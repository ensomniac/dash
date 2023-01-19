#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
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
    ValidateParams: callable

    def __init__(self, execute_as_module, asset_path):
        self._execute_as_module = execute_as_module
        self._asset_path = asset_path
        self._on_init_callback = None

        # (Intended to be overwritten)
        # Emails that can bypass DashContext's specified 'user_email_domain' and create an account regardless of domain
        self.UserEmailDomainBypassEmails = []

        self.Add(self.r,                    requires_authentication=False)
        self.Add(self.reset,                requires_authentication=False)
        self.Add(self.login,                requires_authentication=False)
        self.Add(self.get_all,              requires_authentication=True)
        self.Add(self.validate,             requires_authentication=False)
        self.Add(self.update_pin,           requires_authentication=True)
        self.Add(self.upload_image,         requires_authentication=True)
        self.Add(self.set_property,         requires_authentication=True)
        self.Add(self.update_password,      requires_authentication=True)
        self.Add(self.validate_credentials, requires_authentication=True)

    def OnInit(self, callback):
        # When passed a callback, this function will be called whenever portal
        # init data is passed back, so that custom data can be included in the response.
        self._on_init_callback = callback

    def r(self):
        from Dash.Users import ResetResponse

        return self.SetResponse(ResetResponse(
            request_params=self.Params,
            dash_context=self.DashContext
        ))

    def reset(self):
        from Dash.Users import Reset

        return self.SetResponse(Reset(
            request_params=self.Params,
            dash_context=self.DashContext,
            user_email_domain_bypass_emails=self.UserEmailDomainBypassEmails
        ))

    def login(self):
        from Dash.Users import Login

        return self.SetResponse(self.merge_addl_into_init(Login(
            use_pin=self.ParseParam("use_pin", bool, False),
            request_params=self.Params,
            dash_context=self.DashContext
        )))

    # TODO - get rid of this code - it's been moved to Admin.py (why is this not using Users.GetAll?)
    def get_all(self):
        from Dash.LocalStorage import Read

        sorted_users = []
        pairs_to_sort = []
        response = {"users": []}
        users_root = os.path.join(self.DashContext["srv_path_local"], "users/")

        for email in os.listdir(users_root):
            email = email.lower()  # TODO: This needs to be sanitized upon account creation
            user_path = os.path.join(users_root, email, "usr.data")
            user_data = Read(user_path) if os.path.exists(user_path) else None

            # For now, sending an alert email as to not interrupt the user's session,
            # but it may end up being better to raise an exception here instead
            if not user_data:
                # Ignore new users who haven't logged in yet by checking for the existence of the sessions folder.
                # Checking for the existence of that instead of the usr.data file is preferred in case usr.data may be corrupted.
                if os.path.exists(os.path.join(users_root, email, "sessions")):
                    from Dash.Utils import SendEmail

                    msg = f"\Warning: Failed to read user data for '{email}'. If it's not a new user, it may be corrupted.\n\nPath:\n{user_path}"

                    if self.Params:
                        msg += f"\n\nParams:\n{self.Params}"

                    SendEmail(
                        subject="Dash Error - Users.get_all()",
                        msg=msg,
                        sender_email=self.DashContext.get("admin_from_email"),
                        sender_name=(self.DashContext.get("code_copyright_text") or self.DashContext["display_name"])
                    )

                continue

            user_data = self.conform_user_data(user_data)

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

    def validate(self):
        from Dash.Users import Validate

        return self.SetResponse(self.merge_addl_into_init(Validate(
            request_params=self.Params,
            dash_context=self.DashContext
        )))

    def update_pin(self):
        self.ValidateParams(["email", "pin"])

        from Dash.Users import UpdatePIN

        return self.SetResponse(UpdatePIN(
            email=self.Params["email"],
            pin=self.Params["pin"],
            token_validation=self.ParseParam("token_validation", bool, True),
            request_params=self.Params,
            dash_context=self.DashContext
        ))

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

    def set_property(self):
        from Dash.LocalStorage import SetProperty

        return self.SetResponse(SetProperty(
            dash_context=self.DashContext,
            store_path="users",
            obj_id=self.Params["obj_id"]
        ))

    def update_password(self):
        from Dash.Users import UpdatePassword

        return self.SetResponse(UpdatePassword(
            request_params=self.Params,
            dash_context=self.DashContext
        ))

    def validate_credentials(self):
        self.ValidateParams(["email", "password"])

        response = self.get_credential_validation_data()

        if not response.get("error"):
            response["authenticated"] = True

        return self.SetResponse(response)

    # -------------------------------------------------------------------------------------

    def merge_addl_into_init(self, response):
        if "init" not in response:
            return response

        if not self._on_init_callback:
            return response

        additional = self._on_init_callback()

        for key in additional:
            response["init"][key] = additional[key]

        return response

    # TODO: Evaluate whether this is actually serving any purpose
    def conform_user_data(self, user_data):
        # Light wrapper to make sure certain things exist in returned user data

        user_data["conformed"] = True

        return user_data

    def get_credential_validation_data(self):
        from Dash.Users import ValidateCredentials

        response = {
            "email": self.Params["email"],
            "authenticated": False
        }

        validation = ValidateCredentials(
            email=self.Params["email"],
            password=self.Params["password"],
            return_login_dict=True,  # Just to get the error messages
            request_params=self.Params,
            dash_context=self.DashContext
        )

        if validation.get("error"):
            response["error"] = validation["error"]

        return response
