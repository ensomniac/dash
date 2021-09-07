#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash.Utils import Utils, OapiRoot


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
            "display_name",
            "email_access_csv",
            "domain",
            "id",
            "admin_from_email",
            "srv_path_git_oapi",
            "srv_path_local",
            "srv_path_http_root",
            "code_copyright_text",
            "email_git_webhook_csv",
        ]

        data = {
            "asset_path": self._asset_path,
            "is_valid": True,
            "is_server": self.logs_root
        }

        available_keys = list(self.PackageData.keys())

        for key in required_keys:
            if key not in available_keys:
                data["is_valid"] = False

            data[key] = self.PackageData.get(key)

        # TODO - see if we have authenticated user data and
        #  return their custom paths if they exist

        # dummy_data = {
        #     'id': '2021021821221429116',
        #     'created_by': 'ryan@ensomniac.com',
        #     'created_on': '2021-02-18T21:22:14.291206',
        #     'display_name': 'Altona',
        #     'modified_by': 'ryan@ensomniac.com',
        #     'modified_on': '2021-02-23T16:31:42.190629',
        #     'domain': 'altona.io',
        #     'asset_path': 'altona',
        #     'admin_from_email': 'ryan@ensomniac.com',
        #     'email_access_csv': 'ryan@ensomniac.com, stetandrew@gmail.com',
        #     'usr_local_repo_path_ryan_ensomniac.com': '/Users/rmartin/Google Drive/dash_guide/',
        #     'git_repo': 'https://github.com/ensomniac/altona_io.git',
        #     'path_usr_git_stetandrew_gmail.com': '/Users/andrewstet/altona_bin/repos/altona/',
        #     'usr_path_git_ryan@ensomniac.com': '/Users/rmartin/Google Drive/altona/altona_io/',
        #     'code_copyright_text': 'Altona',
        #     'srv_path_git_oapi': '/var/www/vhosts/oapi.co/altona/altona_io/',
        #     'srv_path_http_root': '/var/www/vhosts/oapi.co/altona/',
        #     'srv_path_local': '/var/www/vhosts/oapi.co/altona/local/'
        # }

        return data

    def get_pkg_data_from_server(self):
        from json import loads

        # TODO: Make a lookup for asset path / package ids

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
            "token": Utils.UserToken
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
