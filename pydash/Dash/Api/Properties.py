#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


# It's unclear if this should be inheriting from ApiCore - it uses ApiCore's
# functionality, but I'm unsure, so just adding the below type hints for now
class ApiProperties:
    Params: dict
    Add: callable
    DashContext: dict
    SetResponse: callable

    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path

        self.Add(self.set_property,     requires_authentication=True)
        self.Add(self.get_property_set, requires_authentication=True)

    def get_property_set(self):
        from Dash.LocalStorage import GetRecordPath, GetData

        record_path = GetRecordPath(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"]
        )

        property_set = {}
        if not os.path.exists(record_path):
            property_set["msg"] = "Record does not exist"
        else:
            property_set = GetData(
                dash_context=self.DashContext,
                store_path="properties",
                obj_id=self.Params["obj_id"],
            )

        return self.SetResponse(property_set)

    def set_property(self):
        from Dash.LocalStorage import SetProperty

        if "_bool" in self.Params["key"]:
            self.Params["value"] = str(self.Params["value"]).lower() == "true"

        result = SetProperty(
            dash_context=self.DashContext,
            store_path="properties",
            obj_id=self.Params["obj_id"],
            key=self.Params["key"],
            value=self.Params["value"],
            create=True,  # Create the record if it doesn't exist
        )

        return self.SetResponse(result)
