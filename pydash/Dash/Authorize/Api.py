#!/usr/bin/python
#
# Author:  Ryan Martin ryan@ensomniac.com
#

import cgi
import os
import json
import traceback
import datetime
import Authorize
from dateutil import parser

class EnsomniacMail:
    def __init__(self, isModule):
        self.FieldStorage = cgi.FieldStorage()

        self.miniStorage = {}
        self.data = self.get_data()

        self.return_data = {"error": "Unauthorized"}

        self.html_content = None
        self.htmlTitle = None
        self.redirect_url = None

        self.local_storage_path = "/var/www/vhosts/oapi.co/authorize/local_storage/"
        self.flow_path = self.local_storage_path + "flow/"

        try:
            self.function = eval("self." + self.data["f"])
        except:
            self.function = None

        if self.function:
            try:
                self.function()
            except:
                tb = traceback.format_exc()
                self.return_data = {"error": "There was a scripting problem: " + str(tb)}

        if not self.html_content and not self.redirect_url and self.return_data.get("error") and len(self.return_data.keys()) == 1:
            self.html_content = self.format_error_html()

        if self.html_content:
            self.print_html()
        elif self.redirect_url:
            self._redirect()
        else:
            self.print_return_data()



    def format_error_html(self):
        # Print the error to the window rather than displaying it as json
        html_content = ["<b>There was a problem with this request:</b>"]
        html_content.append("")
        html_content.extend(self.return_data.get("error").split("\n"))

        style = '''style="text-decoration:none;font-weight:normal;color:#222;background:rgba(143, 133, 233, 0.2);'''
        style += '''font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;'''
        style += '''margin:10px;padding:10px;"'''

        return "<div " + style + ">" + "<br>\n".join(html_content) + "</div>"

    def redirect(self):
        code = self.data.get("code")

        if not code:
            self.return_data = {"error": "Authorization failed. Expected code but didn't get one."}
            return

        # Okay, we have the code, but we have no idea who we're trying to authorize. Let's find out
        all_flows = []
        now = datetime.datetime.now()

        for auth_path in os.listdir(self.flow_path):
            auth_data = self.read_data(self.flow_path + auth_path)
            seconds_since = (now-auth_data["flow_initiated"]).total_seconds()
            if seconds_since > 300: continue # Change this to 60

            all_flows.append([seconds_since, auth_path, auth_data])

        all_flows.sort()

        if not all_flows:
            self.return_data = {"error": "Authorization failed. Error x23489"}
            return

        flow_data_filename = all_flows[0][1]
        flow_data = all_flows[0][2]
        flow_data["code"] = code
        flow_data["code_stored_on"] = now

        # Now that we have the code, let's exchange it for a token
        auth = Authorize.Authorize(flow_data.get("service_name"))
        token_result = auth.exchange_code_for_token(flow_data["code"])

        if token_result.get("error"):
            self.return_data = {"error": token_result.get("error")}
            return

        flow_data["token_data"] = token_result["token_data"]
        flow_data["token_stored_on"] = datetime.datetime.now()

        self.write_data(self.flow_path + flow_data_filename, flow_data)

        self.return_data = {"error": None, "authorization_successfull": True, "path": self.flow_path + flow_data_filename, "data": str(flow_data)}

    def get_token(self):
        # Return token data
        token = None

        try:
            auth = Authorize.Authorize(self.data.get("service_name"))
            auth_data = self.read_data(self.flow_path + auth.service.name)
            token = auth_data["token_data"].get(auth.service.access_token_key)
        except:
            pass

        self.return_data = {"error": None, "token": str(token)}

    def get_token_data(self):
        # Return token data
        token = None

        try:
            auth = Authorize.Authorize(self.data.get("service_name"))
            auth_data = self.read_data(self.flow_path + auth.service.name)
            token_data = auth_data["token_data"]
        except:
            import traceback
            error = traceback.format_exc()
            raise Exception(error)
            pass

        self.return_data = {"error": None, "token_data": str(token_data)}


    def get_all(self):
        # Return token data

        auth = Authorize.Authorize(self.data.get("service_name"))
        auth_data = self.read_data(self.flow_path + auth.service.name)

        #import cPickle

        if auth_data:
            #self.return_data = {"error": None, "data": cPickle.dumps(auth_data)}
            self.return_data = {"error": None, "data": json.dumps(auth_data)}
        else:
            self.return_data = {"error": "Authorization data isn't available on the server"}

    def merge_service_data(self):
        #import cPickle

        auth = Authorize.Authorize(self.data.get("service_name"))

        #service_data = cPickle.loads(self.data.get("service_data"))
        service_data = json.loads(self.data.get("service_data"))

        self.write_data(self.flow_path + auth.service.name, service_data)

        self.return_data = {"error": None}




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
        # return

        service = Authorize.Services.get_by_name(self.data.get("service_name"))

        if not service:
            self.return_data = {"error": "Unknown Service Name '" + str(self.data.get("service_name")) + "'"}
            return

        auth = Authorize.Authorize(self.data.get("service_name"))

        # if auth.is_authorized():
        #     self.return_data = {"error": "This service is authorized"}
        #     return

        # We're not authorized

        auth_uri = auth.get_step1_authorize_url()

        if not auth_uri:
            self.return_data = {"error": "Unable to obtain authorization URL for service " + auth.service.name}
            return

        button = '''<div style="padding:0px;margin:10px;margin-top:15px;border:0px;"><a href="'''
        button += auth_uri + '''" style="text-decoration:none;font-weight:normal;color:#FFFFFF;'''
        button += '''background-color:#4865C7;font-size:12px;text-align:center;'''
        button += '''font-family:arial, helvetica, sans-serif;'''
        button += '''padding:10px;margin:0px;border:0px;">Authorize ''' + auth.service.name.title() + ''' Now</a></div>'''

        flow_data_path = self.flow_path + auth.service.name
        flow_data = {}
        flow_data["service_name"] = auth.service.name
        flow_data["flow_initiated"] = datetime.datetime.now()

        self.write_data(flow_data_path, flow_data)

        self.html_content = button
        self.return_data = {"error": None, "url": auth_uri}





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
                        datetime = parser.parse(value)
                        value = datetime
                    except:
                        raise Exception("Failed to parse date " + str(value))
                        pass

            elif "list" in str(type(value)):
                value = self.iso_to_datetime(value)
            elif "dict" in str(type(value)):
                value = self.iso_to_datetime(value)

            if mode_dict:
                clean_data_dict_or_list[key] = value
            else:
                clean_data_dict_or_list.append(value)

        return clean_data_dict_or_list






    ########### API FUNCTIONS ###########

    def write_data(self, fullPath, dataToWrite):
        #import cPickle
        #pickled_file = open(fullPath, 'w')
        #cPickle.dump(dataToWrite, pickled_file, cPickle.HIGHEST_PROTOCOL)
        #pickled_file.close()

        dataToWrite = self.datetime_to_iso(dataToWrite)

        open(fullPath, "w").write(json.dumps(dataToWrite))

    def read_data(self, fullPath):
        #import cPickle
        data = None

        # try:
        #     pickled_file = open(fullPath, 'r')
        #     data = cPickle.load(pickled_file)
        #     pickled_file.close()
        # except:
        #     pass

        try:
            data = open(fullPath, "r").read()
        except:
            raise Exception("Failed to read file: " + fullPath)

        data = json.loads(data)

        data = self.iso_to_datetime(data)

        return data

    def noFunction(self):
        self.return_data = {"error": "Function not found or not specified"}

    def print_html(self):
        html_to_display = []
        html_to_display.append('Content-Type: text/html\n')

        if self.htmlTitle:
            title = self.htmlTitle
        else:
            title = "Authorization needed"

        html_to_display.append("<!DOCTYPE HTML>")
        html_to_display.append('<html lang="en-US">')
        html_to_display.append('''<head>''')
        html_to_display.append('''<meta charset="UTF-8">''')
        html_to_display.append('''<title>''' + title + '''</title>''')
        html_to_display.append('''</head>''')
        html_to_display.append('''<body style="text-decoration:none;padding:0px;margin:0px;border:0px;">''' + self.html_content + '''</body>''')
        html_to_display.append('''</html>''')

        print("\n".join(html_to_display))

        #print self.html_content

    def print_return_data(self):
        print("Content-type: text/plain")
        print("")
        print(str(json.dumps(self.return_data)))

    def _redirect(self):
        print("Location:" + self.redirect_url + "\r\n")

    def get_data(self):
        data = {}

        for key in self.FieldStorage.keys():
            miniFieldStorage = self.FieldStorage[key]
            data[key] = miniFieldStorage.value

            self.miniStorage[key] = miniFieldStorage

        return data


if __name__ == "__main__":
    EnsomniacMail(False)
