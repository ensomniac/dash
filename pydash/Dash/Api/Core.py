#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import cgi
import json

from Dash.Utils import GetRandomID


class ApiCore:
    _user: dict
    _dash_context: dict
    _dash_global: callable

    def __init__(self, execute_as_module, asset_path, send_email_on_error=False):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path
        self._send_email_on_error = send_email_on_error

        self._params = {}
        self._public = {}
        self._private = {}  # Requires an authenticated user
        self._render_html = None
        self._additional_notify_emails = []
        self._proceeding_with_empty_fs = False
        self._raw_body = None
        self._missing_return_data_tag = "Missing return data x8765"

        try:
            self._fs = cgi.FieldStorage()
        except:
            from traceback import format_exc

            error = format_exc()

            if "write() argument must be str, not bytes" in error:
                try:
                    self.process_raw_body_content()
                except:
                    # Ref: https://bugs.python.org/issue27777
                    raise Exception(f"Failed to process request using Python's cgi.FieldStorage(). Traceback:\n{error}")
            else:
                # Ref: https://bugs.python.org/issue27777
                raise Exception(f"Failed to process request using Python's cgi.FieldStorage(). Traceback:\n{error}")

        self._response = {"error": "Unauthorized"}

        try:
            self._params = self.get_field_storage_data()
        except:
            from traceback import format_exc

            self._params = {}

            keys = None

            try:
                keys = str(self._fs.keys())
            except:
                pass

            self._response = {
                "cgi": str(cgi),
                "keys": keys,
                "traceback": format_exc(),
                "self._fs": str(self._fs)
            }

            self.StopExecutionOnError("CGI Form Error")

            return

        if not execute_as_module:
            # This was causing problems for threaded instances when executed as a module.
            # Changing this shouldn't cause any problems, and hasn't, but this
            # change is not thoroughly tested yet and may need to be reverted or altered.
            self.set_dash_globals()

    @property
    def AsModule(self):
        return self._execute_as_module

    @property
    def DashContext(self):
        """
        | Dash Context object.
        |
        | **Example for quick, available key reference:**

        - "admin_from_email"     : "ryan@ensomniac.com",
        - "asset_path"           : "candy",
        - "code_copyright_text"  : "Candy Digital Inc.",
        - "display_name"         : "Candy",
        - "domain"               : "realtimecandy.com",
        - "email_access_csv"     : "ryan@ensomniac.com, stetandrew@gmail.com",
        - "email_git_webhook_csv": "ryan@ensomniac.com, rmartin@candy.com, stetandrew@gmail.com",
        - "id"                   : "2021102719491527462",
        - "is_server"            : "/var/www/vhosts/oapi.co/logs",
        - "is_valid"             : True,
        - "srv_path_git_oapi"    : "/var/www/vhosts/oapi.co/candy/realtimecandy/",
        - "srv_path_http_root"   : "/var/www/vhosts/oapi.co/candy/",
        - "srv_path_local"       : "/var/www/vhosts/oapi.co/candy/local/"
        - "timezone"             : "EST"
        - "user_email_domain"    : "candy.com"

        :return: self._dash_context
        :rtype: dict
        """

        if not hasattr(self, "_dash_context"):
            if self._execute_as_module and hasattr(self.dash_global, "Context") and self.dash_global.Context:
                self._dash_context = self.dash_global.Context
            else:
                from Dash.PackageContext import Get

                self._dash_context = Get(self._asset_path)

        return self._dash_context

    @property
    def User(self):
        if not hasattr(self, "_user"):
            if (
                self._execute_as_module
                and self.dash_global
                and hasattr(self.dash_global, "RequestUser")
                and self.dash_global.RequestUser
            ):
                self._user = self.dash_global.RequestUser
            else:
                from Dash.Users import Users as DashUsers

                # This asset path override param can be used when doing cross-context requests.
                # For example, allowing any context to call Dash Guide's Documentation endpoint.
                # Without this cross-context authentication, a request from any context other
                # than Dash Guide would fail. The alternative to this would be to create a wrapper
                # endpoint for every other context in a case like this, which is too messy.
                if self.Params.get("dash_context_auth_asset_path"):
                    from Dash.PackageContext import Get

                    self._user = DashUsers(self._params, Get(self.Params["dash_context_auth_asset_path"])).ValidateUser()
                else:
                    if not self.DashContext:
                        raise Exception("Dash Context is missing x8136")

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

    @property
    def dash_global(self):
        if not hasattr(self, "_dash_global"):
            from Dash import __name__ as DashName

            self._dash_global = sys.modules[DashName]

        return self._dash_global

    def AddNotifyEmail(self, email):
        if email in self._additional_notify_emails:
            return

        self._additional_notify_emails.append(email)

    def SetUser(self, user_data):
        if not user_data or type(user_data) is not dict or not user_data.get("email"):
            raise Exception("Invalid user data format")

        self._user = user_data

        self.set_dash_globals()

    def SetUserByToken(self, user_token):
        if hasattr(self, "_user"):
            delattr(self, "_user")

        self._params["token"] = user_token

        self.set_dash_globals()

        return self.User

    def SetUserByEmail(self, user_email):
        from Dash.Users import Get as GetUser

        self.SetUser(GetUser(user_email))

    def SetDashContext(self, dash_context):
        if not dash_context or type(dash_context) is not dict or not dash_context.get("srv_path_local"):
            raise Exception("Invalid dash context format")

        self._dash_context = dash_context

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

        if type(required_params) is str:
            if "," in required_params:
                required_params = required_params.split(",")
                required_params = [p.strip() for p in required_params]
            else:
                required_params = [required_params]

        elif type(required_params) is not list:
            raise Exception("ValidateParams requires a list")

        for param in required_params:
            if falsy:
                if param not in self.Params:
                    raise Exception(f"Missing param '{param}'")
            else:
                if not self.Params.get(param):
                    # if param == "file":
                    #     raise ClientAlert("File failed to properly upload, please try again.")
                    # else:
                    raise Exception(f"Missing param '{param}'")

    def SetParam(self, key, value):
        self._params[key] = value

        try:
            self.dash_global.RequestData[key] = value
        except:
            pass

        return value

    def SetParams(self, params, replace=True, ignore_falsy=False):
        if not params or type(params) is not dict:
            raise Exception(f"SetParams requires a dict: {params}")

        if replace:
            self._params = params
        else:
            for key in params:
                value = params.get(key)

                if ignore_falsy and not value:
                    continue

                self._params[key] = value

        try:
            self.dash_global.RequestData = self._params
        except:
            pass

    # Wrapper
    def SetOptionalParams(self, params):
        self.SetParams(
            params=params,
            replace=False,
            ignore_falsy=True
        )

    def ParseParam(self, key, target_type, default_value=None, set_param=True):
        if key in self._params:
            param_type = type(self._params[key])

            if param_type is target_type:
                return self._params[key]

            value = self._params[key]

            if param_type is str:  # Extended bool handling
                stripped = self._params[key].strip('"').strip("'").lower()

                if stripped == "true" or stripped == "false":
                    value = stripped  # Otherwise, json.loads can't parse it properly

                if (target_type is int or target_type is float) and stripped.startswith("0"):
                    value = value.lstrip("0")

            value = json.loads(value)

            if set_param:
                self._params[key] = value
            else:
                return value
        else:
            if default_value is None:
                return self._params[key]

            if set_param:
                self._params[key] = default_value
            else:
                return default_value

        return self._params[key]

    def DeleteParam(self, key):
        if key in self._params:
            del self._params[key]

    def StopExecutionOnError(self, error):
        self._response["error"] = error

        self.print_return_data()

    def Add(self, f, requires_authentication):
        if requires_authentication:
            self._private[f.__name__] = f
        else:
            self._public[f.__name__] = f

    def SetError(self, error="", format_exception=False):
        if format_exception:
            # This exists as a wrapper so that if we need to raise an exception before self.Run() is
            # called, we can do so without losing the functionality of handling it from self.run().

            from traceback import format_exc

            if error:
                self.SetResponse({"error": f"{error}\n\nTraceback:\n{format_exc()}"})
            else:
                self.SetResponse({"error": f"There was a scripting problem:\n{format_exc()}"})
        else:
            self.SetResponse({"error": error})

    def SetResponse(self, response=None):
        if type(response) is str:
            self._render_html = True
        else:
            self._render_html = False

            if "error" not in response.keys():
                response["error"] = None

        self._response = response

        if (
            # Basic qualifications to send error email
            self._send_email_on_error
            and not self._execute_as_module
            and type(self._response) is dict
            and self._response.get("error")

            # Don't send if and old/deprecated endpoint/function was hit by a Slack URL preview
            and not (
                os.environ
                and os.environ.get("HTTP_USER_AGENT")
                and "slackbot" in os.environ["HTTP_USER_AGENT"].lower()
                and "unknown function" in self._response["error"].lower()
            )
        ):
            self.SendEmail(from_set_response=True)

        # Private errors should be deleted after sending the error email, so they're not exposed to the client
        if "_error" in self._response:
            del self._response["_error"]

        # When using as module, errors get silently ignored, rather than raised - this solves that, but
        # it may be too broad of a solution, so this may need to be adjusted or removed, we'll see
        if self._execute_as_module and self._response.get("error"):
            from json import dumps

            raise Exception(f"{self._response['error']}\n\nFull response:\n{dumps(self._response, indent=4, sort_keys=True)}")

        return self._response

    def SetDashGlobals(self):
        if not self._execute_as_module:
            return

        self.set_dash_globals()

    def SendEmail(
        self, subject="", msg="", error="", notify_email_list=[],
        strict_notify=False, from_set_response=False, strict_msg=False
    ):
        if not self.Params.get("f"):  # No need to send an email, safe to ignore
            return

        error = self.get_error_for_email(error, from_set_response)

        if error is None:
            return

        if not subject:
            subject = f"{self._asset_path.title()} Error - {self.__class__.__name__}.{self.Params.get('f')}()"

        if not strict_msg:
            msg = self.get_msg_for_email(msg)

        sender_name, strict_notify, notify_email_list = self.get_misc_for_email(strict_notify, notify_email_list)

        self._send_email(subject, notify_email_list, msg, error, strict_notify, sender_name)

    def process_raw_body_content(self):
        # This was an attempt at resolving this issue, but it still
        # isn't solved and I have to move on. Leaving this breakout for
        # future dev. GOOD NEWS: I know how to parse the content in
        # this case (see sys.stdin.read()) but that only works if cgi.FieldStorage
        # has not yet been read. So the solution comes down to determining
        # what type of request it is first, and then picking the correct method

        self._raw_body = str(sys.stdin.read())

        # Ref: https://bugs.python.org/issue32029
        # There's a long-running bug in cgi (see ref) that means we can't properly
        # handle certain requests that come through. This is a work-around that
        # allows the request to continue without failing, though with no params.
        # As of writing, this is useful to allow certain webhooks to hit the server.
        self._fs = cgi.FieldStorage(headers={"Content-Disposition": "inline"})
        self._proceeding_with_empty_fs = True

    def get_misc_for_email(self, strict_notify, notify_email_list):
        from Dash import PersonalContexts

        if not strict_notify:
            for email in self._additional_notify_emails:
                if email not in notify_email_list:
                    notify_email_list.append(email)

        sender_name = self.DashContext.get("code_copyright_text") or self.DashContext.get("display_name")

        if sender_name == "Ensomniac":
            sender_name = "Dash"

        for email in PersonalContexts:
            if self._asset_path in PersonalContexts[email]["asset_paths"]:
                strict_notify = True
                notify_email_list = [email]

                break

        return sender_name, strict_notify, notify_email_list

    def get_msg_for_email(self, msg):
        request_details = ""

        if self.User:
            request_details += f"<b>User:</b> {self.User['email']}"

        if self.Params:
            if request_details:
                request_details += "<br><br>"

            # Make a copy of self.Params so we don't modify the original, in case the script is continuing
            params = {k: v for (k, v) in self.Params.items()}

            for key in params:
                if (
                    type(params.get(key)) is bytes  # Bytes
                    or ("bytes" in key and type(params.get(key)) is str)  # Bytes
                    or str(params.get(key)).startswith("b'")  # Bytes
                    or (key == "token" and params.get(key))  # Token
                    or (key == "payload" and params.get("f") == "webhook" and "head_commit" in params.get(key))  # GitHub webhook payload
                ):
                    params[key] = "truncated..."

            # Keep these private
            for key in ["pass", "password", "pin"]:
                if key in params:
                    del params[key]

            if params:
                from json2html import json2html

                request_details += f"<b>Params:</b><br>{json2html.convert(json=json.dumps(params, indent=4, sort_keys=True))}<br><br>"

        if not msg:
            return request_details

        msg += f"<br><br><hr><br>{request_details}"

        return msg

    def get_error_for_email(self, error, from_set_response):
        if not error and self._response.get("error"):
            if self._response["error"] == self._missing_return_data_tag and not from_set_response:
                pass  # This function was called outside of this script, before return data was set, and not triggered by an error
            else:
                error = self._response["error"]

                if self.ignore_error_email(error):
                    return None  # For special cases

                if self._response.get("_error"):
                    private_error = self._response["_error"].replace("\n", "<br>")

                    error += f"<br><br>Private error:<br>{private_error}"

        try:
            from traceback import format_exc

            tb = format_exc()

            if tb and str(tb).strip() != "NoneType: None":
                error += f"<br><br><b>Full traceback:</b><br>{tb}"
        except:
            pass

        # To assist in tracking down errors with unknown origin
        if error:
            try:
                from json2html import json2html

                error += f"<br><br><b>Env:</b><br>{json2html.convert(json=json.dumps(dict(os.environ), indent=4, sort_keys=True))}"
            except:
                pass

        return error or ""

    # Special cases that are safe to ignore and are ideally handled by raising a ClientAlert, but
    # can't be. and don't have a better place to be handled without breaking other functionality
    def ignore_error_email(self, error):
        ignore = [
            "Incorrect login information",
            "Account does not exist x7832",
            "Invalid Login x7283",
            "Select a password with at least 6 characters - x72378"
        ]

        if error in ignore:
            return True

        if self.__class__.__name__ == "Users" and self.Params.get("f") == "r" and "Invalid request token" in error:
            return True

        if "Missing param 'file'" in error:
            return True

        if "Unauthorized" in error:
            return True

        return False

    def set_dash_globals(self):
        """
        This allows us to inject content from this class in all instances of this module running in this shell.
        """

        if self._proceeding_with_empty_fs:
            return  # See notes in init

        self.dash_global.RequestData = self._params
        self.dash_global.RequestUser = self.User
        self.dash_global.Context = self.DashContext

    def get_field_storage_data(self):
        data = {}

        if self._proceeding_with_empty_fs:
            return data  # See notes in init

        keys = self._fs.keys()

        for key in keys:
            if key in data:
                continue

            try:
                mini_field_storage = self._fs[key]
            except:
                continue

            # This catches GitHub Webhook param issues
            if type(mini_field_storage) is list:
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
        from Dash.Utils import ClientAlert

        self._response = {"error": self._missing_return_data_tag}

        try:
            f()

        # See ClientAlert docstring for explainer - don't use this without reading that first
        except ClientAlert as e:
            self._send_email_on_error = False

            self.SetResponse({"error": str(e)})

        except Exception as e:
            self.SetError(e, format_exception=True)

        except:
            self.SetError(format_exception=True)

    def _send_email(self, subject, notify_email_list, msg, error, strict_notify, sender_name):
        from Dash.Utils import SendEmail

        try:
            SendEmail(
                subject=subject,
                notify_email_list=notify_email_list,
                msg=msg,
                error=error,
                strict_notify=strict_notify,
                sender_email=self.DashContext.get("admin_from_email"),
                sender_name=sender_name
            )

        # Adding this as a safeguard for now, until we can confirm that the Candy token refresh issue is not an issue
        except Exception:
            from Dash import AdminEmails
            from traceback import format_exc

            # Send additional email explaining the failure, likely token refresh issue
            SendEmail(
                subject="ApiCore.SendEmail Error",
                msg=(
                    f"Email failed to send from '{self.DashContext.get('admin_from_email') or AdminEmails[0]}', "
                    f"likely due to an token that failed to refresh (see error to confirm):"
                ),
                error=format_exc()
            )

            # Send intended email using default from-email to at least ensure we get it
            SendEmail(
                subject=subject,
                notify_email_list=notify_email_list,
                msg=msg,
                error=error,
                strict_notify=strict_notify,
                sender_name=(self.DashContext.get("code_copyright_text") or self.DashContext.get("display_name"))
            )

    # DEPRECATED (see comment)
    def Execute(uninstantiated_class_ref):  # noqa
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

        Execute(uninstantiated_class_ref)


def Execute(uninstantiated_class_ref):
    """
    This exists as a wrapper to cgi scripts using ApiCore and helps to catch common errors more flexibly.

    :param class uninstantiated_class_ref: Any uninstantiated class reference object to test
    """

    try:
        uninstantiated_class_ref()

    except Exception as e:
        from traceback import format_exc

        print_json({"error": f"{e}\n\nTraceback:\n{format_exc()}"})

    except:
        from traceback import format_exc

        print_json({"error": format_exc(), "script_execution_failed": True})

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
