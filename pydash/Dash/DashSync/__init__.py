# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

# This script requires that you have
# an account at https://dash.guide
#
# This is tied to a command installed during setup.py: "dashsync"

import sys
import os
import json
import getpass
import requests
import site
import threading

try:
    from .utils import SyncUtils
    from .sync_thread import SyncThread
except:
    from utils import SyncUtils
    from sync_thread import SyncThread

class DashSync:
    def __init__(self):
        print("\nDash Sync\n")
        SyncUtils.CheckForRunningProcess("dashsync")
        self.packages = SyncUtils.GetServerSyncPackages()
        self.sync_threads = []

        self.add_pydash()

        for package in self.packages:
            self.add_sync_thread(package)

    def add_sync_thread(self, package):
        # Expected to be at the top level of the
        # git repo but double check to make sure
        server_root, client_root = SyncUtils.FindServerClientRoots(package)

        if server_root:
            # print("server_root: " + server_root)
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

    def add_pydash(self):
        # Add pydash to the packages to sync. This syncing setup
        # works a little differently since changes to the pydash
        # need to be made in a specific place on the server
        pass

if __name__ == "__main__":

    from Dash.Utils import Utils
    context = Utils.GetContext("altona")
    print(context)

    # print(dir(Utils))


    # DashSync()
