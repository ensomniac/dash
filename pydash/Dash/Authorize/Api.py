#!/usr/bin/python
#
# Copyright (c) 2022 Ensomniac Studios. All rights reserved. This material
# contains the confidential and proprietary information of Ensomniac Studios
# and may not be copied in whole or in part without the express written permission
# of Ensomniac Studios. This copyright notice does not imply publication.
#
# Ensomniac Studios 2022 Ryan Martin, ryan@ensomniac.com
#                        Andrew Stet, stetandrew@gmail.com

import os
import sys
import cgi
import json

from dateutil import parser
from datetime import datetime
from Authorize import Authorize
from Dash.Utils import OapiRoot
from traceback import format_exc
from Services import get_by_name


class EnsomniacMail:
    def __init__(self):
        self.mini_storage = {}
        self.field_storage = cgi.FieldStorage()
        self.data = self.get_data()
        self.html_title = None
        self.html_content = None
        self.redirect_url = None
        self.return_data = {"error": "Unauthorized"}
        self.local_storage_path = os.path.join(OapiRoot, "authorize", "local_storage")
        self.flow_path = os.path.join(self.local_storage_path, "flow")

        try:
            self.function = eval(f"self.{self.data['f']}")
        except:
            self.function = None

        if self.function:
            try:
                self.function()
            except:
                self.return_data = {"error": f"There was a scripting problem: {format_exc()}"}

        if not self.html_content and not self.redirect_url and self.return_data.get("error") and len(self.return_data.keys()) == 1:
            self.html_content = self.format_error_html()

        if self.html_content:
            self.print_html()

        elif self.redirect_url:
            self._redirect()

        else:
            self.print_return_data()

    # This is what gets called by the redirected endpoint (authorize.oapi.co/{service_name})
    def authorize_service(self):
        if self.data.get("service_name") == "r":
            self.redirect()

            return

        if self.data.get("token"):
            self.get_token()

            return

        if self.data.get("all"):
            self.get_all()

            return

        if self.data.get("service_data"):
            self.merge_service_data()

            return

        # self.return_data = {"error": None, "keys": str(self.data.keys()), "service": self.data.get("service")}
        #
        # return

        service = get_by_name(self.data.get("service_name"))

        if not service:
            self.return_data = {"error": f"Unknown Service Name '{self.data.get('service_name')}'"}

            return

        auth = Authorize(self.data.get("service_name"))

        # Always re-authorize anyway, doesn't hurt, no need to skip
        # if auth.is_authorized():
        #     self.return_data = {"error": "This service is authorized"}
        #     return

        # We're not authorized

        auth_uri = auth.get_step1_authorize_url()

        if not auth_uri:
            self.return_data = {"error": f"Unable to obtain authorization URL for service: {auth.service.name}"}

            return

        button = f'''<div style="padding:0px;margin:10px;margin-top:15px;border:0px;"><a href="{auth_uri}'''
        button += '''" style="text-decoration:none;font-weight:normal;color:#FFFFFF;font-size:12px;'''
        button += '''background-color:#4865C7;text-align:center;font-family:arial, helvetica, sans-serif;'''
        button += f'''padding:10px;margin:0px;border:0px;">Authorize {auth.service.name.title()} Now</a></div>'''

        self.write_data(os.path.join(
            self.flow_path, auth.service.name),
            {
                "service_name": auth.service.name,
                "flow_initiated": datetime.now()
            }
        )

        self.html_content = button
        self.return_data = {"error": None, "url": auth_uri}

    # Print the error to the window rather than displaying it as json
    def format_error_html(self):
        html_content = [
            "<b>There was a problem with this request:</b>",
            ""
        ]

        html_content.extend(self.return_data.get("error").split("\n"))

        style = '''style="text-decoration:none;font-weight:normal;color:#222;background:rgba(143, 133, 233, 0.2);'''
        style += '''font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;margin:10px;padding:10px;"'''

        return "<div " + style + ">" + "<br>\n".join(html_content) + "</div>"

    def redirect(self):
        code = self.data.get("code")

        if not code:
            self.return_data = {"error": "Authorization failed. Expected code but didn't get one."}

            return

        # We have the code, but we have no idea who we're trying to authorize - let's find out

        all_flows = []
        now = datetime.now()

        for auth_path in os.listdir(self.flow_path):
            auth_data = self.read_data(os.path.join(self.flow_path, auth_path))
            seconds_since = (now - auth_data["flow_initiated"]).total_seconds()

            if seconds_since > 300:
                continue  # Change this to 60

            all_flows.append([seconds_since, auth_path, auth_data])

        all_flows.sort()

        if not all_flows:
            self.return_data = {"error": "Authorization failed. Error x23489"}

            return

        service_name = all_flows[0][1]
        flow_data = all_flows[0][2]

        flow_data["code"] = code
        flow_data["code_stored_on"] = now

        # Now that we have the code, let's exchange it for a token

        auth = Authorize(flow_data.get("service_name"))
        token_result = auth.exchange_code_for_token(flow_data["code"])

        if token_result.get("error"):
            self.return_data = {"error": token_result["error"]}

            return

        flow_data["token_data"] = token_result["token_data"]
        flow_data["token_stored_on"] = datetime.now()

        email = ""

        # TODO: Once Spotify service error has been resolved (see TODO in Services.py),
        #  update the method of getting the email from the response here, specifically for spotify
        if flow_data["token_data"].get("id_token"):
            email = flow_data["token_data"]["id_token"].get("email")

        if not email:
            raise Exception("User email missing from response data, can't identify who these credentials are for.")

        path = self.get_data_path(email, service_name)

        self.write_data(path, flow_data)

        self.return_data = {"error": None, "authorization_successful": True, "path": path, "data": str(flow_data), "TEST": email}

    # TODO: propagate this throughout the code (why did it still create a 'gdrive' file?)
    def get_data_path(self, email, service_name):
        return os.path.join(self.flow_path, f"{email}_{service_name}")

    def get_token(self):
        token = None

        try:
            auth = Authorize(self.data.get("service_name"))
            auth_data = self.read_data(os.path.join(self.flow_path, auth.service.name))
            token_data = auth_data.get("token_data")
            token = token_data.get(auth.service.access_token_key)
        except:
            pass

        self.return_data = {"error": None, "token": str(token)}

    def get_token_data(self):
        try:
            auth = Authorize(self.data.get("service_name"))
            auth_data = self.read_data(os.path.join(self.flow_path, auth.service.name))
            token_data = auth_data.get("token_data")
        except:
            raise Exception(format_exc())

        if not token_data:
            raise Exception(f"No token data: {token_data}")

        self.return_data = {"error": None, "token_data": str(token_data)}

    def get_all(self):
        auth = Authorize(self.data.get("service_name"))
        auth_data = self.read_data(os.path.join(self.flow_path, auth.service.name))

        if auth_data:
            self.return_data = {"error": None, "data": json.dumps(auth_data)}
        else:
            self.return_data = {"error": "Authorization data isn't available on the server"}

    def merge_service_data(self):
        auth = Authorize(self.data.get("service_name"))
        service_data = json.loads(self.data.get("service_data"))

        self.write_data(os.path.join(self.flow_path, auth.service.name), service_data)

        self.return_data = {"error": None}

    def datetime_to_iso(self, data_dict_or_list):
        mode_dict = False

        if "dict" in str(type(data_dict_or_list)):
            clean_data_dict_or_list = {}
            mode_dict = True

        elif "list" in str(type(data_dict_or_list)):
            clean_data_dict_or_list = []

        else:
            raise Exception("Only dicts or lists are valid for this function")

        for key in data_dict_or_list:
            if mode_dict:
                value = data_dict_or_list[key]
            else:
                value = key

            if "datetime" in str(type(value)):
                value = value.isoformat()

            elif "list" in str(type(value)):
                value = self.datetime_to_iso(value)

            elif "dict" in str(type(value)):
                value = self.datetime_to_iso(value)

            if mode_dict:
                clean_data_dict_or_list[key] = value
            else:
                clean_data_dict_or_list.append(value)

        return clean_data_dict_or_list

    def iso_to_datetime(self, data_dict_or_list):
        mode_dict = False

        if "dict" in str(type(data_dict_or_list)):
            clean_data_dict_or_list = {}
            mode_dict = True

        elif "list" in str(type(data_dict_or_list)):
            clean_data_dict_or_list = []

        else:
            raise Exception("Only dicts or lists are valid for this function")

        for key in data_dict_or_list:
            if mode_dict:
                value = data_dict_or_list[key]
            else:
                value = key

            if "str" in str(type(value)):
                if "T" in value and ":" in value and "-" in value:
                    try:
                        value = parser.parse(value)
                    except:
                        raise Exception(f"Failed to parse date {value}")

            elif "list" in str(type(value)):
                value = self.iso_to_datetime(value)

            elif "dict" in str(type(value)):
                value = self.iso_to_datetime(value)

            if mode_dict:
                clean_data_dict_or_list[key] = value
            else:
                clean_data_dict_or_list.append(value)

        return clean_data_dict_or_list

    # ------------------ API FUNCTIONS ------------------

    def write_data(self, full_path, data_to_write):
        open(full_path, "w").write(json.dumps(self.datetime_to_iso(data_to_write)))

    def read_data(self, full_path):
        try:
            data = open(full_path, "r").read()
        except:
            raise Exception(f"Failed to read file: {full_path}")

        return self.iso_to_datetime(json.loads(data))

    def noFunction(self):
        self.return_data = {"error": "Function not found or not specified"}

    def print_html(self):
        if self.html_title:
            title = self.html_title
        else:
            title = "Authorization needed"

        print("\n".join([
            "Content-Type: text/html\n",
            "<!DOCTYPE HTML>",
            '<html lang="en-US">',
            '''<head>''',
            '''<meta charset="UTF-8">''',
            '''<title>''' + title + '''</title>''',
            '''</head>''',
            '''<body style="text-decoration:none;padding:0px;margin:0px;border:0px;">''' + self.html_content + '''</body>''',
            '''</html>'''
        ]))

        # print self.html_content

    def print_return_data(self):
        print("Content-type: text/plain")
        print("")
        print(str(json.dumps(self.return_data)))

    def get_data(self):
        data = {}

        for key in self.field_storage.keys():
            mini_field_storage = self.field_storage[key]

            data[key] = mini_field_storage.value

            self.mini_storage[key] = mini_field_storage

        return data

    def _redirect(self):
        print("Location:" + self.redirect_url + "\r\n")


if __name__ == "__main__":
    EnsomniacMail()
