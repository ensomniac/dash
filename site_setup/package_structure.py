#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| Defins the local / expected structure of a dash package
"""

import os
import sys
import datetime

from cgibin_test_script import CgiBinTestScript
from client_conformer   import ClientConformer

class DashPackageStructure:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def package_root(self):
        return self._package_data["usr_path_git"]

    @property
    def readme_path(self):
        return os.path.join(self.package_root, "README.md")

    @property
    def gitignore_path(self):
        return os.path.join(self.package_root, ".gitignore")

    @property
    def server_dir_root(self):
        return os.path.join(self.package_root, "server/")

    @property
    def cgibin_root(self):
        return os.path.join(self.server_dir_root, "cgi-bin/")

    @property
    def example_endpoint_path(self):
        return os.path.join(self.cgibin_root, "DashTest.py")

    @property
    def client_dir_root(self):
        return os.path.join(self.package_root, "client/")

    @property
    def readme_valid(self):

        if not os.path.exists(self.readme_path):
            return False

        filesize = os.path.getsize(self.readme_path)

        if filesize < 50:
            return False

        return True

    def Conform(self):

        if not self.readme_valid:
            self.create_readme()

        self.create_gitignore()
        self.create_server_structure()
        ClientConformer(self.data).Conform()


    def create_readme(self):
        print("\n\nCreating readme...")

        today = datetime.datetime.now()
        date = [str(today.month), str(today.day), str(today.year)]
        date = "/".join(date)

        lines = []
        lines.append("# Server & Client code for " + self.data["display_name"])
        lines.append("Dash Managed on " + date)

        if os.path.exists(self.readme_path):
            os.remove(self.readme_path)

        open(self.readme_path, "w").write("\n".join(lines))
        print("\tWrote " + self.readme_path)

    def create_server_structure(self):

        # print("\n\nCreating server structure")

        if not os.path.exists(self.server_dir_root):
            os.makedirs(self.server_dir_root)

        if not os.path.exists(self.cgibin_root):
            os.makedirs(self.cgibin_root)

        if os.path.exists(self.example_endpoint_path):
            os.remove(self.example_endpoint_path)

        content = CgiBinTestScript(self.data).Create()
        open(self.example_endpoint_path, "w").write("\n".join(content))

        print("\tWrote " + self.example_endpoint_path)

    def create_gitignore(self):
        if os.path.exists(self.gitignore_path):
            os.remove(self.gitignore_path)

        lines = []
        lines.append("__pycache__/")
        lines.append("*.py[cod]")
        lines.append("*$py.class")
        lines.append("*.so")
        lines.append(".python-version")
        lines.append("*.DS_Store")

        open(self.gitignore_path, "w").write("\n".join(lines))

if __name__ == "__main__":

    print("\n** LOCAL TESTING **\n")

    client_module_path = __file__.split("/site_setup/")[0] + "/"
    cmd = "cd " + client_module_path + ";python site_setup"
    os.system(cmd)
