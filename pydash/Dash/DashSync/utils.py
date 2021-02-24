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
import subprocess
from os.path import expanduser

class SyncUtils:
    def __init__(self):
        pass

    def GetServerSyncPackages(self, quiet=False):
        # Get all active packages for the logged in user
        dash_data_path = os.path.join(expanduser("~"), ".dash") # TODO this is moved to dash.Utils

        if not os.path.exists(dash_data_path):
            print("\nNot Authenticated\n")
            sys.exit()

        dash_data = json.loads(open(dash_data_path, "r").read())
        token = dash_data["user"]["token"]

        response = requests.post(
            "https://dash.guide/Packages",
            data={"f": "get_sync_manifest", "token": token}
        )

        try:
            response = json.loads(response.text)
        except:
            print("\n** SERVER ERROR **\n")
            print(response)
            print(response.text)
            print()
            sys.exit()

        if response.get("error"):
            print("\n**** SERVER ERROR ****\n")
            print(response["error"])
            sys.exit()

        sync_packages = []
        for package_data in response["packages"]:

            if not quiet:
                self.PrintPackageDetails(package_data)

            sync_packages.append(package_data)

        return sync_packages

    def PrintPackageDetails(self, package_data):

        print_keys = [
            "asset_path",
            "domain",
            "git_repo",
            "srv_path_git_oapi",
            "srv_path_local",
            "srv_path_http_root",
            "usr_path_git",
        ]

        if not package_data.get("usr_path_git"):
            msg = "Warning: " + package_data["display_name"] + " "
            msg += "is missing a local path to sync to and will be ignored"
            print(msg)
            print("\tResolve this by adding a local path at https://dash.guide/")
            return

        usr_path_git = package_data.get("usr_path_git")

        if not os.path.exists(usr_path_git):
            msg = "Warning: " + package_data["display_name"] + " "
            msg += "has a local sync path set, but it doesn't exist on this machine."
            msg += "\n\tExpected: '" + usr_path_git + "'"
            print(msg)
            print("\tResolve this by correcting your Local GitHub Repo Path path at https://dash.guide/")
            return

        print(package_data["display_name"])
        for key in print_keys:
            print("\t" + key + ": " + str(package_data[key]))

        print()

    def CheckForRunningProcess(self, script_name):
        # script_name = dashsync

        from psutil import Process

        pid_list = self.get_pids(script_name)
        another_process_running = False

        active_ids = [str(os.getpid()), str(os.getpid()-1)]

        for pid in pid_list:

            if str(pid) in active_ids:
                continue

            process = Process(int(pid))

            if script_name not in str(process.cmdline()):
                continue

            another_process_running = pid
            break

        if another_process_running:
            from signal import SIGKILL

            try:
                os.killpg(int(another_process_running), SIGKILL)
            except:
                os.system(f"kill -9 {str(another_process_running)}")

            print("\nFound existing '" + script_name + "' running...")
            print("\tKilled.\n")

    def get_pids(self, script_name):
        result = subprocess.check_output(["ps -eaf"], shell=True).decode()
        pids = []

        try:
            for line in result.split("\n"):
                if script_name not in line:
                    continue
                if "terminated" in line.lower():
                    continue

                pid = str(line.split()[1].strip())
                pids.append(pid)
        except:
            pass

        return pids

    def FindServerClientRoots(self, package):
        server_root, client_root = "", ""

        all_files = [
            os.path.join(dp, f)
            for dp, dn, fn in os.walk(os.path.expanduser(package["usr_path_git"]))
            for f in fn
        ]

        # For all packages except pydash, we assume there is a cgi-bin/ folder
        server_path_anchor = "/cgi-bin/"

        if package["asset_path"] == "pydash":
            server_path_anchor = "/pydash/Dash/"

        for filename in all_files:
            if "/.git/" in filename: continue

            if not client_root and filename.endswith("index.html"):
                croot = "/".join(filename.split("/")[:-1]) + "/"
                cbin_root = os.path.join(croot, "bin/")
                cdash_root = os.path.join(croot, "dash/")

                if os.path.exists(cbin_root) and os.path.exists(cdash_root):
                    client_root = croot

            if not server_root and server_path_anchor in filename:
                server_root = "/".join(filename.split(server_path_anchor)[:-1]) + "/"

                if package["asset_path"] == "pydash":
                    # Slightly different naming convention since this is a py module
                    server_root = os.path.join(server_root, *server_path_anchor.split("/"))

            if server_root and client_root: break

        # These are just tests to triple check the
        # things we're expecting to exist actually do
        if server_root and not os.path.exists(server_root):
            print("\nError: Failed to find local system path - expected " + server_root + "\n")
            sys.exit()

        if client_root and not os.path.exists(client_root):
            print("\nError: Failed to find local system path - expected " + client_root + "\n")
            sys.exit()

        return server_root, client_root

    def FindDashClientPaths(self, packages):

        pydash_package = None
        for package in packages:
            if package["asset_path"] != "pydash": continue
            pydash_package = package
            break

        if not pydash_package:
            print("\nWarning: Did not find PyDash package locally, will not monitor dash client\n")
            return

        dash_git_root = pydash_package["usr_path_git"]
        client_path_full = os.path.join(dash_git_root, "client", "full/")
        client_path_min = os.path.join(dash_git_root, "client", "min/")

        if not os.path.exists(client_path_full):
            print("\nWarning: Did Dash client code missing. Expected: '" + client_path_full + "'\n")

        # if not os.path.exists(client_path_min):
            # print("\nWarning: Did Dash client code missing. Expected: '" + client_path_min + "'\n")

        return client_path_full, client_path_min, pydash_package

    def GetLocalDashClientPaths(self, packages):
        # return all valid local paths to any Dash
        # client packages on this user's machine

        distribution_packages = []
        for package in packages:
            usr_path_git = package.get("usr_path_git")
            if not usr_path_git: continue
            client_root = os.path.join(usr_path_git, "client/")

            if not os.path.exists(client_root):
                print("\tWarning: Client path doesn't exist! Expected: " + client_root)
                continue

            package["client_root"] = client_root
            distribution_packages.append(package)

        return distribution_packages

    @property
    def LocalDashPackageRoot(self):
        dash_link_path = __file__.split("/Dash/DashSync/")[0] + "/Dash/"
        pydash_root = os.path.realpath(dash_link_path)
        dash_package_root = pydash_root.split("/pydash/")[0] + "/"

        if not os.path.exists(dash_package_root):
            print("Failed to locate dash root! Expected " + dash_package_root)
            sys.exit()

        return dash_package_root

    @property
    def VersionInfoPath(self):
        dash_package_root = self.LocalDashPackageRoot
        version_path = os.path.join(dash_package_root, "local", "version_info.json")

        if not os.path.exists(version_path):
            print("Failed to locate version path! Expected " + version_path)
            sys.exit()

        return version_path




SyncUtils = SyncUtils()
