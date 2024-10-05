#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| This script requires that you have an account at https://dash.guide
|
| This is tied to a command installed during setup.py: "dashsync"
"""

import os
import sys

try:
    from .utils import SyncUtils
    from .sync_thread import SyncThread

except ImportError:
    from utils import SyncUtils
    from sync_thread import SyncThread


class DashSync:
    def __init__(self):
        print("\nDash Sync\n")

        SyncUtils.CheckForRunningProcess("dashsync")

        self.packages = SyncUtils.GetServerSyncPackages()
        self.sync_threads = []

        self.add_dash_client()

        for package in self.packages:
            self.add_sync_thread(package)

    def add_sync_thread(self, package):
        # Expected to be at the top level of the
        # git repo but double check to make sure
        server_root, client_root = SyncUtils.FindServerClientRoots(package)

        if server_root:
            print("server_root: " + server_root)
            self.sync_threads.append(SyncThread(
                package,
                server_root,
                is_client=False
            ))
        else:
            print("Failed to find a local server path for " + package["display_name"])

        # if client_root:
        #     print("client_root: " + client_root)
        #     self.sync_threads.append(SyncThread(
        #         package,
        #         client_root,
        #         is_client=True
        #     ))

    def add_dash_client(self):
        # Add the dash client code to monitor for changes
        # But we don't actually want to live sync the changes
        # Instead, if changes occur in a dash js file,
        # we want to recompile dash.js and distribute it
        # to any local dash packages on this machine.

        full_pth, min_pth, pkg = SyncUtils.FindDashClientPaths(self.packages)
        client_path_full = full_pth
        client_path_min = min_pth
        pydash_package = pkg

        if not os.path.exists(client_path_full):
            print("\nWarning: Did Dash client code missing. Expected: '" + client_path_full + "'\n")

            return

        if not os.path.exists(client_path_min):
            print("\nWarning: Did Dash client code missing. Expected: '" + client_path_min + "'\n")

            return

        self.sync_threads.append(SyncThread(
            pydash_package,
            client_path_full,
            is_client=True,
            on_change_cb=self.on_dash_client_changed
        ))

    def on_dash_client_changed(self):
        # Called when there is a change to the /client/full/ Dash code
        # We want to re-compile the package into /client/full/ then
        # distribute the new version to all local clients
        import Dash.ClientCompiler
        import importlib
        importlib.reload(Dash.ClientCompiler)

        # Since we have local packages, we can set them
        # like this to make things faster. Without this, it
        # will pull them from the server as this code does on startup
        Dash.ClientCompiler.ClientCompiler.SetPackages(self.packages)
        Dash.ClientCompiler.ClientCompiler.CompileAndDistribute()


if __name__ == "__main__":
    # from Dash import PackageContext as Context
    # dash_context = Context.Get("authentic")

    DashSync()
