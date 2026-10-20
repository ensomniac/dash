"""DashSync v1: local file watching, pinned SSH transport, local-only Git."""

import argparse
import fcntl
import os
import time
from pathlib import Path

from .protocol import Rejected
from .sync_thread import SyncThread
from .transport import CONFIG_PATH, load_config
from .utils import SyncUtils


class DashSync:
    def __init__(self):
        parser = argparse.ArgumentParser(description="Sync approved source changes through restricted SSH. Git remains local.")
        parser.add_argument("--check-config", action="store_true", help="validate local configuration without connecting or writing files")
        args = parser.parse_args()
        try:
            config = load_config()
            if args.check_config:
                print(f"DashSync SSH configuration is valid: {len(config['packages'])} local packages")
                return
            lock_path = CONFIG_PATH.parent / "running.lock"
            lock = os.open(str(lock_path), os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
            try:
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                except BlockingIOError as exc:
                    raise Rejected("already_running", "DashSync is already running; stop it before starting another instance") from exc
                self.packages = SyncUtils.GetServerSyncPackages(config=config)
                self.sync_threads = [SyncThread(package) for package in self.packages]
                self.add_dash_client()
                print("DashSync SSH is running. Commits and pushes stay on this computer. Press Ctrl-C to stop.")
                while True:
                    for watcher in self.sync_threads:
                        watcher.check()
                    time.sleep(1)
            finally:
                os.close(lock)
        except KeyboardInterrupt:
            print("\nDashSync stopped. Local files retain any unsynced changes.")
        except (Rejected, OSError) as exc:
            code = getattr(exc, "code", "configuration")
            raise SystemExit(f"DashSync {code}: {exc}. No HTTP deployment fallback is available.") from exc

    def add_dash_client(self):
        package = next((p for p in self.packages if p["asset_path"] == "pydash"), None)
        if package is None:
            return
        root = Path(package["usr_path_git"]) / "client" / "full"
        if root.is_dir() and not root.is_symlink():
            self.sync_threads.append(SyncThread(package, root, is_client=True, on_change_cb=self.on_dash_client_changed))

    def on_dash_client_changed(self):
        from Dash.ClientCompiler import ClientCompiler

        ClientCompiler.SetPackages(self.packages)
        ClientCompiler.CompileAndDistribute()


if __name__ == "__main__":
    DashSync()
