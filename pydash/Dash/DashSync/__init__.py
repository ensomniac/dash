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

from os.path import expanduser

class DashSync:
    def __init__(self):
        print("\nDash Sync\n")
        self.packages = self.get_packages()

        # self.dash_data_path = os.path.join(expanduser("~"), ".dash")
        # self.preflight()
        # self.user = self.authenticate()

        print(self.packages)

    # @property
    # def dash_creds(self):
    #     if not os.path.exists(self.dash_data_path):
    #         return None

    #     if not hasattr(self, "_dash_data"):
    #         self._dash_data = json.loads(open(self.dash_data_path, "r").read())

    #     return self._dash_data

    def get_packages(self):
        import json

        dash_data_path = os.path.join(expanduser("~"), ".dash")

        if not os.path.exists(dash_data_path):
            print("\nNot Authenticated\n")
            sys.exit()

        dash_data = json.loads(open(dash_data_path, "r").read())
        token = dash_data["user"]["token"]

        response = requests.post(
            "https://dash.guide/Packages",
            data={"f": "get_sync_manifest", "token": token}
        ).json()

        if response.get("error"):
            print("\n**** SERVER ERROR ****\n")
            print(response["error"])
            sys.exit()

        for package_data in response["packages"]:
            print(package_data["display_name"])

            for key in package_data:
                print("\t" + key + ": " + str(package_data[key]))

            print()

            # print(package_data)
            # print()

        # if response.get("error"):
        #     print("\nUnable to authenticate @ https://dash.guide/")
        #     print("\tReason: " + response["error"] + "\n")
        #     sys.exit()

        # if not response.get("token"):
        #     print("\nUnable to authenticate @ https://dash.guide/")
        #     print("\tReason: Unknown\n")
        #     sys.exit()

        # dash_data = {}
        # dash_data["user"] = response

        # open(self.dash_data_path, "w").write(json.dumps(dash_data))
        # self._dash_data = dash_data

        # print("\nSuccessfully authenticated!\n")


if __name__ == "__main__":
    DashSync()
