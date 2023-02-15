#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Layer:
    def __init__(self, context_2d, obj_id):
        self.context_2d = context_2d
        self.ID = obj_id

    @property
    def root(self):
        return os.path.join(self.context_2d.LayersRoot, self.ID)

    @property
    def data_path(self):
        return os.path.join(self.root, "data.json")

    def GetData(self):
        if not os.path.exists(self.data_path):
            return {}

        from Dash.LocalStorage import Read

        return Read(self.data_path) or {}

    def SetProperty(self, key, value):
        return self.SetProperties({key: value})

    def SetProperties(self, properties={}):
        data = self.GetData()

        if not properties:
            return data

        data.update(properties)

        return self.save()

    def UploadFile(self, file, filename):
        from Dash.Utils import UploadFile

        os.makedirs(self.root, exist_ok=True)  # In case it's new

        if not os.path.exists(self.data_path):
            # TODO:
            #  - make sure to save new data if new
            #  - save file data? or get on the fly? probably on the fly is best so we don't have to keep it up to date
            #  - any saving to do if not new?
            pass

        file_root = os.path.join(self.root, "file")  # A single layer will only ever have a single file (each upload is its own layer)

        if os.path.exists(file_root):
            from shutil import rmtree

            # This should never be the case, since each upload is its own layer (you're never
            # updating the file on a layer, you would just get a new layer when you upload a new file)
            rmtree(file_root)

        # TODO: for images, need to manage it the same way we do for renders, where we save a
        #  thumb, png in this case, to the server and send the original to s3... right?

        return UploadFile(
            dash_context=self.context_2d.DashContext,
            user=self.context_2d.User,
            file_root=file_root,
            file_bytes_or_existing_path=file,
            filename=filename,
            enforce_unique_filename_key=False,
            include_jpg_thumb=False
        )

    def save(self, data={}):
        from Dash.LocalStorage import Write

        if not data:
            data = self.GetData()

        if not data:
            data = {
                "created_by": self.context_2d.User["email"],
                "created_on": self.context_2d.Now.isoformat(),
                "id": self.ID
            }

        os.makedirs(self.root, exist_ok=True)

        Write(self.data_path, data)

        return data
