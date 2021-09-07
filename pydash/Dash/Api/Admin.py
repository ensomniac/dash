#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash import LocalStorage


# It's unclear if this should be inheriting from ApiCore - it uses ApiCore's
# functionality, but I'm unsure, so just adding the below type hints for now
class ApiAdmin:
    Add: callable
    DashContext: dict
    SetResponse: callable

    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path

        self.Add(self.get, requires_authentication=True)

    def get(self):
        return self.SetResponse({
            "users": self.get_sorted_users(),
            "site_settings": [],
            "user_groups": []
        })

    def get_sorted_users(self):
        users_sort = []

        users = {
            "order": [],
            "data": {}
        }

        for item in self.get_all_users()["users"]:
            users["data"][item["email"]] = item

            users_sort.append([item["created_on"], item["email"]])

        users_sort.sort()

        for item in users_sort:
            users["order"].append(item[1])

        return users

    def get_all_users(self):
        response = {"users": []}
        users_root = os.path.join(self.DashContext["srv_path_local"], "users/")

        for email in os.listdir(users_root):
            user_path = os.path.join(users_root, email, "usr.data")

            response["users"].append(LocalStorage.Read(user_path))

        return self.SetResponse(response)
