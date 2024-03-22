#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from googleapiclient.errors import HttpError


def ParseHTTPError(http_error, params={}):
    """
    Attempt to decode Google's "unprintable" error (googleapiclient.errors.HttpError).
    """

    # Should never happen
    if not isinstance(http_error, HttpError):
        raise Exception(http_error)

    from json import loads

    errors = []

    try:
        msg = str(loads(http_error.content).get("error", {}).get("message", ""))

    except Exception as e:
        msg = ""

        errors.append(str(e))

    # This was causing vague errors to be raised, needed more detail
    # if msg:
    #     raise Exception(msg)

    error = str(http_error).strip().strip("\n").strip()

    try:
        message = (
            f'<HttpError {http_error.resp.status} when requesting {http_error.uri} '
            f'returned "{http_error._get_reason()}". Details: "{http_error.error_details}">'  # noqa
        )

    except Exception as e:
        errors.append(str(e))

        try:
            message = (
                f'<HttpError {http_error.resp.status} when requesting '
                f'{http_error.uri}. Details: "{http_error.error_details}">'
            )

        except Exception as e:
            errors.append(str(e))

            if len(error) and error != "Exception:":
                message = error

            else:
                message = (
                    "The Google API returned an error that was either empty, had no information, "
                    "or was unable to be parsed. Unfortunately, Google does this deliberately for "
                    "security reasons.\n\nThis means the operation failed on Google's end, but we "
                    "don't know why.\nPlease try again.\n\nIf this persists, even after waiting 10 "
                    "minutes or so, reach out to an administrator for assistance."
                )

    message += "\n\n\n\n***Google Error***:"

    if msg:
        message += f"\n(Message): {msg}"

    message += f"\n{error}"

    if len(errors):
        errors = "\n>>".join(errors)

        message += f"\n\n***Parser Errors***:\n{errors}"

    if params:
        from json import dumps

        message += f"\n\n***Params***:\n{dumps(params, indent=4, sort_keys=True)}"

    raise Exception(message)


class GUtils:
    def __init__(self, user_email=""):
        self._user_email = user_email

        if not self._user_email:
            from Dash import AdminEmails

            self._user_email = AdminEmails[0]

        self._auth_utils = _AuthUtils(self)
        self._docs_utils = _DocsUtils(self)
        self._drive_utils = _DriveUtils(self)
        self._sheets_utils = _SheetsUtils(self)
        self._slides_utils = _SlidesUtils(self)

    @property
    def UserEmail(self):
        return self._user_email

    @property
    def OAuth2Creds(self):
        return self._auth_utils.OAuth2Creds

    @property
    def PDFMimeType(self):
        return "application/pdf"

    def DownloadAsPDF(self, file_id, pdf_path, parent_id=""):
        return self.download_as(
            file_id=file_id,
            download_path=pdf_path,
            mime_type=self.PDFMimeType,
            parent_id=parent_id
        )

    def download_as(self, file_id, download_path, mime_type, fields="", parent_id=""):
        from io import BytesIO
        from Dash.LocalStorage import Write
        from googleapiclient.http import MediaIoBaseDownload

        done = False
        error = None
        file = BytesIO()

        params = {
            "fileId": file_id,
            "fields": fields,
            "mimeType": mime_type
        }

        try:
            downloader = MediaIoBaseDownload(file, self.DriveClient.files().export(**params))

            while done is False:
                status, done = downloader.next_chunk()

            Write(download_path, file.getbuffer())

        except HttpError as http_error:
            try:
                error = ParseHTTPError(http_error, params)

            except Exception as e:
                error = e

        except Exception as e:
            error = e

        if error:
            if "file is too large" in str(error):
                from Dash.Utils import ClientAlert

                msg = "The file is too big to be exported from Google's API as the desired format."

                if parent_id:
                    msg += (
                        f"\n\nYou can find the file in this folder:\nhttps://"
                        f"drive.google.com/drive/folders/{parent_id}\n\n"
                    )
                else:
                    msg += (
                        "\n\nIf you know which drive the source file was "
                        "uploaded to, you can open it directly there.\n"
                    )

                msg += "After opening the file, you can download it as the desired format using:\n[File]>[Download]"

                if not parent_id:
                    msg += (
                        "\n\nIf you don't know how to find the source file or the drive it "
                        "was uploaded to, please reach out to the dev team for assistance."
                    )

                msg += f"\n\nFull error:\n{error}"

                raise ClientAlert(msg)

            raise Exception(error)

        return download_path

    # ========================= SHEETS =========================

    @property
    def SheetsClient(self):
        return self._sheets_utils.Client

    @property
    def GSpreadCreds(self):
        return self._sheets_utils.GSpreadCreds

    @property
    def SheetsMimeType(self):
        return self._sheets_utils.SheetsMimeType

    @property
    def ExcelMimeType(self):
        return self._sheets_utils.ExcelMimeType

    def GetSheetData(self, sheet_id, row_data_only=True):
        return self._sheets_utils.GetData(sheet_id, row_data_only)

    def GetParsedSheetData(self, sheet_id, header_row_index=None):
        return self._sheets_utils.GetParsedData(sheet_id, header_row_index)

    def GetNewSheet(self, sheet_name):
        return self._sheets_utils.GetNew(sheet_name)

    def DownloadSheetAsXLSX(self, sheet_id, xlsx_path, parent_id=""):
        return self._sheets_utils.DownloadAsXLSX(sheet_id, xlsx_path, parent_id)

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

    # ========================= SLIDES =========================

    @property
    def SlidesClient(self):
        return self._slides_utils.Client

    @property
    def SlidesMimeType(self):
        return self._slides_utils.SlidesMimeType

    # ========================= DOCS =========================

    @property
    def DocsClient(self):
        return self._docs_utils.Client

    @property
    def DocsMimeType(self):
        return self._docs_utils.DocsMimeType


