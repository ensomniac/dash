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

lazy_lines_js = '''function Core () {

    DashColorSpec.call(this);

    this.html = $("<div></div>");

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "left":       0,
            "top":        0,
            "right":      0,
            "bottom":     0,
            "background": Dash.Color.Background,
            "color":      Dash.Color.Text,
            "overflow-y": "hidden"
        });
    };

    this.on_user_authenticated = function () {

        console.log("on_user_authenticated()");
        console.log("Init:", Dash.User.Init);
        console.log("User's roles:", Dash.User.Init["roles"]);

        var temp_view = $("<div>User Authenticated</div>");
        this.html.append(temp_view);

    };

    this.on_user_not_authenticated = function () {
        var login_flow = new Dash.Gui.Login(this, this.on_user_authenticated);
        this.html.append(login_flow.html);
    };

    this.setup_styles();

    Dash.User.Authenticate(this, this.on_user_authenticated, this.on_user_not_authenticated);

};

function RunDash(){
    window.Core = new Core();
    return window.Core.html;
};
'''

class CoreJSTemplate:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def all_lines(self):
        return lazy_lines_js.split("\n")

    def Create(self):

        lines = []
        lines.extend(self.all_lines)

        return lines

class CoreCSSTemplate:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def all_lines(self):
        return lazy_lines_css.split("\n")

    def Create(self):

        lines = []
        lines.append("//Custom CSS goes here")

        return lines

if __name__ == "__main__":

    print("\n** LOCAL TESTING **\n")

    client_module_path = __file__.split("/site_setup/")[0] + "/"
    cmd = "cd " + client_module_path + ";python site_setup"
    os.system(cmd)
