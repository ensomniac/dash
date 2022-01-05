#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import cgi
import json

from traceback import format_exc
from Dash import __name__ as DashName
from Dash.Utils import GetRandomID, SendEmail, ClientAlert


class ApiCore:
    _user: dict
    _dash_context: dict
    dash_global: callable

    def __init__(self, execute_as_module, asset_path, send_email_on_error=False):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path
        self._send_email_on_error = send_email_on_error

        self._params = {}
        self._public = {}
        self._private = {}  # Requires an authenticated user
        self._render_html = None
        self._fs = cgi.FieldStorage()
        self._response = {"error": "Unauthorized"}

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

        if not execute_as_module:
            # This was causing problems for threaded instances when executed as a module.
            # Changing this shouldn't cause any problems, and hasn't, but this
            # change is not thoroughly tested yet and may need to be reverted or altered.
            self.set_dash_globals()

    @property
    def DashContext(self):
        if not hasattr(self, "_dash_context"):
            from Dash.PackageContext import Get

            self._dash_context = Get(self._asset_path)

        return self._dash_context

    @property
    def User(self):
        if not hasattr(self, "_user"):
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
        return GetRandomID()

    @property
    def PublicFunctions(self):
        return self._public

    @property
    def PrivateFunctions(self):
        return self._private

    @property
    def Response(self):
        return self._response

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
                # This needs to be set again in order to capture the logged-in user's data
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

    def ValidateParams(self, required_params, falsy=False):
        """
        Ensures the request has all required params before processing anything.

        :param list required_params: All param names to check for
        :param bool falsy: Whether required_params is a list of falsy params
        """

        if type(required_params) == str:
            if "," in required_params:
                required_params = required_params.split(",")
                required_params = [p.strip() for p in required_params]
            else:
                required_params = [required_params]

        elif type(required_params) != list:
            raise Exception("ValidateParams requires a list")

        for param in required_params:
            if falsy:
                if param not in self.Params:
                    raise Exception(f"Missing param '{param}'")
            else:
                if not self.Params.get(param):
                    raise Exception(f"Missing param '{param}'")

    def SetParam(self, key, value):
        self._params[key] = value

        try:
            self.dash_global.RequestData[key] = value
        except:
            pass

    def SetParams(self, params):
        if not params or type(params) is not dict:
            raise Exception(f"Error: SetParams requires a dict: {params}")

        self._params = params

        try:
            self.dash_global.RequestData = params
        except:
            pass

    def ParseParam(self, key, target_type, default_value=None):
        if key in self._params:
            if type(self._params[key]) is target_type:
                return

            self._params[key] = json.loads(self._params[key])
        else:
            if default_value is None:
                return

            self._params[key] = default_value

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

        if self._send_email_on_error and not self._execute_as_module and type(self._response) is dict and self._response.get("error"):
            self.SendEmail()

        # Private errors should be deleted after sending the error email, so they're not exposed to the client
        if "_error" in self._response:
            del self._response["_error"]

        return self._response

    def SendEmail(self, subject="", msg="", error="", notify_email_list=["ryan@ensomniac.com", "stetandrew@gmail.com"]):
        if not subject:
            subject = f"{self._asset_path.title()} Error - {self.__class__.__name__}.{self.Params.get('f')}()"

        request_details = ""

        if self.User:
            request_details += f"User: {self.User['email']}"

        if self.Params:
            if request_details:
                request_details += "<br>"

            # Make a copy of self.Params so we don't modify the original, in case the script is continuing
            params = {k: v for (k, v) in self.Params.items()}

            if params.get("file"):
                params["file"] = "truncated..."

            request_details += f"Params: {params}<br><br>"

        if not msg:
            msg = request_details
        else:
            msg += f"<br><br>{request_details}"

        if not error and self._response.get("error"):
            error = self._response["error"]

            # Special case (there's not really a better place to handle this without breaking other functionality)
            if error == "Incorrect login information":
                return

            if self._response.get("_error"):
                private_error = self._response["_error"].replace("\n", "<br>")

                error += f"<br><br>Private error:<br>{private_error}"

        SendEmail(
            subject=subject,
            notify_email_list=notify_email_list,
            msg=msg,
            error=error
        )

    def SetDashGlobals(self):
        if not self._execute_as_module:
            return

        self.set_dash_globals()

    def set_dash_globals(self):
        """
        This allows us to inject content from this class in all instances of this module running in this shell.
        """

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

            # This catches GitHub Webhook param issues
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
        response_status = get_response_status(self._response)

        if "gzip" in self.Params and not self._response.get("error"):
            self._response = self.compress_response(self._response)

        print_json(self._response, response_status)

    def run(self, f):
        self._response = {"error": "Missing return data x8765"}

        try:
            f()

        # See ClientAlert docstring for explainer - don't use this without reading that first
        except ClientAlert as e:
            self._send_email_on_error = False

            self.SetResponse({"error": str(e)})

        except Exception as e:
            self.SetResponse({"error": f"{e}\n\nTraceback:\n{format_exc()}"})

        except:
            self.SetResponse({"error": f"There was a scripting problem:\n{format_exc()}"})

    # DEPRECATED:
    #  Since class functions expect 'self' as the first variable, Execute() belongs outside this class as a standalone function.
    #
    #  --Previous usage--
    #         if __name__ == "__main__":
    #             ApiCore.Execute(Desktop)
    #
    #  --New usage--
    #         if __name__ == "__main__":
    #             from Dash.Api.Core import Execute
    #             Execute(Desktop)
    def Execute(uninstantiated_class_ref):
        Execute(uninstantiated_class_ref)


def Execute(uninstantiated_class_ref):
    """
    This exists as a wrapper to cgi scripts using ApiCore and helps to catch common errors more flexibly.

    :param class uninstantiated_class_ref: Any uninstantiated class reference object to test
    """

    error = None

    try:
        uninstantiated_class_ref()

    except Exception as e:
        error = {"error": f"{e}\n\nTraceback:\n{format_exc()}"}

    except:
        error = {"error": format_exc(), "script_execution_failed": True}

    if error is not None:
        print_json(error)

    sys.exit()


def get_response_status(response):
    status = "Status: 200 OK\n"
    error = response.get("error")

    if error:
        if error == "Unauthorized":
            status = "Status: 401 Unauthorized\n"
        else:
            status = "Status: 400 Bad Request\n"

    return status


def print_json(response, status=None):
    if status is None:
        status = get_response_status(response)

    print(f"{status}Content-type: application/json\n")
    print(str(json.dumps(response)))
