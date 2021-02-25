#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json
import traceback

from Dash import LocalStorage

class ApiProperties:
    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path

        self.Add(self.get_property_set, requires_authentication=True)
        self.Add(self.set_property,     requires_authentication=True)

    def get_property_set(self):

        record_path = LocalStorage.GetRecordPath(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"]
        )

        property_set = {}
        if not os.path.exists(record_path):
            property_set["msg"] = "Record does not exist"
        else:
            property_set = LocalStorage.GetData(
                dash_context=self.DashContext,
                store_path="properties",
                obj_id=self.Params["obj_id"],
            )

        return self.SetResponse(property_set)

    def set_property(self):

        if "_bool" in self.Params["key"]:
            self.Params["value"] = str(self.Params["value"]).lower() == "true"

        result = LocalStorage.SetProperty(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"],
            key=self.Params["key"],
            value=self.Params["value"],
            create=True, # Create the record if it doesn't exist
        )

        return self.SetResponse(result)

