#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Utils:
    ID: str
    User: dict
    Data: dict
    ObjRoot: str
    Now: callable
    DataPath: str
    LayersRoot: str
    ToDict: callable
    LayerOrder: list
    SetProperty: callable

    def __init__(self):
        pass

    def load_data(self):
        if self.ID:  # Existing
            from Dash.LocalStorage import Read

            self.Data = Read(self.DataPath)

            if not self.Data:
                raise ValueError("Failed to read data")

            return

        from Dash.Utils import GetRandomID

        self.ID = GetRandomID()

        self.Data = {  # New
            "created_by": self.User["email"],
            "created_on": self.Now.isoformat(),
            "id": self.ID
        }

    def save(self):
        from Dash.LocalStorage import Write

        os.makedirs(self.ObjRoot, exist_ok=True)

        Write(self.DataPath, self.ToDict(save=True))

        return self

    def get_layers(self):
        layers = {
            "data": {},
            "order": self.LayerOrder
        }

        if not self.LayerOrder:
            return layers

        from .layer import Layer

        for layer_id in self.LayerOrder:
            layers["data"][layer_id] = Layer(self, layer_id).ToDict()

        return layers

    def add_layer_from_file(self, file, filename, allowable_exts, layer_type):
        self.validate_uploaded_file_ext(filename, allowable_exts)

        from .layer import Layer

        layer = Layer(self, new_layer_type=layer_type)

        layer.UploadFile(file, filename)

        return self.add_layer(layer)

    def add_layer(self, layer):
        return self.SetProperty("layer_order", [*self.LayerOrder, layer.ID])

    def validate_uploaded_file_ext(self, filename, allowable_exts):
        ext = filename.split(".")[-1].strip().lower()

        if ext not in allowable_exts:
            raise ValueError(f"Invalid file extension ({ext}), expected: {allowable_exts}")
