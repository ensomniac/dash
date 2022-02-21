#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class GUtils:
    def __init__(self, user_email=""):
        self._user_email = user_email

        if not self._user_email:
            from Dash import AdminEmails

            self._user_email = AdminEmails[0]  # Ryan's email (default)

        self._auth_utils = _AuthUtils(self)
        self._drive_utils = _DriveUtils(self)
        self._sheets_utils = _SheetsUtils(self)

    @property
    def UserEmail(self):
        return self._user_email

    @property
    def OAuth2Creds(self):
        return self._auth_utils.OAuth2Creds

    # ========================= SHEETS =========================
    @property
    def SheetsClient(self):
        return self._sheets_utils.Client

    @property
    def GSpreadCreds(self):
        return self._sheets_utils.GSpreadCreds

    def GetSheetData(self, sheet_id):
        return self._sheets_utils.GetData(sheet_id)

    def GetNewSheet(self, sheet_name):
        return self._sheets_utils.GetNew(sheet_name)

    def DownloadSheetAsXLSX(self, sheet_id, xlsx_path):
        return self._sheets_utils.DownloadAsXLSX(sheet_id, xlsx_path)

    # ========================= DRIVE =========================
    @property
    def DriveClient(self):
        return self._drive_utils.Client

    @property
    def DriveFolderMimeType(self):
        return self._drive_utils.FolderMimeType

    @property
    def DriveFields(self):
        return self._drive_utils.Fields

    def CreateDriveFile(self, params, file_path=None, in_shared_drive=False, fields=""):
        return self._drive_utils.CreateFile(params, file_path, in_shared_drive, fields)

    def DeleteDriveFile(self, file_id, in_shared_drive=False, fields=""):
        return self._drive_utils.DeleteFile(file_id, in_shared_drive, fields)

    def MoveDriveFile(self, file_id, old_parent_id, new_parent_id, in_shared_drive=False, fields=""):
        return self._drive_utils.MoveFile(file_id, old_parent_id, new_parent_id, in_shared_drive, fields)

    def UpdateDriveFileByKeys(self, file_id, params, fields="", in_shared_drive=False):
        return self._drive_utils.UpdateFileByKeys(file_id, params, fields, in_shared_drive)

    def GetDriveFileDataByID(self, file_id, in_shared_drive=False, fields_override=""):
        return self._drive_utils.GetFileDataByID(file_id, in_shared_drive, fields_override)

    def GetDriveFileDataByName(self, filename, drive_id, parent_id="", is_folder=False, fields="", extra_query="", raise_duplicates=True, in_shared_drive=False):
        return self._drive_utils.GetFileDataByName(filename, drive_id, parent_id, is_folder, fields, extra_query, raise_duplicates, in_shared_drive)

    def GetAllDriveFiles(self, drive_id, extra_query="", fields_override="", is_shared_drive=False, include_deleted=False):
        return self._drive_utils.GetAllFiles(drive_id, extra_query, fields_override, is_shared_drive, include_deleted)

    def GetDriveFilePermissions(self, file_id, in_shared_drive=False, fields="id, emailAddress, role"):
        return self._drive_utils.GetFilePermissions(file_id, in_shared_drive, fields)

    def AddPermissionToDriveFile(self, user_email, file_id, permission_level="writer", notify_user=False, in_shared_drive=False):
        return self._drive_utils.AddPermissionToFile(user_email, file_id, permission_level, notify_user, in_shared_drive)

    def RemovePermissionFromDriveFile(self, user_email, file_id, in_shared_drive=False, permission_id=""):
        return self._drive_utils.RemovePermissionFromFile(user_email, file_id, in_shared_drive, permission_id)


