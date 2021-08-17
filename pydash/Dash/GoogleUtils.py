#!/usr/bin/python
#
# Altona 2021 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys

from json import loads
from requests import post
from httplib2 import Http
from gspread import authorize as g_authorize
from oauth2client.client import OAuth2Credentials

# These imports are required for the eval() call
import datetime
from dateutil.tz import tzlocal


class __GUtils:
    __creds: object
    __oauth2_creds: object
    __gspread_creds: object

    def __init__(self):
        pass

    @property
    def OAuth2Creds(self):
        if not hasattr(self, "__oauth2_creds"):
            self.__oauth2_creds = self.credentials.authorize(Http())

        return self.__oauth2_creds

    @property
    def GSpreadCreds(self):
        if not hasattr(self, "__gspread_creds"):
            self.__gspread_creds = g_authorize(self.credentials)

        return self.__gspread_creds

    @property
    def credentials(self):
        if not hasattr(self, "__creds"):
            self.__creds = self.get_credentials()

        return self.__creds

    def get_token_json(self):
        response = post("https://authorize.oapi.co/?f=get_token_data&service_name=gdrive")

        try:
            response = loads(response.text)
        except:
            print("\nFAILED TO GET TOKEN FROM SERVER\n")

            sys.exit()

        return eval(response["token_data"])

    def get_credentials(self):
        token_json = self.get_token_json()

        return OAuth2Credentials(
            access_token=token_json["access_token"],
            client_id=token_json["client_id"],
            client_secret=token_json["client_secret"],
            refresh_token=token_json["refresh_token"],
            token_expiry=token_json["token_expiry"],
            token_uri=token_json["token_uri"],
            revoke_uri=token_json["revoke_uri"],
            user_agent=None
        )


GUtils = __GUtils()
