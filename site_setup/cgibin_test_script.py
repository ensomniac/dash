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

class CgiBinTestScript:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def classname(self):
        return "DashTest"

    @property
    def header(self):
        year = str(datetime.datetime.now().year)

        lines = []
        lines.append("#!/usr/bin/python")
        lines.append("#")
        lines.append("# " + year + " " + self.data["code_copyright_text"])
        lines.append("# Author: " + self.data["admin_from_email"])
        lines.append("")

        return lines

    @property
    def imports_and_class(self):

        lines = []
        lines.append("import os")
        lines.append("import sys")
        lines.append("import json")
        lines.append("import traceback")
        lines.append("import datetime")
        lines.append("")
        lines.append("from Dash.Api.Core import ApiCore")
        lines.append("")
        lines.append("class " + self.classname + "(ApiCore):")
        lines.append("")

        return lines

    @property
    def init(self):
        year = str(datetime.datetime.now().year)

        inh_line = "ApiCore.__init__(self, as_module, asset_path="
        inh_line += '"' + self.data["asset_path"] + '"'
        inh_line += ", send_email_on_error=False)"

        lines = []
        lines.append("def __init__(self, as_module=False):")
        lines.append("    " + inh_line)
        lines.append("")
        lines.append("    self.Add(self.test, requires_authentication=False)")
        lines.append("")
        lines.append("    self.Run()")
        lines.append("")

        indended = []
        for line in lines:
            indended.append("    " + line)

        return indended

    @property
    def func(self):

        lines = []
        lines.append("def test(self):")
        lines.append("")
        lines.append("    response = {}")
        lines.append('    response["testing"] = True')
        lines.append("")
        lines.append("    return self.SetResponse(response)")
        lines.append("")

        indended = []
        for line in lines:
            indended.append("    " + line)

        return indended

    @property
    def footer(self):

        lines = []
        lines.append('if __name__ == "__main__":')
        lines.append("    ApiCore.Execute(" + self.classname + ")")
        lines.append("")

        return lines

    def Create(self):

        lines = []
        lines.extend(self.header)
        lines.extend(self.imports_and_class)
        lines.extend(self.init)
        lines.extend(self.func)
        lines.extend(self.footer)

        return lines

if __name__ == "__main__":

    print("\n** LOCAL TESTING **\n")

    client_module_path = __file__.split("/site_setup/")[0] + "/"
    cmd = "cd " + client_module_path + ";python site_setup"
    os.system(cmd)
