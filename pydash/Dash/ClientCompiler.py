#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
This script can be run by itself or called as a module:
from Dash.ClientCompiler import ClientCompiler

It will compile the dash client code into a minified version
and optionally distribute this new version to all clients
"""

import os
import sys
import json

from datetime import datetime
from Dash.LocalStorage import Read
from Dash.DashSync import SyncUtils
from shutil import rmtree, copytree


class _ClientCompiler:
    _version_info: dict
    dash_min_src_index: str
    dash_min_src_folder: str
    _packages: SyncUtils.GetServerSyncPackages

    def __init__(self):
        pass

    @property
    def VersionInfo(self):
        if not hasattr(self, "_version_info"):
            if os.path.exists(SyncUtils.VersionInfoPath):
                self._version_info = Read(SyncUtils.VersionInfoPath, "r")
            else:
                self._version_info = {"version": 1.0, "date": datetime.now().isoformat()}

            self._version_info["version"] = round(self._version_info["version"] + 0.01, 2)

        return self._version_info

    @property
    def Packages(self):
        if not hasattr(self, "_packages"):
            self._packages = SyncUtils.GetServerSyncPackages(quiet=True)

        return self._packages

    @property
    def ClientPathFull(self):
        # The un-compiled client code
        return SyncUtils.FindDashClientPaths(self.Packages)[0]

    @property
    def ClientPathMin(self):
        # The minified client code
        return SyncUtils.FindDashClientPaths(self.Packages)[1]

    def SetPackages(self, packages):
        self._packages = packages

    def CompileAndDistribute(self):
        self.Compile()
        self.Distribute()

    def Compile(self):
        print("CC -> COMP -> Dash Client -> Compiling (from " + str(self.ClientPathFull) + ")...")
        print("CC -> COMP -> Dash Client -> Compiling (to " + str(self.ClientPathMin) + ")...")

        # p = self.Packages
        self.combine()
        self.write_version_info()

        print("CC -> COMP -> Dash Client - Compilation Complete!")

    def write_version_info(self):
        version_info = self.VersionInfo
        # version_info["date"] = version_info["date"].isoformat()

        now = datetime.now()
        version_info["date"] = now.isoformat()
        version_info["date_hr"] = now.strftime("%m/%d/%y at %I:%M %p")

        open(SyncUtils.VersionInfoPath, "w").write(json.dumps(version_info))
        self._version_info = version_info
        print("CC -> COMP -> Dash Client -> Updated Version: " + str(self.VersionInfo["version"]))

    def combine(self):
        self.dash_min_src_folder = os.path.join(self.ClientPathMin, "dash/")
        self.dash_min_src_index = os.path.join(self.ClientPathMin, "index.html")

        if os.path.exists(self.ClientPathMin):
            rmtree(self.ClientPathMin, True)

        os.makedirs(self.ClientPathMin)
        os.makedirs(self.dash_min_src_folder)

        index_path = os.path.join(self.ClientPathMin, "index.html")
        js_path = os.path.join(self.ClientPathMin, "dash", "dash.js")
        css_path = os.path.join(self.ClientPathMin, "dash", "dash.css")
        css_mobile_path = os.path.join(self.ClientPathMin, "dash", "mdash.css")

        fonts_src = os.path.join(self.ClientPathFull, "bin", "css", "fonts")
        fonts_dst = os.path.join(self.ClientPathMin, "dash", "fonts")

        copytree(fonts_src, fonts_dst)

        index_content = []

        js_source_paths = []
        css_source_paths = []
        css_mobile_source_paths = []

        js_anchor_found = False
        css_anchor_found = False

        # TODO: Clean/Shorten these lines:
        js_anchor = f'''        <script src="dash/dash.js?v={str(self.VersionInfo['version'])}"></script>\n'''
        css_anchor = f'''\n        <link rel="stylesheet" href="dash/dash.css?v={str(self.VersionInfo['version'])}">'''

        lines = open(os.path.join(
            self.ClientPathFull,
            "index.html"
        ), "r").read().split("\n")

        for line in lines:
            if not line.strip():
                continue

            if ".css" in line:
                if "_mobile" in line:
                    path = self.parse_source_path(line)

                    if path:
                        # At the time of writing, there is only one css file,
                        # but we run it through with all the rest for compatibility
                        css_mobile_source_paths.append(path)
                else:
                    if not css_anchor_found:
                        css_anchor_found = True

                        index_content.append(css_anchor)

                    path = self.parse_source_path(line)

                    if path:
                        css_source_paths.append(path)

                continue

            if ".js" in line:
                if not js_anchor_found:
                    js_anchor_found = True

                    index_content.append(js_anchor)

                path = self.parse_source_path(line)

                if path:
                    js_source_paths.append(path)

                continue

            index_content.append(line)

        js_content = self.combine_jscss(js_source_paths)
        css_content = self.combine_jscss(css_source_paths)
        mobile_css_content = self.combine_jscss(css_mobile_source_paths)

        open(index_path, "w").write("\n".join(index_content))
        open(js_path, "w").write("\n".join(js_content))
        open(css_path, "w").write("\n".join(css_content))
        open(css_mobile_path, "w").write("\n".join(mobile_css_content))

        print("CC -> COMP -> Dash Client -> Wrote: " + index_path)
        print("CC -> COMP -> Dash Client -> Wrote: " + js_path)
        print("CC -> COMP -> Dash Client -> Wrote: " + css_path)
        print("CC -> COMP -> Dash Client -> Wrote: " + css_mobile_path)

    def parse_source_path(self, line):
        # Extract the full path of either css or js

        line = line.strip()
        line = line.split('href="')[-1].split("href='")[-1]
        line = line.split('src="')[-1].split("src='")[-1]

        if ".js" in line:
            line = f"{line.split('.js')[0]}.js"

        if ".css" in line:
            line = f"{line.split('.css')[0]}.css"

        full_path = os.path.join(self.ClientPathFull, line)

        if not os.path.exists(full_path):
            msg = "\n\nWARNING: Failed to parse source path '"
            msg += line + "' in dash/index.html "
            msg += "\nRemove the line containing '"
            msg += line + "' in index.html\n\n"

            print(msg)

            return None

        return full_path

    def combine_jscss(self, js_source_paths):
        all_js_lines = []

        for full_path in js_source_paths:
            js_lines = self.clean_js(full_path)
            all_js_lines.extend(js_lines)

        return all_js_lines

    def clean_js(self, full_path):
        all_lines = []

        for line in open(full_path, "r").read().replace("\n\n", "\n").split("\n"):
            all_lines.append(line)

        return all_lines

    def Distribute(self):
        print("CC -> DIST -> Distributing (from " + self.ClientPathMin + ") ...")

        column_width = 0
        distribution_packages = SyncUtils.GetLocalDashClientPaths(self.Packages)

        for package in distribution_packages:
            if len(package["asset_path"]) > column_width:
                column_width = len(package["asset_path"])

        for package in distribution_packages:
            msg = ""
            col_diff = column_width - len(package["asset_path"])

            for key in ["client_root", "sync_client_root"]:
                if not package.get(key):
                    continue

                msg += "CC -> DIST -> " + package["asset_path"] + (" " * col_diff)
                msg += " (to " + package[key] + ") ..."

                print(msg)

        for package in distribution_packages:
            if package["asset_path"] == "pydash":
                continue

            self.distribute_client(package)

    def distribute_client(self, package):
        for key in ["client_root", "sync_client_root"]:
            if not package.get(key):
                continue

            os.makedirs(package[key], exist_ok=True)

            expected_index_path = os.path.join(package[key], "index.html")

            if not os.path.exists(expected_index_path):
                self.initialize_root(package, key)

            self.update_publish_index_source(package, expected_index_path)

    # Called for a new dash portal where there is no index / bin
    def initialize_root(self, package, root_key):
        # TODO: Test this code. During my refactor, I wasn't able to test the initialization of a new package.

        print(f"\tInitializing new portal @ {package[root_key]}")

        index_path_min = os.path.join(self.ClientPathMin, "index.html")
        expected_index_path = os.path.join(package[root_key], "index.html")
        expected_bin_path = os.path.join(package[root_key], "bin")
        expected_core_path = os.path.join(package[root_key], "bin", "core.js")

        os.makedirs(expected_bin_path, exist_ok=True)

        core_line = "        <script src='bin/core.js?v=1.0'></script>"

        index_lines = []
        found_dash_end = False

        for line in open(index_path_min, "r").read().split("\n"):
            if "DASH END" in line and not found_dash_end:
                found_dash_end = True

                index_lines.append(line)
                index_lines.append(core_line)
                index_lines.append("")

                continue

            if "<title>DASH</title>" in line:
                line = line.replace(
                    "<title>DASH</title>", f"<title>{package['display_name']}</title>"
                )

            index_lines.append(line)

        js_package_name = package["asset_path"].replace("_", " ").title().replace(" ", "")

        open(expected_index_path, "w").write("\n".join(index_lines))
        open(expected_core_path, "w").write("\n".join(self.get_default_core_content(js_package_name)))

    def get_default_core_content(self, js_package_name):
        return [
            f"""function {js_package_name}()""" + """{""",
            f"""    this.html = $("<div>{js_package_name}</div>");""",
            """""",
            """    this.setup_styles = function(){""",
            """""",
            """        this.html.css({""",
            """            "position": "absolute",""",
            """            "left": 0,""",
            """            "top": 0,""",
            """            "right": 0,""",
            """            "bottom": 0,""",
            """            "background": "orange",""",
            """            "overflow-y": "auto",""",
            """        });""",
            """""",
            """    };""",
            """""",
            """    this.setup_styles();""",
            """""",
            """};""",
            """""",
            """function RunDash(){""",
            f"""    window.{js_package_name} = new {js_package_name}();""",
            f"""    return window.{js_package_name}.html;""",
            """};""",
            """""",
        ]

    def get_mobile_css_include(self):
        lines = []

        nav_desc = "/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/"

        lines.append('''<script type="text/javascript">''')
        lines.append('''    if (''' + nav_desc + '''i.test(navigator.userAgent)) {''')
        lines.append('''        document.write("<link rel='stylesheet' type='text/css' href='dash/mdash.css?v=''' + str(self.VersionInfo["version"]) + ''''/>");''')
        lines.append('''    }''')
        lines.append('''</script>''')

        return lines

    def update_publish_index_source(self, package, index_path):
        path_root = index_path.split("index.h")[0].replace("index.h", "")

        if os.path.exists(os.path.join(path_root, "dash/")):
            rmtree(os.path.join(path_root, "dash/"), True)

        copytree(
            os.path.join(self.ClientPathMin, "dash/"),
            os.path.join(path_root, "dash/")
        )

        clean_context = {}
        skip = ["path_", "admin", "git", "root_"]

        for key in package:
            for word in skip:
                if word in key:
                    continue

            clean_context[key] = package[key] or ""

        dash_authors = [
            "Ryan Martin ryan@ensomniac.com",
            "Andrew Stet stetandrew@gmail.com"
        ]

        header = [
            '''''', '''<!-- DASH START -->''',
            '''<script type="text/javascript">''',
            '''    var DASH_AUTHORS = "''' + ", ".join(dash_authors) + '''";''',
            '''    var DASH_VERSION = ''' + str(self.VersionInfo["version"]) + ''';''',
            '''    var DASH_VERSION_DATE = "''' + str(self.VersionInfo["date_hr"]) + '''";''',
            '''    var DASH_CONTEXT = {'''
        ]

        max_key_len = [len(x) for x in list(clean_context.keys())]
        max_key_len.sort()
        max_key_len = max_key_len[-1]

        indent = " " * 8

        key_order = list(clean_context.keys())

        key_order.sort()

        for key in key_order:
            spacer = " " * (max_key_len-len(key))
            line   = indent + '"' + key.zfill(len(key)-max_key_len) + '": '
            line   += spacer + '"' + clean_context[key] + '",'

            header.append(line)

        # Remove trailing comma from last dict line
        header[-1].rstrip(",")

        header.extend([
            '''    };''',
            '''</script>''',
            '''<script src="dash/dash.js?v=''' + str(self.VersionInfo["version"]) + '''"></script>''',
            '''<link rel="stylesheet" href="dash/dash.css?v=''' + str(self.VersionInfo["version"]) + '''">'''
        ])

        header.extend(self.get_mobile_css_include())
        header.append('''<!-- DASH END -->''')
        header.append('''''')

        found_title = False
        injected_imports = False

        start_token = "<!-- DASH START -->"
        end_token = "<!-- DASH END -->"

        index_orig = open(index_path, "r").read()

        if end_token in index_orig and start_token not in index_orig:
            sys.exit(f"\nx12 Unable to modify index for \n")

        if start_token in index_orig and end_token not in index_orig:
            sys.exit(f"\nx78 Unable to modify index for {index_path}\n")

        dash_header_open = False
        dash_free = []

        for line in index_orig.split("\n"):
            if start_token in line and not dash_header_open:
                dash_header_open = True
                continue

            if end_token in line and dash_header_open:
                dash_header_open = False
                continue

            if dash_header_open:
                continue

            dash_free.append(line)

        index_content = []

        for x in range(len(dash_free)):
            line = dash_free[x]

            if x > 0 and not line.strip() and not dash_free[x - 1].strip():
                continue

            if "</title>" in line and not found_title:
                found_title = True
                index_content.append(line)
                continue

            if found_title and not injected_imports:
                injected_imports = True

                for header_line in header:
                    index_content.append(f"        {header_line}")

                if not line.strip():
                    continue

            if ".js" in line and "dash/" not in line and "</script>" in line and 'type="module"' not in line:
                line = self.version_arbitrary(line, True, False)

            if ".css" in line and "dash/" not in line and "stylesheet" in line:
                line = self.version_arbitrary(line, False, True)

            index_content.append(line)

        open(index_path, "w").write("\n".join(index_content))

        print("CC -> DIST -> Wrote " + index_path)

    def version_arbitrary(self, line, is_js, is_css):
        # TODO: Reformat this code back away from pem - it looks blurry AF
        #  " or ':

        if is_js and not is_css:
            separator = "src="
            extension = ".js"
        elif is_css and not is_js:
            separator = "href="
            extension = ".css"
        else:
            raise Exception(
                "At least one param of 'is_js' or 'is_css' must be set to True, and not both."
            )

        quote_type = line.split(separator)[-1].strip()[0]
        tail = line.split(extension)[-1].split(quote_type)[-1]
        head = f"{line.split(extension)[0]}{extension}"
        vstring = f"?v={str(self.VersionInfo['version'])}"

        return f"{head}{vstring}{quote_type}{tail}"


if __name__ == "__main__":
    _ClientCompiler().CompileAndDistribute()
else:
    ClientCompiler = _ClientCompiler()
