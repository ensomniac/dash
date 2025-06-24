#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
pip install https://ensomniac.io/src/pydash.tar.gz
"""

import os
import sys

from Dash.Utils import OapiRoot


class PublishDash:
    _year: str
    _now: callable
    _timestamp: str

    def __init__(self):
        self.source_path = os.path.join(OapiRoot, "dash", "github", "dash", "pydash")

        if not os.path.exists(self.source_path):
            raise FileNotFoundError(f"Path doesn't exist. Expected:\n{self.source_path}")

        self.tmp_path = os.path.join(OapiRoot, "dash", "local", "tmp", "PublishDash")
        self.dest_tar = os.path.join(self.tmp_path, "pydash.tar.gz")
        self.dest_src = os.path.join(self.tmp_path, "src")
        self.version = self.get_version()

        if os.path.exists(self.tmp_path):
            from shutil import rmtree

            rmtree(self.tmp_path)

        self.modify_version_info()
        self.copy_source()
        self.upload()
        # self.cleanup()

    @property
    def now(self):
        if not hasattr(self, "_now"):
            from datetime import datetime

            self._now = datetime.now()

        return self._now

    @property
    def year(self):
        if not hasattr(self, "_year"):
            self._year = str(self.now.year)

        return self._year

    @property
    def timestamp(self):
        if not hasattr(self, "_timestamp"):
            self._timestamp = "/".join([str(self.now.month), str(self.now.day), str(self.year)])

        return self._timestamp

    def get_version(self):
        version = None
        init_path = os.path.join(self.source_path, "Dash", "__init__.py")

        for line in open(init_path).read().split("\n"):
            if line.startswith("__version__"):
                version = float(
                    line.split("=")[-1].replace('"', "").replace("'", '"').strip()
                )

                break

        if not version:
            sys.exit("Unable to determine version!")

        return round(version + 0.01, 3)

    def copy_source(self):
        from shutil import copytree

        os.makedirs(self.tmp_path)

        copytree(self.source_path, self.dest_src)

        os.system(f"cd {self.dest_src};tar -czf {self.dest_tar} .")

        if not os.path.exists(self.dest_tar):
            sys.exit(f"Failed to publish! Dest TAR doesn't exist. Expected:\n{self.dest_tar}")

    # def cleanup(self):
    #     print("cleanup (empty function)")

    def modify_version_info(self):
        self.modify_init()
        # self.modify_pkg()
        # self.modify_setup()
        # self.modify_readme()

    def modify_init(self):
        init_content = []
        init_path = os.path.join(self.source_path, "Dash", "__init__.py")

        for line in open(init_path).read().split("\n"):
            if "Ensomniac" in line and "Ryan Martin" in line:
                line = f"# {self.year} Ensomniac, Ryan Martin ryan@ensomniac.com"

            if line.startswith("__version__"):
                line = f'__version__ = "{str(self.version)}"'

            if line.startswith("__copyright__"):
                line = f'__copyright__ = "Copyright (c) {self.year} Ensomniac"'

            init_content.append(line)

        open(init_path, "w").write("\n".join(init_content))

    def modify_pkg(self):
        content = []
        path = os.path.join(self.source_path, "PKG-INFO")

        for line in open(path).read().split("\n"):
            if line.startswith("Version"):
                line = f"Version: {str(self.version)}"

            if line.startswith("Published"):
                line = f"Published: {str(self.timestamp)}"

            content.append(line)

        open(path, "w").write("\n".join(content))

    def modify_setup(self):
        content = []
        path = os.path.join(self.source_path, "setup.py")

        for line in open(path).read().split("\n"):
            if "version=" in line:
                line = f'{line.split("=")[0]}="{str(self.version)}",'

            content.append(line)

        open(path, "w").write("\n".join(content))

    def modify_readme(self):
        content = []
        path = os.path.join(self.source_path, "README.md")

        for line in open(path).read().split("\n"):
            if line.startswith("## Dash "):
                line = f"## Dash - Version {str(self.version)} - {self.timestamp}"

            content.append(line)

        open(path, "w").write("\n".join(content))

    def upload(self):
        from requests import post

        print("Uploading...")

        response = post(
            "https://ensomniac.io/PyDash",
            files={"tar": open(self.dest_tar, "rb")},
            data={
                "f": "publish",
                "version": self.version
            }
        )

        try:
            r = response.json()

            if r.get("accepted"):
                print(f"\tSuccessfully published v{str(r.get('version'))}!\n\tpip install {r.get('url')}")

                return
        except:
            pass

        sys.exit(f"Error Uploading to Server! Response:\n{response.text}")


if __name__ == "__main__":
    PublishDash()
