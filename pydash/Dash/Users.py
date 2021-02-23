#!/usr/bin/python

import datetime
import json
import os
import traceback

# from Dash.Paths import server_paths
from Dash import LocalStorage
from Dash.Utils import Utils
from Dash import PackageContext as Context

class Users:
    def __init__(self, params, dash_context=None):
        self.data = params
        self.dash_context = dash_context or Context.Get(params["asset_path"])

    @property
    def UsersPath(self):
        return os.path.join(
            self.dash_context["srv_path_local"],
            "users/"
        )

    def Reset(self):
        email = str(self.data.get("email")).strip().lower()

        if "@" not in email:
            return {"error": "Enter a valid email address."}

        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)
        user_reset_root = os.path.join(user_root, "reset_requests")
        account_exists = True

        if not os.path.exists(user_root):
            os.makedirs(user_root)
            account_exists = False

        os.makedirs(user_reset_root, exist_ok=True)

        import random
        import base64

        request_token = random.randint(10000000, 99999999)
        now = datetime.datetime.now()

        uri_data = {
            "email": email,
            "time": now.isoformat(),
            "request_token": request_token,
        }

        uri_str = json.dumps(uri_data)
        uri_data_64 = base64.urlsafe_b64encode(uri_str.encode()).decode().strip()
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
        uri_data_64 = self.data.get("t")

        if not uri_data_64:
            return {"error": "Invalid request token x3728"}

        import dateutil.parser as date_parser
        import random
        from passlib.apps import custom_app_context as pwd_context

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

        timestamp = date_parser.parse(uri_data["time"])
        seconds_since = (datetime.datetime.now() - timestamp).total_seconds()
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

        characters = (
            "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$"
        )
        new_password = ""

        for i in range(10):
            new_password += random.choice(characters)

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

        # return_data = {"new_password": new_password}

        os.remove(reset_path)

        return "\n".join(html)

    def UpdatePassword(self):
        user = self.ValidateUser()

        if not user:
            return {"error": "Invalid User - x73894"}

        new_password = self.data.get("p")

        # return_data = {
        #     "user": user,
        #     "new_password": new_password,
        #     "email": user["email"],
        # }

        if not new_password or len(new_password) < 5:
            return {"error": "Select a password with at least 6 characters - x72378"}

        from passlib.apps import custom_app_context as pwd_context

        hashed_password = pwd_context.hash(new_password)
        user_root = os.path.join(self.UsersPath, user["email"])
        pass_path = os.path.join(user_root, "phash")

        open(pass_path, "w").write(hashed_password)

        return_data = {"updated": True}

        return return_data

    def decode_base64(self, data, altchars=b"+/"):
        """Decode base64, padding being optional.

        :param altchars: (optional, default=b"+/")
        :param data: Base64 data as an ASCII byte string
        :returns: The decoded byte string.

        """
        import base64
        import re

        data = re.sub(rb"[^a-zA-Z0-9%s]+" % altchars, b"", data)  # normalize
        missing_padding = len(data) % 4

        if missing_padding:
            data += b"=" * (4 - missing_padding)

        try:
            return base64.b64decode(data, altchars)
        except:
            raise Exception(f"Parse error x32489\n{traceback.format_exc()}")
            # return None

    def Login(self):
        email = self.data.get("email").lower().strip()
        password = self.data.get("pass").strip()

        if not email or not password:
            return {"error": "Invalid login credentials x1943"}

        # raise Exception(self.dash_context["srv_path_local"])

        user_root = os.path.join(self.UsersPath, email)
        sessions_path = os.path.join(user_root, "sessions")
        pass_path = os.path.join(user_root, "phash")

        if not os.path.exists(pass_path):
            return {"error": "Account does not exist x7832 | PP: " + pass_path}

        from passlib.apps import custom_app_context as pwd_context
        import base64

        hashed_password = open(pass_path, "r").read()
        password_correct = pwd_context.verify(password, hashed_password)

        if not password_correct:
            return {
                "error": "Incorrect login information",
                "h": hashed_password,
                "p": password,
            }

        if not os.path.exists(sessions_path):
            os.makedirs(sessions_path)

        token = f"{os.environ['HTTP_USER_AGENT']}_|_{email}"

        session_data = {
            "HTTP_USER_AGENT": os.environ["HTTP_USER_AGENT"],
            "REMOTE_ADDR": os.environ["REMOTE_ADDR"],
            "email": email,
            "token": token,
            "time": datetime.datetime.now().isoformat(),
        }

        token = base64.urlsafe_b64encode(token.encode("ascii")).decode()
        token_path = os.path.join(sessions_path, token)

        open(token_path, "w").write(json.dumps(session_data))

        return_data = {"token": token, "user": self.get_user_info(email)}

        return return_data

    def get_user_info(self, email):
        email = email.lower().strip()

        if type(email) == bytes:
            email = email.decode()

        user_data_path = LocalStorage.GetRecordPath(
            dash_context=self.dash_context,
            store_path="users",
            obj_id=email,
        )

        # raise Exception(">> " + user_data_path)

        if not Utils.Global.RequestUser:
            Utils.Global.RequestUser = {}
            Utils.Global.RequestUser["email"] = email

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

    def ValidateUser(self):
        response = self.Validate()

        if response.get("user"):
            return response.get("user")
        else:
            return None

    def Validate(self):
        token_str = self.data.get("token")

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

        return return_data

    def get_token_data(self, token):
        import base64

        # token_data = None
        # padding_retry = False

        for x in range(3):
            try:
                token_data = base64.urlsafe_b64decode(token)
                return token, token_data
            except:
                error = traceback.format_exc().lower()

                if "incorrect padding" in error:
                    pass
                    # padding_retry = True
                else:
                    # self.set_return_data({"error": error, "token": token})
                    return None, None

            token += "="

        # self.set_return_data({"error": "Failed to validate user. Error x8329"})
        return None, None
