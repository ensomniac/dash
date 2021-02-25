#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json
import traceback

import Dash
from Dash.Utils import Utils

class ApiCore:
    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path
        self._params = {}
        self._response = {"error": "Unauthorized"}
        self._render_html = None
        self._public = {}
        self._private = {}  # Requires an authenticated user
        self._fs = cgi.FieldStorage()

        try:
            self._params = self.get_data()
        except:
            self._params = {}

            self._response = {
                "cgi": str(cgi),
                "keys": str(self._fs.keys()),
                "traceback": traceback.format_exc(),
                "self._fs": str(self._fs),
            }

            self.StopExecutionOnError("CGI Form Error")
            return

        self.set_dash_globals()

    @property
    def GetRandomID(self):
        return Utils.get_random_id()

    @property
    def DashContext(self):
        if not hasattr(self, "_dash_context"):
            from Dash import PackageContext as Context
            self._dash_context = Context.Get(self._asset_path)

        return self._dash_context

    def set_dash_globals(self):
        # This code allows us to inject content from this class in all
        # instances of this module running in this shell
        if not hasattr(self, "dash_global"):
            self.dash_global = sys.modules[Dash.__name__]

        self.dash_global.RequestData = self._params
        self.dash_global.RequestUser = self.User

    @property
    def User(self):
        if not hasattr(self, "_user"):
            self._user = None

            if not self.DashContext:
                raise Exception("Dash Context is missing x8136")

            from Dash.Users import Users as DashUsers
            self._user = DashUsers(self._params, self.DashContext).ValidateUser()

        return self._user

    def Run(self):
        if self._execute_as_module:
            return

        self.set_dash_globals()

        if self._params.get("f") in self._public:
            self.run(self._public[self._params.get("f")])
        elif self._params.get("f") in self._private:

            if self.User:
                # This needs to be set again in order to
                # capture the logged in user's data
                self.set_dash_globals()
                self.run(self._private[self._params.get("f")])

        else:
            self.SetResponse({"error": "Unknown Function x4543"})

        if self._render_html:
            self.print_return_html()
        else:
            self.print_return_data()

    @property
    def Params(self):
        return self._params

    def SetParam(self, key, value):
        # Adds a param to self._params
        self._params[key] = value

    def StopExecutionOnError(self, error):
        self._response["error"] = error
        self.print_return_data()

    def Add(self, f, requires_authentication):
        if requires_authentication:
            self._private[f.__name__] = f
        else:
            self._public[f.__name__] = f

    def get_data(self):
        data = {}

        for key in self._fs.keys():
            if key in data:
                continue

            mini_field_storage = self._fs[key]

            try:
                data[key] = mini_field_storage.value
            except:
                mini_field_storage = self._fs[key][0]
                raise Exception("? -> key: " + str(mini_field_storage))

        return data

    def print_return_html(self):
        print("Content-type: text/html\n")
        print(self._response)

    def print_return_data(self):
        print("Content-type: text/plain\n")
        print(str(json.dumps(self._response)))

    def SetError(self, error_str):
        self.SetResponse({"error": error_str})

    # Previously: set_return_data(self, return_data=None):
    def SetResponse(self, response=None):
        if type(response) == str:
            self._render_html = True
        else:
            self._render_html = False

            if "error" not in response.keys():
                response["error"] = None

        self._response = response
        return self._response

    def run(self, f):
        self._response = {"error": "Missing return data x8765"}

        try:
            f()
        except:
            tb = traceback.format_exc()
            self.SetResponse({"error": "There was a scripting problem: " + str(tb)})

    def Execute(uninstantiated_class_ref):
        '''
        This function exists as a wraper to cgi scripts using ApiCore
        and helps to catch common errors more flexibly
        '''

        try:
            uninstantiated_class_ref()
        except:
            import traceback
            error = {"error": traceback.format_exc(), "script_execution_failed": True}
            print("Content-type: text/plain\n")
            print(str(json.dumps(error)))

