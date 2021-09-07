#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

# For now, this shouldn't be expected to run locally. However, if we start getting
# relative import errors, we'll have to adjust all the below imports to match this format:
#     try:
#         from .number import GetRandomID
#     except ImportError:
#         from number import GetRandomID

OapiRoot = os.path.join("/var", "www", "vhosts", "oapi.co")


# ------------------------------------------------- IMAGE ---------------------------------------------------
def UploadImage():
    from .image import Upload

    return Upload(None, None, None, None)


# ------------------------------------------------- NUMBER --------------------------------------------------
def GetRandomID():
    from .number import GetRandomID

    return GetRandomID()


def Lerp(valA, valB, t):
    from .number import Lerp

    return Lerp(valA, valB, t)


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
def SendEmail(subject, notify_email_list=[], msg="", error=""):
    from .comms import SendEmail

    return SendEmail(subject, notify_email_list, msg, error)


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
