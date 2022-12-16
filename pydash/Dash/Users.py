#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
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

    def Reset(self):
        email = str(self.request_params.get("email")).strip().lower()

        if "@" not in email:
            return {"error": "Enter a valid email address."}

        if self.dash_context.get("user_email_domain") and email.split("@")[-1] != self.dash_context["user_email_domain"]:
            from Dash import AdminEmails

            if email not in AdminEmails:
                from Dash.Utils import ClientAlert

                raise ClientAlert("Unauthorized")  # Keep it vague intentionally

        from json import dumps
        from random import randint
        from datetime import datetime
        from Dash.Utils import SendEmail
        from base64 import urlsafe_b64encode

        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)
        user_reset_root = os.path.join(user_root, "reset_requests")
        account_exists = True

        if not os.path.exists(user_root):
            self.validate_dash_guide_account_creation(email)

            os.makedirs(user_root)

            account_exists = False

        os.makedirs(user_reset_root, exist_ok=True)

        request_token = randint(10000000, 99999999)
        now = datetime.now()

        uri_data = {
            "email": email,
            "time": now.isoformat(),
            "request_token": request_token,
        }

        uri_str = dumps(uri_data)
        uri_data_64 = urlsafe_b64encode(uri_str.encode()).decode().strip()
        reset_path = os.path.join(user_reset_root, uri_data_64)

        open(reset_path, "w").write("")

        return_data = {
            "email": email,
            "t": uri_data_64
        }

        link = f"https://{self.dash_context['domain']}/Users?f=r&t={uri_data_64}"
        body_text = f"Use <a href='{link}'>this link</a> to reset the password for your account."

        if account_exists:
            subject = f"Reset Your {self.dash_context['display_name']} Account: {email}"
        else:
            subject = f"Create Your {self.dash_context['display_name']} Account: {email}"

        SendEmail(
            subject=subject,
            notify_email_list=[email],
            msg=body_text,
            sender_email=self.dash_context.get("admin_from_email"),
            sender_name=(self.dash_context.get("code_copyright_text") or self.dash_context.get("display_name"))
        )

        return_data["success"] = True

        return return_data

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

    def Login(self):
        validation = self.ValidateCredentials(return_login_dict=True)

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

    def ValidateCredentials(self, email="", password="", return_login_dict=False):
        email = (email or self.request_params.get("email")).lower().strip()
        password = (password or self.request_params.get("pass")).strip()

        if not email or not password:
            if return_login_dict:
                return {
                    "error": "Invalid login credentials x1943",
                    "_error": f"email: {email}"
                }

            return False

        user_root = os.path.join(self.UsersPath, email)
        pass_path = os.path.join(user_root, "phash")

        if not os.path.exists(pass_path):
            if return_login_dict:
                return {
                    "error": "Account does not exist x7832",
                    "_error": f"password path: {pass_path}"
                }

            return False

        from passlib.apps import custom_app_context as pwd_context

        hashed_password = open(pass_path, "r").read()
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

    def GetUserData(self, user_email):
        # Andrew - I wanted to expose this function externally and
        # changed the name I didn't have time to see if it would
        # break anything to get rid of the snake case variation

        return self.get_user_info(user_email)

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

    def validate_dash_guide_account_creation(self, email):
        if self.dash_context["domain"] != "dash.guide":
            return

        from Dash.LocalStorage import GetPrivKey

        auth_key = GetPrivKey("dash_guide_new_account_auth_key", is_json=False)

        if self.request_params.get(auth_key):
            return

        from Dash.Utils import SendEmail, ClientAlert

        link = f"https://{self.dash_context['domain']}/Users?f=reset&email={email}&{auth_key}=true"

        SendEmail(
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

    def get_user_info(self, email):
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
                obj_id=email,
            )
        else:
            from Dash.LocalStorage import New

            user_data = New(
                dash_context=self.dash_context,
                store_path="users",
                additional_data={"email": email},
                obj_id=email,
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
        users_root = os.path.join(self.dash_context["srv_path_local"], "users/")

        for user_email in os.listdir(users_root):
            try:
                team[user_email] = self.get_user_info(user_email)

            # In cases where a specific user's data is corrupted etc, we don't
            # want that to prevent everyone else from logging in etc
            except Exception as e:
                from Dash.Utils import SendEmail

                team[user_email] = {"error": e}

                SendEmail(
                    subject="Dash Error - Users.get_team()",
                    msg=f"Failed to get user info for {user_email}, data may be corrupted",
                    error=e,
                    sender_email=self.dash_context.get("admin_from_email"),
                    sender_name=(self.dash_context.get("code_copyright_text") or self.dash_context.get("display_name"))
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


def GetUserDataRoot(user_email_to_get, request_params={}, dash_context={}):
    return "/".join(GetUserDataPath(user_email_to_get, request_params, dash_context).split("/")[:-1]) + "/"


def GetUserDataPath(user_email_to_get, request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetUserDataPath(user_email_to_get)


def Get(user_email_to_get, request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetUserData(user_email_to_get)


def GetByToken(user_token, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Validate(user_token)


def GetAll(request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetAll()


def ValidateCredentials(email, password, return_login_dict=False, request_params={}, dash_context={}):
    return Users(request_params, dash_context).ValidateCredentials(email, password, return_login_dict)
