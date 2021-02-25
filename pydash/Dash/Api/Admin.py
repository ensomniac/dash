#!/usr/bin/python
#
# Ensomniac 2021, Ryan Martin ryan@ensomniac.com

import os
import sys
import cgi
import json
import traceback

from Dash import LocalStorage

class ApiAdmin:
    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path

        self.Add(self.get_all, requires_authentication=True)

    def get_all(self):
        response = {"admin": "maybe"}
        return self.SetResponse(response)


