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
        raise TypeError(f"Expected HttpError, got {type(http_error).__name__}: {http_error}")

    from json import loads

    errors = []

    try:
        msg = str(loads(http_error.content).get("error", {}).get("message", ""))

    except Exception as e:
        msg = ""

        errors.append(f"Error parsing message from HttpError content: {e}")

    error = str(http_error).strip().strip("\n").strip()

    try:
        message = (
            f'<HttpError {http_error.resp.status} when requesting {http_error.uri} '
            f'returned "{http_error._get_reason()}". Details: "{http_error.error_details}">'  # noqa
        )

    except Exception as e:
        errors.append(f"Error constructing HttpError details: {e}")

        try:
            message = (
                f'<HttpError {http_error.resp.status} when requesting '
                f'{http_error.uri}. Details: "{http_error.error_details}">'
            )

        except Exception as e:
            errors.append(f"Error constructing fallback HttpError details: {e}")

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

    if errors:
        errors = "\n>>".join(errors)

        message += f"\n\n***Parser Errors***:\n{errors}"

    if params:
        from json import dumps

        message += f"\n\n***Params***:\n{dumps(params, indent=4, sort_keys=True)}"

    raise Exception(message) from http_error


class GUtils:
    _auth_utils_: callable
    _docs_utils_: callable
    _drive_utils_: callable
    _sheets_utils_: callable
    _slides_utils_: callable
    _youtube_utils_: callable
    _youtube_auth_utils_: callable

    def __init__(self, user_email=""):
        self._user_email = user_email

        if not self._user_email:
            from Dash import AdminEmails

            self._user_email = AdminEmails[0]

    @property
    def UserEmail(self):
        return self._user_email

    @property  # For all Drive-based apps (not YouTube)
    def OAuth2Creds(self):
        return self._auth_utils.OAuth2Creds

    @property  # For all Drive-based apps (not YouTube)
    def BearerToken(self):
        return self._auth_utils.BearerToken

    @property
    def PDFMimeType(self):
        return "application/pdf"

    @property  # For all Drive-based apps (not YouTube)
    def _auth_utils(self):
        if not hasattr(self, "_auth_utils_"):
            self._auth_utils_ = _AuthUtils(self)

        return self._auth_utils_

    # If downloading a sheet as a PDF and landscape is needed, use DownloadSheetAsPDF with landscape set to True
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

                msg += (
                    "After opening the file, you can download it "
                    "as the desired format using:\n[File]>[Download]"
                )

                if not parent_id:
                    msg += (
                        "\n\nIf you don't know how to find the source file or the drive it "
                        "was uploaded to, please reach out to the dev team for assistance."
                    )

                raise ClientAlert(msg) from error

            raise error

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

    @property
    def _sheets_utils(self):
        if not hasattr(self, "_sheets_utils_"):
            self._sheets_utils_ = _SheetsUtils(self)

        return self._sheets_utils_

    def GetSheetData(self, sheet_id, row_data_only=True):
        return self._sheets_utils.GetData(sheet_id, row_data_only)

    def GetParsedSheetData(self, sheet_id, header_row_index=None):
        return self._sheets_utils.GetParsedData(sheet_id, header_row_index)

    def GetNewSheet(self, sheet_name):
        return self._sheets_utils.GetNew(sheet_name)

    def DownloadSheetAsXLSX(self, sheet_id, xlsx_path, parent_id=""):
        return self._sheets_utils.DownloadAsXLSX(sheet_id, xlsx_path, parent_id)

    # Wrapper to support landscape workaround
    def DownloadSheetAsPDF(self, file_id, pdf_path, parent_id="", landscape=False):
        self._sheets_utils.DownloadAsPDF(file_id, pdf_path, parent_id, landscape)

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

    @property
    def _drive_utils(self):
        if not hasattr(self, "_drive_utils_"):
            self._drive_utils_ = _DriveUtils(self)

        return self._drive_utils_

    def CreateDriveFile(self, params, file_path=None, in_shared_drive=False, fields="", file_url=""):
        return self._drive_utils.CreateFile(params, file_path, in_shared_drive, fields, file_url)

    def CreateDriveFolder(self, name, parent_id="", in_shared_drive=False, fields=""):
        return self._drive_utils.CreateFolder(name, parent_id, in_shared_drive, fields)

    def DeleteDriveFile(self, file_id, in_shared_drive=False, fields=""):
        return self._drive_utils.DeleteFile(file_id, in_shared_drive, fields)

    def MoveDriveFile(self, file_id, old_parent_id, new_parent_id, in_shared_drive=False, fields=""):
        return self._drive_utils.MoveFile(file_id, old_parent_id, new_parent_id, in_shared_drive, fields)

    def UpdateDriveFileByKeys(self, file_id, params, fields="", in_shared_drive=False):
        return self._drive_utils.UpdateFileByKeys(file_id, params, fields, in_shared_drive)

    def GetDriveFileDataByID(self, file_id, in_shared_drive=False, fields_override=""):
        return self._drive_utils.GetFileDataByID(file_id, in_shared_drive, fields_override)

    def GetDriveFileDataByName(
        self, filename, drive_id, parent_id="", is_folder=False, fields="",
        extra_query="", raise_duplicates=True, in_shared_drive=False
    ):
        return self._drive_utils.GetFileDataByName(
            filename, drive_id, parent_id, is_folder, fields, extra_query, raise_duplicates, in_shared_drive
        )

    def GetAllDriveFiles(
        self, drive_id, extra_query="", fields_override="", is_shared_drive=False,
        include_deleted=False, parent_folder_id="", mime_type=""
    ):
        return self._drive_utils.GetAllFiles(
            drive_id, extra_query, fields_override, is_shared_drive, include_deleted, parent_folder_id, mime_type
        )

    def GetDriveFilePermissions(self, file_id, in_shared_drive=False, fields="id, emailAddress, role"):
        return self._drive_utils.GetFilePermissions(file_id, in_shared_drive, fields)

    def AddPermissionToDriveFile(
        self, user_email, file_id, permission_level="writer", notify_user=False, in_shared_drive=False
    ):
        return self._drive_utils.AddPermissionToFile(
            user_email, file_id, permission_level, notify_user, in_shared_drive
        )

    def RemovePermissionFromDriveFile(self, user_email, file_id, in_shared_drive=False, permission_id=""):
        return self._drive_utils.RemovePermissionFromFile(user_email, file_id, in_shared_drive, permission_id)

    # ========================= SLIDES =========================

    @property
    def SlidesClient(self):
        return self._slides_utils.Client

    @property
    def SlidesMimeType(self):
        return self._slides_utils.SlidesMimeType

    @property
    def _slides_utils(self):
        if not hasattr(self, "_slides_utils_"):
            self._slides_utils_ = _SlidesUtils(self)

        return self._slides_utils_

    # ========================= DOCS =========================

    @property
    def DocsClient(self):
        return self._docs_utils.Client

    @property
    def DocsMimeType(self):
        return self._docs_utils.DocsMimeType

    @property
    def _docs_utils(self):
        if not hasattr(self, "_docs_utils_"):
            self._docs_utils_ = _DocsUtils(self)

        return self._docs_utils_

    # ======================== YOUTUBE =======================

    @property
    def YouTubeClient(self):
        return self._youtube_utils.Client

    @property
    def YouTubeOAuth2Creds(self):
        return self._youtube_auth_utils.OAuth2Creds

    @property
    def YouTubeBearerToken(self):
        return self._youtube_auth_utils.BearerToken

    @property
    def _youtube_auth_utils(self):
        if not hasattr(self, "_youtube_auth_utils_"):
            self._youtube_auth_utils_ = _YouTubeAuthUtils(self)

        return self._youtube_auth_utils_

    @property
    def _youtube_utils(self):
        if not hasattr(self, "_youtube_utils_"):
            self._youtube_utils_ = _YouTubeUtils(self)

        return self._youtube_utils_

    def GetYouTubeChannels(self, handle="", username=""):
        return self._youtube_utils.GetChannels(handle, username)

    def GetYouTubePlaylists(self, channel_id="", single_playlist_id=""):
        return self._youtube_utils.GetPlaylists(channel_id, single_playlist_id)

    def GetYouTubeVideos(
        self, channel_id="", search_query="", category_num=0,
        by_views=False, by_rating=False, by_date=False, by_name=False
    ):
        return self._youtube_utils.GetVideos(
            channel_id, search_query, category_num, by_views, by_rating, by_date, by_name
        )

    def GetYouTubeVideo(self, video_id):
        return self._youtube_utils.GetVideo(video_id)

    def GetYouTubeComments(self, comment_ids):
        return self._youtube_utils.GetComments(comment_ids)

    def GetYouTubeCommentReplies(self, comment_id):
        return self._youtube_utils.GetCommentReplies(comment_id)

    def GetYouTubeSubscriberCount(self, channel_id="", channel_handle="", music_channel_id=""):
        return self._youtube_utils.GetSubscriberCount(channel_id, channel_handle, music_channel_id)


