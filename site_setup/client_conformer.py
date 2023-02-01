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

from index_template import IndexTemplate
from core_template import CoreJSTemplate
from core_template import CoreCSSTemplate
from core_color_spec import CoreColorSpecTemplate

class ClientConformer:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def data(self):
        return self._package_data

    @property
    def package_root(self):
        return self._package_data["usr_path_git"]

    @property
    def client_dir_root(self):
        return os.path.join(self.package_root, "client/")

    @property
    def bin_root(self):
        return os.path.join(self.client_dir_root, "bin/")

    @property
    def dash_root(self):
        return os.path.join(self.client_dir_root, "dash/")

    @property
    def index_path(self):
        return os.path.join(self.client_dir_root, "index.html")

    @property
    def client_core_root(self):
        return os.path.join(self.bin_root, "core/")

    @property
    def client_css_path(self):
        return os.path.join(self.client_core_root, "core.css")

    @property
    def core_js_path(self):
        return os.path.join(self.client_core_root, "core.js")

    @property
    def core_js_cs_path(self):
        return os.path.join(self.client_core_root, "core_color_spec.js")

    def Conform(self):
        print("\t>> Client conforming " + str(self.data["asset_path"]))

        if not os.path.exists(self.client_dir_root):
            os.makedirs(self.client_dir_root)
            print("\t\tCreated " + self.client_dir_root)

        if not os.path.exists(self.bin_root):
            os.makedirs(self.bin_root)
            print("\t\tCreated " + self.bin_root)

        if not os.path.exists(self.dash_root):
            os.makedirs(self.dash_root)
            print("\t\tCreated " + self.dash_root)

        if not os.path.exists(self.client_core_root):
            os.makedirs(self.client_core_root)

        self.create_index()
        self.create_client_css()
        self.create_client_js()
        self.create_client_color_spec()
        self.copy_dash()

    def create_index(self):

        print("\t\tCreating index...")

        lines = IndexTemplate(self.data).Create()

        if os.path.exists(self.index_path):
            os.remove(self.index_path)

        open(self.index_path, "w").write("\n".join(lines))
        print("\t\tWrote " + self.index_path)

    def create_client_css(self):

        if os.path.exists(self.client_css_path):
            os.remove(self.client_css_path)

        lines = CoreCSSTemplate(self.data).Create()

        open(self.client_css_path, "w").write("\n".join(lines))
        print("\t\tWrote " + self.client_css_path)

    def create_client_js(self):

        if os.path.exists(self.core_js_path):
            os.remove(self.core_js_path)

        lines = CoreJSTemplate(self.data).Create()

        open(self.core_js_path, "w").write("\n".join(lines))
        print("\t\tWrote " + self.core_js_path)

    def create_client_color_spec(self):

        if os.path.exists(self.core_js_cs_path):
            os.remove(self.core_js_cs_path)

        lines = CoreColorSpecTemplate(self.data).Create()

        open(self.core_js_cs_path, "w").write("\n".join(lines))
        print("\t\tWrote " + self.core_js_cs_path)








    def copy_dash(self):
        print("\t\tCopying Dash...")





if __name__ == "__main__":

    print("\n** LOCAL TESTING **\n")

    client_module_path = __file__.split("/site_setup/")[0] + "/"
    cmd = "cd " + client_module_path + ";python site_setup"
    os.system(cmd)
