#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash import AdminEmails


class GUtils:
    _creds: object
    _oauth2_creds: object
    _gspread_creds: object
    _drive_client: callable
    _sheets_client: callable

    def __init__(self, user_email=""):
        self._user_email = user_email or AdminEmails[0]

    @property
    def UserEmail(self):
        return self._user_email

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
            from Dash.Authorize import GetTokenData

            try:
                token_json = GetTokenData(service_name="gdrive", user_email=self._user_email)

            except Exception as e:
                raise Exception(f"Failed to get Google credentials, error:\n\n{e}")

            from oauth2client.client import OAuth2Credentials

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

    # TODO: When the full Google module is migrated from Altona to Dash, this needs to be moved there
    def DownloadSheetAsXLSX(self, sheet_id, xlsx_path):
        from io import BytesIO
        from Dash.LocalStorage import Write
        from googleapiclient.http import MediaIoBaseDownload

        done = False
        file = BytesIO()

        downloader = MediaIoBaseDownload(
            file,
            self.DriveClient.files().export(
                fileId=sheet_id,
                fields="",  # Intentionally empty to make the request faster
                mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        )

        while done is False:
            status, done = downloader.next_chunk()

        Write(xlsx_path, file.getbuffer())
