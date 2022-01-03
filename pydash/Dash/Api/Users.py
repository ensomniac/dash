#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


# It's unclear if this should be inheriting from ApiCore - it uses ApiCore's
# functionality, but I'm unsure, so just adding the below type hints for now
class ApiUsers:
    User: dict
    Params: dict
    RandomID: str
    Add: callable
    DashContext: dict
    ParseParam: callable
    SetResponse: callable

    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path
        self._on_init_callback = None

        self.Add(self.r,               requires_authentication=False)
        self.Add(self.reset,           requires_authentication=False)
        self.Add(self.login,           requires_authentication=False)
        self.Add(self.get_all,         requires_authentication=True)
        self.Add(self.validate,        requires_authentication=False)
        self.Add(self.upload_image,    requires_authentication=True)
        self.Add(self.set_property,    requires_authentication=True)
        self.Add(self.update_password, requires_authentication=True)

    def reset(self):
        from Dash.Users import Users as DashUsers

        return self.SetResponse(DashUsers(self.Params, self.DashContext).Reset())

    def r(self):
        from Dash.Users import Users as DashUsers

        return self.SetResponse(DashUsers(self.Params, self.DashContext).ResetResponse())

    def login(self):
        from Dash.Users import Users as DashUsers

        response = self.SetResponse(DashUsers(self.Params, self.DashContext).Login())

        return self.merge_addl_into_init(response)

    def OnInit(self, callback):
        # When passed a callback, this function will be called whenever portal
        # init data is passed back, so that custom data can be included in the response.
        self._on_init_callback = callback

    def validate(self):
        from Dash.Users import Users as DashUsers

        response = DashUsers(self.Params, self.DashContext).Validate()

        return self.SetResponse(self.merge_addl_into_init(response))

    def merge_addl_into_init(self, response):
        if "init" not in response:
            return response

        if not self._on_init_callback:
            return response

        additional = self._on_init_callback()

        for key in additional:
            response["init"][key] = additional[key]

        return response

    def update_password(self):
        from Dash.Users import Users as DashUsers

        return self.SetResponse(DashUsers(self.Params, self.DashContext).UpdatePassword())

    def set_property(self):
        from Dash.LocalStorage import SetProperty

        return self.SetResponse(SetProperty(
            dash_context=self.DashContext,
            store_path="users",
            obj_id=self.Params["obj_id"]
        ))

    # TODO - get rid of this code - it's been moved to Admin.py
    def get_all(self):
        from Dash.LocalStorage import Read

        sorted_users = []
        pairs_to_sort = []
        response = {"users": []}
        users_root = os.path.join(self.DashContext["srv_path_local"], "users/")

        for email in os.listdir(users_root):
            user_path = os.path.join(users_root, email, "usr.data")
            user_data = self.conform_user_data(Read(user_path))

            pairs_to_sort.append([user_data.get("first_name") or user_data.get("email"), user_data.get("id")])

            response["users"].append(user_data)

        pairs_to_sort.sort()

        for pair in pairs_to_sort:
            for user in response["users"]:
                if pair[1] != user.get("id"):
                    continue

                sorted_users.append(user)

                break

        response["users"] = sorted_users
        response["record_path"] = self.DashContext["srv_path_local"]

        return self.SetResponse(response)

    # TODO: Evaluate whether or not this is useful/needed
    def conform_user_data(self, user_data):
        # Light wrapper to make sure certain things exist in returned user data

        user_data["conformed"] = True

        return user_data

    # TODO: Move this into the core Users.py module
    def upload_image(self):
        from Dash.Utils import UploadFile
        from Dash.Users import GetUserDataRoot
        from Dash.LocalStorage import Read, Write

        self.ParseParam("user_data", dict, self.User)

        data_root = GetUserDataRoot(self.Params["user_data"]["email"])
        img_root = os.path.join(data_root, "img/")
        user_data_path = os.path.join(data_root, "usr.data")
        user_data = Read(user_data_path)

        user_data["img"] = UploadFile(
            self.DashContext,
            user_data,
            img_root,
            self.Params["file"],
            self.Params.get("filename")
        )

        Write(user_data_path, user_data)

        return self.SetResponse(user_data)
