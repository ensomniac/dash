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

    # TODO: Update this to use Dash.Utils UploadImage, then move this into the core Users.py module
    def upload_image(self):
        from PIL import Image
        from io import BytesIO
        from json import loads
        from datetime import datetime
        from Dash.Users import GetUserDataRoot
        from Dash.LocalStorage import Read, Write

        user_data = self.Params.get("user_data") or self.User

        if type(user_data) == str:
            # Sent from the client
            user_data = loads(user_data)

        data_root = GetUserDataRoot(user_data["email"])
        usr_data_path = os.path.join(data_root, "usr.data")
        img_root = os.path.join(data_root, "img/")

        os.makedirs(img_root, exist_ok=True)

        # extension = self.Params.get("filename").split(".")[0].strip().lower()

        img = Image.open(BytesIO(self.Params["file"]))
        img = img.convert("RGB")

        img_data = {
            "id": self.RandomID,
            "org_width": img.size[0],
            "org_height": img.size[0],
            "org_aspect": img.size[0] / float(img.size[1]),
            "uploaded_by": self.User["email"],
            "uploaded_on": datetime.now().isoformat()
        }

        orig_path = os.path.join(img_root, img_data["id"] + "_orig.png")
        thumb_path = os.path.join(img_root, img_data["id"] + "_thb.jpg")
        data_path = os.path.join(img_root, img_data["id"] + ".json")
        size = img.size[0]
        thumb_size = 512

        img.save(orig_path)

        if img.size[0] != img.size[1]:
            if img.size[0] > img.size[1]:  # Wider
                size = img.size[1]
                x = int((img.size[0] * 0.5) - (size * 0.5))

                img = img.crop((
                    x,  # x start
                    0,  # y start
                    x + size,  # x + width
                    size  # y + height
                ))

            else:  # Taller
                size = img.size[0]
                y = int((img.size[1] * 0.5) - (size * 0.5))

                img = img.crop((
                    0,  # x start
                    y,  # y start
                    size,  # x + width
                    y + size  # y + height
                ))

        if size > thumb_size:
            img = img.resize((thumb_size, thumb_size), Image.ANTIALIAS)
            size = thumb_size

        img.save(thumb_path)

        asset_path_splitter = self.DashContext["asset_path"]

        if asset_path_splitter == "dash_guide":
            asset_path_splitter = "dash"

        thumb_url = "https://" + self.DashContext["domain"] + "/local/"
        thumb_url += img_root.split(f"/{asset_path_splitter}/local/")[-1]
        thumb_url += img_data["id"] + "_thb.jpg"

        orig_url = "https://" + self.DashContext["domain"] + "/local/"
        orig_url += img_root.split(f"/{asset_path_splitter}/local/")[-1]
        orig_url += img_data["id"] + "_orig.png"

        img_data["thumb_url"] = thumb_url
        img_data["orig_url"] = orig_url

        img_data["width"] = size
        img_data["height"] = size
        img_data["aspect"] = 1

        Write(data_path, img_data)

        # Now finally, update this user's user data
        user_data = Read(usr_data_path)
        user_data["img"] = img_data

        Write(usr_data_path, user_data)

        return self.SetResponse(user_data)
