#!/usr/bin/python
#
# Ensomniac 2026 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# TODO: Break this script up into a module

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

    from json import loads, dumps

    try:
        raw_json = loads(http_error.content)

    except Exception:
        raw_json = None

    parser_errors = []
    error_data = raw_json.get("error", {}) if raw_json else {}

    try:
        msg = str(error_data.get("message", ""))

    except Exception as e:
        msg = ""

        parser_errors.append(f"Error parsing message from HttpError content: {e}")

    error = str(http_error).strip().strip("\n").strip()

    try:
        message = (
            f'HttpError {http_error.resp.status} when requesting {http_error.uri}, '
            f'returned "{http_error._get_reason()}".\nDetails: "{http_error.error_details}"'  # noqa
        )

    except Exception as e:
        parser_errors.append(f"Error constructing HttpError details:\n{e}")

        try:
            message = (
                f'HttpError {http_error.resp.status} when requesting '
                f'{http_error.uri}. Details:\n"{http_error.error_details}"'
            )

            if str(http_error.resp.status).startswith("5"):
                message += (
                    "\n\n*** If this has to do with a shared drive, make sure "
                    "it's not full before debugging anything else ***"
                )

        except Exception as e:
            parser_errors.append(f"Error constructing fallback HttpError details:\n{e}")

            if len(error) and error != "Exception:":
                message = error
                error = ""
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

    errors = []

    if error:
        errors.append(error)

    if "errors" in error_data:
        for e in error_data["errors"]:
            errors.append(f"{e.get('domain')}: {e.get('reason')} — {e.get('message')}")

    if errors:
        errors = "\n - ".join(errors)

        message += f"\n\n***Errors***:\n{errors}"

    if parser_errors:
        parser_errors = "\n - ".join(parser_errors)

        message += f"\n\n***Parser Errors***:\n{parser_errors}"

    if params:
        from json import dumps

        message += f"\n\n***Params***:\n{dumps(params, indent=4, sort_keys=True)}"

    message += f"\n\n***Response Headers***:\n{http_error.resp}\n"

    if raw_json:
        message += f"\n\n***Full Google JSON***:\n{dumps(raw_json, indent=4)}"
    else:
        message += f"\n\n***Raw Content***:\n{http_error.content!r}"

    raise Exception(message) from http_error


def GetChromeProfileRoot(profile_name="Dash"):
    # As of Chromium v136, can't do any automation (like Selenium) from
    # this default config root, but the shared root works just fine
    # user = os.path.expanduser("~")
    #
    # if "root" in user:
    #     return os.path.join(
    #         user,
    #         ".config",
    #         "google-chrome",
    #         profile_name
    #     )

    from Dash.Utils import OapiRoot

    return os.path.join(
        OapiRoot,
        "httpdocs",
        "shared",
        "config",
        "google-chrome",
        profile_name
    )


