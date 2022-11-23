#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
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
        dash_context, user, file_root, file_bytes_or_existing_path, filename, nested=False, parent_folders=[], enforce_unique_filename_key=True,
        existing_data_for_update={}, enforce_single_period=True, allowable_executable_exts=[], related_file_path="", target_aspect_ratio=None,
        additional_data={}, replace_extra_periods=True, include_jpg_thumb=True, include_png_thumb=True, include_square_thumb=False
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
        include_square_thumb=include_square_thumb
    )


def ValidateImageAspectRatio(image_bytes, target_aspect_ratio, return_image_aspect_ratio=False):
    from .file import ValidateImageAspectRatio

    return ValidateImageAspectRatio(image_bytes, target_aspect_ratio, return_image_aspect_ratio)


def EnsureUniqueFilename(file_data, file_root, nested, is_image):
    from .file import EnsureUniqueFilename

    return EnsureUniqueFilename(file_data, file_root, nested, is_image)


def GetFileURLFromPath(dash_context, server_file_path, add_anti_caching_id=False):
    from .file import GetURLFromPath

    return GetURLFromPath(dash_context, server_file_path, add_anti_caching_id)


def GetFilePathFromURL(dash_context, server_file_url):
    from .file import GetPathFromURL

    return GetPathFromURL(dash_context, server_file_url)


def GetImageExtensions():
    from .file import ImageExtensions

    return ImageExtensions


def GetAudioExtensions():
    from .file import AudioExtensions

    return AudioExtensions


def GetVideoExtensions():
    from .file import VideoExtensions

    return VideoExtensions


def CreateZIP(dir_path):
    from .file import CreateZIP

    return CreateZIP(dir_path)


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


# ------------------------------------------------- STRING --------------------------------------------------
def FormatTime(datetime_object, time_format=1, tz="utc"):
    from .string import FormatTime

    return FormatTime(datetime_object, time_format, tz)


def GetAssetPath(name):
    from .string import GetAssetPath

    return GetAssetPath(name)


def ValidateEmailAddress(email):
    from .string import ValidateEmailAddress

    return ValidateEmailAddress(email)


# -------------------------------------------------- LIST ----------------------------------------------------
def OSListDirCleaned(path):
    from .list import OSListDirCleaned

    return OSListDirCleaned(path)


def GetListPortion(list_obj, center_anchor_value, size=3):
    from .list import GetListPortion

    return GetListPortion(list_obj, center_anchor_value, size)


# ------------------------------------------------- COMMS ---------------------------------------------------
def SendEmail(
        subject, notify_email_list=[], msg="", error="", sender_email="", sender_name="Dash", strict_notify=False,
        reply_to_email="", reply_to_name="", bcc_email_list=[], attachment_file_paths=[], ensure_sender_gets_copied=True
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
