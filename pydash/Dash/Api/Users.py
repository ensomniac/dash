#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class ApiUsers:
    # This seems to only ever be used to extend a Users class that is
    # instantiated with ApiCore, so adding these here to resolve ApiCore's variables
    User: dict
    Params: dict
    RandomID: str
    Add: callable
    DashContext: dict
    AnalogContext: dict
    ParseParam: callable
    SetResponse: callable
    ValidateParams: callable
    _user_email_domain_bypass_emails: list

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

        self._on_init_callback = None
        self._on_termination_callback = None
        self._pre_init_callback_response = None

        self.Add(self.r,                    requires_authentication=False)
        self.Add(self.reset,                requires_authentication=False)
        self.Add(self.login,                requires_authentication=False)
        self.Add(self.get_all,              requires_authentication=True)
        self.Add(self.validate,             requires_authentication=False)
        self.Add(self.terminate,            requires_authentication=True)
        self.Add(self.update_pin,           requires_authentication=True)
        self.Add(self.upload_image,         requires_authentication=True)
        self.Add(self.set_property,         requires_authentication=True)
        self.Add(self.update_password,      requires_authentication=True)
        self.Add(self.validate_credentials, requires_authentication=True)

    @property
    def UserEmailDomainBypassEmails(self):
        if not hasattr(self, "_user_email_domain_bypass_emails"):
            self._user_email_domain_bypass_emails = self.AnalogContext.get("user_email_domain_bypass_emails", [])

        return self._user_email_domain_bypass_emails

    def SetUserEmailDomainBypassEmails(self, new_emails, replace=False):
        if replace:
            self._user_email_domain_bypass_emails = new_emails

            return self._user_email_domain_bypass_emails

        emails = self.UserEmailDomainBypassEmails

        for email in new_emails:
            if email not in emails:
                emails.append(email)

        self._user_email_domain_bypass_emails = emails

        return self._user_email_domain_bypass_emails

    def OnInit(self, callback):
        # When passed a callback, this function will be called whenever portal
        # init data is passed back, so that custom data can be included in the response.
        self._on_init_callback = callback

    def OnTermination(self, callback):
        self._on_termination_callback = callback

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

        response = Login(
            use_pin=self.ParseParam("use_pin", bool, False),
            request_params=self.Params,
            dash_context=self.DashContext
        )

        try:
            # When abstracting from both this class and ApiCore, having access to
            # self.User is sometimes needed when adding custom init data on login
            if response.get("user") and hasattr(self, "SetUser") and hasattr(self, "User") and not self.User:
                self.SetUser(response["user"])
        except:
            pass

        return self.SetResponse(self.merge_addl_into_init(response))

    def get_all(self):
        from Dash.Users import GetAll

        all_users = GetAll(
            request_params=self.Params,
            dash_context=self.DashContext,
            include_order=True,
            order_by_last_name=self.ParseParam("sort_by_last_name", bool, False)
        )

        sorted_users = []

        for email in all_users["order"]:
            sorted_users.append(all_users["data"][email])

        return self.SetResponse({
            "users": sorted_users,
            "record_path": self.DashContext["srv_path_local"]  # Why is this included?
        })

    def validate(self):
        from Dash.Users import Validate

        return self.SetResponse(self.merge_addl_into_init(Validate(
            request_params=self.Params,
            dash_context=self.DashContext
        )))

    def terminate(self):
        self.ValidateParams(["email_to_term"])

        from datetime import datetime
        from Dash.Users import Get as GetUser
        from Dash.LocalStorage import SetProperties

        user_data = GetUser(
            user_email_to_get=self.Params["email_to_term"],
            dash_context=self.DashContext,
            request_params=self.Params
        )

        properties = {
            "terminated": True,
            "terminated_on": datetime.now().isoformat(),
            "terminated_by": self.User["email"] if self.User and self.User.get("email") else ""
        }

        if not user_data["last_name"].endswith("(Terminated)"):
            # Do this here so we don't have to keep track of this on any given view of the front end.
            # It doesn't hurt to do it here, since we won't be renaming them moving forward.
            properties["last_name"] = f"{user_data['last_name']} (Terminated)"

        if self._on_termination_callback:
            self._on_termination_callback(user_data)

        return self.SetResponse(SetProperties(
            dash_context=self.DashContext,
            store_path="users",
            obj_id=self.Params["email_to_term"],
            properties=properties
        ))

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

        # Ideally, the response gets passed in as a param, but
        # don't want any contexts to break, so this is a workaround
        self._pre_init_callback_response = response

        additional = self._on_init_callback()

        self._pre_init_callback_response = None

        for key in additional:
            response["init"][key] = additional[key]

        if self.AnalogContext:
            response["analog_context"] = self.AnalogContext
            response["dash_context"] = self.DashContext

        try:
            response.update(self.AnalogContext)
        except:
            pass

        return response

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
