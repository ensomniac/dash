#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

"""
Utility for reading, writing and maintaining common data
"""

import os
import sys

from Dash.Utils import Utils
from datetime import datetime


class DashLocalStorage:
    def __init__(self, dash_context, store_path, nested, sort_by_key="", filter_out_keys=[]):
        """
        Utility for reading, writing and maintaining common data

        :param dash_context: Dash Context
        :param str store_path: users, packages, jobs, etc
        :param bool nested: If True, core record is considered data.json in a directory named after the ID
        :param str sort_by_key: dict key to sort the ordered data by
        :param list filter_out_keys: dict keys to filter out of each final data object
        """

        self.nested = nested
        self.store_path = store_path
        self.sort_by_key = sort_by_key
        self.filter_out_keys = filter_out_keys
        self.dash_context = dash_context

    def CreateOrUpdate(self, additional_data, obj_id):
        record_path = self.get_record_path(obj_id)

        if not os.path.exists(record_path):
            return self.New(additional_data, obj_id)

        # Get existing data and modify
        data = self.GetData(obj_id)

        try:
            for key in additional_data:
                data[key] = additional_data[key]
        except:
            raise Exception("--> " + str(type(data)) + "<--")

        data["modified_by"] = Utils.Global.RequestUser["email"]
        data["modified_on"] = datetime.now().isoformat()

        self.WriteData(obj_id, data)

        return data

    def New(self, additional_data, obj_id=None):
        """
        Creates and saves a standard user record
        """

        record_id = obj_id or Utils.GetRandomID()

        data = {}
        data["id"] = record_id
        data["created_by"] = Utils.Global.RequestUser["email"]
        data["created_on"] = datetime.now().isoformat()
        data["modified_by"] = Utils.Global.RequestUser["email"]
        data["modified_on"] = datetime.now().isoformat()

        if additional_data:
            for key in additional_data:
                data[key] = additional_data[key]

        if not os.path.exists(self.get_data_root(record_id)):
            os.makedirs(self.get_data_root(record_id))

        self.Write(self.get_record_path(record_id), data)

        return data

    def GetAll(self):
        """
        Returns a dictionary containing ID > Data pairs
        """

        all_data = {}
        all_data["data"] = {}
        all_data["order"] = []

        if not os.path.exists(self.get_store_root()):
            return all_data

        for obj_id in os.listdir(self.get_store_root()):
            if obj_id.startswith("."):
                continue

            all_data["data"][obj_id] = self.GetData(obj_id)

        if self.sort_by_key:
            all_data["order"] = self.get_dict_order_by_sort_key(all_data["data"])
        else:
            all_data["order"] = list(all_data["data"].keys())
            all_data["order"].sort()
            all_data["order"].reverse()

        if self.filter_out_keys:
            for entry_id in all_data["data"]:
                all_data["data"][entry_id] = self.filter_data_entry(all_data["data"][entry_id])

        return all_data

    def GetData(self, obj_id, create=False, additional_data={}):
        record_path = self.get_record_path(obj_id)

        if not os.path.exists(record_path):
            if create:
                return self.New(additional_data, obj_id=obj_id)
            else:
                raise Exception("Expected record does not exist. x9483 Expected " + record_path + " / " + obj_id)

        data = self.Read(record_path)

        return data

    def filter_data_entry(self, data):
        filtered_data = {}

        for key in data:
            if key in self.filter_out_keys:
                continue

            filtered_data[key] = data[key]

        return filtered_data

    def get_dict_order_by_sort_key(self, all_data):
        order = []
        keys_to_sort = []
        restructured_data = {}
        unsortable = []

        for entry_id in all_data:
            entry_data = all_data[entry_id]

            if not entry_data.get(self.sort_by_key):
                unsortable.append(entry_id)
                continue

            sorted_key = entry_data[self.sort_by_key]

            if not restructured_data.get(self.sort_by_key):
                restructured_data[sorted_key] = entry_data
            else:
                restructured_data[f"{sorted_key}_{entry_id}"] = entry_data

        for item in restructured_data:
            keys_to_sort.append(item)

        keys_to_sort.sort()

        # This for loop adds unsortable items to the front of the object
        # Move this after the next for loop to add them to the end of the object instead
        for unsorted_id in unsortable:
            order.append(unsorted_id)

        for sorted_key in keys_to_sort:
            order.append(restructured_data[sorted_key]["id"])

        return order

    def get_data_root(self, obj_id_email):
        """
        Nearly identical to self.get_store_root, but returns slightly
        different paths depending on whether or not the record is nested
        """

        if not self.nested:
            # /local/store_path/202283291732434 <- This is the data
            return self.get_store_root()
        else:
            # /local/store_path/202283291732434/data.json <- This is the data
            return os.path.join(self.get_store_root(obj_id_email), obj_id_email + "/")

    def get_store_root(self, obj_id_email=None):
        """
        | Example: /var/www/vhosts/oapi.co/dash/local/users/ryan@ensomniac.com/
        | Where 'users' is store_path and 'ryan@ensomniac.com' is obj_id_email
        """

        if self.store_path == "users":
            store_root = os.path.join(
                self.dash_context["srv_path_local"],
                self.store_path,
                obj_id_email + "/",  # Email address
            )
        else:
            store_root = os.path.join(
                self.dash_context["srv_path_local"],
                self.store_path + "/"
            )

        return store_root

    def get_record_count(self):
        store_root = self.get_store_root()

        if os.path.exists(store_root):
            return len(os.listdir(store_root))
        else:
            return 0

    def get_record_path(self, obj_id):
        if self.store_path == "users":
            record_path = os.path.join(
                self.get_store_root(obj_id),
                "usr.data"
            )
        else:
            if self.nested:
                record_path = os.path.join(
                    self.get_store_root(obj_id),
                    obj_id,
                    "data.json"
                )
            else:
                record_path = os.path.join(
                    self.get_store_root(obj_id),
                    obj_id
                )

        return record_path

    def SetProperty(self, obj_id, key=None, value=None, create=False):
        obj_id = obj_id or Utils.Global.RequestData["obj_id"]
        key = key or Utils.Global.RequestData["key"]
        value = value or Utils.Global.RequestData.get("value")

        if not obj_id:
            raise Exception("Missing 'obj_id' error x8932")

        response = {}
        response["key"] = key
        response["value"] = value
        response["obj_id"] = obj_id
        response["record_path"] = self.get_record_path(obj_id)

        data = self.GetData(obj_id, create=create)
        data[key] = value
        data["modified_by"] = Utils.Global.RequestUser["email"]
        data["modified_on"] = datetime.now().isoformat()

        self.WriteData(obj_id, data)

        response["updated_data"] = data

        return response

    def Delete(self, obj_id):
        if self.nested:
            record_path = self.get_data_root(obj_id)
        else:
            record_path = self.get_record_path(obj_id)

        result = {}
        result["existed"] = os.path.exists(record_path)
        result["record_path"] = record_path

        if result["existed"]:
            if self.nested:
                from shutil import rmtree

                rmtree(record_path, True)
            else:
                os.remove(record_path)

        result["exists_now"] = os.path.exists(record_path)

        return result

    def WriteData(self, obj_id, data):
        self.Write(self.get_record_path(obj_id), data)

        return data

    def Write(self, full_path, data):
        # if "local/performance/ryan" in full_path:
        #     self.write_protected(full_path, data)
        # else:
        #     self.write_unprotected(full_path, data)

        # Andrew - I'm leaving this code somewhat messy / or at least
        # leaving some old bits around since today is Warpsound day
        # and I want to make sure I can quickly revert this change in the
        # case that it starts causing problems instead of solving them

        return self.write_protected(full_path, data)

    def Read(self, full_path):
        from json import loads
        import time

        attempts = 0
        data = None

        while attempts < 3:
            attempts += 1

            try:
                data = loads(open(full_path, "r").read())
            except:
                time.sleep(0.2)

        if attempts >=3 and data == None:
            raise Exception("Failed to read: " + full_path + " (" + str(attempts) + " attempts)")

        return data

    def write_unprotected(self, full_path, data):
        from json import dumps

        open(full_path, "w").write(dumps(data))

        return data

    def write_protected(self, full_path, data):
        # Andrew, this is a newer system that first writes a unique filename to
        # disk, then moves that file into the correct location. This should resolve
        # clobbered .json files, but it will not prevent in-memory merge failures

        from json import dumps
        import random

        filename = full_path.split("/")[-1].strip()
        directory = full_path.rstrip(filename) + "/"

        tmp_filename = directory + "_tmp_" + str(random.randint(100000, 999999))
        tmp_filename += "_" + filename

        open(tmp_filename, "w").write(dumps(data))
        os.rename(tmp_filename, full_path)
        os.chown(full_path, 10000, 1004)

        return data

def New(dash_context, store_path, additional_data={}, obj_id=None, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).New(additional_data, obj_id=obj_id)


def CreateOrUpdate(dash_context, store_path, additional_data, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).CreateOrUpdate(additional_data, obj_id)


def SetData(dash_context, store_path, obj_id, data, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).WriteData(obj_id, data)


def Delete(dash_context, store_path, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).Delete(obj_id)


def GetData(dash_context, store_path, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).GetData(obj_id)


def GetAll(dash_context, store_path, nested=False, sort_by_key="", filter_out_keys=[]):
    return DashLocalStorage(dash_context, store_path, nested, sort_by_key, filter_out_keys).GetAll()


def SetProperty(dash_context, store_path, obj_id, key=None, value=None, create=False, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).SetProperty(obj_id, key=key, value=value, create=create)


def GetRecordCount(dash_context, store_path, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).get_record_count()


def GetRecordRoot(dash_context, store_path, obj_id=None, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).get_store_root(obj_id)


def GetRecordPath(dash_context, store_path, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).get_record_path(obj_id)


def Read(full_path):
    return DashLocalStorage(None, None, None).Read(full_path)


def Write(full_path, data):
    return DashLocalStorage(None, None, None).Write(full_path, data)
