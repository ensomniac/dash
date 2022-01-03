#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
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
        enforce_unique_filename_key=True, existing_data_for_update={}, enforce_single_period=True, allowable_executable_exts=[]
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
        allowable_executable_exts=allowable_executable_exts
    )


def EnsureUniqueFilename(file_data, file_root, nested, is_image):
    from .file import EnsureUniqueFilename

    return EnsureUniqueFilename(file_data, file_root, nested, is_image)


def GetFileURL(dash_context, server_file_path):
    from .file import GetURL

    return GetURL(dash_context, server_file_path)


def GetImageExtensions():
    from .file import ImageExtensions

    return ImageExtensions


def CreateZip(dir_path):
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
def GetRandomID():
    from .number import GetRandomID

    return GetRandomID()


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


# -------------------------------------------------- LIST ----------------------------------------------------
def OSListDirCleaned(path):
    from .list import OSListDirCleaned

    return OSListDirCleaned(path)


# ------------------------------------------------- COMMS ---------------------------------------------------
def SendEmail(subject, notify_email_list=[], msg="", error="", sender="ryan@ensomniac.com", sender_name="Dash"):
    from .comms import SendEmail

    return SendEmail(subject, notify_email_list, msg, error, sender, sender_name)


# ------------------------------------------------- MEMORY --------------------------------------------------
class _Memory:
    _usr_token: str
    _global: object

    def __init__(self):
        pass

    @property
    def Global(self):
        # This function is meant to return meaningful shared data in the context of a single request

        if not hasattr(self, "_global"):
            from Dash import __name__ as DashName

            self._global = sys.modules[DashName]

        if not hasattr(self._global, "RequestData"):
            self._global.RequestData = {}

        if not hasattr(self._global, "RequestUser"):
            self._global.RequestUser = None

        if not hasattr(self._global, "Context"):
            self._global.Context = None

        return self._global

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


Memory = _Memory()