class _DriveUtils:
    _client: callable

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
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

        if not params.get("mimeType") and file_path:
            from Dash.Utils import GetDraftingExtensions

            ext = file_path.split(".")[-1].strip().lower()

            if ext in GetDraftingExtensions():
                params["mimeType"] = "application/x-autocad"

        file = None

        if file_path:
            from googleapiclient.http import MediaFileUpload

            file = MediaFileUpload(file_path)

        _params = {
            "supportsAllDrives": in_shared_drive,
            "fields": fields or self.Fields,
            "body": params,
            "media_body": file
        }

        try:
            return self.Client.files().create(**_params).execute()

        except HttpError as http_error:
            _params["media_body"] = "(MediaFileUpload object) truncated..."

            ParseHTTPError(http_error, _params)

        except UnicodeEncodeError as e:
            if file_path:
                file_ext = file_path.lower().strip().split(".")[-1]

                if file_ext and file_ext in [
                    # Add to this as more come up
                    "eml"
                ]:
                    from Dash.Utils import ClientAlert

                    raise ClientAlert(f"'.{file_ext}' files cannot be uploaded due to encoding restrictions of the Google API")

            raise UnicodeEncodeError(e.encoding, e.object, e.start, e.end, e.reason)

    def DeleteFile(self, file_id, in_shared_drive=False, fields=""):
        params = {
            "supportsAllDrives": in_shared_drive,
            "fields": fields or self.Fields,
            "fileId": file_id
        }

        try:
            return self.Client.files().delete(**params).execute()

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

    def MoveFile(self, file_id, old_parent_id, new_parent_id, in_shared_drive=False, fields=""):
        params = {
            "supportsAllDrives": in_shared_drive,
            "fields": fields or self.Fields,
            "fileId": file_id,
            "removeParents": old_parent_id,
            "addParents": new_parent_id
        }

        try:
            return self.Client.files().update(**params).execute()

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

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

        _params = {
            "supportsAllDrives": in_shared_drive,
            "fields": fields or self.Fields,
            "fileId": file_id,
            "body": params
        }

        try:
            return self.Client.files().update(**_params).execute()

        except HttpError as http_error:
            ParseHTTPError(http_error, _params)

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

        params = {
            "fileId": file_id,
            "fields": (fields_override or self.Fields),
            "supportsAllDrives": in_shared_drive
        }

        try:
            return self.Client.files().get(**params).execute()

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

        except:
            return None  # Why is this not being handled?

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

        params = {
            "driveId": drive_id,
            "corpora": "drive",
            "q": query,
            "fields": f"files({(fields_override or self.Fields)})",
            "supportsAllDrives": is_shared_drive,
            "includeItemsFromAllDrives": is_shared_drive
        }

        try:
            return self.Client.files().list(**params).execute()["files"]

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

    def GetFilePermissions(self, file_id, in_shared_drive=False, fields="id, emailAddress, role"):
        params = {
            "supportsAllDrives": in_shared_drive,
            "fields": f"permissions({fields})",
            "fileId": file_id
        }

        try:
            return self.Client.permissions().list(**params).execute()["permissions"]

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

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

        params = {
            "supportsAllDrives": in_shared_drive,
            "transferOwnership": transfer_ownership,
            "fields": "emailAddress, role, displayName, id",
            "fileId": file_id,
            "sendNotificationEmail": notify_user,
            "body": {
                "type": "user",
                "emailAddress": user_email,
                "role": permission_level
            }
        }

        try:
            return self.Client.permissions().create(**params).execute()

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

    def RemovePermissionFromFile(self, user_email, file_id, in_shared_drive=False, permission_id=""):
        if not permission_id:
            permissions = self.GetFilePermissions(file_id, in_shared_drive)

            for permission in permissions:
                if permission["emailAddress"] == user_email:
                    permission_id = permission["id"]

                    break

        if not permission_id:
            return None

        params = {
            "supportsAllDrives": in_shared_drive,
            "fileId": file_id,
            "permissionId": permission_id
        }

        try:
            return self.Client.permissions().delete(**params).execute()

        except HttpError as http_error:
            ParseHTTPError(http_error, params)


