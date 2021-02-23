#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys

class __Utils:
    def __init__(self):
        pass

    def GetContext(self, asset_path):
        if self.IsServer:
            return None
        else:
            # Make a request
            return {}

    @property
    def IsServer(self):
        return os.path.exists("/var/www/vhosts/oapi.co/logs/")

    @property
    def ServerLocalStorePath(self):
        return "/var/www/vhosts/oapi.co/dash/local/packages/"

    @property
    def Global(self):
        # This function is meant to return meaningful shared
        # data in the context of a single request

        if not hasattr(self, "_global"):
            import Dash
            self._global = sys.modules[Dash.__name__]

        if not hasattr(self._global, "RequestData"):
            self._global.RequestData = {}

        if not hasattr(self._global, "RequestUser"):
            self._global.RequestUser = None

        return self._global

    def get_random_id(self):
        from random import randint
        from datetime import datetime

        now = str(datetime.today())

        return (
            now.split(".")[0]
            .strip()
            .replace("-", "")
            .replace(" ", "")
            .replace(":", "")
            .strip()
            + now.split(".")[-1].strip()[:3]
            + str(randint(0, 99))
        )

    def write_to_server(self, path, data):
        from json import dumps

        open(path, "w").write(dumps(data))

    def read_from_server(self, path):
        from json import loads

        return loads(open(path, "r").read())

    @property
    def LocalPackages(self):
        # Andrew - I'm going to be moving these config objects
        # somewhere else since it's messy doing it like this
        # but for now let's keep it simple and assume there are only two of us

        from Dash.LocalPackageContext import LocalPackageContext

        pkg = []

        if self.IsRyansMachine:

            pkg.append(LocalPackageContext(
                asset_path="altona",
                display_name="Altona IO",
                domain="altona.io",
                local_git_root="/Users/rmartin/Google Drive/altona/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="analog",
                display_name="Analog Technology",
                domain="analog.technology",
                local_git_root="/Users/rmartin/Google Drive/analog/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="smartsioux",
                display_name="Smart Sioux",
                domain="smartsioux.com",
                local_git_root="/Users/rmartin/Google Drive/smartsioux/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="authentic",
                display_name="Authentic Tools Portal",
                domain="authentic.tools",
                local_git_root="/Users/rmartin/Google Drive/authentic/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="authentic",
                display_name="Authentic Tools Portal",
                domain="authentic.tools",
                local_git_root="/Users/rmartin/Google Drive/authentic/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="dash_guide",
                display_name="Dash Guide",
                domain="dash.guide",
                local_git_root="/Users/rmartin/Google Drive/dash/",
            ))

        else:

            pkg.append(LocalPackageContext(
                asset_path="altona",
                display_name="Altona IO",
                domain="altona.io",
                local_git_root="/Users/andrewstet/altona_bin/repos/",
            ))

        for package_context in pkg:
            if not os.path.exists(package_context.LocalGitRoot):
                msg = "\nError: this path doesn't exist, but it should: '"
                msg += package_context.LocalGitRoot + "'\n"
                print(msg)
                sys.exit()

        return pkg

    @property
    def IsRyansMachine(self):
        return os.path.exists("/Users/rmartin/")

    @property
    def UserToken(self):
        if not hasattr(self, "_usr_token"):

            try:
                from os.path import expanduser
                import json
                dash_data_path = os.path.join(expanduser("~"), ".dash")
                dash_data = json.loads(open(dash_data_path, "r").read())
                self._usr_token = dash_data["user"]["token"]
            except:
                return None

        return self._usr_token

utils = __Utils()
Utils = utils # Migrating away from utils
