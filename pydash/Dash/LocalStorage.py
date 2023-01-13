#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
Utility for reading, writing and maintaining common data.
"""

import os
import sys

from datetime import datetime
from Dash.Utils import Memory, GetRandomID


class DashLocalStorage:
    def __init__(self, dash_context=None, store_path="", nested=False, sort_by_key="", filter_out_keys=[]):
        """
        Utility for reading, writing and maintaining common data.

        :param dash_context: Dash Context (default=None)
        :param str store_path: Name of the folder located in /local/, such as users, packages, jobs, etc. (default="")
        :param bool nested: If True, core record is considered data.json in a directory named after the ID (default=False)
        :param str sort_by_key: dict key to sort the ordered data by (default="")
        :param list filter_out_keys: dict keys to filter out of each final data object (default=[])
        """

        self.nested = nested

        # This attr name is confusing, and should be named local_folder_name, or something
        # like that, but leaving it alone to not break anything in other code bases
        self.store_path = store_path

        self.sort_by_key = sort_by_key
        self.filter_out_keys = filter_out_keys
        self.dash_context = dash_context

    def CreateOrUpdate(self, additional_data, obj_id):
        record_path = self.GetRecordPath(obj_id)

        if not os.path.exists(record_path):
            return self.New(additional_data, obj_id)

        # Get existing data and modify
        data = self.GetData(obj_id, record_path=record_path)

        try:
            for key in additional_data:
                data[key] = additional_data[key]
        except:
            raise Exception("--> " + str(type(data)) + "<--")

        data["modified_by"] = Memory.Global.RequestUser["email"]
        data["modified_on"] = datetime.now().isoformat()

        self.WriteData(obj_id, data)

        return data

    def New(self, additional_data, obj_id=None, conform_permissions=True):
        """
        Creates and saves a standard user record
        """

        record_id = obj_id or GetRandomID()

        data = self.get_default_data(record_id)

        if additional_data:
            for key in additional_data:
                if key in data:
                    continue

                data[key] = additional_data[key]

        root = self.get_data_root(record_id)

        if not os.path.exists(root):
            os.makedirs(root)

            # Previously, if root called this, the file itself was being
            # conformed in Write, but not the parent folder it was nested in
            if self.nested and conform_permissions:
                self.ConformPermissions(root)

        self.Write(self.GetRecordPath(record_id), data, conform_permissions)

        return data

    def Duplicate(self, id_to_duplicate, include_display_name=True, display_name_tag="Copy"):
        if self.nested:
            from shutil import copytree

            new_id = GetRandomID()

            copytree(self.get_data_root(id_to_duplicate), self.get_data_root(new_id))

            new_data = self.GetData(new_id)

            new_data.update(self.get_default_data(new_id))
        else:
            new_data = self.New(self.GetData(id_to_duplicate))
            new_id = new_data["id"]

        new_data["_duplicated_from"] = id_to_duplicate

        if new_data.get("display_name"):
            if not include_display_name:
                new_data["display_name"] = new_id

            elif display_name_tag:
                new_data["display_name"] = f"{new_data['display_name']} ({display_name_tag})"

        self.Write(self.GetRecordPath(new_id), new_data)

        if not self.nested:
            return new_data

        self.recursively_replace_id_in_root(self.get_data_root(new_id), id_to_duplicate, new_id)

        return new_data

    def GetAllIDs(self):
        all_ids = []
        store_root = self.GetRecordRoot()

        if not os.path.exists(store_root):
            return all_ids

        for obj_id in os.listdir(store_root):
            if str(obj_id).startswith("."):
                continue

            all_ids.append(obj_id)

        return all_ids

    def GetAll(self, extensionless=False, filter_params={}):
        """
        Returns a dictionary containing ID > Data pairs.
        """

        all_data = {
            "data": {},
            "order": []
        }

        store_root = self.GetRecordRoot()

        if not os.path.exists(store_root):
            return all_data

        for obj_id in os.listdir(store_root):
            if str(obj_id).startswith("."):
                continue

            try:
                data = self.GetData(obj_id)

            # In this context, if there's a failure, it can break an entire portal, so if a folder exists but
            # is simply missing its data.json, we can safely skip it and send a warning email instead of failing
            except Exception as e:
                if "does not exist" in str(e):
                    if not obj_id.startswith("_"):
                        from Dash.Utils import SendEmail

                        SendEmail(
                            subject="Dash.LocalStorage.GetAll",
                            msg=(
                                f"Warning:\nA folder was identified as missing its data.json file. This typically happens "
                                "if an object failed to be fully deleted, and therefore, this folder likely needs to be removed."
                            ),
                            error=str(e)
                        )

                    continue
                else:
                    raise Exception(str(e))

            if not data:
                continue

            if extensionless and obj_id.count(".") == 1:
                obj_id = obj_id.split(".")[0]

            exclude = False

            if filter_params:
                for key, val in filter_params.items():
                    if data.get(key) != val:
                        exclude = True
                        
                        break

            if not exclude:
                all_data["data"][obj_id] = data

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

    def GetData(self, obj_id, create=False, additional_data={}, record_path=""):
        if not record_path:
            record_path = self.GetRecordPath(obj_id)

        if not record_path:
            return {}

        if not os.path.exists(record_path):
            if create:
                return self.New(additional_data, obj_id=obj_id)
            else:
                raise Exception(f"Expected record does not exist x9483. Expected: {record_path} (obj_id: {obj_id})\n\nParams:\n{Memory.Global.RequestData or {}}")

        data = self.Read(record_path)

        return self.filter_data_entry(data)

    def SetProperties(self, obj_id, properties, create=False):
        obj_id = obj_id or Memory.Global.RequestData["obj_id"]

        if not obj_id:
            raise Exception("Missing 'obj_id' error x8932")

        data = self.GetData(obj_id, create=create)
        data["modified_by"] = Memory.Global.RequestUser["email"]
        data["modified_on"] = datetime.now().isoformat()

        for key in properties:
            data[key] = properties[key]

        self.WriteData(obj_id, data)

        return data

    def SetProperty(self, obj_id, key=None, value=None, create=False):
        obj_id = obj_id or Memory.Global.RequestData["obj_id"]
        key = key or Memory.Global.RequestData["key"]
        # value = value or Memory.Global.RequestData.get("value")  # This was breaking certain cases

        if value is None and "value" in Memory.Global.RequestData:
            value = Memory.Global.RequestData["value"]

        if not obj_id:
            raise Exception("Missing 'obj_id' error x8932")

        data = self.GetData(obj_id, create=create)

        response = {
            "key": key,
            "value": value,
            "obj_id": obj_id,
            "previous_value": data.get(key),
            "record_path": self.GetRecordPath(obj_id)
        }

        data.update({
            key: value,
            "modified_by": Memory.Global.RequestUser["email"],
            "modified_on": datetime.now().isoformat()
        })

        self.WriteData(obj_id, data)

        response["updated_data"] = data

        return response

    def Delete(self, obj_id):
        from time import sleep
        from shutil import rmtree

        if self.nested:
            record_path = self.get_data_root(obj_id)
        else:
            record_path = self.GetRecordPath(obj_id)

        result = {
            "existed": os.path.exists(record_path),
            "record_path": record_path
        }

        error = ""
        attempts = 0

        while attempts < 5:
            attempts += 1

            try:
                if not os.path.exists(record_path):
                    break

                if self.nested:
                    rmtree(record_path)
                else:
                    os.remove(record_path)

            except Exception as e:
                error = e

                sleep(0.2)

        if os.path.exists(record_path):
            raise Exception(f"Failed to delete: {record_path}, error: {error}, ({attempts} attempts)")

        result["exists_now"] = False

        return result

    def WriteData(self, obj_id, data):
        self.Write(self.GetRecordPath(obj_id), data)

        return data

    def Write(self, full_path, data, conform_permissions=True):
        if type(data) is bytes or type(data) is memoryview:
            return self.write_binary(full_path, data, conform_permissions)

        return self.write_json_protected(full_path, data, conform_permissions)

    def Read(self, full_path, is_json=True):
        if not os.path.exists(full_path):
            return None

        from json import loads
        from time import sleep

        error = ""
        data = None
        attempts = 0

        while attempts < 3:
            attempts += 1

            try:
                data = open(full_path, "r").read()

                if is_json:
                    data = loads(data)

                if data:
                    return data

            except Exception as e:
                error = e

                sleep(0.2)

        if attempts >= 3 and data is None:
            raise Exception(f"Failed to read: {full_path}, error: {error}, ({attempts} attempts)")

        return data

    def GetPrivKey(self, filename, subfolders=[], is_json=True):
        """
        Get a private key from /var/priv/
        """

        if subfolders:
            if type(subfolders) is not list:
                raise Exception("Subfolders param must be a list")

            priv_index = 1

            if subfolders[0] in self.get_folder_possibilities("var"):
                subfolders.pop(0)

                priv_index = 0

            if len(subfolders) > priv_index and subfolders[priv_index] in self.get_folder_possibilities("priv"):
                subfolders.pop(priv_index)

        key = self.Read(os.path.join("/var", "priv", *subfolders, filename), is_json=is_json)

        if type(key) is str:
            key = key.strip().strip("\n").strip()

        return key

    def ConvertToNested(self):
        from shutil import move

        ids = self.GetAllIDs()
        converted_ids = []

        for flat_id in ids:
            flat_path = self.GetRecordPath(flat_id)

            if os.path.isdir(flat_path):
                continue

            flat_path_renamed = flat_path.replace(flat_id, "data.json")

            os.rename(flat_path, flat_path_renamed)

            os.makedirs(flat_path)

            move(flat_path_renamed, os.path.join(flat_path, "data.json"))

            converted_ids.append(flat_id)

        return converted_ids

    def GetRecordPath(self, obj_id):
        obj_id = str(obj_id)  # IDs usually consist purely of numbers, so this is an extra safeguard

        if self.store_path == "users":
            return os.path.join(
                self.GetRecordRoot(obj_id),
                "usr.data"
            )
        else:
            if self.nested:
                obj_id_root = os.path.join(
                    self.GetRecordRoot(obj_id),
                    obj_id
                )

                if not os.path.isdir(obj_id_root):
                    return ""

                return os.path.join(
                    obj_id_root,
                    "data.json"
                )
            else:
                return os.path.join(
                    self.GetRecordRoot(obj_id),
                    obj_id
                )

    def GetRecordRoot(self, obj_id=""):
        """
        | Example: /var/www/vhosts/oapi.co/dash/local/users/ryan@ensomniac.com/
        | Where 'users' is store_path and 'ryan@ensomniac.com' is obj_id
        """

        if self.store_path == "users":
            if not obj_id:
                from Dash.Utils import Memory

                params = Memory.Global.RequestData
                obj_id = params.get("email")

            if not obj_id:
                raise Exception("An email address is required. Error x8392")

            store_root = os.path.join(
                self.dash_context["srv_path_local"],
                self.store_path,
                obj_id + "/",  # Email address
            )
        else:
            store_root = os.path.join(
                self.dash_context["srv_path_local"],
                self.store_path + "/"
            )

        return store_root

    def GetRecordCount(self):
        store_root = self.GetRecordRoot()

        if os.path.exists(store_root):
            return len(os.listdir(store_root))
        else:
            return 0

    def ConformPermissions(self, full_path):
        try:
            os.chown(full_path, 10000, 1004)  # chmod 755, chown ensomniac, chgrp psacln

        except FileNotFoundError:
            pass

        except PermissionError:  # Permission error when trying to fix permissions... smfh
            from subprocess import check_output

            check_output(f"sudo chmod 755 {full_path}; sudo chown ensomniac {full_path}; sudo chgrp psacln {full_path}", shell=True)

    def get_folder_possibilities(self, name):
        return [name, f"/{name}", f"{name}/", f"/{name}/"]

    def filter_data_entry(self, data):
        if not self.filter_out_keys:
            return data

        filtered_data = {}

        for key in data:
            if key in self.filter_out_keys:
                continue

            filtered_data[key] = data[key]

        return filtered_data

    def get_dict_order_by_sort_key(self, all_data):
        order = []
        unsortable = []
        keys_to_sort = []
        sorted_to_prepend = []
        restructured_data = {}

        for entry_id in all_data:
            entry_data = all_data[entry_id]

            if not entry_data.get(self.sort_by_key):
                unsortable.append(entry_id)

                continue

            sort_value = entry_data[self.sort_by_key]

            if type(sort_value) is str:
                sort_value = sort_value.lower().strip()

            if not restructured_data.get(sort_value):
                restructured_data[sort_value] = entry_data
            else:
                restructured_data[f"{sort_value}_{entry_id}"] = entry_data

        for item in restructured_data:
            keys_to_sort.append(item)

        og_keys_to_sort = keys_to_sort.copy()

        # Check if all keys are ints, so we can sort accordingly
        for index, key in enumerate(keys_to_sort):
            try:
                if len(key) > 1 and key.startswith("0") and key.endswith("0"):
                    sorted_to_prepend.append(key)

                keys_to_sort[index] = int(key)
            except:
                sorted_to_prepend = []
                keys_to_sort = og_keys_to_sort.copy()

                break

        if keys_to_sort != og_keys_to_sort:
            keys_to_sort.sort()

            keys_to_sort = [str(k) for k in keys_to_sort]
        else:
            keys_to_sort.sort()

        # This for loop adds unsortable items to the front of the object
        # Move this after the next for loop to add them to the end of the object instead
        for unsorted_id in unsortable:
            order.append(unsorted_id)

        for sort_value in keys_to_sort:
            order.append(restructured_data[sort_value]["id"])

        if len(sorted_to_prepend):
            sorted_to_prepend.sort()

            for prepend_key in sorted_to_prepend:
                order.insert(0, restructured_data[prepend_key]["id"])

        return order

    def get_data_root(self, obj_id):
        """
        Nearly identical to self.get_store_root, but returns slightly
        different paths depending on whether the record is nested
        """

        if self.nested:
            return os.path.join(self.GetRecordRoot(obj_id), obj_id + "/")  # /local/store_path/
        else:
            return self.GetRecordRoot()  # /local/store_path/

    def write_binary(self, full_path, data, conform_permissions=True):
        open(full_path, "wb").write(data)

        if conform_permissions:
            self.ConformPermissions(full_path)

        return data

    def write_json_unprotected(self, full_path, data, conform_permissions=True):
        from json import dumps

        open(full_path, "w").write(dumps(data))

        if conform_permissions:
            self.ConformPermissions(full_path)

        return data

    def write_json_protected(self, full_path, data, conform_permissions=True):
        """
        This is a newer system that first writes a unique filename to
        disk, then moves that file into the correct location. This should resolve
        clobbered .json files, but it will not prevent in-memory merge failures.
        """

        from json import dumps
        from random import randint

        filename = full_path.split("/")[-1].strip()

        tmp_file_path = os.path.join(
            full_path.rstrip(filename),
            f"_tmp_{randint(100000, 999999)}_{filename}"
        )

        try:
            open(tmp_file_path, "w").write(dumps(data))

        except Exception as e:
            raise Exception(f"Write fail at {tmp_file_path} from {full_path}\n\nException: {e}")

        os.rename(tmp_file_path, full_path)

        if conform_permissions:
            self.ConformPermissions(full_path)

        return data

    def get_default_data(self, record_id):
        return {
            "id": record_id,
            "created_by": Memory.Global.RequestUser["email"],
            "created_on": datetime.now().isoformat(),
            "modified_by": Memory.Global.RequestUser["email"],
            "modified_on": datetime.now().isoformat()
        }

    def recursively_replace_id_in_root(self, root, old_id, new_id):
        if not os.path.exists(root):
            return

        for filename in os.listdir(root):
            path = os.path.join(root, filename)

            if filename.endswith(".json"):
                data, modified = self.recursively_replace_id_in_data(self.Read(path), old_id, new_id)

                if modified:
                    self.Write(path, data)

            elif os.path.isdir(path):
                self.recursively_replace_id_in_root(path, old_id, new_id)

            if old_id in filename:
                os.rename(path, os.path.join(root, filename.replace(old_id, new_id)))

    def recursively_replace_id_in_data(self, data, old_id, new_id):
        modified = False

        if not data:
            return data, modified

        key_changes = []

        for key in data:
            if key == "_duplicated_from":
                continue

            if old_id in key:
                key_changes.append(key)

            value = data.get(key)

            if not value or type(value) is not str or old_id not in value:
                continue

            data[key] = value.replace(old_id, new_id)

            modified = True

        for key in key_changes:
            data[key.replace(old_id, new_id)] = data.pop(key)

            modified = True

        return data, modified


def New(dash_context, store_path, additional_data={}, obj_id=None, nested=False, conform_permissions=True):
    return DashLocalStorage(dash_context, store_path, nested).New(additional_data, obj_id, conform_permissions)


def Duplicate(dash_context, store_path, id_to_duplicate, include_display_name=True, display_name_tag="Copy", nested=False):
    return DashLocalStorage(dash_context, store_path, nested).Duplicate(id_to_duplicate, include_display_name, display_name_tag)


def CreateOrUpdate(dash_context, store_path, additional_data, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).CreateOrUpdate(additional_data, obj_id)


def SetData(dash_context, store_path, obj_id, data, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).WriteData(obj_id, data)


def Delete(dash_context, store_path, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).Delete(obj_id)


def GetData(dash_context, store_path, obj_id, nested=False, filter_out_keys=[]):
    return DashLocalStorage(dash_context, store_path, nested, filter_out_keys=filter_out_keys).GetData(obj_id)


def GetAll(dash_context, store_path, nested=False, sort_by_key="", filter_out_keys=[], extensionless=False, filter_params={}):
    return DashLocalStorage(dash_context, store_path, nested, sort_by_key, filter_out_keys).GetAll(extensionless, filter_params=filter_params)


def GetAllIDs(dash_context, store_path, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).GetAllIDs()


def SetProperty(dash_context, store_path, obj_id, key=None, value=None, create=False, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).SetProperty(obj_id, key=key, value=value, create=create)


def SetProperties(dash_context, store_path, obj_id, properties={}, create=False, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).SetProperties(obj_id, properties, create=create)


def GetRecordCount(dash_context, store_path, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).GetRecordCount()


def GetRecordRoot(dash_context, store_path, obj_id=None, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).GetRecordRoot(obj_id)


def GetRecordPath(dash_context, store_path, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).GetRecordPath(obj_id)


def Read(full_path, is_json=True):
    return DashLocalStorage().Read(full_path, is_json=is_json)


def Write(full_path, data, conform_permissions=True):
    return DashLocalStorage().Write(full_path, data, conform_permissions)


def GetPrivKey(filename, subfolders=[], is_json=True):
    return DashLocalStorage().GetPrivKey(filename, subfolders, is_json)


def ConformPermissions(full_path):
    return DashLocalStorage().ConformPermissions(full_path)


def ConvertToNested(dash_context, store_path):
    return DashLocalStorage(dash_context, store_path).ConvertToNested()
