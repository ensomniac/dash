#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Properties:
    _layers: list
    _now: callable
    get_layers: callable
    get_precomps: callable
    _precomps_default: dict

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
            colors = [  # ROYGBIV
                "#d10000",
                "#ff6622",
                "#ffda21",
                "#33dd00",
                "#1133cc",
                "#220066",
                "#330044"
                # If max increases above seven, add more colors
            ]

            self._precomps_default = {}

            for num in range(7):
                self._precomps_default[str(num)] = {
                    "display_name": f"Pre-Comp #{num + 1}",
                    "color": colors[num],
                    "asset_path": f"precomp_{num + 1}"
                }

        return self._precomps_default
