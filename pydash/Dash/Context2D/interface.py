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
    AspectRatioH: int
    AspectRatioW: int
    Context2DRoot: str
    add_layer: callable
    add_layer_from_file: callable
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
        if properties and type(properties) is str:
            from json import loads

            properties = loads(properties)

        if "layers" in properties:  # This should never happen, but just in case
            del properties["layers"]

        if not properties:
            return self.ToDict()

        if "layer_order" in properties:
            if type(properties["layer_order"]) is str:
                from json import loads

                properties["layer_order"] = loads(properties["layer_order"])

            if type(properties["layer_order"]) is not list:
                raise ValueError(f"Layer order must be a list: {properties['layer_order']}")

        if "aspect_ratio_w" in properties or "aspect_ratio_h" in properties:
            from math import gcd

            properties["aspect_ratio_w"] = float(properties.get("aspect_ratio_w") or self.AspectRatioW)
            properties["aspect_ratio_h"] = float(properties.get("aspect_ratio_h") or self.AspectRatioH)

            divisor = gcd(properties["aspect_ratio_w"], properties["aspect_ratio_h"])

            properties["aspect_ratio_w"] /= divisor
            properties["aspect_ratio_h"] /= divisor

        self.Data.update(properties)

        return self.save().ToDict()

    def AddTextLayer(self):
        from .layer import Layer

        return self.add_layer(Layer(self, new_layer_type="text"))

    def AddImageLayer(self, file, filename):
        from Dash.Utils import GetImageExtensions

        return self.add_layer_from_file(file, filename, GetImageExtensions(), "image")

    def AddVideoLayer(self, file, filename):
        from Dash.Utils import GetVideoExtensions

        return self.add_layer_from_file(file, filename, GetVideoExtensions(), "video")

    def SetLayerProperty(self, layer_id, key, value, imported_context_layer_id=""):
        from .layer import Layer

        Layer(self, layer_id).SetProperty(key, value, imported_context_layer_id)

        return self.ToDict()

    def SetLayerProperties(self, layer_id, properties={}, imported_context_layer_id=""):
        from .layer import Layer

        Layer(self, layer_id).SetProperties(properties, imported_context_layer_id)

        return self.ToDict()

    def ImportAnotherContext(self, obj_id_to_import):
        from .layer import Layer

        return self.add_layer(Layer(
            self,
            new_layer_type="context",
            new_layer_imported_context_id=obj_id_to_import
        ))
