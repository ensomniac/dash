#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from .errors import ClientAlert

# For now, this shouldn't be expected to run locally. However, if we start getting
# relative import errors, we'll have to adjust all the below imports to match this format:
#     try:
#         from .number import GetRandomID
#     except ImportError:
#         from number import GetRandomID

OapiRoot = os.path.join("/var", "www", "vhosts", "oapi.co")


# ------------------------------------------------- FILE ----------------------------------------------------


def UploadFile(
    dash_context, user, file_root, file_bytes_or_existing_path, filename, nested=False, parent_folders=[],
    enforce_unique_filename_key=True, existing_data_for_update={}, enforce_single_period=True,
    allowable_executable_exts=[], related_file_path="", target_aspect_ratio=0, additional_data={},
    replace_extra_periods=True, include_jpg_thumb=True, include_png_thumb=True, include_square_thumb=False,
    include_orig_png=True, min_size=0, is_mask=False
):
    from .file import Upload

    return Upload(
        dash_context=dash_context,
        user=user,
        file_root=file_root,
        file_bytes_or_existing_path=file_bytes_or_existing_path,
        filename=filename,
        nested=nested,
        parent_folders=parent_folders,
        enforce_unique_filename_key=enforce_unique_filename_key,
        existing_data_for_update=existing_data_for_update,
        enforce_single_period=enforce_single_period,
        allowable_executable_exts=allowable_executable_exts,
        related_file_path=related_file_path,
        target_aspect_ratio=target_aspect_ratio,
        additional_data=additional_data,
        replace_extra_periods=replace_extra_periods,
        include_jpg_thumb=include_jpg_thumb,
        include_png_thumb=include_png_thumb,
        include_square_thumb=include_square_thumb,
        include_orig_png=include_orig_png,
        min_size=min_size,
        is_mask=is_mask
    )


def ValidateImageAspectRatio(
    target_aspect_ratio, file_bytes_or_existing_path="",
    filename="", pil_image_object=None, return_image_aspect_ratio=False
):
    from .file import ValidateImageAspectRatio

    return ValidateImageAspectRatio(
        target_aspect_ratio, file_bytes_or_existing_path, filename, pil_image_object, return_image_aspect_ratio
    )


def ValidateVideoAspectRatio(video_bytes, target_aspect_ratio, return_video_details=False):
    from .file import ValidateVideoAspectRatio

    return ValidateVideoAspectRatio(video_bytes, target_aspect_ratio, return_video_details)


def ValidateMaskImage(
    file_bytes_or_existing_path="", filename="", pil_image_object=None, target_aspect_ratio=0, raise_reason=True
):
    from .file import ValidateMaskImage

    return ValidateMaskImage(
        file_bytes_or_existing_path, filename, pil_image_object, target_aspect_ratio, raise_reason
    )


def EnsureUniqueFilename(file_data, file_root, nested, is_image):
    from .file import EnsureUniqueFilename

    return EnsureUniqueFilename(file_data, file_root, nested, is_image)


def GetFileURLFromPath(dash_context, server_file_path, add_anti_caching_id=False):
    from .file import GetURLFromPath

    return GetURLFromPath(dash_context, server_file_path, add_anti_caching_id)


def GetFilePathFromURL(dash_context, server_file_url):
    from .file import GetPathFromURL

    return GetPathFromURL(dash_context, server_file_url)


def GetImageExtensions(strict=False):
    if strict:
        from .file import ImageExtensionsStrict as ImageExtensions
    else:
        from .file import ImageExtensions

    return ImageExtensions


def GetDraftingExtensions():
    from .file import DraftingExtensions

    return DraftingExtensions


def GetAudioExtensions():
    from .file import AudioExtensions

    return AudioExtensions


def GetVideoExtensions():
    from .file import VideoExtensions

    return VideoExtensions


def GetFontExtensions():
    from .file import FontExtensions

    return FontExtensions


def CreateZIP(dir_path):
    from .file import CreateZIP

    return CreateZIP(dir_path)


def CombinePDFs(pdf_paths, output_path):
    from .file import CombinePDFs

    return CombinePDFs(pdf_paths, output_path)


def ImageHasTransparency(pil_image_object=None, file_bytes_or_existing_path="", filename=""):
    from .file import ImageHasTransparency

    return ImageHasTransparency(pil_image_object, file_bytes_or_existing_path, filename)