class GUtils:
    _auth_utils_: callable
    _docs_utils_: callable
    _drive_utils_: callable
    _gmail_utils_: callable
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

    @property
    def PDFMimeType(self):
        return "application/pdf"

    @property  # For all Drive-based apps (not YouTube)
    def _auth_utils(self):
        if not hasattr(self, "_auth_utils_"):
            self._auth_utils_ = _AuthUtils(self)

        return self._auth_utils_

    @property  # For all Drive-based apps (not YouTube)
    def _oauth2_creds(self):
        return self._auth_utils._oauth2_creds  # noqa

    @property  # For all Drive-based apps (not YouTube)
    def _bearer_token(self):
        return self._auth_utils._bearer_token  # noqa

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

    # ========================= GMAIL =========================

    @property
    def GmailClient(self):
        return self._gmail_utils.Client

    @property
    def _gmail_utils(self):
        if not hasattr(self, "_gmail_utils_"):
            self._gmail_utils_ = _GmailUtils(self)

        return self._gmail_utils_

    # ========================= SHEETS =========================

    @property
    def SheetsClient(self):
        return self._sheets_utils.Client

    @property
    def _gspread_creds(self):
        return self._sheets_utils._gspread_creds  # noqa

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

    def CreateDriveFile(self, params, file_path=None, in_shared_drive=False, fields="", file_url="", resumable=False):
        return self._drive_utils.CreateFile(params, file_path, in_shared_drive, fields, file_url, resumable)

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
    def _youtube_oauth2_creds(self):
        return self._youtube_auth_utils._oauth2_creds  # noqa

    @property
    def __youtube_bearer_token(self):
        return self._youtube_auth_utils._bearer_token  # noqa

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

    def PostVideoToYouTube(
        self, video_path, title, description="", tags=[],
        visibility="public", category_num=0, future_iso="", thumb_path=""
    ):
        return self._youtube_utils.PostVideo(
            video_path, title, description, tags, visibility, category_num, future_iso, thumb_path
        )

    def PostSocialToYouTube(self, text):
        return self._youtube_utils.PostSocial(text)

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

    def DeleteYouTubeVideo(self, video_id):
        return self._youtube_utils.DeleteVideo(video_id)

    def GetYouTubeVideoCategories(self, from_cache=True):
        return self._youtube_utils.GetVideoCategories(from_cache)

    def GetYouTubeComments(self, comment_ids=[], video_id="", skip_comment_ids=[], include_replies=True):
        return self._youtube_utils.GetComments(comment_ids, video_id, skip_comment_ids, include_replies)

    def GetYouTubeSubscriberCount(self, channel_id="", channel_handle="", music_channel_id=""):
        return self._youtube_utils.GetSubscriberCount(channel_id, channel_handle, music_channel_id)

    def GetYouTubeMostPopularVideos(self, region_code="US", category_num=0, max_results=50):
        return self._youtube_utils.GetMostPopularVideos(region_code, category_num, max_results)


# TODO: Placeholder for future - once ability to send email is added, can probably deprecate the Mail module
class _GmailUtils:
    _client: callable

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("gmail", "v1", http=self.gutils._oauth2_creds)  # noqa

        return self._client


