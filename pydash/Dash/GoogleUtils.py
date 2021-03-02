#!/usr/bin/python
#
# Altona 2021 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys
import json
import gspread
import httplib2
import requests
import datetime

from oauth2client import client
from dateutil.tz import tzlocal


class __GUtils:
    def __init__(self):
        pass

    def get_token_json(self):
        response = requests.post("https://authorize.oapi.co/?f=get_token_data&service_name=gdrive")

        try:
            response = json.loads(response.text)
        except:
            print("\nFAILED TO GET TOKEN FROM SERVER\n")
            sys.exit()

        token_data = eval(response["token_data"])
        return token_data

    def get_service(self, gspread_auth=False):
        token_json = self.get_token_json()
        credentials = client.OAuth2Credentials(
            access_token=token_json["access_token"],
            client_id=token_json["client_id"],
            client_secret=token_json["client_secret"],
            refresh_token=token_json["refresh_token"],
            token_expiry=token_json["token_expiry"],
            token_uri=token_json["token_uri"],
            revoke_uri=token_json["revoke_uri"],
            user_agent=None,
        )

        if gspread_auth:
            return gspread.authorize(credentials)
        else:
            return credentials.authorize(httplib2.Http())


GUtils = __GUtils()
