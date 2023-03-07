#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Layer:
    _default_display_name: str
    _imported_context_data: dict

    def __init__(self, context_2d, obj_id="", new_layer_type="", new_layer_imported_context_id=""):
        self.context_2d = context_2d
        self.ID = obj_id
        self.Type = new_layer_type  # text, image, video, etc
        self._new_layer_imported_context_id = new_layer_imported_context_id  # When importing another context into a context

        self.data = {}
        self._new = False
        self.bool_keys = ["hidden", "locked", "linked", *self.context_2d.LayerExtraBoolKeys]
        self.str_keys = ["display_name", "text_value", "font_id", "font_color", *self.context_2d.LayerExtraStrKeys]
        self.state_keys = ["anchor_norm_x", "anchor_norm_y", "width_norm", "rot_deg", "opacity", *self.context_2d.LayerExtraStateKeys]
        self.float_keys = [*self.state_keys, "aspect", "contrast", "brightness", *self.context_2d.LayerExtraFloatKeys]

        self.load_data()

    @property
    def root(self):
        return os.path.join(self.context_2d.LayersRoot, self.ID)

    @property
    def data_path(self):
        return os.path.join(self.root, "data.json")

    @property
    def imported_context_data(self):
        if not hasattr(self, "_imported_context_data"):
            if self.Type == "context":
                from . import GetData as GetContextData

                self._imported_context_data = GetContextData(
                    user_data=self.context_2d.User,
                    context_2d_root=self.context_2d.Context2DRoot,
                    obj_id=self.get_imported_context_id()
                )

                for layer_id in self._imported_context_data["layers"]["data"]:
                    # Add this here because it doesn't belong in the ToDict data for
                    # layers in general, only in this context. Including it makes it
                    # more consistent to parse this against the override on the front end.
                    self._imported_context_data["layers"]["data"][layer_id]["linked"] = True

                # This is a function that is meant to be overridden to use for custom modifications
                # to this imported context data for abstractions and extensions of this code.
                self._imported_context_data = self.context_2d.OnLayerImportedContextData(self._imported_context_data)
            else:
                self._imported_context_data = {}

        return self._imported_context_data

    @property
    def default_display_name(self):
        if not hasattr(self, "_default_display_name"):
            self._default_display_name = self.imported_context_data["display_name"] if self.Type == "context" else f"New {self.Type.title()} Layer"

        return self._default_display_name

    def ToDict(self, save=False):
        """
        :param bool save: When True, the 'modified_by' and 'modified_on' keys are updated, and data is slightly different than a non-save (default=False)

        :return: Sanitized layer data
        :rtype: dict
        """

        if not self.data:
            return self.data

        data = {
            # If the default values of anchor or width norm keys change, update front end: DashGuiContext2DPrimitive.get_drag_state_value
            "aspect":        self.data["aspect"] if "aspect" in self.data else (15.45 if self.Type == "text" else 1.0),
            "anchor_norm_x": self.data["anchor_norm_x"] if "anchor_norm_x" in self.data else 0.5,  # normalized in relation to the canvas
            "anchor_norm_y": self.data["anchor_norm_y"] if "anchor_norm_y" in self.data else 0.5,  # normalized in relation to the canvas
            "created_by":    self.data["created_by"],
            "created_on":    self.data["created_on"],
            "display_name":  self.data["display_name"],
            "id":            self.ID,
            "hidden":        self.data["hidden"] if "hidden" in self.data else False,
            "locked":        self.data["locked"] if "locked" in self.data else False,
            "modified_by":   self.context_2d.User["email"] if save else (self.data.get("modified_by") or ""),
            "modified_on":   self.context_2d.Now.isoformat() if save else (self.data.get("modified_on") or ""),
            "opacity":       self.data["opacity"] if "opacity" in self.data else 1.0,
            "rot_deg":       self.data.get("rot_deg") or 0,  # -180 to 180
            "type":          self.Type,
            "width_norm":    self.data["width_norm"] if "width_norm" in self.data else (0.9 if self.Type == "text" else 0.5)  # normalized in relation to the canvas
        }

        if self.Type == "text":
            data["text_value"] = self.data.get("text_value") or ""
            data["font_id"] = self.data.get("font_id") or ""
            data["font_color"] = self.data.get("font_color") or ""

        elif self.Type == "context":
            data = self.context_to_dict(data, save)

        else:
            data["file"] = self.data.get("file") or {}

        if self.Type == "image":
            data["contrast"] = self.data["contrast"] if "contrast" in self.data else 1.0
            data["brightness"] = self.data["brightness"] if "brightness" in self.data else 1.0

        # This is a function that is meant to be overridden to use for custom modifications
        # to this returned data for abstractions and extensions of this code.
        data = self.context_2d.OnLayerToDict(self, data)

        return data

    def SetProperty(self, key, value, imported_context_layer_id=""):
        return self.SetProperties({key: value}, imported_context_layer_id)

    def SetProperties(self, properties={}, imported_context_layer_id=""):
        from json import loads

        if properties and type(properties) is str:
            properties = loads(properties)

        # Should never happen, but just in case
        for key in ["created_by", "created_on", "id", "modified_by", "modified_on", "type"]:
            if key in properties:
                del properties[key]

        if not properties:
            return self.ToDict()

        # Enforce str when null
        for key in self.str_keys:
            if key in properties and not properties.get(key):
                properties[key] = ""

        # Bools
        for key in self.bool_keys:
            if key in properties and type(properties[key]) is not bool:
                properties[key] = loads(properties[key])

        # Floats
        for key in self.float_keys:
            if key in properties and type(properties[key]) not in [float, int]:
                properties[key] = float(properties[key])

        if "text_value" in properties and "display_name" not in properties:
            if self.data.get("display_name") == self.default_display_name or self.data["text_value"] == self.data["display_name"]:
                # If the layer's name has not already been set manually by the user,
                # then auto-set the name based on the primitive's text change
                properties["display_name"] = properties["text_value"]

        properties = self.context_2d.OnLayerSetProperties(self, properties, imported_context_layer_id)

        if self.Type == "context":
            for key in properties:
                self.context_set_prop(key, properties[key], imported_context_layer_id)
        else:
            for key in properties:
                if key == "layer_order":  # Should never happen, but just in case
                    del properties[key]

            self.data.update(properties)

        return self.Save().ToDict()

    def UploadFile(self, file, filename):
        if self.Type == "text" or self.Type == "context":
            raise ValueError("Can't upload files to 'text' or 'context' layers")  # Should never happen, but just in case

        from Dash.Utils import UploadFile

        # A single layer will only ever have a single file (each upload is its own layer)
        file_root = os.path.join(self.root, "file")

        if os.path.exists(file_root):
            from shutil import rmtree

            # This should never be the case, since each upload is its own layer (you're never
            # updating the file on a layer, you would just get a new layer when you upload a new file)
            rmtree(file_root)

        return self.SetProperties({
            "file": UploadFile(
                dash_context=self.context_2d.DashContext,
                user=self.context_2d.User,
                file_root=file_root,
                file_bytes_or_existing_path=file,
                filename=filename,
                enforce_unique_filename_key=False,
                include_jpg_thumb=False
            ),
            "display_name": filename.split(".")[0]
        })

    def Save(self):
        from Dash.LocalStorage import Write

        os.makedirs(self.root, exist_ok=True)

        Write(self.data_path, self.ToDict(save=True))

        return self

    def load_data(self):
        if self.ID:  # Existing
            if not os.path.exists(self.data_path):
                raise FileNotFoundError(f"Data path doesn't exist for layer ({self.ID}), this shouldn't happen")

            from Dash.LocalStorage import Read

            self.data = Read(self.data_path)
            
            if not self.data:
                raise ValueError(f"Failed to read layer data ({self.ID})")

            self.Type = self.data["type"]

            return

        if not self.Type:
            raise ValueError("Layer type is required")
        
        if self.Type == "context" and not self._new_layer_imported_context_id:
            raise ValueError("Imported Context ID is required")

        from Dash.Utils import GetRandomID

        self._new = True
        self.ID = GetRandomID()

        self.data = {  # New
            "created_by": self.context_2d.User["email"],
            "created_on": self.context_2d.Now.isoformat(),
            "id": self.ID,
            "type": self.Type,
            "display_name": self.default_display_name
        }

    def get_imported_context_id(self):
        imported_context = self.data.get("imported_context") or {}
        imported_context_id = imported_context.get("id") or self._new_layer_imported_context_id

        if not imported_context_id:
            raise ValueError("Missing Imported Context ID, this shouldn't happen")

        return imported_context_id

    def context_to_dict(self, data, save):
        imported_context = self.data.get("imported_context") or {}

        if save:
            data["imported_context"] = {"id": self.get_imported_context_id()}
        else:
            data["imported_context"] = self.imported_context_data

            data["str_keys"] = self.str_keys
            data["bool_keys"] = self.bool_keys
            data["float_keys"] = self.float_keys

        # These are overrides per layer (in the imported context)
        data["imported_context"]["context_overrides"] = imported_context.get("context_overrides") or {}

        # These are overrides per layer (in the imported context)
        data["imported_context"]["layer_overrides"] = imported_context.get("layer_overrides") or {}

        # Global overrides for all imported layers, such as rotating all imported layers 45º (rot_deg), is stored at the top level of this layer (self.Data)

        if not self._new:
            return data

        # When first importing a context, make sure it'll fit in the canvas it's being imported into.
        # There's a potential weakness in this logic in its current form. I think if another layer is added
        # to the source context (the one that's been imported) after this initial calculation, that layer
        # won't match the rest. This would require this to be calculated each time we get this dict, but
        # that's not as simple as it sounds. There's a lot of complex logic happening when an imported
        # context is rescaled (affecting all layers in the imported context) and when a single layer within
        # the imported context is rescaled. Solving this potential issue I've laid out above would require
        # modifying that complicated code, and I don't have time for that right now, so this will have to do.
        highest_width_norm = 0
        layers = self.imported_context_data["layers"]

        for layer_id in layers["order"]:
            layer_data = layers["data"][layer_id]

            if layer_data["type"] == "text":
                continue  # Not concerned about text - text's width_norm is 0.9 by default, and that doesn't mean it's all filled

            if layer_data["type"] == "context":
                from Dash.Utils import ClientAlert

                # TODO: We need to add support for this, it's just very complicated because of the
                #  need to handle overrides recursively and I don't have enough time to do it now
                raise ClientAlert(
                    "The context you are trying to import has its own imported context(s).\n"
                    "Importing contexts with nested contexts is complex and not yet supported."
                )

            width_norm = layers["data"][layer_id]["width_norm"]

            if width_norm > highest_width_norm:
                highest_width_norm = width_norm

        if highest_width_norm <= 1:
            data["width_norm"] = highest_width_norm

            return data

        mult = 1 / highest_width_norm

        data["width_norm"] = 1

        for layer_id in layers["order"]:
            width_norm = layers["data"][layer_id]["width_norm"]
            reduced = width_norm * mult

            data["imported_context"]["layer_overrides"][layer_id] = {"width_norm": reduced - width_norm}

        return data

    def context_set_prop(self, key, value, imported_context_layer_id=""):
        if key == "layer_order":
            if type(value) is str:
                from json import loads

                value = loads(value)

            if type(value) is not list:
                raise ValueError(f"Layer order must be a list: {value}")

            self.data["imported_context"]["context_overrides"][key] = value

            return

        # Change to top-level (parent), trickle down to all layers' overrides
        if key in self.state_keys and not imported_context_layer_id:
            if key == "opacity":
                self.data[key] = value

                return

            dif = abs(value - self.data[key])

            for layer_id in self.imported_context_data["layers"]["order"]:
                if not self.is_linked(layer_id):
                    return  # Don't update overrides

                self.update_context_children_state_overrides(key, value, layer_id, dif)

            self.data[key] = value

            return

        # Change to nested layer in parent (imported context)
        if not imported_context_layer_id:
            raise ValueError("Imported Context Layer ID is required")

        if key != "linked" and not self.is_linked(imported_context_layer_id):
            return  # Don't update overrides

        if imported_context_layer_id not in self.data["imported_context"]["layer_overrides"]:
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id] = {}

        if key in self.str_keys or key in self.bool_keys:
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key] = value

        elif key in self.float_keys:
            self.update_context_child_float(key, value, imported_context_layer_id)

    def is_linked(self, imported_context_layer_id):
        overrides = self.data["imported_context"]["layer_overrides"].get(imported_context_layer_id) or {}

        return overrides["linked"] if "linked" in overrides else self.imported_context_data["layers"]["data"][imported_context_layer_id]["linked"]

    def update_context_child_float(self, key, value, imported_context_layer_id):
        if not self.is_linked(imported_context_layer_id):
            return  # Don't update overrides

        if key not in self.data["imported_context"]["layer_overrides"][imported_context_layer_id]:
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key] = 0

        if key == "rot_deg":
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key] += value

            return

        if key == "opacity":
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key] = value

            return

        previous_override = self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key]
        previous_value = self.imported_context_data["layers"]["data"][imported_context_layer_id][key] + previous_override
        dif = abs(value - previous_value)

        if value < previous_value:
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key] -= dif
        else:
            self.data["imported_context"]["layer_overrides"][imported_context_layer_id][key] += dif

    def update_context_children_state_overrides(self, key, value, layer_id, dif):
        if not self.is_linked(layer_id):
            return  # Don't update overrides

        if layer_id not in self.data["imported_context"]["layer_overrides"]:
            self.data["imported_context"]["layer_overrides"][layer_id] = {}

        if key not in self.data["imported_context"]["layer_overrides"][layer_id]:
            self.data["imported_context"]["layer_overrides"][layer_id][key] = 0

        if value < self.data[key]:
            self.data["imported_context"]["layer_overrides"][layer_id][key] -= dif
        else:
            self.data["imported_context"]["layer_overrides"][layer_id][key] += dif

        if key != "rot_deg" and key != "width_norm":
            return

        new_coords = {}
        current_coords = {}
        anchor_keys = ["anchor_norm_x", "anchor_norm_y"]

        for k in anchor_keys:
            if k not in self.data["imported_context"]["layer_overrides"][layer_id]:
                self.data["imported_context"]["layer_overrides"][layer_id][k] = 0

            previous_override = self.data["imported_context"]["layer_overrides"][layer_id][k]
            current_coords[k] = self.imported_context_data["layers"]["data"][layer_id][k] + previous_override

        if key == "rot_deg":
            from Dash.Utils import MovePointAroundCircle

            new_coords["anchor_norm_x"], new_coords["anchor_norm_y"] = MovePointAroundCircle(
                circle_center_x=self.data["anchor_norm_x"],
                circle_center_y=self.data["anchor_norm_y"],
                point_x=current_coords["anchor_norm_x"],
                point_y=current_coords["anchor_norm_y"],
                rotation_degrees=(dif if value > self.data[key] else -dif)
            )

        elif key == "width_norm":
            from Dash.Utils import ScaleChildWithParent

            new_coords["anchor_norm_x"], new_coords["anchor_norm_y"] = ScaleChildWithParent(
                parent_x=self.data["anchor_norm_x"],
                parent_y=self.data["anchor_norm_y"],
                parent_w=value,
                parent_h=(value / self.data["aspect"]),
                child_x=current_coords["anchor_norm_x"],
                child_y=current_coords["anchor_norm_y"],
                scale_factor=(value / self.data[key])
            )

        for k in anchor_keys:
            new_dif = abs(new_coords[k] - self.imported_context_data["layers"]["data"][layer_id][k])

            if new_coords[k] < self.imported_context_data["layers"]["data"][layer_id][k]:
                self.data["imported_context"]["layer_overrides"][layer_id][k] = -new_dif
            else:
                self.data["imported_context"]["layer_overrides"][layer_id][k] = new_dif
