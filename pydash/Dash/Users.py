#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class Users:
    def __init__(self, request_params={}, dash_context={}):
        self.request_params = request_params
        self._dash_context = dash_context

        if not self.request_params or not self._dash_context:
            from Dash.Utils import Memory

            if not self.request_params and Memory.Global.RequestData:
                self.request_params = Memory.Global.RequestData

            if not self._dash_context and Memory.Global.Context:
                self._dash_context = Memory.Global.Context

    @property
    def UsersPath(self):
        return os.path.join(self.dash_context["srv_path_local"], "users/")

    @property
    def dash_context(self):
        if not self._dash_context:
            if not self.request_params or not self.request_params.get("asset_path"):
                raise Exception("Error: (Users) No access to Dash Context asset path (no request params)")

            from Dash.PackageContext import Get

            self._dash_context = Get(self.request_params["asset_path"])

        return self._dash_context

    def Reset(self, user_email_domain_bypass_emails=[]):
        email = str(self.request_params.get("email")).strip().lower()

        if "@" not in email:
            return {"error": "Enter a valid email address."}

        self.validate_reset(email, user_email_domain_bypass_emails)

        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)

        if not os.path.exists(user_root):
            self.validate_dash_guide_account_creation(email)

            from validate_email_address import validate_email

            # Make sure it's a real, existing email address that actually exists before
            # we create a user for an email address that was simply misspelled, etc
            if not validate_email(email, verify=True):
                from Dash.Utils import ClientAlert

                raise ClientAlert("Invalid email address.\nPlease double-check and try again.")

            os.makedirs(user_root)

            account_exists = False
        else:
            account_exists = True

        from json import dumps
        from random import randint
        from datetime import datetime
        from base64 import urlsafe_b64encode

        user_reset_root = os.path.join(user_root, "reset_requests")

        os.makedirs(user_reset_root, exist_ok=True)

        uri_data_64 = urlsafe_b64encode(dumps({
            "email": email,
            "time": datetime.now().isoformat(),
            "request_token": randint(10000000, 99999999)
        }).encode()).decode().strip()

        open(os.path.join(user_reset_root, uri_data_64), "w").write("")  # Why not Dash.LocalStorage.Write?

        user_data = self.get_user_info(email)  # Calling this will ensure we create default data for new user right off the bat
        link = f"https://{self.dash_context['domain']}/Users?f=r&t={uri_data_64}"
        body_text = f"Use <a href='{link}'>this link</a> to "

        if account_exists:
            subject = f"Reset Your {self.dash_context['display_name']} Account: {email}"

            body_text += "reset the password for your account and get a new, temporary password."
        else:
            subject = f"Create Your {self.dash_context['display_name']} Account: {email}"

            body_text += "get a temporary password for your account."

        body_text += "\nOnce signed in, please change your password."

        self.send_email(
            subject=subject,
            msg=body_text,
            notify_email_list=[email]
        )

        return {
            "email": email,
            "t": uri_data_64,
            "user": user_data,
            "success": True
        }

    def ResetResponse(self):
        uri_data_64 = self.request_params.get("t")

        if not uri_data_64:
            return {
                "error": "Invalid request token x3728",
                "_error": f"uri_data_64: {uri_data_64}"
            }

        uri_str = self.decode_base64(uri_data_64.encode())

        if not uri_str:
            return

        from json import loads

        uri_data = loads(uri_str)
        email = uri_data["email"]
        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)
        user_reset_root = os.path.join(user_root, "reset_requests")
        reset_path = os.path.join(user_reset_root, uri_data_64)

        if not os.path.exists(reset_path):
            return {
                "error": "Invalid request token x8923",
                "_error": f"reset path: {reset_path}"
            }

        from random import choice
        from datetime import datetime
        from dateutil.parser import parse
        from passlib.apps import custom_app_context as pwd_context

        timestamp = parse(uri_data["time"])
        seconds_since = (datetime.now() - timestamp).total_seconds()
        minutes_since = int(seconds_since / 60)

        if minutes_since > 5:
            html = [
                "<!DOCTYPE html>",
                """<html lang='en-us'>""",
                """  <head>""",
                """    <meta charset='utf-8'>""",
                """    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>""",
                """<title>Your password reset link has expired!</title>""",
                """</head>""",
                """<body style='font-family: sans-serif;'>""",
            ]

            link = "<a href='https://" + self.dash_context["domain"]
            link += "'>https://" + self.dash_context["domain"] + "</a>"

            html.append(
                f"""Your password reset link has expired. Visit {link} to request a new reset link.<br><br>"""
            )

            html.append("""</body>""")
            html.append("""</html>""")

            return "\n".join(html)

        new_password = ""
        characters = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$"

        for i in range(10):
            new_password += choice(characters)

        hashed_password = pwd_context.hash(new_password)
        pass_path = os.path.join(user_root, "phash")

        open(pass_path, "w").write(hashed_password)

        html = [
            "<!DOCTYPE html>",
            """<html lang='en-us'>""",
            """  <head>""",
            """    <meta charset='utf-8'>""",
            """    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>""",
            """<title>Password was set!</title>""",
            """</head>""",
            """<body style='font-family: sans-serif;'>""",
        ]

        link = "<a href='https://" + self.dash_context["domain"]
        link += "'>https://" + self.dash_context["domain"] + "</a>"

        html.append(f"""Hello, {email}, <br><br>""")
        html.append(f"""You've been issued a new temporary password that can be used to log in to {link}<br><br>""")
        html.append("""Change it once you log in.<br><br>""")
        html.append(f"""<b>Temporary password: </b>{new_password}""")
        html.append("""</body>""")
        html.append("""</html>""")

        os.remove(reset_path)

        return "\n".join(html)

    def UpdatePassword(self):
        user = self.ValidateUser()

        if not user:
            return {
                "error": "Invalid User - x73894",
                "_error": f"user: {user}"
            }

        new_password = (self.request_params.get("p") or "").strip()

        # If updating someone else's password from the client, there will be an 'email' param, otherwise, update the requesting user's password
        email = (self.request_params.get("email") or "").lower().strip() or user["email"].lower().strip()

        if not new_password or len(new_password) < 5:
            return {"error": "Select a password with at least 6 characters - x72378"}

        from passlib.apps import custom_app_context as pwd_context

        hashed_password = pwd_context.hash(new_password)
        user_root = os.path.join(self.UsersPath, email)
        pass_path = os.path.join(user_root, "phash")

        open(pass_path, "w").write(hashed_password)

        return {
            "updated": True,
            "user_email": email
        }

    def UpdatePIN(self, email="", pin="", token_validation=True):
        email = (email or self.request_params.get("email") or "").lower().strip()
        pin = str(pin or self.request_params.get("pin") or "").strip()

        if not email:
            return {"error": f"Missing email: {email}"}

        if not pin or len(pin) != 4 or not pin.isdigit():
            return {"error": f"Invalid pin format: {pin}"}

        if token_validation and "token_validation" in self.request_params:
            token_validation = self.request_params["token_validation"]

        if token_validation:
            user = self.ValidateUser()

            if not user:
                return {
                    "error": "Invalid User - x73894",
                    "_error": f"user: {user}"
                }
        else:  # For when validation needs to happen outside of this function and/or when the token will not match the email
            user_data_path = self.GetUserDataPath(email)

            if not user_data_path or not os.path.exists(user_data_path):
                return {"error": f"User does not exist: {user_data_path}"}

        from passlib.apps import custom_app_context as pwd_context

        open(os.path.join(self.UsersPath, email, "pin_hash"), "w").write(pwd_context.hash(pin))

        return {
            "updated": True,
            "user_email": email
        }

    def Login(self, use_pin=False):
        validation = self.ValidateCredentials(use_pin=use_pin, return_login_dict=True)

        if validation.get("error"):
            return validation

        from json import dumps
        from datetime import datetime
        from base64 import urlsafe_b64encode

        sessions_path = os.path.join(validation["user_root"], "sessions")

        os.makedirs(sessions_path, exist_ok=True)

        token = f"{os.environ['HTTP_USER_AGENT']}_|_{validation['email']}"

        session_data = {
            "HTTP_USER_AGENT": os.environ["HTTP_USER_AGENT"],
            "REMOTE_ADDR": os.environ["REMOTE_ADDR"],
            "email": validation["email"],
            "token": token,
            "time": datetime.now().isoformat()
        }

        token = urlsafe_b64encode(token.encode("ascii")).decode()
        token_path = os.path.join(sessions_path, token)

        open(token_path, "w").write(dumps(session_data))

        return {
            "token": token,
            "user": self.get_user_info(validation["email"]),
            "init": self.get_user_init(validation["email"])
        }

    def ValidateCredentials(self, email="", password="", use_pin=False, return_login_dict=False):
        email = (email or self.request_params.get("email") or "").lower().strip()
        password = (password or self.request_params.get("pass") or self.request_params.get("password") or "").strip()

        if use_pin and not password:
            password = str(self.request_params.get("pin") or "").strip()

            if not password or len(password) != 4 or not password.isdigit():
                return {"error": f"Invalid pin format: {password}"}

        if not email or not password:
            if return_login_dict:
                return {
                    "error": "Invalid login credentials x1943",
                    "_error": f"email: {email}"
                }

            return False

        user_data = self.get_user_info(email, create_if_missing=False)

        # Don't allow terminated users to login
        if user_data.get("terminated"):
            from Dash.Utils import ClientAlert

            raise ClientAlert("Unauthorized")  # Keep it vague intentionally

        user_root = os.path.join(self.UsersPath, email)
        pass_path = os.path.join(user_root, "pin_hash" if use_pin else "phash")

        if not os.path.exists(user_root if use_pin else pass_path):
            if return_login_dict:
                return {
                    "error": "Account does not exist x7832",
                    "_error": f"user root: {user_root}" if use_pin else f"password path: {pass_path}"
                }

            return False

        if use_pin and not os.path.exists(pass_path):
            if return_login_dict:
                return {
                    "error": "PIN has not yet been setup",
                    "_error": f"pin path: {pass_path}"
                }

            return False

        from passlib.apps import custom_app_context as pwd_context

        hashed_password = open(pass_path).read()
        password_correct = pwd_context.verify(password, hashed_password)

        if not password_correct:
            if return_login_dict:
                return {
                    "error": "Incorrect login information",
                    "_error": f"email: {email}",
                    # "h": hashed_password,
                    "p": password
                }

            return False

        if return_login_dict:
            return {
                "email": email,
                "user_root": user_root
            }

        return True

    def GetAll(self):
        return self.get_team()

    def GetUserDataPath(self, user_email):
        from Dash.LocalStorage import GetRecordPath

        email = user_email.lower().strip()

        if type(email) == bytes:
            email = email.decode()

        return GetRecordPath(
            dash_context=self.dash_context,
            store_path="users",
            obj_id=email
        )

    def GetUserData(self, user_email, create_if_missing=True):
        # Andrew - I wanted to expose this function externally and
        # changed the name I didn't have time to see if it would
        # break anything to get rid of the snake case variation

        return self.get_user_info(user_email, create_if_missing)

    def ValidateUser(self):
        response = self.Validate()

        if response.get("user"):
            return response.get("user")
        else:
            return None

    def Validate(self, token=None):
        token_str = token or self.request_params.get("token")

        if not token_str:
            return {"error": "Missing token"}

        token_str, token_data = self.get_token_data(token_str)

        if not token_data:
            return {
                "error": "Invalid token",
                "_error": f"token str: {token_str}"
            }

        if type(token_data) == str:
            token_data = token_data.encode()

        email = token_data.split(b"_|_")[-1].strip()
        # HTTP_USER_AGENT = token_data.split(b"_|_")[0].strip()

        user_root = os.path.join(self.UsersPath, email.decode())
        sessions_path = os.path.join(user_root, "sessions")
        token_path = os.path.join(sessions_path, token_str)

        if not os.path.exists(token_path):
            return {
                "error": "Invalid Login x7283",
                "_error": f"token path: {token_path}",
                "token_path": token_path
            }

        return_data = {"valid_login": True, "user": self.get_user_info(email)}

        if self.request_params.get("init"):
            # Return additional information for this user
            return_data["init"] = self.get_user_init(email)

        return return_data

    # Wrapper
    def send_email(self, subject="", msg="", notify_email_list=[], error=""):
        from Dash.Utils import SendEmail

        bcc_email_list = []
        strict_notify = False

        try:
            asset_path = self.dash_context.get("asset_path")
            sender_name = (self.dash_context.get("code_copyright_text") or self.dash_context.get("display_name"))
            sender_email = self.dash_context.get("admin_from_email")
        except:
            asset_path = ""
            sender_name = ""
            sender_email = ""

        if asset_path:
            from Dash import PersonalContexts

            for email in PersonalContexts:
                if asset_path in PersonalContexts[email]["asset_paths"]:
                    strict_notify = True

                    if notify_email_list:
                        bcc_email_list.append(email)

                    elif email not in notify_email_list:
                        notify_email_list.append(email)

                    break

        SendEmail(
            subject=subject,
            msg=msg,
            error=error,
            notify_email_list=notify_email_list,
            strict_notify=strict_notify,
            sender_email=sender_email,
            sender_name=sender_name,
            bcc_email_list=bcc_email_list
        )

    def validate_reset(self, email, user_email_domain_bypass_emails=[]):
        # If an email domain has been specified, don't allow any emails outside of that domain to create an account
        if self.dash_context.get("user_email_domain") and email.split("@")[-1] != self.dash_context["user_email_domain"]:
            # Unless they're added to the bypass list
            if email not in user_email_domain_bypass_emails:
                from Dash import AdminEmails

                # Unless it's one of us
                if email not in AdminEmails:
                    from Dash.Utils import ClientAlert

                    raise ClientAlert("Unauthorized")  # Keep it vague intentionally

        user_data = self.get_user_info(email, create_if_missing=False)

        # Don't allow terminated users to reset their password
        if user_data.get("terminated"):
            from Dash.Utils import ClientAlert

            raise ClientAlert("Unauthorized")  # Keep it vague intentionally

    def validate_dash_guide_account_creation(self, email):
        if self.dash_context["domain"] != "dash.guide":
            return

        from Dash.LocalStorage import GetPrivKey

        auth_key = GetPrivKey("dash_guide_new_account_auth_key", is_json=False)

        if self.request_params.get(auth_key):
            return

        from Dash.Utils import ClientAlert

        link = f"https://{self.dash_context['domain']}/Users?f=reset&email={email}&{auth_key}=true"

        self.send_email(
            subject="Dash Guide - New User Request",
            msg=(
                f"\n'{email}' has requested to create an account in Dash Guide.\n\n"
                f"If this is authorized, use <a href='{link}'>this link</a> "
                "to send the new user the standard reset password email."
            )
        )

        raise ClientAlert(
            "Your request to create an account has been sent to admin. If approved, "
            "you'll receive an email with a link to get a temporary password to log in."
        )

    def decode_base64(self, data, altchars=b"+/"):
        """
        Decode base64, padding being optional.

        :param bytes data: Base64 data as an ASCII byte string
        :param bytes altchars: (optional, default=b"+/")
        :return: The decoded byte string.
        :rtype: str
        """

        from re import sub
        from base64 import b64decode

        data = sub(rb"[^a-zA-Z0-9%s]+" % altchars, b"", data)  # normalize
        missing_padding = len(data) % 4

        if missing_padding:
            data += b"=" * (4 - missing_padding)

        try:
            return b64decode(data, altchars)
        except:
            from traceback import format_exc

            raise Exception(f"Parse error x32489\n{format_exc()}")

    # create_if_missing should probably default to False, but don't want to break anything
    def get_user_info(self, email, create_if_missing=True):
        from Dash.Utils import Memory

        email = email.lower().strip()

        if type(email) == bytes:
            email = email.decode()

        user_data_path = self.GetUserDataPath(email)

        if not Memory.Global.RequestUser:
            Memory.Global.RequestUser = {"email": email}

        if os.path.exists(user_data_path):
            from Dash.LocalStorage import GetData

            user_data = GetData(
                dash_context=self.dash_context,
                store_path="users",
                obj_id=email
            )

            user_data["has_pin"] = os.path.exists(user_data_path.replace("usr.data", "pin_hash"))
        else:
            if not create_if_missing:
                return {}

            from Dash.LocalStorage import New

            user_data = New(
                dash_context=self.dash_context,
                store_path="users",
                additional_data={"email": email},
                obj_id=email
            )

        return self.set_display_name(user_data)

    def get_user_init(self, email):
        if type(email) == bytes:
            email = email.decode()

        team = self.get_team()

        return {
            "team": team,
            "team_sort": self.sort_team(team),
            "email": email
        }

    def sort_team(self, team):
        sortable = []
        sorted_emails = []

        for email in team:
            primary = team[email].get("display_name") or team[email].get("first_name") or email

            sortable.append([primary, email])

        sortable.sort()

        for item in sortable:
            sorted_emails.append(item[1])

        return sorted_emails

    # TODO - get rid of this code - it's been moved to Admin.py
    def get_team(self):
        team = {}
        users_root = os.path.join(self.dash_context["srv_path_local"], "users")

        for user_email in os.listdir(users_root):
            try:
                team[user_email] = self.get_user_info(user_email)

            # In cases where a specific user's data is corrupted etc, we don't
            # want that to prevent everyone else from logging in etc
            except Exception as e:
                # Ignore new users who haven't logged in yet by checking for the existence of the sessions folder.
                # Checking for the existence of that instead of the usr.data file is preferred in case usr.data may be corrupted.
                if os.path.exists(os.path.join(users_root, user_email, "sessions")):
                    team[user_email] = {"error": e}

                    self.send_email(
                        subject="Dash Error - Users.get_team()",
                        msg=f"Warning: Failed to get user info for {user_email}. If it's not a new user, data may be corrupted.",
                        error=e
                    )

        return team

    # At some point, we may want to actually permanently include this key in the user data,
    # which would also mean updating it anytime "first_name" and/or "last_name" are updated
    def set_display_name(self, user_data):
        if user_data.get("first_name") and user_data.get("last_name"):
            user_data["display_name"] = user_data["first_name"] + " " + user_data["last_name"]

        elif user_data.get("first_name"):
            user_data["display_name"] = user_data["first_name"]

        elif user_data.get("email"):
            user_data["display_name"] = user_data["email"]

        return user_data

    def get_token_data(self, token):
        from base64 import urlsafe_b64decode

        for x in range(3):
            try:
                token_data = urlsafe_b64decode(token)

                return token, token_data
            except:
                from traceback import format_exc

                error = format_exc().lower()

                if "incorrect padding" in error:
                    pass
                else:
                    return None, None

            token += "="

        return None, None


