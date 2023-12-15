#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
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

    def __init__(self, execute_as_module=False, asset_path=""):
        # These don't need to be here, they're already passed into ApiCore, making this is redundant
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path

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
