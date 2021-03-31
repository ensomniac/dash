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
#
# If nested == True, the collection will include a data.json file
# at the top level of a folder named with the ID of the collection item

class Collection:
    def __init__(self, store_path, nested=False, dash_context=None):
        self.store_path = store_path
        self.nested = nested
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
            self.store_path,
            nested=self.nested,
        )

        return data

    def New(self, additional_data={}):

        new_obj = LocalStorage.New(
            self.Ctx,
            self.store_path,
            additional_data=additional_data,
            nested=self.nested,
        )

        data = self.All
        data["new_object"] = new_obj["id"]

        return data

    def Delete(self, obj_id):

        new_obj = LocalStorage.Delete(
            self.Ctx,
            self.store_path,
            obj_id=obj_id,
            nested=self.nested,
        )

        data = self.All

        return data

    def SetProperty(self, obj_id, key, value):

        result = LocalStorage.SetProperty(
            self.Ctx,
            self.store_path,
            obj_id,
            key,
            value,
            nested=self.nested,
        )

        return self.All

    def Clear(self):

        root = LocalStorage.GetRecordRoot(
            self.Ctx,
            self.store_path,
            nested=self.nested,
        )

        import shutil
        shutil.rmtree(root, True)

