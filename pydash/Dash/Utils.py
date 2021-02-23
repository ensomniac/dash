#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys

class __Utils:
    def __init__(self):
        self.rar_timeout = 30  # Seconds before we kill a RAR request

        # Andrew - this should be replaced with
        # the property Paths - leaving for legacy
        # self.paths = _paths
        # self.paths = self.Paths

        # if local_paths.root_path is not None:
        #     self.local_user = self.__get_local_user()
        #     self.local_packages = self.__get_local_packages()

    # @property
    # def Paths(self):
    #     # Convenience function
    #     if not hasattr(self, "_paths"):
    #         from Dash.Paths import Paths as _paths
    #         self._paths = _paths

    #     return self._paths

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

    # Andrew: we rarely want to return a string
    # like this, as it requires a followup check
    # Instead, have the module do the busywork for us

    # def __get_local_user(self):
    #     if os.path.exists(local_paths.root_ryan):
    #         return "Ryan"
    #     elif os.path.exists(local_paths.root_andrew):
    #         return "Andrew"
    #     else:
    #         raise Exception(
    #             "Unable to identify local user. Checked for "
    #             f"{local_paths.root_ryan} and {local_paths.root_andrew}"
    #         )

utils = __Utils()
