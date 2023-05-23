#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
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
    _all: dict
    _root: dict
    _all_ids: list

    def __init__(self, store_path, nested=False, dash_context=None, sort_by_key="", default_data_to_assert_on_get={}):
        self.store_path = store_path
        self.nested = nested
        self._dash_context = dash_context
        self._sort_by_key = sort_by_key
        self.default_data_to_assert_on_get = default_data_to_assert_on_get

    @property
    def DashContext(self):
        if not self._dash_context:
            from Dash.Utils import Memory

            self._dash_context = Memory.Global.Context

        return self._dash_context

    @property
    def AssetPath(self):
        return self.DashContext["asset_path"]

    @property
    def Root(self):
        if not hasattr(self, "_root"):
            self._root = LocalStorage.GetRecordRoot(
                self.DashContext,
                self.store_path,
                nested=self.nested,
            )

        return self._root

    @property
    def All(self):
        if not hasattr(self, "_all"):
            self.GetAll()

        return self._all

    @property
    def AllIDs(self):
        if not hasattr(self, "_all_ids"):
            self._all_ids = self.GetAllIDs()

        return self._all_ids

    # Deprecated in favor of DashContext
    @property
    def Ctx(self):
        return self.DashContext

    @property
    def sort_by_key(self):
        return self._sort_by_key

    def SetSortByKey(self, key):
        self._sort_by_key = key

    def GetAll(self, filter_params={}):
        self._all = LocalStorage.GetAll(
            self.DashContext,
            self.store_path,
            nested=self.nested,
            sort_by_key=self._sort_by_key,
            filter_params=filter_params,
            default_data_to_assert=self.default_data_to_assert_on_get
        )

        return self._all

    def GetAllIDs(self):
        self._all_ids = LocalStorage.GetAllIDs(
            self.DashContext,
            self.store_path,
            nested=self.nested
        )

        return self._all_ids

    def GetOverview(self, filter_out_keys, sort_by_key=""):
        return LocalStorage.GetAll(
            self.DashContext,
            self.store_path,
            nested=self.nested,
            sort_by_key=(sort_by_key or self._sort_by_key),
            filter_out_keys=filter_out_keys,
            default_data_to_assert=self.default_data_to_assert_on_get
        )

    def Get(self, obj_id, filter_out_keys=[]):
        return LocalStorage.GetData(
            self.DashContext,
            self.store_path,
            obj_id,
            nested=self.nested,
            filter_out_keys=filter_out_keys
        )

    def New(self, additional_data={}, return_all_data=True, obj_id=""):
        return self.handle_new_data(
            LocalStorage.New(
                self.DashContext,
                self.store_path,
                additional_data=additional_data,
                nested=self.nested,
                obj_id=obj_id
            ),
            return_all_data
        )

    def Duplicate(self, id_to_duplicate, include_display_name=True, display_name_tag="Copy", return_all_data=True):
        return self.handle_new_data(
            LocalStorage.Duplicate(
                self.DashContext,
                self.store_path,
                id_to_duplicate,
                include_display_name,
                display_name_tag,
                nested=self.nested
            ),
            return_all_data
        )

    def Delete(self, obj_id, return_all_data=True):
        deleted = LocalStorage.Delete(
            self.DashContext,
            self.store_path,
            obj_id=obj_id,
            nested=self.nested
        )

        if return_all_data:
            return self.GetAll()

        return deleted

    def SetProperty(self, obj_id, key, value, return_all_data=True):
        updated_data = LocalStorage.SetProperty(
            self.DashContext,
            self.store_path,
            obj_id,
            key,
            value,
            nested=self.nested,
        )["updated_data"]

        if hasattr(self, "_all") and type(self._all) is dict and "data" in self._all:
            self._all["data"][obj_id] = updated_data

        if return_all_data:
            return self.GetAll()

        return updated_data

    def SetProperties(self, obj_id, properties, return_all_data=True):
        updated_data = LocalStorage.SetProperties(
            self.DashContext,
            self.store_path,
            obj_id,
            properties,
            nested=self.nested,
        )

        if hasattr(self, "_all") and type(self._all) is dict and "data" in self._all:
            self._all["data"][obj_id] = updated_data

        if return_all_data:
            return self.GetAll()

        return updated_data

    def Clear(self, contents_only=False):
        if not contents_only:
            rmtree(self.Root, True)

            return

        for filename in os.listdir(self.Root):
            path = os.path.join(self.Root, filename)

            if self.nested:
                rmtree(path)
            else:
                os.remove(path)

    def handle_new_data(self, new_data, return_all_data=True):
        if hasattr(self, "_all") and type(self._all) is dict:
            if "data" in self._all and not self._all["data"].get(new_data["id"]):
                self._all["data"][new_data["id"]] = new_data

            if "order" in self._all and new_data["id"] not in self._all["order"]:
                self._all["order"].append(new_data["id"])

        if hasattr(self, "_all_ids") and type(self._all_ids) is list and new_data["id"] not in self._all_ids:
            self._all_ids.append(new_data["id"])

        if return_all_data:
            data = self.GetAll()

            data["new_object"] = new_data["id"]

            return data

        return new_data
