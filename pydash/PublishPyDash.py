#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
pip install https://ensomniac.io/src/pydash.tar.gz
"""

import os
import sys

from requests import post
from datetime import datetime
from Dash.Utils import OapiRoot
from shutil import rmtree, copytree


class PublishDash:
    _timestamp: str
    _year: str

    def __init__(self):

        self.source_path = os.path.join(OapiRoot, "dash", "github", "dash", "pydash")

        if not os.path.exists(self.source_path):
            raise Exception("Path doesn exist. Expected: " + self.source_path)

        self.tmp_path = os.path.join("/var", "tmp", "PublishDash")
        self.dest_tar = os.path.join(self.tmp_path, "pydash.tar.gz")
        self.dest_src = os.path.join(self.tmp_path, "src")
        self.version = self.get_version()

        if os.path.exists(self.tmp_path):
            rmtree(self.tmp_path)

        self.modify_version_info()
        self.copy_source()
        self.upload()
        # self.cleanup()

    @property
    def year(self):
        if not hasattr(self, "_year"):
            self._year = str(datetime.now().year)

        return self._year

    @property
    def timestamp(self):
        if not hasattr(self, "_timestamp"):
            now = datetime.now()
            self._timestamp = "/".join([str(now.month), str(now.day), str(now.year)])

        return self._timestamp

    def get_version(self):
        init_path = os.path.join(self.source_path, "Dash", "__init__.py")
        version = None

        for line in open(init_path, "r").read().split("\n"):
            if line.startswith("__version__"):
                version = float(
                    line.split("=")[-1].replace('"', "").replace("'", '"').strip()
                )
                break

        if not version:
            sys.exit("Unable to determine version!")

        return round(version + 0.01, 3)

    def copy_source(self):
        os.makedirs(self.tmp_path)

        copytree(self.source_path, self.dest_src)

        os.system(f"cd {self.dest_src};tar -czf {self.dest_tar} .")

        if not os.path.exists(self.dest_tar):
            sys.exit("Failed to publish!")

    # def cleanup(self):
    #     print("cleanup (empty function)")

    def modify_version_info(self):
        self.modify_init()
        # self.modify_pkg()
        # self.modify_setup()
        # self.modify_readme()

    def modify_init(self):
        init_path = os.path.join(self.source_path, "Dash", "__init__.py")
        init_content = []

        for line in open(init_path, "r").read().split("\n"):
            if "Ensomniac" in line and "Ryan Martin" in line:
                line = f"# {self.year} Ensomniac, Ryan Martin ryan@ensomniac.com"

            if line.startswith("__version__"):
                line = f'__version__ = "{str(self.version)}"'

            if line.startswith("__copyright__"):
                line = f'__copyright__ = "Copyright (c) {self.year} Ensomniac"'

            init_content.append(line)

        open(init_path, "w").write("\n".join(init_content))

    def modify_pkg(self):
        path = os.path.join(self.source_path, "PKG-INFO")
        content = []

        for line in open(path, "r").read().split("\n"):
            if line.startswith("Version"):
                line = f"Version: {str(self.version)}"

            if line.startswith("Published"):
                line = f"Published: {str(self.timestamp)}"

            content.append(line)

        open(path, "w").write("\n".join(content))

    def modify_setup(self):
        path = os.path.join(self.source_path, "setup.py")
        content = []

        for line in open(path, "r").read().split("\n"):
            if "version=" in line:
                line = f'{line.split("=")[0]}="{str(self.version)}",'

            content.append(line)

        open(path, "w").write("\n".join(content))

    def modify_readme(self):
        path = os.path.join(self.source_path, "README.md")
        content = []

        for line in open(path, "r").read().split("\n"):
            if line.startswith("## Dash "):
                line = f"## Dash - Version {str(self.version)} - {self.timestamp}"

            content.append(line)

        open(path, "w").write("\n".join(content))

    def upload(self):
        print("Uploading...")

        post_data = {"f": "publish", "version": self.version}

        response = post(
            "https://ensomniac.io/PyDash",
            files={"tar": open(self.dest_tar, "rb")},
            data=post_data,
        )

        try:
            r = response.json()

            if r.get("accepted"):
                print(f"\tSuccessfully published v{str(r.get('version'))}!")
                print(f"\tpip install {r.get('url')}")

                return
        except:
            pass

        sys.exit(f"Error Uploading to Server!!\n{response.text}")


if __name__ == "__main__":
    PublishDash()
