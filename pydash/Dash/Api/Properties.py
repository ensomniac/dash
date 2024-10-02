#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class ApiProperties:
    # This seems to only ever be used to extend a class that is instantiated
    # with ApiCore, so adding these here to resolve ApiCore's variables
    Params: dict
    Add: callable
    DashContext: dict
    SetResponse: callable

    def __init__(self, execute_as_module=False, asset_path=""):
        if not hasattr(self, "_execute_as_module"):
            self._execute_as_module = execute_as_module

        if not hasattr(self, "_asset_path"):
            self._asset_path = asset_path

            if not self._asset_path:
                from Dash.Utils import ParseDashContextAssetPath

                self._asset_path = ParseDashContextAssetPath()

        self.Add(self.set_property,     requires_authentication=True)
        self.Add(self.get_property_set, requires_authentication=True)

    def get_property_set(self):
        from Dash.LocalStorage import GetRecordPath, GetData

        if not os.path.exists(GetRecordPath(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"]
        )):
            return self.SetResponse({"msg": "Record does not exist"})

        return self.SetResponse(GetData(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"]
        ))

    def set_property(self):
        from Dash.LocalStorage import SetProperty

        if "_bool" in self.Params["key"]:
            self.Params["value"] = str(self.Params["value"]).lower() == "true"

        return self.SetResponse(SetProperty(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"],
            key=self.Params["key"],
            value=self.Params["value"],
            create=True  # Create the record if it doesn't exist
        ))
