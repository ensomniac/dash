#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Layer:
    def __init__(self, context_2d, obj_id="", new_layer_type=""):
        self.context_2d = context_2d
        self.ID = obj_id
        self.Type = new_layer_type  # text, image, video, etc

        self.data = {}

        self.load_data()

    @property
    def root(self):
        return os.path.join(self.context_2d.LayersRoot, self.ID)

    @property
    def data_path(self):
        return os.path.join(self.root, "data.json")

    def ToDict(self, save=False):
        """
        :param bool save: When True, the 'modified_by' and 'modified_on' keys are updated, and data is slightly different than a non-save (default=False)

        :return: Sanitized layer data
        :rtype: dict
        """

        if not self.data:
            return self.data

        data = {
            "aspect":        self.data["aspect"] if "aspect" in self.data else (15.45 if self.Type == "text" else 1),
            "anchor_norm_x": self.data["anchor_norm_x"] if "anchor_norm_x" in self.data else 0.5,  # normalized in relation to the canvas
            "anchor_norm_y": self.data["anchor_norm_y"] if "anchor_norm_y" in self.data else 0.5,  # normalized in relation to the canvas
            "created_by":    self.data["created_by"],
            "created_on":    self.data["created_on"],
            "display_name":  self.data["display_name"],
            "id":            self.ID,
            "hidden":        self.data.get("hidden") or False,
            "locked":        self.data.get("locked") or False,
            "modified_by":   self.context_2d.User["email"] if save else (self.data.get("modified_by") or ""),
            "modified_on":   self.context_2d.Now.isoformat() if save else (self.data.get("modified_on") or ""),
            "opacity":       self.data["opacity"] if "opacity" in self.data else 1,
            "rot_deg":       self.data.get("rot_deg") or 0,  # -180 to 180 (or is it -179 to 179?)
            "type":          self.Type,
            "width_norm":    self.data["width_norm"] if "width_norm" in self.data else (0.9 if self.Type == "text" else 0.5)  # normalized in relation to the width of the canvas
        }

        if self.Type == "text":
            data["text_value"] = self.data.get("text_value") or ""
            data["font_id"] = self.data.get("font_id") or ""
            data["font_color"] = self.data.get("font_color") or ""
        else:
            data["file"] = self.data.get("file") or {}

        if self.Type == "image":
            data["contrast"] = self.data["contrast"] if "contrast" in self.data else 1
            data["brightness"] = self.data["brightness"] if "brightness" in self.data else 1

        return data

    def SetProperty(self, key, value):
        return self.SetProperties({key: value})

    def SetProperties(self, properties={}):
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
        for key in ["display_name", "text_value", "font_id", "font_color"]:
            if key in properties and not properties.get(key):
                properties[key] = ""

        # Bools
        for key in ["hidden", "locked"]:
            if key in properties and type(properties[key]) is not bool:
                properties[key] = loads(properties[key])

        # Floats
        for key in ["aspect", "anchor_norm_x", "anchor_norm_y", "opacity", "rot_deg", "width_norm", "contrast", "brightness"]:
            if key in properties and type(properties[key]) not in [float, int]:
                properties[key] = float(properties[key])

        if "text_value" in properties and "display_name" not in properties:
            if self.data.get("display_name") == self.get_default_display_name() or self.data["text_value"] == self.data["display_name"]:
                # If the layer's name has not already been set manually by the user,
                # then auto-set the name based on the primitive's text change
                properties["display_name"] = properties["text_value"]

        self.data.update(properties)

        return self.Save().ToDict()

    def UploadFile(self, file, filename):
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

    def get_default_display_name(self):
        return f"New {self.Type.title()} Layer"

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

        from Dash.Utils import GetRandomID

        self.ID = GetRandomID()

        self.data = {  # New
            "created_by": self.context_2d.User["email"],
            "created_on": self.context_2d.Now.isoformat(),
            "id": self.ID,
            "type": self.Type,
            "display_name": self.get_default_display_name()
        }
