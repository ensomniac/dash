#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| This is a command line tool that sets up a new site
| Run from outside the main site_setup folder, like this:
| > /dash> python site_setup
|
| You can re-run this on existing sites
|
| Prerequisites:
| 1. You have already created a github repo for the new site
| 2. You have already setup the package at dash.guide
| 3. You have already cloned the new repo locally
| 4. You are on your development machine, not the server
| 5. You have added this webhook to your github repo:
|        >> https://dash.guide/GitHub?f=webhook&asset_path=<asset_path>
"""

import os
import sys
import requests

from Dash.LocalStorage import Read, Write

from package_structure import DashPackageStructure

class DashSiteSetup:
    def __init__(self):

        print("\n\nTODO: Add default Users.py file for authentication")
        print("\n\nTODO: Consider adding a better default 'main view' that includes the admin and user buttons")

        test_processing = ["freshpath", "ensomniac_ai", "simple_paycheck_budget"]

        # Get everything built
        for asset_path in self.user_packages:
            if asset_path not in test_processing: continue
            self.process_package(asset_path)

        # Compile Dash so anything new will be migrated to the latest Dash
        self.run_dashsync()

        # Finally, go through and conform the server directives
        # for asset_path in self.user_packages:
        #     if asset_path not in test_processing: continue
        #     self.upload_package(asset_path)

    def run_dashsync(self):
        print("Running DashSync")

        from Dash import ClientCompiler
        ClientCompiler.CompileAndDistribute()


    @property
    def local_packages(self):
        local_asset_paths = []

        for asset_path in self.user_packages:
            package_data = self.user_packages[asset_path]
            usr_path_git = package_data.get("usr_path_git")

            if not os.path.exists(usr_path_git):
                print(">> Skipping " + asset_path + " (not found locally)")
                continue

            local_asset_paths.append(asset_path)

        return local_asset_paths

    @property
    def dash_user(self):
        if not hasattr(self, "_dash_user"):

            credspath = os.path.join(
                os.path.expanduser("~"),
                ".dash"
            )

            if not os.path.exists(credspath):
                print("Fatal error: Dash is not set up on this machine")
                print("\tExpected " + credspath)
                sys.exit()

            self._dash_user = Read(credspath)["user"]

        return self._dash_user

    @property
    def dash_user_token(self):
        return self.dash_user["token"]

    @property
    def user_sync_state(self):
        if not hasattr(self, "_user_sync_state"):
            params = {}
            params["f"] = "get_sync_manifest"
            params["token"] = self.dash_user_token

            packages = requests.post(
                "https://dash.guide/Packages",
                data=params
            ).json()["packages"]

            self._user_sync_state = {}
            for sync_details in packages:
                self._user_sync_state[sync_details["id"]] = sync_details

        return self._user_sync_state

    @property
    def user_packages(self):

        if not hasattr(self, "_dash_user_packages"):
            params = {}
            params["f"] = "get"
            params["token"] = self.dash_user_token

            packages = requests.post(
                "https://dash.guide/Packages",
                data=params
            ).json()["data"]

            self._dash_user_packages = {}

            for package_id in packages:
                pdata = packages[package_id]

                if package_id in self.user_sync_state:

                    for key in self.user_sync_state[package_id]:
                        if key in pdata: continue

                        pdata[key] = self.user_sync_state[package_id][key]

                    self._dash_user_packages[pdata["asset_path"]] = pdata

        return self._dash_user_packages

    def process_package(self, asset_path):
        local_package = DashPackageStructure(self.user_packages[asset_path])
        print("\n>> Processing " + asset_path)
        local_package.Conform()


    def process_package(self, asset_path):
        local_package = DashPackageStructure(self.user_packages[asset_path])
        print("\n>> Processing " + asset_path)
        local_package.Conform()



if __name__ == "__main__":
    DashSiteSetup()