def Login(use_pin=False, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Login(use_pin)


def UpdatePassword(request_params={}, dash_context={}):
    return Users(request_params, dash_context).UpdatePassword()


def UpdatePIN(email="", pin="", token_validation=True, request_params={}, dash_context={}):
    return Users(request_params, dash_context).UpdatePIN(email, pin, token_validation)


def Validate(user_token=None, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Validate(user_token)


def ValidateCredentials(email, password, use_pin=False, return_login_dict=False, request_params={}, dash_context={}):
    return Users(request_params, dash_context).ValidateCredentials(email, password, use_pin, return_login_dict)


def GetAll(request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetAll()


def GetUserDataPath(user_email_to_get, request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetUserDataPath(user_email_to_get)


def GetUserData(user_email_to_get, request_params={}, dash_context={}, create_if_missing=True):
    return Users(request_params, dash_context).GetUserData(user_email_to_get, create_if_missing)


def Reset(request_params={}, dash_context={}, user_email_domain_bypass_emails=[]):
    return Users(request_params, dash_context).Reset(user_email_domain_bypass_emails)


def ResetResponse(request_params={}, dash_context={}):
    return Users(request_params, dash_context).ResetResponse()


# Wrapper
def GetUserDataRoot(user_email_to_get, request_params={}, dash_context={}):
    return "/".join(GetUserDataPath(user_email_to_get, request_params, dash_context).split("/")[:-1]) + "/"


# Deprecated, use Validate instead (same functionality, different name)
def GetByToken(user_token=None, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Validate(user_token)


# Deprecated, use GetUserData instead (same functionality, different name)
def Get(user_email_to_get, request_params={}, dash_context={}, create_if_missing=True):
    return Users(request_params, dash_context).GetUserData(user_email_to_get, create_if_missing)
