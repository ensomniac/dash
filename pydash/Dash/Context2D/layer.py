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
            "anchor_norm_x": self.data["anchor_norm_x"] if "anchor_norm_x" in self.data else 0.5,  # normalized x value for the center point of the element in relation to the canvas
            "anchor_norm_y": self.data["anchor_norm_y"] if "anchor_norm_y" in self.data else 0.5,  # normalized y value for the center point of the element in relation to the canvas
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
            "width_norm":    self.data["width_norm"] if "width_norm" in self.data else 0.5  # normalized width for the width of the element in relation to the width of the canvas
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
        if properties and type(properties) is str:
            from json import loads

            properties = loads(properties)

        if "file" in properties:  # Should never happen, but just in case
            del properties["file"]

        if not properties:
            return self.ToDict()

        self.data.update(properties)

        return self.save().ToDict()

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
            "display_name": filename
        })

    def save(self):
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

        from Dash.Utils import GetRandomID

        self.ID = GetRandomID()

        self.data = {  # New
            "created_by": self.context_2d.User["email"],
            "created_on": self.context_2d.Now.isoformat(),
            "id": self.ID,
            "type": self.Type,
            "display_name": f"New {self.data['type']} Layer"
        }
