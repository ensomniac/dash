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
    Layers: dict
    Now: callable
    CreatedBy: str
    CreatedOn: str
    save: callable
    ModifiedBy: str
    ModifiedOn: str
    LayersRoot: str
    DisplayName: str
    ToDict: callable
    LayerOrder: list
    DashContext: dict
    AspectRatioH: int
    AspectRatioW: int
    Context2DRoot: str
    add_layer: callable
    add_layer_from_file: callable
    validate_uploaded_file_ext: callable

    def __init__(self):
        pass

    def ToDict(self, save=False):
        """
        :param bool save: When True, the 'modified_by' and 'modified_on' keys are updated, and data is slightly different than a non-save (default=False)

        :return: Sanitized context2D data
        :rtype: dict
        """

        return {
            "aspect_ratio_h":                    self.AspectRatioH,
            "aspect_ratio_w":                    self.AspectRatioW,
            "created_by":                        self.CreatedBy,
            "created_on":                        self.CreatedOn,
            "display_name":                      self.DisplayName,
            "id":                                self.ID,

            # We don't want to save the "layers" key, since we store the layers separately, but we need to
            # save the "layer_order" to be able to populate the "layers" when serving this dict (not saving)
            "layer_order" if save else "layers": self.LayerOrder if save else self.Layers,

            "modified_by":                       self.User["email"] if save else self.ModifiedBy,
            "modified_on":                       self.Now.isoformat() if save else self.ModifiedOn
        } if self.Data else self.Data

    def Duplicate(self):
        from Dash.LocalStorage import Duplicate

        return Duplicate(
            dash_context=self.DashContext,
            store_path=self.Context2DRoot.replace(self.DashContext["srv_path_local"], "").strip("/"),
            id_to_duplicate=self.ID,
            nested=True
        )

    def DuplicateLayer(self, layer_id):
        from Dash.LocalStorage import Duplicate

        return self.SetProperty(
            "layer_order",
            [
                *self.LayerOrder,
                Duplicate(
                    dash_context=self.DashContext,
                    store_path=self.LayersRoot.replace(self.DashContext["srv_path_local"], "").strip("/"),
                    id_to_duplicate=layer_id,
                    nested=True
                )["id"]
            ]
        )

    def SetProperty(self, key, value):
        return self.SetProperties({key: value})

    def SetProperties(self, properties={}):
        from json import loads

        if properties and type(properties) is str:
            properties = loads(properties)

        if "layers" in properties:  # This should never happen, but just in case
            del properties["layers"]

        if not properties:
            return self.ToDict()

        if "layer_order" in properties:
            if type(properties["layer_order"]) is str:
                properties["layer_order"] = loads(properties["layer_order"])

            if type(properties["layer_order"]) is not list:
                raise ValueError(f"Layer order must be a list: {properties['layer_order']}")

            if len(properties["layer_order"]) < len(self.LayerOrder):  # Deletion
                from shutil import rmtree

                for layer_id in os.listdir(self.LayersRoot):
                    if layer_id in properties["layer_order"]:
                        continue

                    rmtree(os.path.join(self.LayersRoot, layer_id))

        if "aspect_ratio_w" in properties or "aspect_ratio_h" in properties:
            properties["aspect_ratio_w"] = float(properties.get("aspect_ratio_w") or self.AspectRatioW)
            properties["aspect_ratio_h"] = float(properties.get("aspect_ratio_h") or self.AspectRatioH)

            for key in ["aspect_ratio_w", "aspect_ratio_h"]:
                if not properties[key].is_integer():
                    from Dash.Utils import ClientAlert

                    raise ClientAlert("Aspect Ratio values must be whole numbers (integers)")

                properties[key] = int(properties[key])

            from math import gcd

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

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to customize the returned layer data for abstractions.
    def OnLayerToDict(self, layer, data):  # noqa
        return data

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to for custom property handling of layer properties for abstractions.
    def OnLayerSetProperties(self, layer, properties={}, imported_context_layer_id=""):  # noqa
        return properties

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to customize the imported context data for abstractions.
    def OnLayerImportedContextData(self, data):
        return data
