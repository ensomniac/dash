#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class LayerLink:
    def __init__(
        self, context_2d, link_id="", new_data={}, initiating_layer_id=""
    ):
        self.context_2d = context_2d
        self.ID = link_id
        self._new_data = new_data  # For new links (no link_id provided)
        self._initiating_layer_id = initiating_layer_id

        self.data = {}
        self._new = False
        self._first_save = False

        self.load_data()

    @property
    def root(self):
        return os.path.join(self.context_2d.LayerLinksRoot, self.ID)

    @property
    def data_path(self):
        return os.path.join(self.root, "data.json")

    def ToDict(self, save=False):
        """
        :param bool save: When True, the 'modified_by' and 'modified_on' keys are updated,
                          and data is slightly different than a non-save (default=False)

        :return: Sanitized layer link data
        :rtype: dict
        """

        if not self.data:
            return self.data

        from copy import deepcopy

        data = deepcopy(self.data)

        if save:
            data["modified_by"] = self.context_2d.User["email"]
            data["modified_on"] = self.context_2d.Now.isoformat()

        # This is a function that is meant to be overridden to use for custom modifications
        # to this returned data for abstractions and extensions of this code.
        return self.context_2d.OnLayerLinkToDict(self, data, save)

    def Save(self):
        from Dash.LocalStorage import Write

        os.makedirs(self.root, exist_ok=True)

        if self._new and not self._first_save and self.data["layer_ids"]:
            from copy import deepcopy

            self.data["layer_ids"] = self.on_layer_ids_added(
                added=deepcopy(self.data["layer_ids"]),
                layer_ids=deepcopy(self.data["layer_ids"]),
                initiating_layer_id=self._initiating_layer_id
            )

            self._first_save = True

        Write(self.data_path, self.ToDict(save=True))

        return self

    def SetProperty(self, key, value):
        return self.SetProperties({key: value})

    def SetProperties(self, properties={}):
        if not properties:
            return self.ToDict()

        if "layer_ids" in properties and self.data["layer_ids"]:
            properties["layer_ids"] = self.handle_layer_id_changes(properties["layer_ids"])

        self.data.update(properties)

        return self.Save().ToDict()

    def Delete(self):
        if not os.path.exists(self.root):
            return None

        data = self.ToDict()

        if data["layer_ids"]:
            from copy import deepcopy

            data["layer_ids"] = self.on_layer_ids_removed(deepcopy(data["layer_ids"]), [])

            if data["layer_ids"]:  # Prevent data errors from a mid-operation failure
                self.SetProperty("layer_ids", data["layer_ids"])

                raise Exception("Some layers failed to be unlinked")

        from shutil import rmtree

        rmtree(self.root)

        return data

    def handle_layer_id_changes(self, layer_ids=[]):
        removed = []

        for layer_id in self.data["layer_ids"]:
            if layer_id not in layer_ids:
                removed.append(layer_id)

        layer_ids = self.on_layer_ids_removed(removed, layer_ids)
        added = []

        for layer_id in layer_ids:
            if layer_id not in self.data["layer_ids"]:
                added.append(layer_id)

        return self.on_layer_ids_added(added, layer_ids)

    def on_layer_ids_added(self, added, layer_ids=None, initiating_layer_id=""):
        if initiating_layer_id and self.data["keys"]:
            initiating_layer_data = self.context_2d.GetLayer(initiating_layer_id).ToDict()

            props = {k: initiating_layer_data[k] for k in self.data["keys"]}
        else:
            props = {}

        for layer_id in added:
            try:
                self.context_2d.SetLayerProperties(
                    layer_id=layer_id,
                    properties={
                        "link_id": self.ID,
                        **props
                    },
                    return_full_data=False,
                    update_linked_layers=False
                )
            except:
                if layer_ids is not None:
                    layer_ids.remove(layer_id)  # Prevent data errors from a mid-operation failure

        return layer_ids

    def on_layer_ids_removed(self, removed, layer_ids=None):
        for layer_id in removed:
            try:
                self.context_2d.SetLayerProperty(
                    layer_id=layer_id,
                    key="link_id",
                    value="",
                    return_full_data=False,
                    update_linked_layers=False
                )
            except:
                if layer_ids is not None:
                    layer_ids.append(layer_id)  # Prevent data errors from a mid-operation failure

        return layer_ids

    def load_data(self):
        if self.ID:  # Existing
            if not os.path.exists(self.data_path):
                from Dash.Utils import ClientAlert

                raise ClientAlert(
                    f"This layer link ({self.ID}) appears to have been deleted (expected: {self.data_path})."
                    f"If not by you, possibly by another user working on the same context.\n\n"
                    f"Please refresh and try again.\nIf this error persists, please report it."
                )

            from Dash.LocalStorage import Read

            self.data = Read(self.data_path)

            if not self.data:
                raise ValueError(f"Failed to read layer link data ({self.ID})")

            return

        if not self._new_data.get("layer_ids"):
            raise ValueError("Layer IDs are required")

        if not self._new_data.get("keys"):
            raise ValueError("Keys are required")

        from Dash.Utils import GetRandomID

        self._new = True
        self.ID = GetRandomID()

        if not self._new_data.get("color"):
            from Dash.Utils import GetRandomHexColor

            self._new_data["color"] = GetRandomHexColor()

        self.data = {  # New
            "created_by": self.context_2d.User["email"],
            "created_on": self.context_2d.Now.isoformat(),
            "id": self.ID,
            "layer_ids": self._new_data["layer_ids"],
            "keys": self._new_data["keys"],
            "color": self._new_data["color"]
        }
