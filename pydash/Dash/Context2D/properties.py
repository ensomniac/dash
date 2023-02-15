#!/usr/bin/python
#
# Candy 2022, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys


class Properties:
    _now: callable

    def __init__(self, user_data, context2d_root, obj_id=""):
        self.User = user_data
        self.Context2DRoot = context2d_root
        self.ID = obj_id

        self.Data = {}

    # -------------------------------FIELDS-------------------------------------

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
    def ModifiedBy(self):
        return self.Data["modified_by"]

    @property
    def ModifiedOn(self):
        return self.Data["modified_on"]

    # -------------------------------PATHS--------------------------------------

    @property
    def DataPath(self):
        return os.path.join(self.Root, "data.json")

    @property
    def Root(self):
        return os.path.join(self.Context2DRoot, self.ID)

    # ------------------------------MODULES-------------------------------------

    # ------------------------------HELPERS-------------------------------------

    @property
    def now(self):
        if not hasattr(self, "_now"):
            from datetime import datetime

            self._now = datetime.now()

        return self._now
