#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Interface:
    ID: str
    Data: dict
    User: dict
    save: callable
    ToDict: callable
    DashContext: dict
    upload_file: callable
    validate_uploaded_file_ext: callable

    def __init__(self):
        pass

    def Duplicate(self):
        from Dash.LocalStorage import Duplicate

        return Duplicate(
            dash_context=self.DashContext,
            store_path="vdb_context_2d",
            id_to_duplicate=self.ID,
            nested=True
        )

    def SetProperty(self, key, value):
        return self.SetProperties({key: value})

    def SetProperties(self, properties={}):
        if "layers" in properties:  # This should never happen, but just in case
            del properties["layers"]

        if not properties:
            return self.ToDict()

        self.Data.update(properties)

        return self.save().ToDict()

    def UploadImage(self, file, filename, layer_id):
        from Dash.Utils import GetImageExtensions

        return self.upload_file(file, filename, layer_id, GetImageExtensions())

    def UploadVideo(self, file, filename, layer_id):
        from Dash.Utils import GetVideoExtensions

        return self.upload_file(file, filename, layer_id, GetVideoExtensions())