class _DriveUtils:
    _client: callable
    _drafting_file_exts: list

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
    def drafting_file_exts(self):
        if not hasattr(self, "_drafting_file_exts"):
            from Dash.Utils import GetDraftingExtensions

            self._drafting_file_exts = GetDraftingExtensions()

        return self._drafting_file_exts

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

    def CreateFile(self, params, file_path=None, in_shared_drive=False, fields="", file_url=""):
        """
        | Update file data or metadata, such as file/folder description.
        |
        | Params ref: https://developers.google.com/drive/api/v3/reference/files/create#request-body

        :param dict params: Request parameters that match accepted keys for request body
        :param str file_path: Path, instead of URL, to optional file for upload (default=None)
        :param bool in_shared_drive: File lives in a shared drive (default=False)
        :param str fields: Requested fields, if different than self.fields (default="")
        :param str file_url: URL, instead of path, for optional file to upload (default="")

        :return: New file/folder data
        :rtype: dict
        """

        if (
            (file_path or file_url)
            and not params.get("mimeType")
            and (file_path or file_url).split(".")[-1].strip().lower() in self.drafting_file_exts
        ):
            params["mimeType"] = "application/x-autocad"

        file = None

        if file_path:
            from googleapiclient.http import MediaFileUpload

            file = MediaFileUpload(file_path)

        elif file_url:
            from mimetypes import guess_type

            filename = file_url.split("/")[-1]

            if "?" in filename:
                filename = filename.split("?")[0]

            mime_type = guess_type(filename)[0]

            if not mime_type:
                raise ValueError(f"Failed to get mime type for url: {file_url}")

            from requests import get

            response = get(file_url)

            response.raise_for_status()

            from io import BytesIO
            from googleapiclient.http import MediaIoBaseUpload

            file = MediaIoBaseUpload(
                BytesIO(response.content),
                mimetype=mime_type
            )

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

                    raise ClientAlert(
                        f"'.{file_ext}' files cannot be uploaded due to encoding restrictions of the Google API"
                    ) from e

            raise UnicodeEncodeError(e.encoding, e.object, e.start, e.end, e.reason) from e

    def CreateFolder(self, name, parent_id="", in_shared_drive=False, fields=""):
        params = {
            "name": name,
            "mimeType": self.FolderMimeType
        }

        if parent_id:
            params["parents"] = [parent_id]

        return self.CreateFile(
            params=params,
            in_shared_drive=in_shared_drive,
            fields=fields
        )

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

    def GetFileDataByName(
        self, filename, drive_id, parent_id="", is_folder=False, fields="",
        extra_query="", raise_duplicates=True, in_shared_drive=False
    ):
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

    def GetAllFiles(
        self, drive_id, extra_query="", fields_override="", is_shared_drive=False,
        include_deleted=False, parent_folder_id="", mime_type=""
    ):
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
        :param str parent_folder_id: Specific folder ID to search in
        :param str mime_type: Specific MIME type to look for

        :return: List of data dictionaries for each file/folder
        :rtype: list
        """

        query = []

        if not include_deleted:
            query.append("trashed=false")

        if parent_folder_id:
            query.append(f"'{parent_folder_id}' in parents")

        if mime_type:
            query.append(f"mimeType='{mime_type}'")

        query = " and ".join(query)

        if extra_query:
            if query:
                query += " and "

            query += extra_query

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

    def AddPermissionToFile(
        self, user_email, file_id, permission_level="writer", notify_user=False, in_shared_drive=False
    ):
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

    def DownloadAsPDF(self, file_id, pdf_path, parent_id="", landscape=False):
        if not landscape:
            return self.gutils.DownloadAsPDF(file_id, pdf_path, parent_id)

        # As of writing, the Google API does not have support for any download parameters specific
        # to each document type. For example, when downloading a sheet from the Google Sheets interface,
        # there are a lot of options presented that are specific to that download, but those options
        # are not supported in the API. The workaround is to call the request URL directly, instead
        # of using the API, which is what we have to do to export a sheet as a landscape PDF.

        from requests import get as requests_get

        params = "&".join([
            f"{k}={v}" for k, v in {
                "format": "pdf",
                "portrait": False,
                "size": "letter",  # This is likely the default, but there's no documentation to confirm

                # Might want to use these at some point
                # "fitw": True,  # Fit to width
                # "sheetnames": False,  # Include sheet names
                # "printtitle": False,  # Include title
                # "pagenumbers": False,  # Include page numbers
                # "gridlines": False,  # Show gridlines
                # "fzr": False  # Repeat frozen rows on each page
            }.items()
        ])

        response = requests_get(
            f"https://docs.google.com/spreadsheets/d/{file_id}/export?{params}",
            headers={
                "Authorization": f"Bearer {self.gutils.BearerToken}"
            }
        )

        if response.status_code != 200:
            raise Exception(f"Failed to download spreadsheet as landscape PDF:\n{response.text}")

        with open(pdf_path, "wb") as f:
            f.write(response.content)


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


# Ref: https://developers.google.com/youtube/v3/docs
class _YouTubeUtils:
    _client: callable
    _video_categories: dict

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("youtube", "v3", http=self.gutils.YouTubeOAuth2Creds)

        return self._client

    @property
    def video_categories(self):
        if not hasattr(self, "_video_categories"):
            self._video_categories = {
                1: "Film & Animation",
                2: "Autos & Vehicles",
                10: "Music",
                15: "Pets & Animals",
                17: "Sports",
                18: "Short Movies",
                19: "Travel & Events",
                20: "Gaming",
                21: "Videoblogging",
                22: "People & Blogs",
                23: "Comedy",
                24: "Entertainment",
                25: "News & Politics",
                26: "Howto & Style",
                27: "Education",
                28: "Science & Technology",
                29: "Nonprofits & Activism",
                30: "Movies",
                31: "Anime/Animation",
                32: "Action/Adventure",
                33: "Classics",
                34: "Comedy",
                35: "Documentary",
                36: "Drama",
                37: "Family",
                38: "Foreign",
                39: "Horror",
                40: "Sci-Fi/Fantasy",
                41: "Thriller",
                42: "Shorts",
                43: "Shows",
                44: "Trailers"
            }

        return self._video_categories

    def GetChannels(self, handle="", username=""):
        params = {
            "part": ", ".join([
                "id",
                "statistics",
                "snippet",

                # These are available but not useful
                # "auditDetails",
                # "brandingSettings",
                # "contentDetails",  # Playlist-related IDs
                # "contentOwnerDetails",  # Only relevant to partners
                # "localizations",
                # "status",
                # "topicDetails"
            ])
        }

        if handle:
            params["forHandle"] = handle

        elif username:
            params["forUsername"] = username

        else:
            params["mine"] = True

        return self.Client.channels().list(**params).execute()["items"]

    def GetPlaylists(self, channel_id="", single_playlist_id=""):
        params = {
            "part": ", ".join([
                "id",
                "snippet",

                # These are available but not useful
                # "contentDetails",  # Playlist-related IDs
                # "localizations",
                # "player",  # For embedding
                # "status"
            ])
        }

        if single_playlist_id:
            params["id"] = single_playlist_id

        elif channel_id:
            params["channelId"] = channel_id

        else:
            params["mine"] = True

        results = self.Client.playlists().list(**params).execute()["items"]

        if not single_playlist_id:
            return results

        if not results:
            raise ValueError(f"No playlists found for {single_playlist_id}")

        if len(results) > 1:
            raise ValueError(
                f"Multiple playlists found for {single_playlist_id} (this shouldn't happen):\n{results}"
            )

        return results[0]

    # - For category_num, see self.video_categories
    # - search_query can include the NOT (-) and OR (|) operators, ex: "boating|sailing -fishing"
    def GetVideos(
        self, channel_id="", search_query="", category_num=0,
        by_views=False, by_rating=False, by_date=False, by_name=False
    ):
        params = {
            "part": "id, snippet",  # Docs say to explicitly set this, doesn't seem like there are other options
            "order": (
                "viewCount" if by_views else
                "rating" if by_rating else
                "date" if by_date else
                "title" if by_name else
                "relevance"
            ),
            "safeSearch": "none",
            "type": "video"
        }

        if category_num and category_num in self.video_categories:
            params["videoCategoryId"] = str(category_num)

        if search_query:
            params["q"] = search_query

        if channel_id:
            params["channelId"] = channel_id
        else:
            params["forMine"] = True

        return self.Client.search().list(**params).execute()["items"]

    def GetVideo(self, video_id):
        results = self.Client.videos().list(**{
            "part": ", ".join([
                "id",
                "snippet",
                "statistics",

                # These are available but not useful
                # "contentDetails",
                # "fileDetails",
                # "liveStreamingDetails",
                # "localizations",
                # "player",  # For embedding
                # "processingDetails",
                # "recordingDetails",  # Physical recording info, like geolocation
                # "status",
                # "suggestions",
                # "topicDetails"
            ]),
            "id": video_id
        }).execute()["items"]

        if not results:
            raise ValueError(f"No videos found for {video_id}")

        if len(results) > 1:
            raise ValueError(f"Multiple videos found for {video_id} (this shouldn't happen):\n{results}")

        return results[0]

    def GetComments(self, comment_ids):
        results = self.Client.comments().list(**{
            "part": "id, snippet",
            "id": ", ".join(comment_ids),
            "textFormat": "plainText"
        }).execute()["items"]

        if len(comment_ids) != len(results):
            raise ValueError(
                "Not all comment IDs returned results, expected "
                f"{len(comment_ids)} but got {len(results)}:\n{results}"
            )

        return results

    def GetCommentReplies(self, comment_id):
        return self.Client.comments().list(**{
            "part": "id, snippet",
            "parentId": comment_id,
            "textFormat": "plainText"
        }).execute()["items"]

    # Can't get this via API
    def GetSubscriberCount(self, channel_id="", channel_handle="", music_channel_id=""):
        code_chars = ["{", "}", "[", "]", "(", ")", "'", '"', ":"]

        if channel_id:
            from requests import get

            r = get(f"https://www.youtube.com/channel/{channel_id}")

        elif channel_handle:
            from requests import get

            r = get(f"https://www.youtube.com/@{channel_handle}")

        elif music_channel_id:
            from curl_cffi.requests import get

            r = get(f"https://music.youtube.com/channel/{music_channel_id}", impersonate="chrome")

            # Can be in multiple formats, don't convert to int
            parsed = r.text.split(r" subscribers\x22")[-3].split(r"\x22")[-1]

            for char in code_chars:
                if char in parsed:
                    raise ValueError(f"Failed to parse YouTube subscriber count from response:\n{r.text}")

            return parsed

        else:
            raise ValueError("Must provide either a channel ID, channel handle, or music channel ID")

        # Can be in multiple formats, don't convert to int
        parsed = r.text.split('{"metadataParts":[{"text":{"content":"')[-1].split(" subscriber")[0]

        for char in code_chars:
            if char in parsed:
                raise ValueError(f"Failed to parse YouTube subscriber count from response:\n{r.text}")

        return parsed


class _AuthUtils:
    _creds: object
    _oauth2_creds: object

    def __init__(self, gutils, service_name="gdrive"):
        self.gutils = gutils
        self.service_name = service_name

    @property
    def OAuth2Creds(self):
        """
        This is used for API instance authentication.
        """

        if not hasattr(self, "_oauth2_creds"):
            from httplib2 import Http

            self._oauth2_creds = self.credentials.authorize(Http())

        return self._oauth2_creds

    @property
    def BearerToken(self):
        """
        | This is used for standard request authentication, ex:
        | requests.get(url, headers={"Authorization": f"Bearer {self.BearerToken}"})
        """

        if self.credentials.access_token_expired:
            self.credentials.refresh(self.OAuth2Creds)

        return self.credentials.access_token

    @property
    def credentials(self):
        if not hasattr(self, "_creds"):
            from Dash.Authorize import GetTokenData

            try:
                token_json = GetTokenData(service_name=self.service_name, user_email=self.gutils.UserEmail)

            except Exception as e:
                raise Exception(f"Failed to get Google credentials") from e

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


class _YouTubeAuthUtils(_AuthUtils):
    def __init__(self, gutils):
        _AuthUtils.__init__(self, gutils, service_name="youtube")

