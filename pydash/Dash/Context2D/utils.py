#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

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
    PreCompsMin: dict
    LayerLinksRoot: str
    SetProperty: callable
    precomps_default: dict
    SetLayerProperties: callable

    def __init__(self):
        pass

    def load_data(self):
        if self.ID:  # Existing
            if not os.path.exists(self.DataPath):
                raise FileNotFoundError(f"Data path ({self.DataPath}) doesn't exist for context ({self.ID}), this shouldn't happen")

            from Dash.LocalStorage import Read

            self.Data = Read(self.DataPath)

            if not self.Data:
                raise ValueError(f"Failed to read context data ({self.ID})")

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

    def get_precomps(self):
        precomps = {}

        for letter in self.precomps_default:
            precomps[letter] = {}

            for key in self.precomps_default[letter]:
                if self.PreCompsMin.get(letter) and self.PreCompsMin[letter].get(key):
                    precomps[letter][key] = self.PreCompsMin[letter][key]
                else:
                    precomps[letter][key] = self.precomps_default[letter][key]

        return precomps

    def get_layers(self):
        layers = {
            "data": {},
            "order": self.LayerOrder
        }

        if not self.LayerOrder:
            return layers

        from .layer import Layer
        from copy import deepcopy

        for layer_id in self.LayerOrder:
            layers["data"][layer_id] = Layer(self, layer_id).ToDict()

        last_precomp_tag = ""
        reversed_order = deepcopy(self.LayerOrder)

        reversed_order.reverse()

        for layer_id in reversed_order:
            if not last_precomp_tag:
                last_precomp_tag = (
                        layers["data"][layer_id].get("precomp_tag")
                        or self.precomps_default[list(self.precomps_default.keys())[0]]["asset_path"]
                )

            if not layers["data"][layer_id].get("precomp_tag"):
                layers["data"][layer_id]["precomp_tag"] = last_precomp_tag

            last_precomp_tag = layers["data"][layer_id]["precomp_tag"]

        return layers

    def get_layer_links(self):
        layer_links = {}

        if not os.path.exists(self.LayerLinksRoot):
            return layer_links

        link_ids = os.listdir(self.LayerLinksRoot)

        if not link_ids:
            return layer_links

        from .layer_link import LayerLink

        for link_id in link_ids:
            layer_links[link_id] = LayerLink(self, link_id).ToDict()

        return layer_links

    def add_layer_from_file(self, file, filename, layer_type):
        from .layer import Layer

        layer = Layer(self, new_layer_type=layer_type)

        layer.UploadFile(file, filename)

        return self.add_layer(layer)

    def update_linked_layers_on_change(self, link_id, initiating_layer_id, properties={}):
        properties, layer_ids = self.get_properties_and_layer_ids_to_update_linked_layers_on_change(
            link_id=link_id,
            properties=properties
        )

        if not properties or not layer_ids:
            return

        for layer_id in layer_ids:
            if layer_id == initiating_layer_id:
                continue

            self.SetLayerProperties(
                layer_id=layer_id,
                properties=properties,
                return_full_data=False,
                update_linked_layers=False
            )

    # Lengthy name, I know
    def get_properties_and_layer_ids_to_update_linked_layers_on_change(self, link_id, properties={}):
        if not properties:
            return None, None

        from .layer_link import LayerLink

        try:
            layer_link = LayerLink(self, link_id)

        except ValueError:
            return None, None

        layer_link_data = layer_link.ToDict()

        if not layer_link_data.get("layer_ids") or not layer_link_data.get("keys"):
            return None, None

        properties = {k: properties[k] for k in properties if k in layer_link_data["keys"]}

        if not properties:
            return None, None

        return properties, layer_link_data["layer_ids"]

    def add_layer(self, layer):
        layer.Save()

        return self.SetProperty("layer_order", [*self.LayerOrder, layer.ID])

    def parse_properties_for_override_tag(self, properties, for_overrides=False):
        if for_overrides:
            from copy import deepcopy

            old = deepcopy(properties)
            properties = {}

            for key in old:
                if not key.endswith("_override"):
                    raise ValueError(
                        "'for_overrides' mode expects an overrides dict, where all keys end in '_override'"
                    )

                # Reformat the dict to not have "_override" keys
                # so we can parse the properties as normal
                properties[key.replace("_override", "")] = old[key]

            return properties

        for key in properties:
            if key.endswith("_override"):
                from Dash.Utils import ClientAlert

                raise ClientAlert(
                    "As of writing, any overrides will have to be explicitly handled by "
                    "the custom abstraction of Dash.Context2D. In the future, this "
                    "can be baked into the core code if it makes sense to do so."
                )

        return properties

    def re_add_override_tag_to_properties(self, properties):
        from copy import deepcopy

        old = deepcopy(properties)
        properties = {}

        for key in old:
            # Re-add the "_override" tag to each key
            properties[f"{key}_override"] = old[key]

        return properties

    # If abstraction of this module is managing overrides,
    # you'll likely want to override this function so that
    # 'or self.Data[key]' checks for the overridden value first.
    def parse_aspect_keys_for_properties(self, properties, for_overrides=False):
        for key in ["aspect_ratio_w", "aspect_ratio_h"]:
            valid = True

            try:
                properties[key] = float(properties.get(key) or self.Data[key])

                if not properties[key].is_integer():
                    valid = False

            except ValueError:
                valid = False

            if not valid:
                from Dash.Utils import ClientAlert

                raise ClientAlert("Aspect Ratio values must be whole numbers (integers)")

            properties[key] = int(properties[key])

        return properties
