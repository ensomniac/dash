#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

import os
import sys


class Properties:
    _layers: list
    _now: callable
    get_layers: callable
    get_precomps: callable
    _precomps_default: dict
    get_layer_links: callable

    def __init__(self, user_data, context2d_root, obj_id="", dash_context={}):
        self.User = user_data
        self.Context2DRoot = context2d_root
        self.ID = obj_id
        self.DashContext = dash_context

        self.Data = {}

        # Intended to be added to whenever this class is abstracted or expanded upon.
        self.LayerExtraStrKeys = []
        self.LayerExtraBoolKeys = []
        self.LayerExtraStateKeys = []
        self.LayerExtraFloatKeys = []

    # -------------------------------FIELDS-------------------------------------

    @property
    def AspectRatioH(self):
        return self.Data.get("aspect_ratio_h") or 1.0

    @property
    def AspectRatioW(self):
        return self.Data.get("aspect_ratio_w") or 1.0

    @property
    def CreatedBy(self):
        return self.Data["created_by"]

    @property
    def CreatedOn(self):
        return self.Data["created_on"]

    @property
    def DisplayName(self):
        return self.Data.get("display_name") or self.ID

    @property
    def LayerOrder(self):
        return self.Data.get("layer_order") or []

    @property
    def Layers(self):
        # Since layers can be added, re-ordered, etc, this should be fresh each time
        return self.get_layers()

    @property
    def LayerLinks(self):
        # Since links can be added, re-ordered, etc, this should be fresh each time
        return self.get_layer_links()

    @property
    def ModifiedBy(self):
        return self.Data.get("modified_by") or ""

    @property
    def ModifiedOn(self):
        return self.Data.get("modified_on") or ""

    @property
    def PreCompsMin(self):
        return self.Data.get("precomps") or {}

    @property
    def PreCompsFull(self):
        return self.get_precomps()

    # -------------------------------PATHS--------------------------------------

    @property
    def DataPath(self):
        return os.path.join(self.ObjRoot, "data.json")

    @property
    def LayersRoot(self):
        return os.path.join(self.ObjRoot, "layers")

    @property
    def LayerLinksRoot(self):
        return os.path.join(self.ObjRoot, "layer_links")

    @property
    def ObjRoot(self):
        return os.path.join(self.Context2DRoot, self.ID)

    # ------------------------------HELPERS-------------------------------------

    @property
    def Now(self):
        if not hasattr(self, "_now"):
            from datetime import datetime

            self._now = datetime.now()

        return self._now

    @property
    def precomps_default(self):
        if not hasattr(self, "_precomps_default"):
            from string import ascii_lowercase
            from Dash.Utils import GetHexColorList

            self._precomps_default = {}

            limit = 7
            colors = GetHexColorList(limit)

            for index, letter in enumerate(list(ascii_lowercase)[0:limit]):
                self._precomps_default[letter] = {
                    "display_name": f"Pre-Comp {letter.title()}",
                    "color": colors[index],
                    "asset_path": f"precomp_{letter}",
                    "parallax": 0.5
                }

        return self._precomps_default
