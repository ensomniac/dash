#!/usr/bin/python
#
# Ensomniac 2026 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
Utility for reading, writing, and maintaining common data.
"""

import os
import sys

from contextlib import contextmanager
from threading import Lock, RLock


_JSON_READ_MODIFY_WRITE_LOCKS = {} 
_JSON_READ_MODIFY_WRITE_LOCKS_LOCK = Lock()


def _get_json_read_modify_write_lock(full_path):
    lock_key = os.path.abspath(full_path)

    with _JSON_READ_MODIFY_WRITE_LOCKS_LOCK:
        if lock_key not in _JSON_READ_MODIFY_WRITE_LOCKS:
            _JSON_READ_MODIFY_WRITE_LOCKS[lock_key] = RLock()

        return _JSON_READ_MODIFY_WRITE_LOCKS[lock_key]


def _get_json_read_modify_write_lock_path(full_path):
    full_path = os.path.abspath(full_path)

    return os.path.join(os.path.dirname(full_path), f".{os.path.basename(full_path)}.lock")


@contextmanager
def _locked_json_file(full_path):
    """
    Serialize JSON writes and read-modify-write transactions for one file path.

    The in-process RLock keeps threads in this interpreter ordered, while `flock` on a
    sibling hidden lock file coordinates with other processes. Callers should hold this
    only around short JSON file operations. Slow request, network, or scan work should be
    done before entering a ReadModifyWrite callback when possible.
    """

    import fcntl

    thread_lock = _get_json_read_modify_write_lock(full_path)
    lock_path = _get_json_read_modify_write_lock_path(full_path)

    with thread_lock:
        with open(lock_path, "a+") as lock_file:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)

            try:
                yield
            finally:
                fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


class DashLocalStorage:
    _user: dict
    _now: callable
    _memory: callable
    _request_data: dict

    def __init__(self, dash_context=None, store_path="", nested=False, sort_by_key="", filter_out_keys=[]):
        """
        Utility for reading, writing, and maintaining common data.

        :param dash_context: Dash Context (default=None)
        :param str store_path: Name of the folder located in /local/, such as
                               users, packages, jobs, etc. (default="")
        :param bool nested: If True, core record is considered data.json in a
                            directory named after the ID (default=False)
        :param str sort_by_key: dict key to sort the ordered data by (default="")
        :param list filter_out_keys: dict keys to filter out of each final data object (default=[])
        """

        self._dash_context = dash_context

        # This attr name is confusing, and should be named local_folder_name, or something
        # like that, but leaving it alone to not break anything in other code bases
        self.store_path = store_path

        self.nested = nested
        self.sort_by_key = sort_by_key
        self.filter_out_keys = filter_out_keys
        
    @property
    def RequestData(self):
        if not hasattr(self, "_request_data"):
            self._request_data = self.memory.RequestData
            
        return self._request_data

    @property
    def User(self):
        if not hasattr(self, "_user"):
            self._user = self.memory.User

        return self._user

    @property
    def DashContext(self):
        if not self._dash_context:
            self._dash_context = self.memory.DashContext

        return self._dash_context

    @property
    def now(self):
        if not hasattr(self, "_now"):
            from datetime import datetime

            self._now = datetime.now()

        return self._now

    @property
    def memory(self):
        if not hasattr(self, "_memory"):
            from Dash.Utils import Memory

            self._memory = Memory

        return self._memory

    def CreateOrUpdate(self, additional_data, obj_id):
        record_path = self.GetRecordPath(obj_id)

        if not os.path.exists(record_path):
            return self.New(additional_data, obj_id)

        # Get existing data and modify
        data = self.GetData(obj_id, record_path=record_path)

        try:
            for key in additional_data:
                data[key] = additional_data[key]

        except Exception as e:
            raise Exception(f"-->{type(data)}<--") from e

        data["modified_by"] = self.User["email"]
        data["modified_on"] = self.now.isoformat()

        self.WriteData(obj_id, data)

        return data

    def New(self, additional_data, obj_id=None, conform_permissions=True):
        """
        Creates and saves a standard user record.
        """

        if obj_id:
            record_id = obj_id
        else:
            from Dash.Utils import GetRandomID

            record_id = GetRandomID()

        data = self.get_default_data(record_id)

        if additional_data:
            if self.store_path == "users" and not obj_id and additional_data.get("email"):
                record_id = additional_data["email"].lower()

            data.update(additional_data)

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
            from Dash.Utils import GetRandomID

            new_id = GetRandomID()

            copytree(self.get_data_root(id_to_duplicate), self.get_data_root(new_id))

            new_data = self.GetData(new_id)
            default_data = self.get_default_data(new_id)

            for key in default_data:
                if key != "display_name":
                    new_data[key] = default_data[key]
        else:
            new_data = self.New(self.GetData(id_to_duplicate))
            new_id = new_data["id"]

        new_data["_duplicated_from"] = id_to_duplicate

        if new_data.get("display_name"):
            if not include_display_name:
                new_data["display_name"] = new_id

            elif display_name_tag:
                if new_data["display_name"].endswith(f"({display_name_tag})"):
                    new_data["display_name"] = new_data["display_name"].replace(
                        f"({display_name_tag})",
                        f"({display_name_tag} 1)"
                    )

                elif f"({display_name_tag}" in new_data["display_name"] and new_data["display_name"].endswith(")"):
                    split = new_data["display_name"].split(f"({display_name_tag}")
                    num = split[-1].split(")")[0].strip()

                    try:
                        new_data["display_name"] = f"{split[0]}({display_name_tag} {int(num) + 1})"

                    except ValueError:
                        new_data["display_name"] = f"{split[0]}({display_name_tag})"

                else:
                    new_data["display_name"] = f"{new_data['display_name']} ({display_name_tag})"

        self.Write(self.GetRecordPath(new_id), new_data)

        if not self.nested:
            return new_data

        self.RecursivelyReplaceIDInRoot(self.get_data_root(new_id), id_to_duplicate, new_id)

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

    def GetAll(self, extensionless=False, filter_params={}, default_data_to_assert={}):
        """
        Returns a dictionary containing ID > Data pairs.
        """

        all_data = {
            "data": {},
            "order": []
        }

        store_root = self.GetRecordRoot(from_get_all=True)

        if not os.path.exists(store_root):
            return all_data

        missing = []

        for obj_id in os.listdir(store_root):
            if str(obj_id).startswith(".") or str(obj_id).startswith("_"):
                continue

            record_path = self.GetRecordPath(obj_id)

            try:
                data = self.GetData(obj_id, record_path=record_path)

            # In this context, if there's a failure, it can break an entire portal, so if a folder exists but
            # is simply missing its data.json, we can safely skip it and send a warning email instead of failing
            except Exception as e:
                if "does not exist" in str(e):
                    if not obj_id.startswith("_") and not record_path.endswith("usr.data"):
                        missing.append(f"{obj_id}: {record_path}")

                    continue

                raise

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

        if missing:
            from Dash.Utils import SendEmail
            from traceback import format_stack

            msg = (
                "Warning:\nFolder(s) were identified as missing a data.json file. This typically happens if an "
                "object failed to be fully deleted, and therefore, this folder likely needs to be removed.\n"
                "Alternatively, a request to get the data may have happened at the same moment it was deleted."
                f"\n\nFolders:\n" + "\n- ".join(missing) +
                f"\n\nStack trace:\n" + "\n".join(format_stack())
            )

            sender_email = self.DashContext.get("admin_from_email") if self.DashContext else ""

            try:
                SendEmail(
                    subject="Dash.LocalStorage.GetAll",
                    msg=msg,
                    sender_email=sender_email,
                    sender_name=(
                        self.DashContext.get("code_copyright_text") or self.DashContext.get("display_name")
                    ) if self.DashContext else ""
                )

            except Exception as e:
                from traceback import format_exc

                raise Exception(
                    f"Failed to send error email.\nTried sender email: {sender_email}\n"
                    f"Message to send:\n{msg}\n\n---------\n\nException:\n{format_exc()}"
                ) from e

        if self.sort_by_key:
            all_data["order"] = self.get_dict_order_by_sort_key(all_data["data"])
        else:
            all_data["order"] = list(all_data["data"].keys())
            
            all_data["order"].sort()
            all_data["order"].reverse()

        if self.filter_out_keys:
            for entry_id in all_data["data"]:
                all_data["data"][entry_id] = self.filter_data_entry(all_data["data"][entry_id])

        if default_data_to_assert:
            for entry_id in all_data["data"]:
                for key in default_data_to_assert:
                    if key in all_data["data"][entry_id]:
                        continue

                    all_data["data"][entry_id][key] = default_data_to_assert[key]

        return all_data

    def GetData(self, obj_id, create=False, additional_data={}, record_path=""):
        if not record_path:
            record_path = self.GetRecordPath(obj_id)

        if not record_path:
            return {}

        if not os.path.exists(record_path):
            if create:
                return self.New(additional_data, obj_id=obj_id)

            raise FileNotFoundError(
                f"Expected record does not exist x9483. Expected: {record_path} "
                f"(obj_id: {obj_id})\n\nParams:\n{self.RequestData or {}}"
            )

        data = self.Read(record_path)

        return self.filter_data_entry(data)

    def SetProperties(self, obj_id, properties, create=False):
        obj_id = obj_id or self.RequestData["obj_id"]

        if not obj_id:
            raise Exception("Missing 'obj_id' error x8932")

        data = self.GetData(obj_id, create=create)
        data["modified_by"] = self.User["email"]
        data["modified_on"] = self.now.isoformat()

        for key in properties:
            data[key] = properties[key]

        self.WriteData(obj_id, data)

        return data

    def SetProperty(self, obj_id, key=None, value=None, create=False):
        obj_id = obj_id or self.RequestData["obj_id"]

        if not obj_id:
            raise Exception("Missing 'obj_id' error x8932")

        key = key or self.RequestData["key"]
        # value = value or self.RequestData.get("value")  # This was breaking certain cases

        if value is None and "value" in self.RequestData:
            value = self.RequestData["value"]

        data = self.GetData(obj_id, create=create)

        if self.store_path == "users" and value:
            if key in ["first_name", "last_name"]:
                value = value.strip()

        response = {
            "key": key,
            "value": value,
            "obj_id": obj_id,
            "previous_value": data.get(key),
            "record_path": self.GetRecordPath(obj_id)
        }

        data.update({
            key: value,
            "modified_by": self.User["email"],
            "modified_on": self.now.isoformat()
        })

        self.WriteData(obj_id, data)

        response["updated_data"] = self.update_user_monogram_on_set_property(data, key)

        return response

    def update_user_monogram_on_set_property(self, data, key):
        if (  # Confirm we're modifying a user's name and we have both parts
            self.store_path != "users"
            or key not in ["first_name", "last_name"]
            or not data.get("first_name")
            or not data.get("last_name")
        ):
            return data

        monogram_prefix = "_default_user_monogram_"

        # Confirm there's either no image yet, or the existing image is another auto-generated monogram
        if data.get("img") and not data["img"].get("orig_filename", "").startswith(monogram_prefix):
            return data

        first_initial = data["first_name"].strip()[0].lower()
        last_initial = data["last_name"].strip()[0].lower()

        if not first_initial or not last_initial:
            return data

        from Dash.Users import UploadUserImage
        from Dash.Utils import CreateMonogramImage

        cleaned_email = data.get("email", data["id"]).lower().strip().split(".")[-1]
        filename = f"{monogram_prefix}_{first_initial}{last_initial}_{cleaned_email}.png"

        return UploadUserImage(
            request_params={  # Spoof as a workaround to the request-only expectation of Dash.Users
                "user_data": data,
                "filename": filename,
                "file": CreateMonogramImage(
                    first_initial=first_initial,
                    last_initial=last_initial,
                    output_path=os.path.join(self.DashContext["srv_path_local"], "tmp", filename)
                )
            },
            dash_context=self.DashContext
        )

    def Delete(self, obj_id, archive_path=""):
        from time import sleep

        error = None
        attempts = 0
        record_path = self.get_data_root(obj_id) if self.nested else self.GetRecordPath(obj_id)

        result = {
            "existed": os.path.exists(record_path),
            "record_path": record_path
        }

        while attempts < 5:
            attempts += 1

            try:
                if not os.path.exists(record_path):
                    break

                if archive_path:
                    from shutil import move

                    move(record_path, archive_path)
                else:
                    if self.nested:
                        from shutil import rmtree

                        rmtree(record_path)
                    else:
                        os.remove(record_path)

            except Exception as e:
                error = e

                sleep(0.2)

        if os.path.exists(record_path):
            msg = f"Failed to delete: {record_path}, ({attempts} attempts)"

            if error:
                raise OSError(msg) from error

            raise Exception(msg)

        result["exists_now"] = False

        if archive_path:
            result["archive_path"] = archive_path

        return result

    def WriteData(self, obj_id, data):
        self.Write(self.GetRecordPath(obj_id), data)

        return data

    def ReadModifyWrite(self, full_path, modify, default_data=None, conform_permissions=True):
        """
        Lock a JSON file, read it, modify the decoded data, and protected-write the result.

        The 'modify' callable may return replacement data or mutate the provided data in place
        and return None.

        Use this instead of `Read` -> custom mutation logic -> `Write` when the new value depends
        on the latest saved JSON data. `UpdateData` is a convenience wrapper around this transaction
        helper, so use it for simple dictionary merges. Use `Write` for standalone full-file
        replacements where the caller already has the authoritative data and does not need to
        merge with the existing file contents.
        """

        if not full_path:
            raise ValueError(f"No path provided to LocalStorage.ReadModifyWrite: {full_path}")

        if not callable(modify):
            raise TypeError("LocalStorage.ReadModifyWrite requires a callable modify argument")

        from copy import deepcopy

        with _locked_json_file(full_path):
            data = self.Read(full_path)

            if data is None and default_data is not None:
                data = deepcopy(default_data)

            updated_data = modify(data)

            if updated_data is None:
                updated_data = data

            return self.write_json_protected(full_path, updated_data, conform_permissions)

    # Shortcut/wrapper for Read->Write for simple top-level dict updates
    def UpdateData(self, full_path, update_data, conform_permissions=True):
        """
        Lock a JSON file, merge update_data into the existing dictionary, and write it back.

        Use this for simple top-level dict updates. Use `ReadModifyWrite` when the change needs
        custom logic such as list append/removal, nested merges, deleting keys, or computing a
        value from the latest saved JSON.
        """

        def modify(data):
            if type(data) is not dict:
                raise ValueError(f"Data must be a dictionary, not {type(data).__name__}")

            data.update(update_data)  # Leave this here (returns None)

            return data

        return self.ReadModifyWrite(full_path, modify, conform_permissions=conform_permissions)

    def Write(self, full_path, data, conform_permissions=True):
        if not full_path:
            raise ValueError(f"No path provided to LocalStorage.Write: {full_path}")

        if type(data) is bytes or type(data) is memoryview:
            return self.write_binary(full_path, data, conform_permissions)

        with _locked_json_file(full_path):
            return self.write_json_protected(full_path, data, conform_permissions)

    def Read(self, full_path, is_json=True):
        if not full_path:
            raise ValueError(f"No path provided to LocalStorage.Read: {full_path}")

        if not os.path.exists(full_path):
            return None

        from json import loads
        from time import sleep

        data = None
        error = None
        attempts = 0

        while attempts < 3:
            attempts += 1

            try:
                with open(full_path) as file:
                    data = file.read()

                if is_json:
                    data = loads(data)

                if data:
                    return data

            except Exception as e:
                error = e

                sleep(0.2)

        if attempts >= 3 and data is None:
            msg = f"Failed to read: {full_path}, ({attempts} attempts)"

            if error:
                raise OSError(msg) from error

            raise Exception(msg)

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
        root = self.GetRecordRoot(obj_id)

        if self.store_path == "users":
            return os.path.join(root, "usr.data")

        if self.nested:
            obj_id_root = os.path.join(root, obj_id)

            if not os.path.isdir(obj_id_root):
                return ""

            path = os.path.join(obj_id_root, "data.json")

            if not os.path.exists(path) and "users" in obj_id_root:
                return os.path.join(obj_id_root, "usr.data")

            return path

        return os.path.join(root, obj_id)

    def GetRecordRoot(self, obj_id="", from_get_all=False):
        """
        | Example: /var/www/vhosts/oapi.co/dash/local/users/ryan@ensomniac.com/
        | Where 'users' is store_path and 'ryan@ensomniac.com' is obj_id
        """

        if self.store_path == "users" and not from_get_all:
            if not obj_id:
                params = self.RequestData
                obj_id = params.get("email")

            if not obj_id:
                raise Exception("An email address is required. Error x8392")

            return os.path.join(
                self.DashContext["srv_path_local"],
                self.store_path,
                obj_id + "/"  # Email address
            )

        return os.path.join(
            self.DashContext["srv_path_local"],
            self.store_path + "/"
        )

    def GetRecordCount(self):
        store_root = self.GetRecordRoot()

        if os.path.exists(store_root):
            return len(os.listdir(store_root))
        else:
            return 0

    def ConformPermissions(self, full_path, recursive=False):
        from time import sleep

        sleep(0.1)  # Buffer for new files/dirs

        mode = "755"
        group = "psacln"
        user = "ensomniac"

        if recursive:
            if not os.path.isdir(full_path):
                raise NotADirectoryError(f"When recursive is true, {full_path} must be a directory")

            from subprocess import run, CalledProcessError

            for command in [
                ["sudo", "chmod", "-R", mode, full_path],
                ["sudo", "chown", "-R", user, full_path],
                ["sudo", "chgrp", "-R", group, full_path]
            ]:
                try:
                    run(command, check=True)

                except CalledProcessError as ce1:
                    raise CalledProcessError(
                        ce1.returncode,
                        ce1.cmd,
                        output=ce1.output,
                        stderr=ce1.stderr
                    ) from Exception(f"Failed to change permissions ({' '.join(command)}) for dir: {full_path}")

                except FileNotFoundError:
                    continue

            return True

        try:
            from shutil import chown

            os.chmod(full_path, int(mode, 8))  # Octal representation of mode

            chown(full_path, user=user, group=group)

        except FileNotFoundError:
            pass

        except PermissionError as pe:
            from subprocess import run, CalledProcessError

            for command in [
                ["sudo", "chmod", mode, full_path],
                ["sudo", "chown", user, full_path],
                ["sudo", "chgrp", group, full_path]
            ]:
                try:
                    run(command, check=True)

                except CalledProcessError as ce1:
                    try:
                        raise CalledProcessError(
                            ce1.returncode,
                            ce1.cmd,
                            output=ce1.output,
                            stderr=ce1.stderr
                        ) from pe

                    except CalledProcessError as ce2:
                        raise Exception(
                            f"Failed to change permissions ({' '.join(command)}) for path: {full_path}"
                        ) from ce2

                except FileNotFoundError:
                    continue

        return True

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
        from unidecode import unidecode

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
                try:
                    sort_value = unidecode(sort_value)
                except:
                    pass

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

    def get_data_root(self, obj_id=""):
        """
        Nearly identical to self.get_store_root but returns slightly
        different paths depending on whether the record is nested
        """

        if self.nested:
            return os.path.join(self.GetRecordRoot(obj_id), obj_id + "/")  # /local/store_path/

        # /local/store_path/
        return self.GetRecordRoot(obj_id if (self.store_path == "users" and "@" in obj_id) else "")

    def write_binary(self, full_path, data, conform_permissions=True):
        with open(full_path, "wb") as file:
            file.write(data)

        if conform_permissions:
            self.ConformPermissions(full_path)

        return data

    def write_json_unprotected(self, full_path, data, conform_permissions=True):
        from json import dumps

        with open(full_path, "w") as file:
            file.write(dumps(data))

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
            with open(tmp_file_path, "w") as file:
                file.write(dumps(data))

        except Exception as e:
            raise IOError(f"Write fail at {tmp_file_path} from {full_path}") from e

        os.rename(tmp_file_path, full_path)

        if conform_permissions:
            self.ConformPermissions(full_path)

        return data

    def get_default_data(self, record_id):
        iso = self.now.isoformat()
        
        return {
            "id": record_id,
            "display_name": record_id,
            "created_by": self.User["email"],
            "created_on": iso,
            "modified_by": self.User["email"],
            "modified_on": iso
        }

    # This is not exclusive to IDs, can be used for any string values
    def RecursivelyReplaceIDInRoot(
        self, root, old_id, new_id, dry_run=False, verbose=False, indent_char="\t", _log=[]
    ):
        log = _log or [f"old: {old_id}, new: {new_id}, dry run: {dry_run}, verbose: {verbose}"]

        if not os.path.exists(root):
            log.append(f"root: {root}")
            log.append(f"{indent_char}root doesn't exist")

            return log

        root_logged = False

        for filename in os.listdir(root):
            path = os.path.join(root, filename)

            if filename.endswith(".json") or filename == "usr.data":
                data, modified, data_log = self.recursively_replace_id_in_dict(
                    self.Read(path),
                    old_id,
                    new_id,
                    verbose,
                    indent_char
                )

                if modified:
                    if not root_logged:
                        log.append(f"root: {root}")

                        root_logged = True

                    log.append(f"{indent_char}{filename}: {path}")

                    log += data_log

                    if not dry_run:
                        self.Write(path, data)

                if verbose:
                    if not root_logged:
                        log.append(f"root: {root}")

                        root_logged = True

                    if not modified:
                        log.append(f"{indent_char}{filename}: {path}")

                    log += data_log

                    log.append(f"{indent_char * 2}modified: {modified}")

            elif os.path.isdir(path):
                if verbose:
                    if not root_logged:
                        log.append(f"root: {root}")

                        root_logged = True

                    log.append(f"{indent_char}{filename}: {path}")
                    log.append(f"{indent_char * 2}is dir, recurse")

                log = self.RecursivelyReplaceIDInRoot(path, old_id, new_id, dry_run, verbose, indent_char, log)

            else:
                if verbose:
                    if not root_logged:
                        log.append(f"root: {root}")

                        root_logged = True

                    log.append(f"{indent_char}{filename}: {path}")
                    log.append(f"{indent_char * 2}skipped/missed")

            if old_id in filename:
                if not root_logged:
                    log.append(f"root: {root}")

                    root_logged = True

                log.append(f"{indent_char}{filename}: {path}")
                log.append(f"{indent_char * 2}rename file")

                if not dry_run:
                    os.rename(path, os.path.join(root, filename.replace(old_id, new_id)))

        return log

    def recursively_replace_id_in_dict(self, data, old_id, new_id, verbose, indent_char, _log=[], _modified=False):
        modified = False
        log = _log or []  # Have to do this, otherwise the logs persist, and we get duplicates

        if verbose:
            log.append(f"{indent_char * 2}dict:")

        if not data:
            if verbose:
                log.append(f"{indent_char * 3}Invalid/empty dict")

            return data, (_modified or modified), log

        key_changes = []

        for key in data:
            if key == "_duplicated_from":
                continue

            if old_id in key:
                key_changes.append(key)

            value = data.get(key)

            if old_id == "NaN" and type(value) is float and str(value) == "nan":
                data[key] = new_id

                log.append(f"{indent_char * 3}updated value for key: {key}")

                modified = True

                continue

            if not value:
                if verbose:
                    log.append(f"{indent_char * 3}key: {key}")
                    log.append(f"{indent_char * 4}continue")

                continue

            value_type = type(value)

            if value_type is dict:
                if verbose:
                    log.append(f"{indent_char * 3}key: {key}")
                    log.append(f"{indent_char * 4}recurse dict")

                data[key], modified, log = self.recursively_replace_id_in_dict(
                    value,
                    old_id,
                    new_id,
                    verbose,
                    indent_char,
                    log,
                    modified
                )

                continue

            if value_type is list:
                if verbose:
                    log.append(f"{indent_char * 3}key: {key}")
                    log.append(f"{indent_char * 4}recurse list")

                data[key], modified, log = self.recursively_replace_id_in_list(
                    value,
                    old_id,
                    new_id,
                    verbose,
                    indent_char,
                    log,
                    modified
                )

                continue

            if value_type is not str or old_id not in value:
                if verbose:
                    log.append(f"{indent_char * 3}key: {key}")
                    log.append(f"{indent_char * 4}continue")

                continue

            data[key] = value.replace(old_id, new_id)

            log.append(f"{indent_char * 3}updated value for key: {key}")

            modified = True

        if key_changes:
            log.append(f"{indent_char * 2}key changes: {key_changes}")

            for key in key_changes:
                data[key.replace(old_id, new_id)] = data.pop(key)

                modified = True

        return data, (_modified or modified), log

    def recursively_replace_id_in_list(self, data, old_id, new_id, verbose, indent_char, _log=[], _modified=False):
        modified = False
        log = _log or []  # Have to do this, otherwise the logs persist, and we get duplicates

        if verbose:
            log.append(f"{indent_char * 3}list:")

        if not data:
            if verbose:
                log.append(f"{indent_char * 4}Invalid/empty list")

            return data, (_modified or modified), log

        for index, item in enumerate(data):
            item_type = type(item)

            if item_type is dict:
                if verbose:
                    log.append(f"{indent_char * 4}index: {index}")
                    log.append(f"{indent_char * 5}recurse dict")

                data[index], modified, log = self.recursively_replace_id_in_dict(
                    item,
                    old_id,
                    new_id,
                    verbose,
                    indent_char,
                    log,
                    modified
                )

                continue

            if item_type is list:
                if verbose:
                    log.append(f"{indent_char * 4}index: {index}")
                    log.append(f"{indent_char * 5}recurse list")

                data[index], modified, log = self.recursively_replace_id_in_list(
                    item,
                    old_id,
                    new_id,
                    verbose,
                    indent_char,
                    log,
                    modified
                )

                continue

            if item_type is not str or old_id not in item:
                continue

            data[index] = new_id

            log.append(f"{indent_char * 3}updated value for index: {index}")

            modified = True

        return data, (_modified or modified), log


def New(dash_context, store_path, additional_data={}, obj_id=None, nested=False, conform_permissions=True):
    return DashLocalStorage(dash_context, store_path, nested).New(additional_data, obj_id, conform_permissions)


def Duplicate(
    dash_context, store_path, id_to_duplicate, include_display_name=True, display_name_tag="Copy", nested=False
):
    return DashLocalStorage(dash_context, store_path, nested).Duplicate(
        id_to_duplicate, include_display_name, display_name_tag
    )


def CreateOrUpdate(dash_context, store_path, additional_data, obj_id, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).CreateOrUpdate(additional_data, obj_id)


def SetData(dash_context, store_path, obj_id, data, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).WriteData(obj_id, data)


def Delete(dash_context, store_path, obj_id, nested=False, archive_path=""):
    return DashLocalStorage(dash_context, store_path, nested).Delete(obj_id, archive_path)


def GetData(dash_context, store_path, obj_id, nested=False, filter_out_keys=[]):
    return DashLocalStorage(dash_context, store_path, nested, filter_out_keys=filter_out_keys).GetData(obj_id)


def GetAll(
    dash_context, store_path, nested=False, sort_by_key="", filter_out_keys=[],
    extensionless=False, filter_params={}, default_data_to_assert={}
):
    return DashLocalStorage(
        dash_context, store_path, nested, sort_by_key, filter_out_keys
    ).GetAll(extensionless, filter_params=filter_params, default_data_to_assert=default_data_to_assert)


def GetAllIDs(dash_context, store_path, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).GetAllIDs()


def SetProperty(dash_context, store_path, obj_id, key=None, value=None, create=False, nested=False):
    return DashLocalStorage(dash_context, store_path, nested).SetProperty(
        obj_id, key=key, value=value, create=create
    )


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


def ReadModifyWrite(full_path, modify, default_data=None, conform_permissions=True):
    """
    Lock a JSON file, read it, run custom mutation logic, and protected-write the result.

    Use this instead of Read -> custom mutation logic -> Write when the new value depends
    on the latest saved JSON data. Use UpdateData for simple dictionary merges; use Write
    for standalone full-file replacements with already-authoritative data.
    """

    return DashLocalStorage().ReadModifyWrite(full_path, modify, default_data, conform_permissions)


# Shortcut/wrapper for Read->Write
def UpdateData(full_path, update_data, conform_permissions=True):
    """
    Lock a JSON file, merge update_data into the existing dictionary, and write it back.

    Use ReadModifyWrite when the change needs custom logic beyond a simple dict update.
    """

    return DashLocalStorage().UpdateData(full_path, update_data, conform_permissions)


def GetPrivKey(filename, subfolders=[], is_json=True):
    return DashLocalStorage().GetPrivKey(filename, subfolders, is_json)


def ConformPermissions(full_path, recursive=False):
    return DashLocalStorage().ConformPermissions(full_path, recursive)


def ConvertToNested(dash_context, store_path):
    return DashLocalStorage(dash_context, store_path).ConvertToNested()


def RecursivelyReplaceIDInRoot(root, old_id, new_id, dry_run=False, verbose=False, indent_char="\t"):
    return DashLocalStorage().RecursivelyReplaceIDInRoot(root, old_id, new_id, dry_run, verbose, indent_char)
