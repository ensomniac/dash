#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash.Utils import Memory, OapiRoot


class PackageContext:
    _package_data: dict

    def __init__(self, asset_path):
        self._asset_path = asset_path
        self.logs_root = os.path.join(OapiRoot, "logs")
        
    @property
    def AssetPath(self):
        return self._asset_path

    @property
    def PackageData(self):
        if not hasattr(self, "_package_data"):
            if os.path.exists(self.logs_root):
                # Get the data directly from the server
                self._package_data = self.get_pkg_data_from_server()
            else:
                # Make a request to https://dash.guide/ to get the data
                self._package_data = self.get_pkg_data_from_request()

        return self._package_data

    def ToDict(self):
        if not self.PackageData:
            return None

        required_keys = [
            "asset_path",
            "code_copyright_text",
            "display_name",
            "domain",
            "email_access_csv",
            "email_git_webhook_csv"
            "id",
            "srv_path_git_oapi",
            "srv_path_http_root",
            "srv_path_local"
        ]

        data = {
            "is_valid": True,
            "is_server": self.logs_root
        }

        for key in required_keys:
            if key not in self.PackageData:
                data["is_valid"] = False

                break

        for key in self.PackageData:
            if key.startswith("created_") or key.startswith("modified_") or key.startswith("usr_path_") or key.startswith("git_"):
                continue

            if key == "sync_state":
                continue

            data[key] = self.PackageData.get(key)

        # TODO: See if we have authenticated user data and return their custom paths if they exist

        return data

    # TODO: Make a lookup for asset path / package ids
    def get_pkg_data_from_server(self):
        from json import loads

        package_data = None
        root = os.path.join(OapiRoot, "dash", "local", "packages/")

        for filename in os.listdir(root):
            record_path = os.path.join(root, filename)
            pkg_data = loads(open(record_path, "r").read())

            if not pkg_data.get("asset_path"):
                continue

            if self._asset_path == pkg_data.get("asset_path").lower().strip():
                package_data = pkg_data

                break

        if not package_data:
            return None

        return package_data

    def get_pkg_data_from_request(self):
        from json import loads
        from requests import post

        params = {
            "f": "get_full_data",
            "asset_path": self._asset_path,
            "token": Memory.UserToken
        }

        response = post("https://dash.guide/PackageContext", data=params)

        try:
            response = loads(response.text)
        except:
            sys.exit(f"== SERVER ERROR ==\n{response.text}")

        if "full_data" not in response:
            sys.exit(response)

        return response["full_data"]


def Get(asset_path):
    return PackageContext(asset_path).ToDict()


def GetFullData(asset_path):
    return PackageContext(asset_path).PackageData
