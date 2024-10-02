#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class ApiAdmin:
    # This seems to only ever be used to extend an Admin class that is
    # instantiated with ApiCore, so adding these here to resolve ApiCore's variables
    Params: dict
    Add: callable
    DashContext: dict
    SetResponse: callable

    # These params don't need to be passed in here since they're already
    # passed into ApiCore, but leaving them to not break any other code
    def __init__(self, execute_as_module=False, asset_path=""):
        if not hasattr(self, "_execute_as_module"):
            self._execute_as_module = execute_as_module

        if not hasattr(self, "_asset_path"):
            self._asset_path = asset_path

            if not self._asset_path:
                from Dash.Utils import ParseDashContextAssetPath

                self._asset_path = ParseDashContextAssetPath()

        self.Add(self.get, requires_authentication=True)

    def get(self):
        from Dash.Users import GetAll

        return self.SetResponse({
            "users": GetAll(
                request_params=self.Params,
                dash_context=self.DashContext,
                include_order=True
            ),

            # What are these for? Why empty?
            "site_settings": [],
            "user_groups": []
        })