class _SheetsUtils:
    _client: callable
    _gspread_creds: object

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("sheets", "v4", http=self.gutils.OAuth2Creds)

        return self._client

    @property
    def GSpreadCreds(self):
        if not hasattr(self, "_gspread_creds"):
            from gspread import authorize as g_authorize

            self._gspread_creds = g_authorize(self.gutils._auth_utils.credentials)  # noqa

        return self._gspread_creds

    @property
    def SheetsMimeType(self):
        return "application/vnd.google-apps.spreadsheet"

    @property
    def ExcelMimeType(self):
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    def GetData(self, sheet_id, row_data_only=True):
        """
        Note: This doesn't currently account for extra, empty rows at the bottom.
        """

        data = {}

        params = {
            "spreadsheetId": sheet_id,
            "includeGridData": True
        }

        try:
            data = self.Client.spreadsheets().get(**params).execute()["sheets"][0]

        except HttpError as http_error:
            ParseHTTPError(http_error, params)

        if row_data_only and data.get("data"):
            return data["data"][0]["rowData"]

        return data

    def GetParsedData(self, sheet_id, header_row_index=None):
        parsed = []
        headers = []
        rows = self.GetData(sheet_id)

        if header_row_index is not None:
            header_row = rows.pop(header_row_index)["values"]

            for col in header_row:
                headers.append(col.get("formattedValue"))

        for row in rows:
            row_data = {}
            row = row["values"]

            for index, col in enumerate(row):
                if headers:
                    try:
                        row_data[headers[index]] = col.get("formattedValue")
                    except IndexError:
                        row_data[f"col_{index}"] = col.get("formattedValue")
                else:
                    row_data[f"col_{index}"] = col.get("formattedValue")

            parsed.append(row_data)

        return parsed

    def GetNew(self, sheet_name):
        return self.GSpreadCreds.open(sheet_name).get_worksheet(0)

    def DownloadAsXLSX(self, sheet_id, xlsx_path, parent_id=""):
        return self.gutils.download_as(
            file_id=sheet_id,
            download_path=xlsx_path,
            mime_type=self.ExcelMimeType,
            parent_id=parent_id
        )


class _SlidesUtils:
    _client: callable

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("slides", "v1", http=self.gutils.OAuth2Creds)

        return self._client

    @property
    def SlidesMimeType(self):
        return "application/vnd.google-apps.presentation"


class _DocsUtils:
    _client: callable

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("docs", "v1", http=self.gutils.OAuth2Creds)

        return self._client

    @property
    def DocsMimeType(self):
        return "application/vnd.google-apps.document"


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
