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
            "rot_deg":       self.data.get("rot_deg") or 0,  # -180 to 180 (or is it -179 to 179?)
            "type":          self.Type,
            "width_norm":    self.data["width_norm"] if "width_norm" in self.data else (0.9 if self.Type == "text" else 0.5)  # normalized in relation to the width of the canvas
        }

        if self.Type == "text":
            data["text_value"] = self.data.get("text_value") or ""
            data["font_id"] = self.data.get("font_id") or ""
            data["font_color"] = self.data.get("font_color") or ""

        elif self.Type == "context":
            imported_context = self.data.get("imported_context") or {}

            if save:
                data["imported_context"] = {"id": self.get_imported_context_id()}
            else:
                data["imported_context"] = self.imported_context_data

            data["imported_context"]["linked"] = imported_context["linked"] if "linked" in imported_context else True

            # These are overrides per layer (in the imported context) - global overrides for all imported
            # layers, such as rotating all imported layers 45º, is stored at the top level of this layer (self.Data)
            data["imported_context"]["overrides"] = imported_context.get("overrides") or {}

        else:
            data["file"] = self.data.get("file") or {}

        if self.Type == "image":
            data["contrast"] = self.data["contrast"] if "contrast" in self.data else 1.0
            data["brightness"] = self.data["brightness"] if "brightness" in self.data else 1.0

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

        state_keys = ["anchor_norm_x", "anchor_norm_y", "width_norm", "rot_deg", "opacity"]
        float_keys = [*state_keys, "aspect", "contrast", "brightness"]

        # Enforce str when null
        for key in ["display_name", "text_value", "font_id", "font_color"]:
            if key in properties and not properties.get(key):
                properties[key] = ""

        # Bools
        for key in ["hidden", "locked", "linked"]:
            if key in properties and type(properties[key]) is not bool:
                properties[key] = loads(properties[key])

        # Floats
        for key in float_keys:
            if key in properties and type(properties[key]) not in [float, int]:
                properties[key] = float(properties[key])

        if "text_value" in properties and "display_name" not in properties:
            if self.data.get("display_name") == self.default_display_name or self.data["text_value"] == self.data["display_name"]:
                # If the layer's name has not already been set manually by the user,
                # then auto-set the name based on the primitive's text change
                properties["display_name"] = properties["text_value"]

        if self.Type == "context":
            for key in properties:
                value = properties[key]

                if key == "linked":
                    self.data["imported_context"][key] = value

                    continue

                if key in state_keys and not imported_context_layer_id:
                    dif = abs(value - self.data[key])

                    for layer_id in self.imported_context_data["layers"]["order"]:
                        if layer_id not in self.data["imported_context"]["overrides"]:
                            self.data["imported_context"]["overrides"][layer_id] = {}

                        if key not in self.data["imported_context"]["overrides"][layer_id]:
                            self.data["imported_context"]["overrides"][layer_id][key] = 0

                        if value < self.data[key]:
                            self.data["imported_context"]["overrides"][layer_id][key] -= dif
                        else:
                            self.data["imported_context"]["overrides"][layer_id][key] += dif

                    self.data[key] = value

                    continue

                # TODO: Moving and rotating work - make sure scaling works as expected

                if not imported_context_layer_id:
                    raise ValueError("Imported Context Layer ID is required")

                if imported_context_layer_id not in self.data["imported_context"]["overrides"]:
                    self.data["imported_context"]["overrides"][imported_context_layer_id] = {}

                if key not in self.data["imported_context"]["overrides"][imported_context_layer_id]:
                    self.data["imported_context"]["overrides"][imported_context_layer_id][key] = 0

                if key == "rot_deg":
                    self.data["imported_context"]["overrides"][imported_context_layer_id][key] += value

                    continue

                previous_override = self.data["imported_context"]["overrides"][imported_context_layer_id][key]
                previous_value = self.imported_context_data["layers"]["data"][imported_context_layer_id][key] + previous_override
                dif = abs(value - previous_value)

                if value < previous_value:
                    self.data["imported_context"]["overrides"][imported_context_layer_id][key] -= dif
                else:
                    self.data["imported_context"]["overrides"][imported_context_layer_id][key] += dif
        else:
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
