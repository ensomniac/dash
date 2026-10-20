"""One package watcher; the main loop serializes linting and uploads."""

import os
import stat
import time
from pathlib import Path

from .protocol import MAX_FILE, MAX_PATHS, Rejected, digest, relative_path


def read_local(repo, relative):
    """Open each component without following symlinks, including at upload time."""
    relative_path(relative)
    fd = os.open(str(repo), os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        parts = relative.split("/")
        for part in parts[:-1]:
            new = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = new
        source = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
        try:
            info = os.fstat(source)
            if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1 or info.st_size > MAX_FILE:
                raise Rejected("invalid_file", "Only single-link regular files of at most 10 MiB can sync")
            chunks, size = [], 0
            while True:
                chunk = os.read(source, 65536)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_FILE:
                    raise Rejected("too_large", "Local file exceeds 10 MiB")
                chunks.append(chunk)
            after = os.fstat(source)
            if (info.st_mtime_ns, info.st_size, info.st_ino) != (after.st_mtime_ns, after.st_size, after.st_ino):
                raise Rejected("local_change", "Local file changed during reading; retrying later")
            return b"".join(chunks)
        finally:
            os.close(source)
    finally:
        os.close(fd)


class SyncThread:
    """Retains the old public name; no background timers or remote Git execution."""
    def __init__(self, package, root_path=None, is_client=False, on_change_cb=None):
        self.context = package
        self.repo = Path(package["usr_path_git"])
        self.root_path = Path(root_path or self.repo)
        self.is_client = is_client
        self.on_change_cb = on_change_cb
        self.transport = package.get("transport")
        self.files = {}
        self.previous = {}
        self.pending = set()
        self.conflicts = set()
        self.next_retry = {}
        self.last_error = {}
        self.initialized = False
        self.index_all()

    @property
    def Name(self):
        return self.context.get("display_name", self.context["asset_path"])

    def allowed(self, path):
        try:
            relative_path(path)
        except Rejected:
            return False
        if self.on_change_cb:
            return path.endswith((".js", ".css", ".html"))
        policy = self.context["sync_policy"]
        if path in policy["protected"] or Path(path).name.lower() in {"rootpoll.py", "runasroot.py"}:
            return False
        return (path in policy["files"] or any(path.startswith(prefix + "/") for prefix in policy["prefixes"])) and Path(path).suffix.lower() in policy["extensions"]

    def scan(self):
        found = {}
        roots = [self.root_path] if self.on_change_cb else [self.repo / p for p in self.context["watch"]]
        for root in roots:
            if root.is_symlink() or not root.exists():
                continue
            for directory, dirs, files in os.walk(root, followlinks=False):
                dirs[:] = [name for name in dirs if not name.startswith(".") and not (Path(directory) / name).is_symlink()]
                for name in files:
                    path = Path(directory) / name
                    relative = path.relative_to(self.repo).as_posix()
                    if not self.allowed(relative):
                        continue
                    try:
                        info = path.lstat()
                        if stat.S_ISREG(info.st_mode) and info.st_nlink == 1 and info.st_size <= MAX_FILE:
                            found[relative] = (info.st_mtime_ns, info.st_size, info.st_ino)
                    except FileNotFoundError:
                        continue
        return found

    def index_all(self):
        current = self.scan()
        if not self.initialized:
            if not self.on_change_cb:
                paths = sorted(current)
                for offset in range(0, len(paths), MAX_PATHS):
                    self.previous.update(self.transport.hashes(self.context["asset_path"], paths[offset:offset + MAX_PATHS]))
            self.files = current
            self.initialized = True
            print(f"[{self.Name}] Tracking {len(current)} files; existing differences are not uploaded at startup")
            return
        removed = set(self.files) - set(current)
        for path in sorted(removed):
            print(f"[{self.Name}] Deletion/rename requires deliberate deployment: {path}")
            self.pending.discard(path)
        for path, stamp in current.items():
            if self.files.get(path) != stamp:
                self.pending.add(path)
        self.files = current

    def check(self):
        self.index_all()
        if self.on_change_cb:
            if self.pending:
                self.on_change_cb()
                self.pending.clear()
            return
        for path in sorted(self.pending):
            if path in self.conflicts or time.monotonic() < self.next_retry.get(path, 0):
                continue
            try:
                self.upload_change(path)
                self.pending.remove(path)
                self.last_error.pop(path, None)
            except (Rejected, OSError) as exc:
                code = getattr(exc, "code", "local_io")
                if code in {"conflict", "permission", "invalid_path", "invalid_file", "too_large"}:
                    self.conflicts.add(path)
                self.next_retry[path] = time.monotonic() + 15
                if self.last_error.get(path) != code:
                    print(f"[{self.Name}] {path}: {code}; unsynced change retained. Reconcile conflicts before restarting DashSync.")
                    self.last_error[path] = code

    def upload_change(self, path):
        from Dash.DashLint import DashLint

        relative_path(path)
        if not self.allowed(path):
            raise Rejected("permission", "Local file is outside the approved sync policy")
        if path not in self.previous:
            current = self.transport.hashes(self.context["asset_path"], [path])[path]
            if current is not None:
                raise Rejected("conflict", "A newly added local path already exists remotely")
            self.previous[path] = None
        # Validate the file before passing its local path to the existing linter.
        read_local(self.repo, path)
        if Path(path).suffix.lower() in {".py", ".js"}:
            try:
                ok, _ = DashLint.Process(is_client=False, dash_context=self.context, code_path=str(self.repo / path))
            except Exception as exc:
                raise Rejected("lint", "Lint failed; review the local file") from exc
            if not ok:
                raise Rejected("lint", "Lint failed; fix the local file before retrying")
        body = read_local(self.repo, path)
        sha = digest(body)
        result = self.transport.request({"op": "put", "package": self.context["asset_path"],
                                         "path": path, "previous": self.previous[path], "size": len(body), "sha256": sha}, body)
        if result.get("sha256") != sha:
            raise Rejected("connection", "Receiver did not confirm the expected content hash")
        self.previous[path] = sha
        print(f"[{self.Name}] Synced {path}")
