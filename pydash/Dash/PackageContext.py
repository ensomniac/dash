#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash.Utils import Memory, OapiRoot


class PackageContext:
    _all_packages: dict
    _package_data: dict

    def __init__(self, asset_path="", ctx_id=""):
        self._asset_path = asset_path
        self._ctx_id = ctx_id

        self.logs_root = os.path.join(OapiRoot, "logs")
        self.pkg_root = os.path.join(OapiRoot, "dash", "local", "packages")
        
    @property
    def AssetPath(self):
        return self._asset_path

    @property
    def ID(self):
        return self._ctx_id

    @property
    def PackageData(self):
        if not hasattr(self, "_package_data"):
            if os.path.exists(self.logs_root):
                self._package_data = self.get_pkg_data_from_server()
            else:
                self._package_data = self.get_pkg_data_from_request()

            if not self._asset_path and self._ctx_id:
                self._asset_path = self._package_data.get("asset_path", "")

            if not self._ctx_id and self._asset_path:
                self._ctx_id = self._package_data.get("id", "")

        return self._package_data

    @property
    def AllPackages(self):
        if not hasattr(self, "_all_packages"):
            if os.path.exists(self.logs_root):
                self._all_packages = self.get_all_pkgs_from_server()
            else:
                self._all_packages = self.get_all_pkgs_from_request()

        return self._all_packages

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
            "is_server": self.logs_root  # What?
        }

        for key in required_keys:
            if key not in self.PackageData:
                data["is_valid"] = False

                break

        for key in self.PackageData:
            if (
                key.startswith("created_")
                or key.startswith("modified_")
                or key.startswith("usr_path_")
                or key.startswith("git_")
            ):
                continue

            if key == "sync_state":
                continue

            data[key] = self.PackageData.get(key)

        # TODO: See if we have authenticated user data and return their custom paths if they exist

        return data

    def get_pkg_data_from_server(self):
        if not self._asset_path and not self._ctx_id:
            return None

        from Dash.LocalStorage import Read

        for ctx_id in os.listdir(self.pkg_root):
            pkg_data = Read(os.path.join(self.pkg_root, ctx_id))

            if not pkg_data.get("asset_path"):
                continue

            if (
                (self._asset_path and self._asset_path == pkg_data.get("asset_path", "").lower().strip())
                or (self._ctx_id and self._ctx_id == pkg_data.get("id", ""))
            ):
                return pkg_data

        return None

    def get_all_pkgs_from_server(self):
        from Dash.LocalStorage import Read

        packages = {
            "data": {},
            "order": []
        }

        for ctx_id in os.listdir(self.pkg_root):
            pkg_data = Read(os.path.join(self.pkg_root, ctx_id))

            if not pkg_data.get("asset_path"):
                continue

            packages["order"].append(pkg_data["id"])

            packages["data"][pkg_data["id"]] = pkg_data

        return packages

    def get_pkg_data_from_request(self):
        from requests import post

        response = post(
            "https://dash.guide/PackageContext",
            data={
                "f": "get_full_data",
                "asset_path": self._asset_path,
                "token": Memory.UserToken
            }
        )

        try:
            response = response.json()
        except:
            sys.exit(f"== SERVER ERROR ==\n{response.text}")

        if "full_data" not in response:
            sys.exit(response)

        return response["full_data"]

    def get_all_pkgs_from_request(self):
        from requests import post

        response = post(
            "https://dash.guide/Packages",
            data={
                "f": "get",
                "token": Memory.UserToken
            }
        )

        try:
            response = response.json()
        except:
            sys.exit(f"== SERVER ERROR ==\n{response.text}")

        if "data" not in response:
            sys.exit(response)

        return response


def Get(asset_path="", ctx_id=""):
    return PackageContext(asset_path, ctx_id).ToDict()


def GetFullData(asset_path="", ctx_id=""):
    return PackageContext(asset_path, ctx_id).PackageData


def GetAssetPath():
    return os.getcwd().lstrip(f"{OapiRoot}{os.path.sep}").split(os.path.sep)[0]


def GetAllPackages():
    return PackageContext().AllPackages


# Not sure where this should live so putting it here for now
def GetAnalogIndex(domain=""):
    if not domain:
        domain = os.environ.get("HTTP_HOST")

    if not domain:
        raise EnvironmentError("Failed to parse domain from os.environ, must provide domain")

    from Dash.LocalStorage import Read

    data = Read(os.path.join(OapiRoot, "analog", "local", "index.json")).get(domain)

    if not data:
        raise KeyError(f"The domain '{domain}' does not exist in the Analog index")

    return data
