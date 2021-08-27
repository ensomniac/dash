#!/usr/bin/python

import os
import sys
import json

from Dash.Utils import Utils


class PackageContext:
    _package_data: dict

    def __init__(self, asset_path):
        self._asset_path = asset_path
        
    @property
    def AssetPath(self):
        return self._asset_path

    @property
    def PackageData(self):
        if not hasattr(self, "_package_data"):

            if Utils.IsServer:
                # Get the data directly from the server
                self._package_data = self.get_pkg_data_from_server()
            else:
                # Make a request to https://dash.guide/ to get the data
                self._package_data = self.get_pkg_data_from_request()

        return self._package_data

    def get_pkg_data_from_server(self):
        # TODO: Make a lookup for asset path / package ids

        package_data = None

        for filename in os.listdir(Utils.ServerLocalStorePath):
            record_path = os.path.join(Utils.ServerLocalStorePath, filename)
            pkg_data = json.loads(open(record_path, "r").read())

            if not pkg_data.get("asset_path"):
                continue

            if self._asset_path == pkg_data.get("asset_path").lower().strip():
                package_data = pkg_data

                break

        if not package_data:
            return None

        return package_data

    def get_pkg_data_from_request(self):
        from requests import post

        params = {
            "f": "get_full_data",
            "asset_path": self._asset_path,
            "token": Utils.UserToken
        }

        response = post("https://dash.guide/PackageContext", data=params)

        try:
            response = json.loads(response.text)
        except:
            print("== SERVER ERROR ==")
            print(response.text)

            sys.exit()

        if "full_data" not in response:
            print(response)

            sys.exit()

        return response["full_data"]

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
            "is_server": Utils.IsServer
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


def Get(asset_path):
    return PackageContext(asset_path).ToDict()


def GetFullData(asset_path):
    return PackageContext(asset_path).PackageData
