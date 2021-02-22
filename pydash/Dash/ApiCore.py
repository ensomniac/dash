#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json
import traceback

import Dash
from Dash.Utils import utils

class APICore:
    def __init__(self, module, execute_as_module, dash_context):
        self.validated = True
        self.module = module
        self.execute_as_module = execute_as_module
        self.module.dash_context = dash_context
        self.module.return_data = {"error": "Unauthorized"}
        self.module.render_html = None
        self.module.print_return_data = self.print_return_data
        self.module.set_return_data = self.set_return_data
        self.module.R = self.set_return_data
        self.module.Add = self.Add
        self.module.Run = self.Run
        self.module.GetRandomID = utils.get_random_id
        self.module.User = None

        self.public = {}
        self.private = {}  # Requires an authenticated user

        self.FieldStorage = cgi.FieldStorage()

        try:
            self.module.data = self.get_data()
        except:
            self.module.data = {}

            self.module.return_data = {
                "cgi": str(cgi),
                "keys": str(self.FieldStorage.keys()),
                "traceback": traceback.format_exc(),
                "self.FieldStorage": str(self.FieldStorage),
            }

            self.StopExecutionOnError("CGI Form Error")
            return

        self.set_dash_globals()

    def set_dash_globals(self):
        # This code allows us to inject content from this class in all
        # instances of this module running in this shell
        if not hasattr(self, "dash_global"):
            self.dash_global = sys.modules[Dash.__name__]

        self.dash_global.RequestData = self.module.data
        self.dash_global.RequestUser = self.module.User

    def Run(self):
        if self.execute_as_module:
            return

        self.set_dash_globals()

        if self.module.data.get("f") in self.public:
            self.run(self.public[self.module.data.get("f")])
        elif self.module.data.get("f") in self.private:
            self.module.User = self.get_validated_user()

            if self.module.User:
                # This needs to be set again in order to
                # capture the logged in user's data
                self.set_dash_globals()
                self.run(self.private[self.module.data.get("f")])

        else:
            self.set_return_data({"error": "Unknown Function x4543"})

        if self.module.render_html:
            self.print_return_html()
        else:
            self.print_return_data()

    def get_validated_user(self):
        if not self.module.dash_context:
            self.set_return_data({"error": "Dash Context is missing x8136"})
            return None

        from Dash.Users import Users

        validated_user = Users(
            self.module.data, self.module.dash_context
        ).ValidateUser()

        if not validated_user:
            self.set_return_data({"error": "Invalid User/Token x9318"})
            return None

        return validated_user

    def StopExecutionOnError(self, error):
        self.module.return_data["error"] = error
        self.print_return_data()
        self.validated = False

    def Validate(self):
        return self.validated

    def Add(self, f, requires_authentication):
        if requires_authentication:
            self.private[f.__name__] = f
        else:
            self.public[f.__name__] = f

    def get_data(self):
        data = {}

        for key in self.FieldStorage.keys():
            if key in data:
                continue

            mini_field_storage = self.FieldStorage[key]

            try:
                data[key] = mini_field_storage.value
            except:
                mini_field_storage = self.FieldStorage[key][0]
                raise Exception("? -> key: " + str(mini_field_storage))

        return data

    def print_return_html(self):
        print("Content-type: text/html\n")
        print(self.module.return_data)

    def print_return_data(self):
        print("Content-type: text/plain\n")
        print(str(json.dumps(self.module.return_data)))

    def set_return_data(self, return_data=None):
        if type(return_data) == str:
            self.module.render_html = True
        else:
            self.module.render_html = False

            if "error" not in return_data.keys():
                return_data["error"] = None

        self.module.return_data = return_data
        return self.module.return_data

    def run(self, f):
        self.module.return_data = {"error": "Missing return data x8765"}

        try:
            f()
        except:
            tb = traceback.format_exc()
            self.set_return_data({"error": "There was a scripting problem: " + str(tb)})


def Init(module, execute_as_module, dash_context=None):
    api = APICore(module, execute_as_module, dash_context)
    return api.Validate()
