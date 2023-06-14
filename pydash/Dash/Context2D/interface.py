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
    PreCompsMin: dict
    PreCompsFull: dict
    Context2DRoot: str
    add_layer: callable
    add_layer_from_file: callable
    validate_uploaded_file_ext: callable
    parse_aspect_keys_for_properties: callable
    parse_properties_for_override_tag: callable
    re_add_override_tag_to_properties: callable

    def __init__(self):
        pass

    def ToDict(self, save=False):
        """
        :param bool save: When True, the 'modified_by' and 'modified_on' keys are updated, and data is slightly different than a non-save (default=False)

        :return: Sanitized context2D data
        :rtype: dict
        """

        if not self.Data:
            return self.Data

        # This is a function that is meant to be overridden to use for custom modifications
        # to this returned data for abstractions and extensions of this code.
        return self.OnToDict({
            "aspect_ratio_h": self.AspectRatioH,
            "aspect_ratio_w": self.AspectRatioW,
            "created_by":     self.CreatedBy,
            "created_on":     self.CreatedOn,
            "display_name":   self.DisplayName,
            "id":             self.ID,

            # We don't want to save the "layers" key, since we store the layers separately, but we need to
            # save the "layer_order" to be able to populate the "layers" when serving this dict (not saving)
            "layer_order" if save else "layers": self.LayerOrder if save else self.Layers,

            "modified_by": self.User["email"] if save else self.ModifiedBy,
            "modified_on": self.Now.isoformat() if save else self.ModifiedOn,

            # Only save changes, don't need to save the entire default data structure
            "precomps": self.PreCompsMin if save else self.PreCompsFull
        })

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

    def SetProperty(self, key, value, moved_layer_id=""):
        return self.SetProperties({key: value}, moved_layer_id)

    def SetProperties(self, properties={}, moved_layer_id=""):
        properties = self.ParseProperties(
            properties,
            moved_layer_id=moved_layer_id
        )

        if not properties:
            return self.ToDict()

        self.Data.update(properties)

        return self.save().ToDict()

    def SetPreCompProperty(self, key, value, letter):
        if "precomps" not in self.Data:
            self.Data["precomps"] = {}

        if letter not in self.PreCompsMin:
            self.Data["precomps"][letter] = {}

        self.Data["precomps"][letter][key] = value

        return self.save().ToDict()

    def ParseProperties(self, properties, for_overrides=False, retain_override_tag=True, moved_layer_id=""):
        if properties and type(properties) is str:
            from json import loads

            properties = loads(properties)

        if "layers" in properties:  # This should never happen, but just in case
            del properties["layers"]

        if not properties:
            return properties

        properties = self.parse_properties_for_override_tag(properties, for_overrides)

        if "layer_order" in properties:
            if type(properties["layer_order"]) is str:
                from json import loads

                properties["layer_order"] = loads(properties["layer_order"])

            if type(properties["layer_order"]) is not list:
                raise ValueError(f"Layer order must be a list: {properties['layer_order']}")

            if len(properties["layer_order"]) < len(self.LayerOrder):  # Deletion
                from shutil import rmtree

                for layer_id in os.listdir(self.LayersRoot):
                    if layer_id in properties["layer_order"]:
                        continue

                    rmtree(os.path.join(self.LayersRoot, layer_id))

            if moved_layer_id:
                from .layer import Layer

                layer = Layer(self, moved_layer_id)

                if layer.data.get("precomp_tag"):
                    layer.SetProperty("precomp_tag", "")

        if "aspect_ratio_w" in properties or "aspect_ratio_h" in properties:
            properties = self.parse_aspect_keys_for_properties(properties, for_overrides)

            if properties["aspect_ratio_w"] == properties["aspect_ratio_h"]:
                properties["aspect_ratio_w"] = 1
                properties["aspect_ratio_h"] = 1
            else:
                from math import gcd

                divisor = gcd(properties["aspect_ratio_w"], properties["aspect_ratio_h"])

                properties["aspect_ratio_w"] /= divisor
                properties["aspect_ratio_h"] /= divisor

        if for_overrides and retain_override_tag:
            properties = self.re_add_override_tag_to_properties(properties)

        return properties

    def AddTextLayer(self):
        from .layer import Layer

        return self.add_layer(Layer(self, new_layer_type="text"))

    def AddColorLayer(self):
        from .layer import Layer

        return self.add_layer(Layer(self, new_layer_type="color"))

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

    # TODO: When importing context with different aspect ratio, need
    #  to recalculate norms so everything is still positioned properly - how?
    def ImportAnotherContext(self, obj_id_to_import):
        from .layer import Layer

        return self.add_layer(Layer(
            self,
            new_layer_type="context",
            new_layer_imported_context_id=obj_id_to_import
        ))

    # As of writing, just for manual testing (not available in the interface)
    def CopyLayerToAnotherContext(self, dest_obj_id, source_layer_id):
        source_layer_root = os.path.join(self.LayersRoot, source_layer_id)

        if not os.path.exists(source_layer_root):
            from Dash.Utils import ClientAlert

            raise ClientAlert(f"Source layer doesn't exist, expected: {source_layer_root}")

        from . import Context2D

        dest_c2d = Context2D(
            user_data=self.User,
            context_2d_root=self.Context2DRoot,
            obj_id=dest_obj_id,
            dash_context=self.DashContext
        )

        if not os.path.exists(dest_c2d.ObjRoot):
            from Dash.Utils import ClientAlert

            raise ClientAlert(f"Dest C2D doesn't exist, expected: {dest_c2d.ObjRoot}")

        from shutil import move
        from Dash.LocalStorage import Duplicate, RecursivelyReplaceIDInRoot, Read

        os.makedirs(dest_c2d.LayersRoot, exist_ok=True)

        new_layer_id = Duplicate(
            dash_context=self.DashContext,
            store_path=self.LayersRoot,
            id_to_duplicate=source_layer_id,
            display_name_tag="",
            nested=True
        )["id"]

        new_layer_dest_root = os.path.join(dest_c2d.LayersRoot, new_layer_id)

        move(
            os.path.join(self.LayersRoot, new_layer_id),
            new_layer_dest_root
        )

        RecursivelyReplaceIDInRoot(new_layer_dest_root, self.ID, dest_obj_id)

        dest_c2d.SetProperty("layer_order", [*dest_c2d.LayerOrder, new_layer_id])

        return Read(os.path.join(new_layer_dest_root, "data.json"))

    # --------------------------------- OVERRIDES ---------------------------------

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to customize the returned context data for abstractions.
    def OnToDict(self, data):
        return data

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to customize the returned layer data for abstractions.
    def OnLayerToDict(self, layer, data, save=False):  # noqa
        return data

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to for custom property handling of layer properties for abstractions.
    def OnLayerSetProperties(self, layer, properties={}, imported_context_layer_id="", for_overrides=False):  # noqa
        return properties

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to customize the imported context data for abstractions.
    def OnLayerImportedContextData(self, data):
        return data

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to get rendered precomp data (must include a "url" key).
    def GetPreComp(self, letter):
        return {"letter": letter}

    # Intended to be overwritten whenever this class is abstracted or expanded upon.
    # This is used to render all precomps.
    def RenderAllPreComps(self):
        return {}