class _DriveUtils:
    _client: callable

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_drive_client"):
            from googleapiclient.discovery import build

            self._client = build("drive", "v3", http=self.gutils.OAuth2Creds)

        return self._client

    @property
    def FolderMimeType(self):
        return "application/vnd.google-apps.folder"

    @property
    def Fields(self):
        """
        Available data keys to request in a response from the Drive client.
        The more keys there are, the heavier the request - keep it minimal.

        :return: Default, light-weight set of field key names, separated by commas
        :rtype: str
        """

        fields = [
            "id",
            "name",
            # "parents",                        # List of parent IDs (usually only the immediate parent)
            # "mimeType",                       # Google API file type, such as self.DriveFolderMimeType
            # "createdTime",
            # "modifiedTime",
            # "lastModifyingUser/displayName",  # Display name key of last modifying user from user info object

            "webViewLink",                    # URL to view the file (requires being logged in or authenticated)
            "thumbnailLink",                  # URL to view the file (does not require being logged in or authenticated)
            # "webContentLink",                 # URL to download the file (requires being logged in or authenticated)
        ]

        return ", ".join(fields)

    def CreateFile(self, params, file_path=None, in_shared_drive=False, fields=""):
        """
        | Update file data or metadata, such as file/folder description.
        |
        | Params ref: https://developers.google.com/drive/api/v3/reference/files/create#request-body

        :param dict params: Request parameters that match accepted keys for request body
        :param str file_path: Path to optional file for upload (default=None)
        :param bool in_shared_drive: File lives in a shared drive (default=False)
        :param str fields: Requested fields, if different than self.fields (default="")

        :return: New file/folder data
        :rtype: dict
        """

        file = None

        if file_path:
            from googleapiclient.http import MediaFileUpload

            file = MediaFileUpload(file_path)

        return self.Client.files().create(
            supportsAllDrives=in_shared_drive,
            fields=fields or self.Fields,
            body=params,
            media_body=file
        ).execute()

    def DeleteFile(self, file_id, in_shared_drive=False, fields=""):
        return self.Client.files().delete(
            supportsAllDrives=in_shared_drive,
            fields=fields or self.Fields,
            fileId=file_id
        ).execute()

    def MoveFile(self, file_id, old_parent_id, new_parent_id, in_shared_drive=False, fields=""):
        return self.Client.files().update(
            supportsAllDrives=in_shared_drive,
            fields=fields or self.Fields,
            fileId=file_id,
            removeParents=old_parent_id,
            addParents=new_parent_id
        ).execute()

    def UpdateFileByKeys(self, file_id, params, fields="", in_shared_drive=False):
        """
        | Update file data or metadata, such as file/folder description.
        |
        | Params ref: https://developers.google.com/drive/api/v3/reference/files/update#request-body

        :param str file_id: File/folder Drive ID to be updated
        :param dict params: Request parameters that match accepted keys for request body
        :param str fields: Requested fields, if different than self.fields (default="")
        :param bool in_shared_drive: File lives in a shared drive (default=False)

        :return: Updated file/folder data
        :rtype: dict
        """

        return self.Client.files().update(
            supportsAllDrives=in_shared_drive,
            fields=fields or self.Fields,
            fileId=file_id,
            body=params
        ).execute()

    def GetFileDataByID(self, file_id, in_shared_drive=False, fields_override=""):
        """
        This is the fastest way to get file data, but requires the ID, which
        you won't typically have without first doing a slower/heavier pull.

        :param str file_id: Google Drive file ID
        :param bool in_shared_drive: File lives in a shared drive (default=False)
        :param str fields_override: Fields to override the default return fields

        :return: Data dictionary for requested file
        :rtype: dict
        """

        try:
            return self.Client.files().get(
                fileId=file_id,
                fields=(fields_override or self.Fields),
                supportsAllDrives=in_shared_drive
            ).execute()
        except:
            return None

    def GetFileDataByName(self, filename, drive_id, parent_id="", is_folder=False, fields="", extra_query="", raise_duplicates=True, in_shared_drive=False):
        """
        This is not as fast as GetFileDataByID(), but it's the best option when you don't have an ID.

        :param str filename: Google Drive file name
        :param str drive_id: Top-level drive ID
        :param str parent_id: Immediate parent ID (default="")
        :param bool is_folder: Is it a folder? (default=False)
        :param str fields: Fields to replace default query of self.fields (default="")
        :param str extra_query: Extra query string conditions to add to search query (default="")
        :param bool raise_duplicates: Raise exception if duplicates are found (default=True)
        :param bool in_shared_drive: File lives in a shared drive (default=False)

        :return: Data dictionary for requested file
        :rtype: dict
        """

        query = f"name='{filename}'"

        if is_folder:
            query += f" and mimeType='{self.FolderMimeType}'"

        if parent_id:
            query += f" and '{parent_id}' in parents"

        if extra_query:
            query += f" and {extra_query}"

        result = self.GetAllFiles(drive_id, query, fields, in_shared_drive)

        if len(result) == 1:
            return result[0]

        if raise_duplicates and len(result) > 1:
            raise Exception(f"Duplicates found for '{filename}':\n{result}")

        # Either no results, or too many - rebound to a more thorough request
        return None

    def GetAllFiles(self, drive_id, extra_query="", fields_override="", is_shared_drive=False, include_deleted=False):
        """
        | ** THIS IS A HEAVY PULL IF NO EXTRA QUERY **
        |
        | Get all files/folders in Master Drive.
        |
        | This can be narrowed down by adding extra queries, which must follow the
          guidelines listed here: https://developers.google.com/drive/api/v3/search-files

        :param str drive_id: Top-level drive ID
        :param str extra_query: Extra query string conditions to add to search query (default="")
        :param str fields_override: Fields to override the default return fields (default="")
        :param bool is_shared_drive: Drive to get files from is a shared drive, or includes a shared drive (default=False)
        :param bool include_deleted: Fields to override the default return fields (default=False)

        :return: List of data dictionaries for each file/folder
        :rtype: list
        """

        if include_deleted:
            query = extra_query
        else:
            query = "trashed=false"

            if extra_query:
                query += f" and {extra_query}"

        files = self.Client.files().list(
            driveId=drive_id,
            corpora="drive",
            q=query,
            fields=f"files({(fields_override or self.Fields)})",
            supportsAllDrives=is_shared_drive,
            includeItemsFromAllDrives=is_shared_drive
        ).execute()["files"]

        return files

    def GetFilePermissions(self, file_id, in_shared_drive=False, fields="id, emailAddress, role"):
        return self.Client.permissions().list(
            supportsAllDrives=in_shared_drive,
            fields=f"permissions({fields})",
            fileId=file_id,
        ).execute()["permissions"]

    def AddPermissionToFile(self, user_email, file_id, permission_level="writer", notify_user=False, in_shared_drive=False):
        """
        | This will not update or demote an existing user. If a user already has access, it
          will just return that user's permission record with the fields specified below.
        |
        | Permission levels ref: https://developers.google.com/drive/api/v3/ref-roles
        |
        | Limitation: Shared drives don't allow setting individual permissions for files within it.
        """

        transfer_ownership = False

        # Required by the API
        if permission_level == "owner" or permission_level == "organizer":
            transfer_ownership = True
            notify_user = True

        return self.Client.permissions().create(
            supportsAllDrives=in_shared_drive,
            transferOwnership=transfer_ownership,
            fields="emailAddress, role, displayName, id",
            fileId=file_id,
            sendNotificationEmail=notify_user,
            body={
                "type": "user",
                "emailAddress": user_email,
                "role": permission_level
            }
        ).execute()

    def RemovePermissionFromFile(self, user_email, file_id, in_shared_drive=False, permission_id=""):
        if not permission_id:
            permissions = self.GetFilePermissions(file_id, in_shared_drive)

            for permission in permissions:
                if permission["emailAddress"] == user_email:
                    permission_id = permission["id"]

                    break

        if not permission_id:
            return None

        return self.Client.permissions().delete(
            supportsAllDrives=in_shared_drive,
            fileId=file_id,
            permissionId=permission_id
        ).execute()


