#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json
from traceback import format_exc


class ApiCore:
    def __init__(self, as_module, dash_context):
        self.dash_context = dash_context
        self.execute_as_module = as_module
        self.validated = False
        self.render_html = None
        self.user = None
        self.public = {}
        self.private = {}  # Requires an authenticated user
        self.data = {}
        self.return_data = {"error": "Unauthorized"}
        self.field_storage = cgi.FieldStorage()

        if not self.execute_as_module:
            try:
                self.data = self.__get_data()
            except:
                self.return_data = {
                    "cgi": str(cgi),
                    "keys": str(self.field_storage.keys()),
                    "traceback": format_exc(),
                    "self.FieldStorage": str(self.field_storage),
                }

                self.stop_execution_on_error("CGI Form Error")
                return

    def core_run(self):
        if self.execute_as_module:
            return

        if self.data.get("f") in self.public:
            self.__run(self.public[self.data.get("f")])
        elif self.data.get("f") in self.private:
            self.user = self.__get_validated_user()

            if self.user:
                self.__run(self.private[self.data.get("f")])

        else:
            self.set_return_data({"error": "Unknown Function x4543"})

        if self.render_html:
            self.__print_return_html()
        else:
            self.__print_return_data()

    def core_add(self, f, requires_authentication):
        if requires_authentication:
            self.private[f.__name__] = f
        else:
            self.public[f.__name__] = f

    def set_return_data(self, return_data=None):
        if type(return_data) == str:
            self.render_html = True
        else:
            self.render_html = False

            if "error" not in return_data.keys():
                return_data["error"] = None

        self.return_data = return_data
        return self.return_data

    def get_random_id(self):
        from Dash.Utils import utils

        return utils.get_random_id()

    def stop_execution_on_error(self, error):
        self.return_data["error"] = error
        self.__print_return_data()
        self.validated = False

    def __print_return_html(self):
        print("Content-type: text/html\n")
        print(self.return_data)

    def __print_return_data(self):
        print("Content-type: text/plain\n")
        print(str(json.dumps(self.return_data)))

    def __run(self, f):
        self.return_data = {"error": "Missing return data x8765"}

        try:
            f()
        except:
            self.set_return_data(
                {"error": f"There was a scripting problem: {format_exc()}"}
            )

    def __get_validated_user(self):
        if not self.dash_context:
            self.set_return_data({"error": "Dash Context is missing x8136"})
            return None

        from Dash.Users import Users

        validated_user = Users(self.data, self.dash_context).ValidateUser()

        if not validated_user:
            self.set_return_data({"error": "Invalid User/Token x9318"})
            return None

        self.validated = True

        return validated_user

    def __get_data(self):
        data = {}

        for key in self.field_storage.keys():
            if key in data:
                continue

            mini_field_storage = self.field_storage[key]

            try:
                data[key] = mini_field_storage.value
            except:
                mini_field_storage = self.field_storage[key][0]
                raise Exception("? -> key: " + str(mini_field_storage))

        return data