def ImageIsGrayscale(pil_image_object=None, file_bytes_or_existing_path="", filename=""):
    from .file import ImageIsGrayscale

    return ImageIsGrayscale(pil_image_object, file_bytes_or_existing_path, filename)


# ------------------------------------------------- MODEL ---------------------------------------------------


def GetModelExtensions():
    from .model import ModelExtensions

    return ModelExtensions


def ConvertFBXToGLB(existing_fbx_path, output_glb_path, txt_path=None, compress_txt=False):
    from .model import ConvertFBXToGLB

    return ConvertFBXToGLB(existing_fbx_path, output_glb_path, txt_path, compress_txt)


def ConvertOBJToGLB(existing_obj_path, output_glb_path):
    from .model import ConvertOBJToGLB

    return ConvertOBJToGLB(existing_obj_path, output_glb_path)


# ------------------------------------------------- NUMBER --------------------------------------------------


def GetRandomID(date_based=True):
    from .number import GetRandomID

    return GetRandomID(date_based)


def Lerp(val_a, val_b, t):
    from .number import Lerp

    return Lerp(val_a, val_b, t)


def InverseLerp(_min, _max, val, unclamped=False):
    from .number import InverseLerp

    return InverseLerp(_min, _max, val, unclamped)


def MovePointAroundCircle(circle_center_x, circle_center_y, point_x, point_y, rotation_degrees):
    from .number import MovePointAroundCircle

    return MovePointAroundCircle(circle_center_x, circle_center_y, point_x, point_y, rotation_degrees)


def ScaleChildWithParent(parent_x, parent_y, parent_w, parent_h, child_x, child_y, scale_factor):
    from .number import ScaleChildWithParent

    return ScaleChildWithParent(parent_x, parent_y, parent_w, parent_h, child_x, child_y, scale_factor)


def GetOrdinalSuffix(num):
    from .number import GetOrdinalSuffix

    return GetOrdinalSuffix(num)


def GetReadableByteSize(total_bytes):
    from .number import GetReadableByteSize

    return GetReadableByteSize(total_bytes)


# ------------------------------------------------- STRING --------------------------------------------------


def FormatTime(datetime_object, time_format=1, tz="utc", update_tz=True):
    from .string import FormatTime

    return FormatTime(datetime_object, time_format, tz, update_tz)


def GetReadableHoursMins(secs, include_secs=False):
    from .string import GetReadableHoursMins

    return GetReadableHoursMins(secs, include_secs)


def GetAssetPath(name):
    from .string import GetAssetPath

    return GetAssetPath(name)


def ValidateEmailAddress(email):
    from .string import ValidateEmailAddress

    return ValidateEmailAddress(email)


def Abbreviate(string, length=3, excluded_abbreviations=[]):
    from .string import Abbreviate

    return Abbreviate(string, length, excluded_abbreviations)


# -------------------------------------------------- LIST ----------------------------------------------------


def OSListDirCleaned(path):
    from .list import OSListDirCleaned

    return OSListDirCleaned(path)


def GetListPortion(list_obj, center_anchor_value, size=3):
    from .list import GetListPortion

    return GetListPortion(list_obj, center_anchor_value, size)


def GetHexColorList(num_colors=5, saturation=1.0, value=1.0):
    from .list import GetHexColorList

    return GetHexColorList(num_colors, saturation, value)


# ------------------------------------------------- COMMS ---------------------------------------------------


def SendEmail(
        subject, notify_email_list=[], msg="", error="", sender_email="",
        sender_name="Dash", strict_notify=False, reply_to_email="", reply_to_name="",
        bcc_email_list=[], attachment_file_paths=[], ensure_sender_gets_copied=True
):
    from .comms import SendEmail

    return SendEmail(
        subject,
        notify_email_list,
        msg,
        error,
        sender_email,
        sender_name,
        strict_notify,
        reply_to_email,
        reply_to_name,
        bcc_email_list,
        attachment_file_paths=attachment_file_paths,
        ensure_sender_gets_copied=ensure_sender_gets_copied
    )


def SendDebugEmail(msg, recipient="stetandrew@gmail.com"):
    from .comms import SendEmail

    return SendEmail(
        subject="Debug/Test",
        notify_email_list=[recipient],
        strict_notify=True,
        msg=msg
    )


# ----------------------------------------------- WORKSHEET -------------------------------------------------


# Use this if multiple operations will be done, otherwise, the singular functions below will do
def GetWorksheetUtils(worksheet):
    from .worksheet import WorksheetUtils

    return WorksheetUtils(worksheet)