class _SheetsUtils:
    _client: callable
    _gspread_creds: object

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_sheets_client"):
            from googleapiclient.discovery import build

            self._client = build("sheets", "v4", http=self.gutils.OAuth2Creds)

        return self._client

    @property
    def GSpreadCreds(self):
        if not hasattr(self, "_gspread_creds"):
            from gspread import authorize as g_authorize

            self._gspread_creds = g_authorize(self.gutils._auth_utils.credentials)  # noqa

        return self._gspread_creds

    def GetData(self, sheet_id):
        return self.Client.spreadsheets().get(
            spreadsheetId=sheet_id,
            includeGridData=True
        ).execute()["sheets"][0]

    def GetNew(self, sheet_name):
        return self.GSpreadCreds.open(sheet_name).get_worksheet(0)

    def DownloadAsXLSX(self, sheet_id, xlsx_path):
        from io import BytesIO
        from Dash.LocalStorage import Write
        from googleapiclient.http import MediaIoBaseDownload

        done = False
        file = BytesIO()

        downloader = MediaIoBaseDownload(
            file,
            self.gutils.DriveClient.files().export(
                fileId=sheet_id,
                fields="",  # Intentionally empty to make the request as fast as possible
                mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        )

        while done is False:
            status, done = downloader.next_chunk()

        Write(xlsx_path, file.getbuffer())

        return xlsx_path


class _AuthUtils:
    _creds: object
    _oauth2_creds: object

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def OAuth2Creds(self):
        if not hasattr(self, "_oauth2_creds"):
            from httplib2 import Http

            self._oauth2_creds = self.credentials.authorize(Http())

        return self._oauth2_creds

    @property
    def credentials(self):
        if not hasattr(self, "_creds"):
            from Dash.Authorize import GetTokenData

            try:
                token_json = GetTokenData(service_name="gdrive", user_email=self.gutils.UserEmail)

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