class _DriveUtils:
    _client: callable
    _drafting_file_exts: list

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("drive", "v3", http=self.gutils._oauth2_creds)  # noqa

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

    @property
    def drafting_file_exts(self):
        if not hasattr(self, "_drafting_file_exts"):
            from Dash.Utils import GetDraftingExtensions

            self._drafting_file_exts = GetDraftingExtensions()

        return self._drafting_file_exts

    # TODO: break `params` out into individual args
    def CreateFile(self, params, file_path=None, in_shared_drive=False, fields="", file_url="", resumable=False):
        """
        | Upload new file, or create a folder, depending on params.
        |
        | Params ref: https://developers.google.com/drive/api/v3/reference/files/create#request-body

        :param dict params: Request parameters that match accepted keys for request body
        :param str file_path: Path, instead of URL, to optional file for upload (default=None)
        :param bool in_shared_drive: File lives in a shared drive (default=False)
        :param str fields: Requested fields, if different than self.fields (default="")
        :param str file_url: URL, instead of path, for optional file to upload (default="")
        :param bool resumable: Upload file using resumable protocol (default=False)

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

            file = MediaFileUpload(
                filename=file_path,
                resumable=resumable
            )

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
                fd=BytesIO(response.content),
                mimetype=mime_type,
                resumable=resumable
            )

        _params = {
            "supportsAllDrives": in_shared_drive,
            "fields": fields or self.Fields,
            "body": params,
            "media_body": file
        }

        try:
            request = self.Client.files().create(**_params)

            if not resumable:
                return request.execute()

            response = None

            while response is None:
                status, response = request.next_chunk()

            return response

        except HttpError as http_error:
            _params["media_body"] = "(Media object) truncated..."

            return ParseHTTPError(http_error, _params)

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
            return ParseHTTPError(http_error, params)

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
            return ParseHTTPError(http_error, params)

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
            return ParseHTTPError(http_error, _params)

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
            return ParseHTTPError(http_error, params)

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
            return ParseHTTPError(http_error, params)

    def GetFilePermissions(self, file_id, in_shared_drive=False, fields="id, emailAddress, role"):
        params = {
            "supportsAllDrives": in_shared_drive,
            "fields": f"permissions({fields})",
            "fileId": file_id
        }

        try:
            return self.Client.permissions().list(**params).execute()["permissions"]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

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
            return ParseHTTPError(http_error, params)

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
            return ParseHTTPError(http_error, params)


class _SheetsUtils:
    _client: callable
    _gspread_creds_: object

    def __init__(self, gutils):
        self.gutils = gutils

    @property
    def Client(self):
        if not hasattr(self, "_client"):
            from googleapiclient.discovery import build

            self._client = build("sheets", "v4", http=self.gutils._oauth2_creds)  # noqa

        return self._client

    @property
    def SheetsMimeType(self):
        return "application/vnd.google-apps.spreadsheet"

    @property
    def ExcelMimeType(self):
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    @property
    def _gspread_creds(self):
        if not hasattr(self, "_gspread_creds_"):
            from gspread import authorize as g_authorize

            self._gspread_creds_ = g_authorize(self.gutils._auth_utils._credentials)  # noqa

        return self._gspread_creds_

    def GetData(self, sheet_id, row_data_only=True):
        """
        Note: This doesn't currently account for extra, empty rows at the bottom.
        """

        params = {
            "spreadsheetId": sheet_id,
            "includeGridData": True
        }

        try:
            data = self.Client.spreadsheets().get(**params).execute()["sheets"][0]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

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
        return self._gspread_creds.open(sheet_name).get_worksheet(0)

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
                "Authorization": f"Bearer {self.gutils._bearer_token}"  # noqa
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

            self._client = build("slides", "v1", http=self.gutils._oauth2_creds)  # noqa

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

            self._client = build("docs", "v1", http=self.gutils._oauth2_creds)  # noqa

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

            self._client = build("youtube", "v3", http=self.gutils._youtube_oauth2_creds)  # noqa

        return self._client

    # This is hard-coded to reduce redundant calls, but if there's every an error along the lines of
    # "snippet.categoryId property specifies an invalid category ID", need to make the call below and update this:
    # Ref: https://developers.google.com/youtube/v3/docs/videoCategories/list
    @property
    def video_categories(self):
        if not hasattr(self, "_video_categories"):
            self._video_categories = {
                1: "Film & Animation",
                2: "Autos & Vehicles",
                10: "Music",
                15: "Pets & Animals",
                17: "Sports",
                19: "Travel & Events",
                20: "Gaming",
                22: "People & Blogs",
                23: "Comedy",
                24: "Entertainment",
                25: "News & Politics",
                26: "Howto & Style",
                27: "Education",
                28: "Science & Technology",
                29: "Nonprofits & Activism"
            }

        return self._video_categories

    def GetVideoCategories(self, from_cache=True):
        if from_cache:
            return self.video_categories

        params = {
            "part": "snippet",
            "regionCode": "US"
        }

        try:
            response = self.Client.videoCategories().list(**params).execute()

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

        parsed = {}

        for item in response["items"]:
            if not item["snippet"].get("assignable"):
                continue

            parsed[int(item["id"])] = item["snippet"]["title"]

        return parsed

    # For category_num, see self.video_categories
    def PostVideo(
        self, video_path, title, description="", tags=[],
        visibility="public", category_num=0, future_iso="", thumb_path=""
    ):
        if visibility not in ["public", "private", "unlisted"]:
            raise ValueError(f"Invalid visibility '{visibility}', expected 'public', 'private', or 'unlisted'")

        if future_iso:
            from Dash.GoogleUtilsSchedule import ValidateYouTubeSchedule

            future_iso = ValidateYouTubeSchedule(future_iso, visibility)

        if "<" in title or ">" in title:
            raise ValueError("Title can't contain '<' or '>'")

        if len(title) > 100:
            raise ValueError("Title can't be longer than 100 characters")

        snippet = {"title": title}

        if category_num:
            if category_num not in self.video_categories:
                raise KeyError(f"Invalid video category number (see self.video_categories): {category_num}")

            snippet["categoryId"] = str(category_num)

        if description:
            if "<" in description or ">" in description:
                raise ValueError("Description can't contain '<' or '>'")

            num_bytes = len(description.encode())

            if num_bytes > 5000:
                raise ValueError(
                    f"Description can't exceed 5000 bytes.\nThe current description is {num_bytes} bytes, "
                    f"with {len(description)} characters.\n\nMost characters are equal to 1 byte, but some "
                    "special characters, as well as emojis, can range from 2-4 bytes each."
                )

            snippet["description"] = description

        if tags:
            char_count = 0

            for tag in tags:
                char_count += len(tag)

                # If a tag contains a space, the API server handles the tag value as though it were
                # wrapped in quotation marks, and the quotation marks count toward the character limit
                if " " in tag:
                    char_count += 2  #

                if char_count > 500:
                    raise ValueError("Combined tags can't exceed 500 characters - see comments for more info")

            snippet["tags"] = tags

        from googleapiclient.http import MediaFileUpload

        params = {
            "part": ", ".join([
                "id",
                "snippet",
                "status",

                # These are available but not useful
                # "contentDetails",
                # "fileDetails",
                # "liveStreamingDetails",
                # "localizations",
                # "paidProductPlacementDetails",
                # "player",
                # "processingDetails",
                # "recordingDetails",
                # "statistics",
                # "suggestions",
                # "topicDetails"
            ]),
            "body": {
                "snippet": snippet,
                "status": {
                    "embeddable": True,
                    "privacyStatus": visibility
                }
            },
            "media_body": MediaFileUpload(video_path)
        }

        if future_iso:
            params["body"]["status"]["publishAt"] = future_iso

        try:
            response = self.Client.videos().insert(**params).execute()

        except HttpError as http_error:
            params["media_body"] = "(MediaFileUpload object) truncated..."

            return ParseHTTPError(http_error, params)

        response["custom_thumbnail_url"] = self.upload_video_thumbnail(
            video_response=response,
            thumb_path=thumb_path
        ) if thumb_path else ""

        # Response does not have what we need, so we have to check the video
        response["shorts"] = self.video_is_a_short(video_path=video_path)

        response["url"] = f"https://youtube.com/{'shorts/' if response['shorts'] else 'watch?v='}{response['id']}"
        response["alt_url"] = f"https://youtube.com/watch?v={response['id']}" if response['shorts'] else ""

        return response

    # This functionality is not available via API as of 4/9/25
    def PostSocial(self, text):  # TODO
        raise NotImplementedError("The function to create a social-media-style YouTube post is not yet written")

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

        try:
            return self.Client.channels().list(**params).execute()["items"]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

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

        try:
            results = self.Client.playlists().list(**params).execute()["items"]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

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

        if category_num and category_num not in self.video_categories:
            raise KeyError(f"Invalid video category number (see self.video_categories): {category_num}")

        params = {
            "part": "snippet",  # Docs say to explicitly set this, doesn't seem like there are other options
            "order": (
                "viewCount" if by_views else  # For shorts, might need to use "views" instead (unconfirmed)
                "rating" if by_rating else
                "date" if by_date else
                "title" if by_name else
                "relevance"
            ),
            "safeSearch": "none",
            "type": "video"
        }

        if category_num:
            params["videoCategoryId"] = str(category_num)

        if search_query:
            params["q"] = search_query

        if channel_id:
            params["channelId"] = channel_id
        else:
            params["forMine"] = True

        try:
            videos = self.Client.search().list(**params).execute()["items"]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

        return self.parse_videos(videos)

    def GetVideo(self, video_id):
        params = {
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
        }

        try:
            results = self.Client.videos().list(**params).execute()["items"]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

        if not results:
            raise ValueError(f"No videos found for {video_id}")

        if len(results) > 1:
            raise ValueError(f"Multiple videos found for {video_id} (this shouldn't happen):\n{results}")

        return results[0]

    def DeleteVideo(self, video_id):
        params = {"id": video_id}

        try:
            self.Client.videos().delete(**params).execute()

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

        return True

    # Will not work for comments on auto-generated music videos (no supported
    # method for that in the API, but see Fantom for scraping example)
    def GetComments(self, comment_ids=[], video_id="", skip_comment_ids=[], include_replies=True):
        results = None

        if not comment_ids:
            if not video_id:
                raise ValueError("Must specify either comment_ids or video_id")

            fields = ["id", "snippet"]

            if include_replies:
                fields.append("replies")

            params = {
                "part": ", ".join(fields),
                "videoId": video_id,
                "textFormat": "plainText",
                "maxResults": 100  # This is the highest allowed, unless we implement paging
            }

            try:
                results = self.Client.commentThreads().list(**params).execute()["items"]

            except HttpError as http_error:
                return ParseHTTPError(http_error, params)

        if results is None:
            if skip_comment_ids:
                comment_ids = [cid for cid in comment_ids if cid not in skip_comment_ids]

            if not comment_ids:
                return []

            params = {
                "part": ", ".join([
                    "id",
                    "snippet"
                ]),
                "id": ", ".join(comment_ids),
                "textFormat": "plainText"
            }

            try:
                results = self.Client.comments().list(**params).execute()["items"]

            except HttpError as http_error:
                return ParseHTTPError(http_error, params)

            if len(comment_ids) != len(results):
                raise ValueError(
                    "Not all comment IDs returned results, expected "
                    f"{len(comment_ids)} but got {len(results)}:\n{results}"
                )

        combined = []

        for comment in results:
            if comment["id"] not in skip_comment_ids:
                combined.append(comment)

            if not include_replies:
                continue

            if video_id:
                replies = comment.pop("replies") if "replies" in comment else []

                if replies and type(replies) is dict and "comments" in replies:
                    replies = replies["comments"]
            else:
                params = {
                    "part": ", ".join([
                        "id",
                        "snippet"
                    ]),
                    "parentId": comment["id"],
                    "textFormat": "plainText"
                }

                try:
                    replies = self.Client.comments().list(**params).execute()["items"]

                except HttpError as http_error:
                    return ParseHTTPError(http_error, params)

            for reply in replies:
                if reply["id"] in skip_comment_ids:
                    continue

                combined.append(reply)

        cleaned = []

        for comment in combined:
            snippet = comment["snippet"]

            if snippet.get("topLevelComment"):
                snippet = snippet["topLevelComment"]

                if snippet.get("snippet"):
                    snippet = snippet["snippet"]

            parsed = {
                "id": comment["id"],
                "message": snippet.get("textOriginal", snippet["textDisplay"]),

                # Don't replace comment["snippet"] with snippet
                "replies": comment["snippet"].get("totalReplyCount", 0),

                "likes": snippet.get("likeCount", 0),
                "author": {
                    "channel_id": snippet["authorChannelId"]["value"],
                    "channel_handle": snippet["authorDisplayName"].replace("@", "")
                },
                "published": snippet.get("publishedAt", snippet["updatedAt"]),
                "parent_id": snippet.get("parentId", ""),
                "url": ""  # YouTube comments don't have URLs, but keeping a consistent format
            }

            cleaned.append(parsed)

        return cleaned

    # Can't get this via API
    def GetSubscriberCount(self, channel_id="", channel_handle="", music_channel_id=""):
        code_chars = ["{", "}", "[", "]", "(", ")", "'", '"', ":"]

        if channel_id:
            url = f"https://www.youtube.com/channel/{channel_id}"

        elif channel_handle:
            url = f"https://www.youtube.com/@{channel_handle}"

        elif music_channel_id:
            from curl_cffi.requests import get

            url = f"https://music.youtube.com/channel/{music_channel_id}"
            r = get(url, impersonate="chrome")

            # Can be in multiple formats, don't convert to int
            parsed = r.text.split(r" subscribers\x22")[-3].split(r"\x22")[-1]

            for char in code_chars:
                if char in parsed:
                    raise ValueError(
                        f"[1] Failed to parse YouTube subscriber count from response (URL: {url}):\n{r.text}"
                    )

            if not str(parsed).isdigit():
                raise ValueError(
                    f"[2] Failed to parse YouTube subscriber count from response (URL: {url}):\n{r.text}"
                )

            return int(parsed)

        else:
            raise ValueError("Must provide either a channel ID, channel handle, or music channel ID")

        from requests import get

        r = get(url)

        # Can be in multiple formats, don't convert to int
        parsed = r.text.split('{"metadataParts":[{"text":{"content":"')[-1].split(" subscriber")[0]

        for char in code_chars:
            if char in parsed:
                if "subscribe to this channel" in r.text:
                    return 0

                raise ValueError(
                    f"[3] Failed to parse YouTube subscriber count from response (URL: {url}):\n{r.text}"
                )

        if not str(parsed).isdigit():
            raise ValueError(
                f"[4] Failed to parse YouTube subscriber count from response (URL: {url}):\n{r.text}"
            )

        return int(parsed)

    # For category_num, see self.video_categories
    def GetMostPopularVideos(self, region_code="US", category_num=0, max_results=50):
        if not 1 <= max_results <= 50:
            raise ValueError("Max results must be between 1 and 50")

        if category_num and category_num not in self.video_categories:
            raise KeyError(f"Invalid video category number (see self.video_categories): {category_num}")

        params = {
            "part": ", ".join([
                "id",
                "snippet",
                "statistics",
                "topicDetails",
                "contentDetails",
                "liveStreamingDetails",

                # These are available but not useful
                # "status",
                # "player",  # For embedding
                # "localizations",
                # "recordingDetails",  # Physical recording info, like geolocation

                # These are available but only to the owner
                # "fileDetails",
                # "suggestions",
                # "processingDetails"
            ]),
            "regionCode": region_code,
            "chart": "mostPopular",
            "maxResults": max_results,
            "videoCategoryId": category_num
        }

        try:
            videos = self.Client.videos().list(**params).execute()["items"]

        except HttpError as http_error:
            return ParseHTTPError(http_error, params)

        return self.parse_videos(videos)

    # API ref: https://developers.google.com/youtube/v3/docs/thumbnails/set
    # Specs ref: https://support.google.com/youtube/answer/72431?sjid=18278064942235778801-NC#zippy=%2Cimage-size-and-resolution
    def upload_video_thumbnail(self, video_response, thumb_path, return_response=False):
        from googleapiclient.http import MediaFileUpload

        url = ""
        error = ""
        thumb_response = None

        thumb_params = {
            "videoId": video_response["id"],
            "media_body": MediaFileUpload(thumb_path)
        }

        try:
            thumb_response = self.Client.thumbnails().set(**thumb_params).execute()

        except HttpError as http_error:
            thumb_params["media_body"] = "(MediaFileUpload object) truncated..."

            try:
                error = ParseHTTPError(http_error, thumb_params)

            except Exception as e:
                error = str(e)

        except Exception as e:
            error = str(e)

        if not error and thumb_response:
            try:
                url = self.parse_video_thumbnail(
                    {"snippet": {"thumbnails": thumb_response["items"][-1]}}
                )["url"]

            except Exception as e:
                from Dash.Utils import JSON2HTML

                error = f"{e}\n\nThumbnail response:\n{JSON2HTML(thumb_response)}"

        # Don't allow this non-critical failure to affect any steps following the successful video upload
        if error:
            from Dash.Utils import SendEmail, JSON2HTML

            SendEmail(
                subject="Failed to set cover image for YouTube video",
                msg=(
                    "The video posted successfully, but the cover image failed to be set for the video."
                    "\n\nIf you're sure you're using the right credentials with the right scopes, the\n\n"
                    "issue is likely that the custom thumbnails feature is still locked for this account. "
                    "Go to `YouTube Studio → Settings → Channel → Feature eligibility` to confirm.\n\n"
                    f"Cover path:\n{thumb_path}\n\nVideo response:\n{JSON2HTML(video_response)}\n\nError:\n{error}"
                )
            )

        if return_response:
            return thumb_response

        return url

    def parse_videos(self, videos):
        url_base = "https://www.youtube.com/"

        for video in videos:
            if video.get("snippet", {}).get("categoryId"):
                cat_id = int(video["snippet"].pop("categoryId"))
                cat_name = self.video_categories.get(cat_id)

                if not cat_name:
                    raise KeyError(f"Unhandled video category ID: {cat_id}")

                video["snippet"]["category"] = {
                    "id": cat_id,
                    "display_name": cat_name,
                }

            if video.get("id") and video.get("contentDetails"):
                video["shorts"] = self.video_is_a_short(video)
                video["url"] = url_base + (f"shorts/{video['id']}" if video["shorts"] else f"watch?v={video['id']}")

        return videos

    # YouTube decides on their end whether a video that's uploaded will be a short,
    # seemingly based only on the duration and aspect ratio. We don't have any control over this.
    # They also don't provide any indicator in the video data/response of whether a video is a short,
    # nor do they provide a URL for the video (which would tell us). Our only option is to assume
    # a video is a short if it's under their max duration and a vertical aspect ratio.
    def video_is_a_short(self, video_data={}, video_path=""):
        if not video_data and not video_path:
            raise ValueError("Must provide either video_data or video_path")

        if video_data:
            duration = self.parse_video_duration_sec(video_data)

            # We don't get video dimensions, so use the thumbnail dimensions to check aspect ratio
            thumbnail = self.parse_video_thumbnail(video_data)

            width = thumbnail.get("width")
            height = thumbnail.get("height")
        else:
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video path {video_path} does not exist")

            from Dash.Utils import GetVideoDetails

            details = GetVideoDetails(video_path)
            width = details.get("width")
            height = details.get("height")
            duration = float(details.get("duration_sec"))

        if duration > 180:  # Formerly 60
            return False  # Too long to be a Short

        if not width or not height:
            return False  # No size info

        if height >= width:
            return True  # It's vertical or square, likely a Short

        return False

    def parse_video_duration_sec(self, video_data):
        duration = video_data.get("contentDetails", {}).get("duration")  # ISO 8601 duration

        if not duration:
            return 0

        from isodate import parse_duration

        return parse_duration(duration).total_seconds()

    def parse_video_thumbnail(self, video_data):
        thumbnails = video_data.get("snippet", {}).get("thumbnails")

        if not thumbnails:
            return {}

        # Favor the highest-res available
        return (
            thumbnails.get("maxres")
            or thumbnails.get("standard")
            or thumbnails.get("high")
            or thumbnails.get("medium")
            or thumbnails.get("default")
            or {}
        )

    def parse_video_stats(self, video_data):
        if not video_data.get("statistics"):
            return {}

        return {
            "views": int(video_data["statistics"].get("viewCount", video_data["statistics"].get("views", 0))),
            "likes": int(video_data["statistics"].get("likeCount", 0)),
            "favorites": int(video_data["statistics"].get("favoriteCount", 0)),
            "comments": int(video_data["statistics"].get("commentCount", 0))
        }


class _AuthUtils:
    _credentials_: object
    _oauth2_creds_: object

    def __init__(self, gutils, service_name="gdrive"):
        self.gutils = gutils
        self.service_name = service_name

    @property
    def _oauth2_creds(self):
        """
        This is used for API instance authentication.
        """

        if not hasattr(self, "_oauth2_creds_"):
            from httplib2 import Http

            self._oauth2_creds_ = self._credentials.authorize(Http())

        return self._oauth2_creds_

    @property
    def _bearer_token(self):
        """
        | This is used for standard request authentication, ex:
        | requests.get(url, headers={"Authorization": f"Bearer {self._bearer_token}"})
        """

        if self._credentials.access_token_expired:
            self._credentials.refresh(self._oauth2_creds)

        return self._credentials.access_token

    @property
    def _credentials(self):
        if not hasattr(self, "_credentials_"):
            from Dash.Authorize import GetTokenData

            try:
                token_json = GetTokenData(
                    service_name=self.service_name,
                    user_email=self.gutils.UserEmail
                )

            except Exception as e:
                raise Exception(f"Failed to get Google credentials") from e

            from oauth2client.client import OAuth2Credentials

            self._credentials_ = OAuth2Credentials(
                access_token=token_json["access_token"],
                client_id=token_json["client_id"],
                client_secret=token_json["client_secret"],
                refresh_token=token_json["refresh_token"],
                token_expiry=token_json["token_expiry"],
                token_uri=token_json["token_uri"],
                revoke_uri=token_json["revoke_uri"],
                user_agent=None
            )

        return self._credentials_


class _YouTubeAuthUtils(_AuthUtils):
    def __init__(self, gutils):
        _AuthUtils.__init__(self, gutils, service_name="youtube")
