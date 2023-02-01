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

class IndexTemplate:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def header(self):

        lines = []
        lines.append([0, "<!DOCTYPE html>"])
        lines.append([0, "<html lang='en-us'>"])
        lines.append([1, "<head>"])
        lines.append([2, "<meta charset='utf-8'>"])
        lines.append([2, "<meta name='viewport' content='width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no'/>"])
        lines.append([2, "<meta name='apple-mobile-web-app-title' content='DASH'/>"])
        lines.append([2, "<meta name='apple-mobile-web-app-capable' content='yes'>"])
        lines.append([2, "<meta name='apple-mobile-web-app-status-bar-style' content='black' />"])
        lines.append([2, "<meta name='description' content=''>"])
        lines.append([2, "<title>" + self.data["display_name"] + "</title>"])
        lines.append([2, ""])

        indended = []
        for line_data in lines:
            intention = line_data[0] * 4
            indended.append((" "*intention) + line_data[1])

        return indended

    @property
    def dash_init(self):

        lines = []
        lines.append([2, "<!-- DASH START -->"])
        lines.append([2, "<script type='text/javascript'>"])
        lines.append([3, "var DASH_VERSION = 1.00;"])
        lines.append([2, "</script>"])
        lines.append([2, "<script src='dash/dash.js?v=1.00'></script>"])
        lines.append([2, "<link rel='stylesheet' href='dash/dash.css?v=1.00'>"])
        lines.append([2, "<script type='text/javascript'>"])
        lines.append([3, "if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {"])
        lines.append([4, '''document.write("<link rel='stylesheet' type='text/css' href='dash/mdash.css?v=1.00'/>");'''])
        lines.append([3, "}"])
        lines.append([2, "</script>"])
        lines.append([2, "<!-- DASH END -->"])
        lines.append([2, ""])

        indended = []
        for line_data in lines:
            intention = line_data[0] * 4
            indended.append((" "*intention) + line_data[1])

        return indended


    @property
    def custom_code(self):

        lines = []
        lines.append([2, "<link rel='stylesheet' href='bin/core/core.css?v=1.00'>"])
        lines.append([2, ""])
        lines.append([2, "<script src='bin/core/core.js?v=1.00'></script>"])
        lines.append([2, "<script src='bin/core/core_color_spec.js?v=1.00'></script>"])
        lines.append([2, ""])

        indended = []
        for line_data in lines:
            intention = line_data[0] * 4
            indended.append((" "*intention) + line_data[1])

        return indended

    @property
    def footer(self):

        lines = []
        lines.append([1, "</head>"])
        lines.append([1, "<body>"])
        lines.append([2, "DASH"])
        lines.append([1, "</body>"])
        lines.append([0, "</html>"])
        lines.append([0, ""])

        indended = []
        for line_data in lines:
            intention = line_data[0] * 4
            indended.append((" "*intention) + line_data[1])

        return indended

    def Create(self):

        lines = []
        lines.extend(self.header)
        lines.extend(self.dash_init)
        lines.extend(self.custom_code)
        lines.extend(self.footer)

        return lines

if __name__ == "__main__":

    print("\n** LOCAL TESTING **\n")

    client_module_path = __file__.split("/site_setup/")[0] + "/"
    cmd = "cd " + client_module_path + ";python site_setup"
    os.system(cmd)