def AutoSizeColumnsByContent(worksheet, pad=2):
    return GetWorksheetUtils(worksheet).AutoSizeColumnsByContent(pad)


def StyleHeaderRow(worksheet, bg_color="dcdfe3", font=None, border=None, fill=None):
    return GetWorksheetUtils(worksheet).StyleHeaderRow(bg_color, font, border, fill)


def StyleFooterRow(worksheet, bg_color="dcdfe3", font=None, border=None, fill=None):
    return GetWorksheetUtils(worksheet).StyleFooterRow(bg_color, font, border, fill)


def StyleRow(worksheet, row_num, font=None, border=None, fill=None, bg_color="", font_type=""):
    return GetWorksheetUtils(worksheet).StyleRow(row_num, font, border, fill, bg_color, font_type)


def SetCellValueByColumnIndex(worksheet, row_num, column_index, value=""):
    return GetWorksheetUtils(worksheet).SetCellValueByColumnIndex(row_num, column_index, value)


def CenterTextVerticallyInAllCells(worksheet, min_height=30, min_height_mults={}):
    return GetWorksheetUtils(worksheet).CenterTextVerticallyInAllCells(min_height, min_height_mults)


# -------------------------------------------------- CRON ---------------------------------------------------


# Intended to be used as a base for any cron scripts' classes
class Cron:
    def __init__(self, dash_context_asset_path):
        from Dash import AdminEmails

        self.DashContext = Memory.SetContext(dash_context_asset_path)
        self.User = Memory.SetUser(AdminEmails[0])

        try:
            sys.path.append(os.path.join(self.DashContext["srv_path_git_oapi"], "server", "cgi-bin"))
        except:
            raise EnvironmentError("Error: This needs to be run on the server.")

    def Run(self):
        try:
            self.run()

        except (SystemExit, KeyboardInterrupt):
            pass

        except:
            self.send_fail_email()
            self.on_run_fail()

    # Intended to be overwritten
    def run(self):
        pass

    # Intended to be overwritten
    def get_error_detail(self):
        return ""

    # Intended to be overwritten
    def on_run_fail(self):
        pass

    # Wrapper - when sending an error email manually, use send_error_email
    def send_fail_email(self):
        from traceback import format_exc

        self.send_error_email(
            f"Failed to run{self.get_error_detail()}",
            format_exc()
        )

    # Name is misleading, as it can also be used to send non-error emails, that's just uncommon in most crons
    def send_error_email(
        self, msg, error=None, notify_email_list=[], strict_notify=False, subject="", bcc_email_list=[]
    ):
        if error:
            print(error)

        SendEmail(
            subject=subject or f"{self.__class__.__name__} CRON",
            msg=msg,
            error=error,
            notify_email_list=notify_email_list,
            bcc_email_list=bcc_email_list,
            strict_notify=strict_notify,
            sender_email=self.DashContext.get("admin_from_email"),
            sender_name=(self.DashContext.get("code_copyright_text") or self.DashContext.get("display_name"))
        )


# ------------------------------------------------- MEMORY --------------------------------------------------


class _Memory:
    _usr_token: str
    _global_memory: object

    def __init__(self):
        pass

    @property
    def global_memory(self):
        if not hasattr(self, "_global_memory"):
            from Dash import __name__ as DashName

            self._global_memory = sys.modules[DashName]

        return self._global_memory

    @property
    def Global(self):
        # This function is meant to return meaningful shared data in the context of a single request

        if not hasattr(self.global_memory, "RequestData"):
            self.global_memory.RequestData = {}

        if not hasattr(self.global_memory, "RequestUser"):
            self.global_memory.RequestUser = None

        if not hasattr(self.global_memory, "Context"):
            self.global_memory.Context = None

        return self.global_memory

    @property
    def UserToken(self):
        if not hasattr(self, "_usr_token"):
            try:
                from json import loads
                from os.path import expanduser

                dash_data_path = os.path.join(expanduser("~"), ".dash")
                dash_data = loads(open(dash_data_path, "r").read())

                self._usr_token = dash_data["user"]["token"]
            except:
                return None

        return self._usr_token

    def SetUser(self, email):
        from Dash.Users import Get as GetUser

        self.global_memory.RequestUser = GetUser(email)

        return self.global_memory.RequestUser

    def SetContext(self, asset_path):
        from Dash.PackageContext import Get as GetContext

        self.global_memory.Context = GetContext(asset_path)

        return self.global_memory.Context


Memory = _Memory()
