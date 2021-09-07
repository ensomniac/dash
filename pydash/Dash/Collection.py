#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| A Collection is a type of managed data store for use cases that look like this:
|
| Top Level:
|
| 2021031815461365345
| 2021031815461375645
| 2021031815461434654
| 2021031815461654656
| ...
|
| Where each top level ID is a folder with a data.json default
  store, but can be optionally used of other types of data as well
|
| If nested == True, the collection will include a data.json file
  at the top level of a folder named with the ID of the collection item
"""

import os
import sys

from shutil import rmtree
from Dash import LocalStorage


class Collection:
    _ctx: dict

    def __init__(self, store_path, nested=False, dash_context=None, sort_by_key=""):
        self.nested = nested
        self.store_path = store_path
        self._sort_by_key = sort_by_key
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
    def Root(self):
        return LocalStorage.GetRecordRoot(
            self.Ctx,
            self.store_path,
            nested=self.nested,
        )

    @property
    def sort_by_key(self):
        return self._sort_by_key

    def SetSortByKey(self, key):
        self._sort_by_key = key

    def All(self):
        return LocalStorage.GetAll(
            self.Ctx,
            self.store_path,
            nested=self.nested,
            sort_by_key=self._sort_by_key
        )

    def AllIDs(self):
        return LocalStorage.GetAllIDs(
            self.Ctx,
            self.store_path,
            nested=self.nested
        )

    def Overview(self, filter_out_keys, sort_by_key=""):
        return LocalStorage.GetAll(
            self.Ctx,
            self.store_path,
            nested=self.nested,
            sort_by_key=(sort_by_key or self._sort_by_key),
            filter_out_keys=filter_out_keys
        )

    def Get(self, obj_id, filter_out_keys=[]):
        return LocalStorage.GetData(
            self.Ctx,
            self.store_path,
            obj_id,
            nested=self.nested,
            filter_out_keys=filter_out_keys
        )

    def New(self, additional_data={}, return_all_data=True):
        new_obj = LocalStorage.New(
            self.Ctx,
            self.store_path,
            additional_data=additional_data,
            nested=self.nested,
        )

        if return_all_data:
            data = self.All()
            data["new_object"] = new_obj["id"]

            return data

        else:
            return new_obj

    def Delete(self, obj_id, return_all_data=True):
        LocalStorage.Delete(
            self.Ctx,
            self.store_path,
            obj_id=obj_id,
            nested=self.nested,
        )

        if return_all_data:
            return self.All()

    def SetProperty(self, obj_id, key, value, return_all_data=True):
        updated_data = LocalStorage.SetProperty(
            self.Ctx,
            self.store_path,
            obj_id,
            key,
            value,
            nested=self.nested,
        )["updated_data"]

        if return_all_data:
            return self.All()
        else:
            return updated_data

    def SetProperties(self, obj_id, properties, return_all_data=True):
        updated_data = LocalStorage.SetProperties(
            self.Ctx,
            self.store_path,
            obj_id,
            properties,
            nested=self.nested,
        )

        if return_all_data:
            return self.All()
        else:
            return updated_data

    def Clear(self):
        rmtree(self.Root, True)
