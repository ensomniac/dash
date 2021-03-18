#!/usr/bin/python

import os
from Dash import LocalStorage

# A Collection is a type of managed data store for
# use cases that look like this:
#
# Top Level:
#
# 2021031815461365345
# 2021031815461375645
# 2021031815461434654
# 2021031815461654656
# ...
#
# Where each top level ID is a folder with a data.json
# default store, but can be optionally used of other
# types of data as well

class Collection:
    def __init__(self, store_path, dash_context=None):
        self.store_path = store_path
        self._dash_context = dash_context

    @property
    def Ctx(self):
        if not hasattr(self, "_ctx"):

            if self._dash_context:
                self._ctx = self._dash_context
            else:
                from Dash.Utils import Utils as DashUtils
                self._ctx = DashUtils.Global.Context

        return self._ctx

    @property
    def AssetPath(self):
        return self.Ctx["asset_path"]

    @property
    def All(self):

        data = LocalStorage.GetAll(
            self.Ctx,
            self.store_path
        )

        return data

    def New(self):

        new_obj = LocalStorage.New(
            self.Ctx,
            self.store_path
        )

        data = self.All
        data["new_object"] = new_obj["id"]

        return data








