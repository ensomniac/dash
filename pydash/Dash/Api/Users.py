#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json
import traceback

# import Dash
from Dash import LocalStorage
from Dash.Utils import Utils
from Dash.Users import Users as DashUsers

class ApiUsers:
    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path

        self.Add(self.reset,           requires_authentication=False)
        self.Add(self.r,               requires_authentication=False)
        self.Add(self.login,           requires_authentication=False)
        self.Add(self.validate,        requires_authentication=False)
        self.Add(self.update_password, requires_authentication=True)
        self.Add(self.set_property,    requires_authentication=True)

    def reset(self):
        return self.SetResponse(DashUsers(self.Params, self.DashContext).Reset())

    def r(self):
        return self.SetResponse(DashUsers(self.Params, self.DashContext).ResetResponse())

    def login(self):
        return self.SetResponse(DashUsers(self.Params, self.DashContext).Login())

    def validate(self):
        return self.SetResponse(DashUsers(self.Params, self.DashContext).Validate())

    def update_password(self):
        return self.SetResponse(DashUsers(self.Params, self.DashContext).UpdatePassword())

    def set_property(self):
        return self.SetResponse(LocalStorage.SetProperty(
            dash_context=self.DashContext,
            store_path="users",
            obj_id=self.Params["obj_id"]
        ))



