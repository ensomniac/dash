# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class GUtils:
    _creds: object
    _oauth2_creds: object
    _gspread_creds: object
    _drive_client: callable
    _sheets_client: callable

    def __init__(self):
        pass

    @property
    def DriveClient(self):
        if not hasattr(self, "_drive_client"):
            from googleapiclient.discovery import build

            self._drive_client = build("drive", "v3", http=self.OAuth2Creds)

        return self._drive_client

    @property
    def SheetsClient(self):
        if not hasattr(self, "_sheets_client"):
            from googleapiclient.discovery import build

            self._sheets_client = build("sheets", "v4", http=self.OAuth2Creds)

        return self._sheets_client

    @property
    def OAuth2Creds(self):
        if not hasattr(self, "_oauth2_creds"):
            from httplib2 import Http

            self._oauth2_creds = self.credentials.authorize(Http())

        return self._oauth2_creds

    @property
    def GSpreadCreds(self):
        if not hasattr(self, "_gspread_creds"):
            from gspread import authorize as g_authorize

            self._gspread_creds = g_authorize(self.credentials)

        return self._gspread_creds

    @property
    def DriveFolderMimeType(self):
        return "application/vnd.google-apps.folder"

    @property
    def credentials(self):
        if not hasattr(self, "_creds"):
            from json import loads
            from requests import post
            from oauth2client.client import OAuth2Credentials

            # These unused imports are required for the eval() call for some reason (inspection suppressed with noqa tag)
            import datetime                  # noqa
            from dateutil.tz import tzlocal  # noqa

            response = post("https://authorize.oapi.co/?f=get_token_data&service_name=gdrive")

            try:
                response = loads(response.text)
            except:
                raise Exception("Failed to get Google token from server")

            token_json = eval(response["token_data"])

            self._creds = OAuth2Credentials(
                access_token=token_json["access_token"],
                client_id=token_json["client_id"],
                client_secret=token_json["client_secret"],
                refresh_token=token_json["refresh_token"],
                token_expiry=token_json["token_expiry"],
                token_uri=token_json["token_uri"],
                revoke_uri=token_json["revoke_uri"],
                user_agent=None
            )

        return self._creds
