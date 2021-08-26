# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import json

from Dash.Utils import Utils
from datetime import datetime
from Dash import LocalStorage
from traceback import format_exc


class Users:
    def __init__(self, request_params, dash_context=None):
        self.request_params = request_params
        self.__dash_context = dash_context

    @property
    def UsersPath(self):
        return os.path.join(
            self.dash_context["srv_path_local"],
            "users/"
        )

    @property
    def dash_context(self):
        if self.__dash_context is None:
            if not self.request_params or not self.request_params.get("asset_path"):
                raise Exception("Error: (Users) No access to Dash Context asset path (no request params)")

            from Dash.PackageContext import Get

            self.__dash_context = Get(self.request_params["asset_path"])

        return self.__dash_context

    def Reset(self):
        email = str(self.request_params.get("email")).strip().lower()

        if "@" not in email:
            return {"error": "Enter a valid email address."}

        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)
        user_reset_root = os.path.join(user_root, "reset_requests")
        account_exists = True

        if not os.path.exists(user_root):
            os.makedirs(user_root)
            account_exists = False

        os.makedirs(user_reset_root, exist_ok=True)

        from random import randint
        from base64 import urlsafe_b64encode

        request_token = randint(10000000, 99999999)
        now = datetime.now()

        uri_data = {
            "email": email,
            "time": now.isoformat(),
            "request_token": request_token,
        }

        uri_str = json.dumps(uri_data)
        uri_data_64 = urlsafe_b64encode(uri_str.encode()).decode().strip()
        reset_path = os.path.join(user_reset_root, uri_data_64)

        open(reset_path, "w").write("")

        return_data = {"email": email, "t": uri_data_64}

        link = "https://" + self.dash_context["domain"] + "/Users?f=r&t=" + uri_data_64
        body_text = f"Use <a href='{link}'>this link</a> to reset the password for your account."
        subject = "Create Your " + self.dash_context["display_name"] + " Account: " + email

        if account_exists:
            subject = "Reset Your " + self.dash_context["display_name"] + " Account: " + email

        import Mail

        message = Mail.create(self.dash_context["admin_from_email"])
        message.set_sender_name("Reset Login <" + self.dash_context["admin_from_email"] + ">")

        message.add_recipient(f"{email.split('@')[0].strip().title()} <{email}>")
        message.add_bcc_recipient(self.dash_context["admin_from_email"])

        message.set_subject(subject)
        message.set_body_html(body_text)
        message.send()

        return_data["success"] = True

        return return_data

    def ResetResponse(self):
        uri_data_64 = self.request_params.get("t")

        if not uri_data_64:
            return {"error": "Invalid request token x3728"}

        uri_str = self.decode_base64(uri_data_64.encode())

        if not uri_str:
            return

        uri_data = json.loads(uri_str)
        email = uri_data["email"]
        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)
        user_reset_root = os.path.join(user_root, "reset_requests")
        reset_path = os.path.join(user_reset_root, uri_data_64)

        if not os.path.exists(reset_path):
            return {"error": "Invalid request token x8923"}

        from random import choice
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
        html.append(
            f"""You've been issued a new temporary password that can be used to log in to {link}<br><br>"""
        )
        html.append("""Change it once you log in.<br><br>""")
        html.append(f"""<b>Temporary password: </b>{new_password}""")
        html.append("""</body>""")
        html.append("""</html>""")

        os.remove(reset_path)

        return "\n".join(html)

    def UpdatePassword(self):
        user = self.ValidateUser()

        if not user:
            return {"error": "Invalid User - x73894"}

        new_password = self.request_params.get("p")

        if not new_password or len(new_password) < 5:
            return {"error": "Select a password with at least 6 characters - x72378"}

        from passlib.apps import custom_app_context as pwd_context

        hashed_password = pwd_context.hash(new_password)
        user_root = os.path.join(self.UsersPath, user["email"])
        pass_path = os.path.join(user_root, "phash")

        open(pass_path, "w").write(hashed_password)

        return_data = {"updated": True}

        return return_data

    def Login(self):
        email = self.request_params.get("email").lower().strip()
        password = self.request_params.get("pass").strip()

        if not email or not password:
            return {"error": "Invalid login credentials x1943"}

        user_root = os.path.join(self.UsersPath, email)
        sessions_path = os.path.join(user_root, "sessions")
        pass_path = os.path.join(user_root, "phash")

        if not os.path.exists(pass_path):
            return {"error": "Account does not exist x7832 | PP: " + pass_path}

        from passlib.apps import custom_app_context as pwd_context

        hashed_password = open(pass_path, "r").read()
        password_correct = pwd_context.verify(password, hashed_password)

        if not password_correct:
            return {
                "error": "Incorrect login information",
                "h": hashed_password,
                "p": password,
            }

        from base64 import urlsafe_b64encode

        os.makedirs(sessions_path, exist_ok=True)

        token = f"{os.environ['HTTP_USER_AGENT']}_|_{email}"

        session_data = {
            "HTTP_USER_AGENT": os.environ["HTTP_USER_AGENT"],
            "REMOTE_ADDR": os.environ["REMOTE_ADDR"],
            "email": email,
            "token": token,
            "time": datetime.now().isoformat(),
        }

        token = urlsafe_b64encode(token.encode("ascii")).decode()
        token_path = os.path.join(sessions_path, token)

        open(token_path, "w").write(json.dumps(session_data))

        return {
            "token": token,
            "user": self.get_user_info(email),
            "init": self.get_user_init(email)
        }

    def GetAll(self):
        return self.get_team()

    def GetUserDataPath(self, user_email):
        email = user_email.lower().strip()

        if type(email) == bytes:
            email = email.decode()

        return LocalStorage.GetRecordPath(
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
            return {"error": "Invalid token"}

        if type(token_data) == str:
            token_data = token_data.encode()

        email = token_data.split(b"_|_")[-1].strip()
        # HTTP_USER_AGENT = token_data.split(b"_|_")[0].strip()

        user_root = os.path.join(self.UsersPath, email.decode())
        sessions_path = os.path.join(user_root, "sessions")
        token_path = os.path.join(sessions_path, token_str)

        if not os.path.exists(token_path):
            return {"error": "Invalid Login x7283", "token_path": token_path}

        return_data = {"valid_login": True, "user": self.get_user_info(email)}

        if self.request_params.get("init"):
            # Return additional information for this user
            return_data["init"] = self.get_user_init(email)

        return return_data

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
            raise Exception(f"Parse error x32489\n{format_exc()}")

    def get_user_info(self, email):
        email = email.lower().strip()

        if type(email) == bytes:
            email = email.decode()

        user_data_path = self.GetUserDataPath(email)

        if not Utils.Global.RequestUser:
            Utils.Global.RequestUser = {"email": email}

        if os.path.exists(user_data_path):
            user_data = LocalStorage.GetData(
                dash_context=self.dash_context,
                store_path="users",
                obj_id=email,
            )

        else:
            user_data = LocalStorage.New(
                dash_context=self.dash_context,
                store_path="users",
                additional_data={"email": email},
                obj_id=email,
            )

        return user_data

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
        sorted_emails = []
        sortable = []

        for email in team:
            primary = team[email].get("display_name") or team[email].get("first_name") or email
            sortable.append([primary, email])

        sortable.sort()

        for item in sortable:
            sorted_emails.append(item[1])

        return sorted_emails

    def get_team(self):
        # TODO - get rid of this code - it's been moved to Admin.py

        team = {}
        users_root = os.path.join(self.dash_context["srv_path_local"], "users/")

        for user_email in os.listdir(users_root):
            user_path = os.path.join(users_root, user_email, "usr.data")
            user_data = LocalStorage.Read(user_path)

            if user_data.get("first_name") and user_data.get("last_name"):
                user_data["display_name"] = user_data["first_name"] + " "
                user_data["display_name"] += user_data["last_name"]
            elif user_data.get("first_name"):
                user_data["display_name"] = user_data["first_name"]
            else:
                user_data["display_name"] = user_email

            team[user_email] = user_data

        return team

    def get_token_data(self, token):
        from base64 import urlsafe_b64decode

        for x in range(3):
            try:
                token_data = urlsafe_b64decode(token)

                return token, token_data
            except:
                error = format_exc().lower()

                if "incorrect padding" in error:
                    pass
                else:
                    return None, None

            token += "="

        return None, None


def GetUserDataRoot(user_email_to_get, request_params=None, dash_context=None):
    data_path = GetUserDataPath(user_email_to_get, request_params, dash_context)

    return "/".join(data_path.split("/")[:-1]) + "/"


def GetUserDataPath(user_email_to_get, request_params=None, dash_context=None):
    return Users(
        request_params or Utils.Global.RequestData,
        dash_context or Utils.Global.Context
    ).GetUserDataPath(user_email_to_get)


def Get(user_email_to_get, request_params=None, dash_context=None):
    # This function allows an admin to quickly pull a user (for the moment, everyone is an admin)

    return Users(
        request_params or Utils.Global.RequestData,
        dash_context or Utils.Global.Context
    ).GetUserData(user_email_to_get)


def GetByToken(user_token, request_params=None, dash_context=None):
    # This function allows you to return a User object based on a valid token

    return Users(
        request_params or Utils.Global.RequestData,
        dash_context or Utils.Global.Context
    ).Validate(user_token)


def GetAll(request_params=None, dash_context=None):
    return Users(
        request_params or Utils.Global.RequestData,
        dash_context or Utils.Global.Context
    ).GetAll()
