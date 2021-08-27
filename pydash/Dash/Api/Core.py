#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json

from Dash.Utils import Utils
from traceback import format_exc
from Dash import __name__ as DashName


class ApiCore:
    _user: str
    _dash_context: dict
    dash_global: callable

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
                "traceback": format_exc(),
                "self._fs": str(self._fs),
            }

            self.StopExecutionOnError("CGI Form Error")

            return

        self.set_dash_globals()

    @property
    def DashContext(self):
        if not hasattr(self, "_dash_context"):
            from Dash.PackageContext import Get as GetContext

            self._dash_context = GetContext(self._asset_path)

        return self._dash_context

    @property
    def User(self):
        if not hasattr(self, "_user"):
            self._user = None

            if not self.DashContext:
                raise Exception("Dash Context is missing x8136")

            from Dash.Users import Users as DashUsers

            self._user = DashUsers(self._params, self.DashContext).ValidateUser()

        return self._user

    @property
    def Params(self):
        return self._params

    @property
    def RunningOnServer(self):
        return sys.path[0].startswith(self.DashContext["srv_path_http_root"])

    @property
    def RandomID(self):
        return Utils.GetRandomID()

    # TODO: Deprecate this function in favor of @property > RandomID
    def GetRandomID(self):
        return self.RandomID

    def SetUser(self, user_data):
        if not user_data["email"]:
            raise Exception("Invalid user_data format!")

        self._user = user_data
        self.set_dash_globals()

    def Run(self):
        if self._execute_as_module:
            return

        self.set_dash_globals()

        if self._params.get("f") in self._public:
            self.run(self._public[self._params.get("f")])

        elif self._params.get("f") in self._private:
            if self.User:
                # This needs to be set again in order to capture the logged in user's data
                self.set_dash_globals()
                self.run(self._private[self._params.get("f")])
        else:
            self.SetResponse({"error": "Unknown Function x4543"})

        self.ReturnResponse()

    def ReturnResponse(self):
        if self._render_html:
            self.print_return_html()
        else:
            self.print_return_data()

    # TODO: Propagate this throughout the code and update old validation checks
    def ValidateParams(self, required_params):
        """
        Ensures the request has all required params before processing anything.

        :param list required_params: All param names to check for
        """

        if type(required_params) != list:
            self.RaiseError("ValidateParams requires a list")

        for param in required_params:
            if not self.Params.get(param):
                self.RaiseError(f"Missing param '{param}'")

    # TODO: Propagate this throughout the code and update old raiseException calls
    def RaiseError(self, error_msg):
        self.SetResponse({"error": error_msg})
        self.ReturnResponse()

        sys.exit()

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

    def SetError(self, error_str):
        self.SetResponse({"error": error_str})

    def SetResponse(self, response=None):
        if type(response) == str:
            self._render_html = True
        else:
            self._render_html = False

            if "error" not in response.keys():
                response["error"] = None

        self._response = response

        return self._response

    def set_dash_globals(self):
        # This code allows us to inject content from this class in all
        # instances of this module running in this shell
        if not hasattr(self, "dash_global"):
            self.dash_global = sys.modules[DashName]

        self.dash_global.RequestData = self._params
        self.dash_global.RequestUser = self.User
        self.dash_global.Context = self.DashContext

    def get_data(self):
        data = {}

        for key in self._fs.keys():
            if key in data:
                continue

            mini_field_storage = self._fs[key]

            # This catches Github Webhook param issues
            if type(mini_field_storage) == list:
                mini_field_storage = mini_field_storage[0]

            try:
                data[key] = mini_field_storage.value
            except:
                # mini_field_storage = self._fs[key][0]
                # raise Exception("? -> key: " + str(mini_field_storage))
                pass

        return data

    def print_return_html(self):
        print("Content-type: text/html\n")
        print(self._response)

    def compress_response(self, data):
        from gzip import compress
        from base64 import b64encode

        data = json.dumps(data).encode()
        order_compressed = compress(data)
        order_compressed_bin = b64encode(order_compressed)
        order_compressed_str = order_compressed_bin.decode()

        return {"gzip": order_compressed_str}

    def print_return_data(self):
        if "gzip" in self.Params and not self._response.get("error"):
            self._response = self.compress_response(self._response)

        print("Content-type: text/plain\n")
        print(str(json.dumps(self._response)))

    def run(self, f):
        self._response = {"error": "Missing return data x8765"}

        try:
            f()
        except:
            self.SetResponse({"error": f"There was a scripting problem: {format_exc()}"})

    def Execute(uninstantiated_class_ref):
        """
        This function exists as a wrapper to cgi scripts using ApiCore
        and helps to catch common errors more flexibly
        """

        try:
            uninstantiated_class_ref()
        except:
            error = {"error": format_exc(), "script_execution_failed": True}

            print("Content-type: text/plain\n")
            print(str(json.dumps(error)))

            sys.exit()
