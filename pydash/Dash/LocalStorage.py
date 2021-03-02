#!/usr/bin/python

import os
import sys
import datetime
import json

from Dash.Utils import Utils

# DashLocalStorage is a utility for reading, writing and maintaining common data

class DashLocalStorage:
    def __init__(self, dash_context, store_path):
        # store_path examples: users / packages / jobs
        # obj_id examples: 326783762323 / ryan@ensomniac.com

        self.dash_context = dash_context
        self.store_path = store_path

    def CreateOrUpdate(self, additional_data, obj_id):
        record_path = self.get_record_path(obj_id)

        if not os.path.exists(record_path):
            return self.New(additional_data, obj_id)

        # Get existing data and modify
        data = self.GetData(obj_id)

        for key in additional_data:
            data[key] = additional_data[key]

        data["modified_by"] = Utils.Global.RequestUser["email"]
        data["modified_on"] = datetime.datetime.now().isoformat()

        self.WriteData(obj_id, data)

        return data

    def New(self, additional_data, obj_id=None):
        # Creates and saves a standard user record

        import json

        record_id = obj_id or Utils.get_random_id()

        # if self.store_path == "users" and obj_id:
            # record_id = obj_id

        data = {}
        data["id"] = record_id
        data["created_by"] = Utils.Global.RequestUser["email"]
        data["created_on"] = datetime.datetime.now().isoformat()
        data["modified_by"] = Utils.Global.RequestUser["email"]
        data["modified_on"] = datetime.datetime.now().isoformat()

        if additional_data:
            for key in additional_data:
                data[key] = additional_data[key]

        if not os.path.exists(self.get_store_root(record_id)):
            os.makedirs(self.get_store_root(record_id))

        json_data = json.dumps(data)
        open(self.get_record_path(record_id), "w").write(json_data)

        return data

    def GetAll(self):
        # Returns a dictionary containing ID > Data pairs

        all_data = {}
        all_data["data"] = {}
        all_data["order"] = []

        if not os.path.exists(self.get_store_root()):
            return all_data

        import json
        for obj_id in os.listdir(self.get_store_root()):
            if obj_id.startswith("."): continue
            all_data["data"][obj_id] = self.GetData(obj_id)

        all_data["order"] = list(all_data["data"].keys())
        all_data["order"].sort()
        all_data["order"].reverse()

        return all_data

    def GetData(self, obj_id, create=False, additional_data={}):
        import json

        record_path = self.get_record_path(obj_id)

        if not os.path.exists(record_path):

            if create:
                return self.New(additional_data, obj_id=obj_id)
            else:
                raise Exception("Expected record does not exist. x9483 Expected " + record_path + " / " + obj_id)

        return json.loads(open(record_path, "r").read())

    def get_store_root(self, obj_id_email=None):
        # Example: /var/www/vhosts/oapi.co/dash/local/users/ryan@ensomniac.com/
        # Where 'users' is store_path and 'ryan@ensomniac.com' is obj_id_email

        if self.store_path == "users":
            store_root = os.path.join(
                self.dash_context["srv_path_local"],
                self.store_path,
                obj_id_email + "/", # Email address
            )
        else:
            store_root = os.path.join(
                self.dash_context["srv_path_local"],
                self.store_path + "/"
            )

        return store_root

    def get_record_path(self, obj_id):

        if self.store_path == "users":

            record_path = os.path.join(
                self.get_store_root(obj_id),
                "usr.data"
            )

        else:

            record_path = os.path.join(
                self.get_store_root(obj_id),
                obj_id
            )

        return record_path

    def WriteData(self, obj_id, data):
        import json
        json_str = json.dumps(data)
        open(self.get_record_path(obj_id), "w").write(json_str)
        return data

    def SetProperty(self, obj_id, key=None, value=None, create=False):
        import json

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
        data["modified_on"] = datetime.datetime.now().isoformat()

        self.WriteData(obj_id, data)

        response["updated_data"] = data

        return response

    def Delete(self, obj_id):
        record_path = self.get_record_path(obj_id)

        result = {}
        result["existed"] = os.path.exists(record_path)
        result["record_path"] = record_path

        if result["existed"]:
            os.remove(record_path)

        result["exists_now"] = os.path.exists(record_path)
        return result

    def Read(self, full_path):
        return json.loads(open(full_path, "r").read())

def New(dash_context, store_path, additional_data={}, obj_id=None):
    return DashLocalStorage(dash_context, store_path).New(additional_data, obj_id=obj_id)

def CreateOrUpdate(dash_context, store_path, additional_data, obj_id):
    return DashLocalStorage(dash_context, store_path).CreateOrUpdate(additional_data, obj_id)

def SetData(dash_context, store_path, obj_id, data):
    return DashLocalStorage(dash_context, store_path).WriteData(obj_id, data)

def Delete(dash_context, store_path, obj_id):
    return DashLocalStorage(dash_context, store_path).Delete(obj_id)

def GetData(dash_context, store_path, obj_id):
    return DashLocalStorage(dash_context, store_path).GetData(obj_id)

def GetAll(dash_context, store_path):
    return DashLocalStorage(dash_context, store_path).GetAll()

def SetProperty(dash_context, store_path, obj_id, key=None, value=None, create=False):
    return DashLocalStorage(dash_context, store_path).SetProperty(obj_id, key=key, value=value, create=create)

def GetRecordRoot(dash_context, store_path, obj_id=None):
    return DashLocalStorage(dash_context, store_path).get_store_root(obj_id)

def GetRecordPath(dash_context, store_path, obj_id):
    return DashLocalStorage(dash_context, store_path).get_record_path(obj_id)

def Read(full_path):
    return DashLocalStorage(None, None).Read(full_path)
