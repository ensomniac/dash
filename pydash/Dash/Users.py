#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class Users:
    _analog_context: dict
    _dash_global: callable

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
            if not hasattr(self, "_analog_context"):
                # Explicitly evaluate analog_context to trigger its logic, since it could populate _dash_context
                _ = self.analog_context

            if not self._dash_context:
                if (
                    self.dash_global
                    and hasattr(self.dash_global, "Context")
                    and self.dash_global.Context
                ):
                    self._dash_context = self.dash_global.Context
                else:
                    if not self.request_params or not self.request_params.get("asset_path"):
                        raise Exception("Error: (Users) No access to Dash Context asset path (no request params)")

                    from Dash.PackageContext import Get

                    self._dash_context = Get(self.request_params["asset_path"])

        return self._dash_context

    @property
    def analog_context(self):
        if not hasattr(self, "_analog_context"):
            if (
                self.dash_global
                and hasattr(self.dash_global, "AnalogContext")
                and self.dash_global.AnalogContext
            ):
                self._analog_context = self.dash_global.AnalogContext
            else:
                from Dash.PackageContext import GetAnalogIndex

                self._analog_context = {}

                try:
                    analog_index = GetAnalogIndex()

                    if analog_index.get("dash_context"):
                        self._dash_context = analog_index["dash_context"]

                    if analog_index.get("analog_context"):
                        self._analog_context = analog_index["analog_context"]

                except KeyError:
                    pass

            # Expose access for older code without requiring adding support for this new context
            if self._dash_context:
                self._dash_context["analog_context"] = self._analog_context

        return self._analog_context

    @property
    def dash_global(self):
        if not hasattr(self, "_dash_global"):
            from Dash import __name__ as DashName

            self._dash_global = sys.modules[DashName]

        return self._dash_global

    def Reset(self, user_email_domain_bypass_emails=[], send_reset_email=True):
        email = str(self.request_params.get("email")).strip().lower()

        if "@" not in email:
            return {"error": "Enter a valid email address."}

        self.validate_reset(email, user_email_domain_bypass_emails)

        user_root = os.path.join(self.dash_context["srv_path_local"], "users", email)

        if not os.path.exists(user_root):
            self.validate_dash_guide_account_creation(email)
            self.validate_email_address(email)

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

        # Calling this will ensure we create default data for new user right off the bat
        user_data = self.get_user_info(email)

        if send_reset_email:
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
            "success": True,
            "reset_email_sent": send_reset_email
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
        link = f"<a href='https://{self.dash_context['domain']}'>https://{self.dash_context['domain']}</a>"

        if not os.path.exists(reset_path):
            from Dash.Utils import ClientAlert

            raise ClientAlert(f"Your password request has expired. Visit {link} to request a new reset link.")

        from random import choice
        from datetime import datetime
        from dateutil.parser import parse
        from passlib.apps import custom_app_context as pwd_context

        timestamp = parse(uri_data["time"])
        seconds_since = (datetime.now() - timestamp).total_seconds()
        minutes_since = int(seconds_since / 60)

        # This used to be 10 minutes, but on 1/24/25 Altona requested it be an hour,
        # and it seemed harmless to make that a global change. If this becomes a
        # security concern down the line, we can make that specific to Altona.
        if minutes_since > 60:
            return "\n".join([
                "<!DOCTYPE html>",
                """<html lang='en-us'>""",
                """  <head>""",
                """    <meta charset='utf-8'>""",
                """    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>""",
                """<title>Your password request has expired</title>""",
                """</head>""",
                """<body style='font-family: sans-serif;'>""",
                f"""Your password request has expired. Visit {link} to request a new reset link.<br><br>""",
                """</body>""",
                """</html>"""
            ])

        new_password = ""
        characters = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$"

        for i in range(10):
            new_password += choice(characters)

        hashed_password = pwd_context.hash(new_password)
        pass_path = os.path.join(user_root, "phash")

        open(pass_path, "w").write(hashed_password)

        return "\n".join([
            "<!DOCTYPE html>",
            """<html lang='en-us'>""",
            """  <head>""",
            """    <meta charset='utf-8'>""",
            """    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>""",
            """<title>Password was set!</title>""",
            """</head>""",
            """<body style='font-family: sans-serif;'>""",
            f"""Hello, {email}, <br><br>""",
            f"""You've been issued a new temporary password that can be used to log in to {link}<br><br>""",
            """Change it once you log in.<br><br>""",
            f"""<b>Temporary password: </b>{new_password}""",
            """</body>""",
            """</html>"""
        ])

    def UpdateEmail(self, return_logs=False):
        user = self.ValidateUser()

        if not user:
            return {
                "error": "Invalid User - x73894",
                "_error": f"user: {user}"
            }

        if not self.request_params.get("new_email"):
            return {"error": "Can't update email without a new email address"}

        new_email = str(self.request_params["new_email"]).strip().lower()

        self.validate_email_address(new_email)

        # If updating someone else's password from the client, there will
        # be an 'email' param, otherwise, update the requesting user's password
        old_email = (self.request_params.get("email") or "").lower().strip() or user["email"].lower().strip()

        old_email_root = os.path.join(self.dash_context["srv_path_local"], "users", old_email)
        new_email_root = os.path.join(self.dash_context["srv_path_local"], "users", new_email)

        if os.path.exists(new_email_root):
            from Dash.Utils import ClientAlert

            raise ClientAlert(
                "There's already an account with this email address.\n\nIf you believe "
                "this in error, please reach out to your manager or the dev team."
            )

        from shutil import copytree, rmtree
        from Dash.LocalStorage import DashLocalStorage

        copytree(old_email_root, new_email_root)

        ls = DashLocalStorage(dash_context=self.dash_context)

        logs = {
            new_email_root: ls.RecursivelyReplaceIDInRoot(
                root=new_email_root,
                old_id=old_email,
                new_id=new_email,
                indent_char="    "
            )
        }

        for filename in os.listdir(self.dash_context["srv_path_local"]):
            if "users" in filename:
                continue

            root = os.path.join(self.dash_context["srv_path_local"], filename)

            if not os.path.isdir(root):
                continue

            log = ls.RecursivelyReplaceIDInRoot(
                root=root,
                old_id=old_email,
                new_id=new_email,
                indent_char="    "
            )

            if len(log) > 1:
                logs[root] = log

        rmtree(old_email_root)

        self.analog_update_on_email_change(old_email, new_email)

        response = {
            "updated": True,
            "old_email": old_email,
            "new_email": new_email
        }

        if return_logs:
            response["logs"] = logs

        return response

    def UpdatePassword(self):
        user = self.ValidateUser()

        if not user:
            return {
                "error": "Invalid User - x73894",
                "_error": f"user: {user}"
            }

        new_password = (self.request_params.get("p") or "").strip()

        # If updating someone else's password from the client, there will
        # be an 'email' param, otherwise, update the requesting user's password
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
                    # "email": email,
                    # "user_root": user_root,
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

    def GetAll(self, include_order=False, order_by_last_name=False):
        users = self.get_team()

        if not include_order:
            return users

        return self.add_order_to_team(users, order_by_last_name)

    def GetUserDataPath(self, user_email):
        from Dash.LocalStorage import GetRecordPath

        email = user_email.lower().strip()

        if type(email) is bytes:
            email = email.decode()

        return GetRecordPath(
            dash_context=self.dash_context,
            store_path="users",
            obj_id=email
        )

    # Wrapper
    def GetUserDataRoot(self, user_email_to_get):
        return "/".join(self.GetUserDataPath(user_email_to_get).split("/")[:-1]) + "/"

    def GetUserData(self, user_email, create_if_missing=True):
        return self.get_user_info(user_email, create_if_missing)

    def ValidateUser(self):
        response = self.Validate()

        if response.get("user"):
            return response.get("user")

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

        if type(token_data) is str:
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

    def UploadUserImage(self):
        from Dash.Utils import UploadFile
        from Dash.LocalStorage import Read, Write

        data_root = self.GetUserDataRoot(self.request_params["user_data"]["email"])
        img_root = os.path.join(data_root, "img")
        user_data_path = os.path.join(data_root, "usr.data")
        user_data = Read(user_data_path)

        user_data["img"] = UploadFile(
            dash_context=self.dash_context,
            user=user_data,
            file_root=img_root,
            file_bytes_or_existing_path=self.request_params["file"],
            filename=self.request_params["filename"]
        )

        Write(user_data_path, user_data)

        # Cleanup old images
        for filename in os.listdir(img_root):
            if filename.startswith(user_data["img"]["id"]):
                continue

            try:
                os.remove(os.path.join(img_root, filename))

            except FileNotFoundError:
                pass

        return user_data

    def validate_email_address(self, email):
        from Dash.Utils import ValidateEmailAddress

        # Make sure it's a real, existing email address that actually exists before
        # we create a user for an email address that was simply misspelled, etc
        if ValidateEmailAddress(email):
            return

        from Dash.Utils import ClientAlert

        raise ClientAlert(
            "Invalid email address.\nPlease double-check and try again.\n\n"
            "If you believe this is in error, please inform your manager or the dev team."
        )

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
        # If an email domain has been specified, don't allow
        # any emails outside of that domain to create an account
        if (
            self.dash_context.get("user_email_domain")
            and email.split("@")[-1] != self.dash_context["user_email_domain"]
        ):
            # Unless they're added to the bypass list
            if email not in user_email_domain_bypass_emails:
                from Dash import AdminEmails

                # Unless it's one of us
                if email not in AdminEmails:
                    from Dash.Utils import ClientAlert

                    raise ClientAlert(f"Unauthorized: {email}")  # Keep it vague intentionally

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

    def analog_update_on_email_change(self, old_email, new_email):
        try:
            if (
                self.analog_context
                and self.analog_context.get("user_email_domain_bypass_emails")
            ):
                delete = old_email in self.analog_context["user_email_domain_bypass_emails"]

                add = (
                    new_email not in self.analog_context["user_email_domain_bypass_emails"]
                    and not new_email.endswith(self.dash_context["domain"])
                )

                if add or delete:
                    from Analog.VDB import VDB
                    from Dash.PackageContext import Get as GetDashContext

                    analog_vdb = VDB(
                        vdb_type=self.analog_context["vdb_type"],
                        obj_id=self.analog_context["id"],
                        dash_context=GetDashContext("analog")
                    )

                    if delete:
                        analog_vdb.UpdateUserEmailDomainBypassEmails(email_to_remove=old_email)

                    if add:
                        analog_vdb.UpdateUserEmailDomainBypassEmails(email_to_add=new_email)
        except:
            from traceback import format_exc
            from Dash.Utils import SendEmail

            # Don't want any issues here interrupting the email change, so we can address any issues if they arise
            SendEmail(
                subject="Email Change - Analog Error",
                msg="Something failed when trying to handle Analog updates during an email change.",
                error=format_exc()
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

        except Exception as e:
            from traceback import format_exc

            raise Exception(f"Parse error x32489\n{format_exc()}") from e

    # create_if_missing should probably default to False, but don't want to break anything
    def get_user_info(self, email, create_if_missing=True):
        from Dash.Utils import Memory

        email = email.lower().strip()

        if type(email) is bytes:
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

        user_data["conformed"] = True  # Keeping this around just in case it's used somewhere, but doesn't seem to be

        if user_data.get("img", {}).get("exif"):
            user_data["img"]["exif"] = {}  # See comment in Dash.Utils.file.get_image_with_data

        return self.set_display_name(user_data)

    def get_user_init(self, email):
        if type(email) is bytes:
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
            primary = (
                team[email].get("display_name")
                or f"{team[email].get('first_name', '')} {team[email].get('last_name', '')}".strip()
                or email
            )

            sortable.append([primary, email])

        sortable.sort()

        for item in sortable:
            sorted_emails.append(item[1])

        return sorted_emails

    def get_team(self):
        team = {}
        users_root = os.path.join(self.dash_context["srv_path_local"], "users")

        for user_email in os.listdir(users_root):
            if user_email.startswith("_"):
                continue

            # Emails are sanitized on account creation, but leaving this here for
            # any accounts for older sites from before that sanitation was added
            user_email = user_email.lower()

            user_data_path = self.GetUserDataPath(user_email)
            is_link = os.path.islink(os.path.dirname(user_data_path))

            if is_link:
                continue

            try:
                team[user_email] = self.get_user_info(user_email)

            # In cases where a specific user's data is corrupted etc, we don't
            # want that to prevent everyone else from logging in etc
            except Exception as e:
                # Ignore new users who haven't logged in yet by checking for the existence
                # of the sessions folder. Checking for the existence of that instead of
                # the usr.data file is preferred in case usr.data may be corrupted.
                if os.path.exists(os.path.join(users_root, user_email, "sessions")):
                    team[user_email] = {"error": str(e)}

                    self.send_email(
                        subject="Dash Error - Users.get_team()",
                        msg=(
                            f"Warning: Failed to get user info for {user_email}. "
                            f"If it's not a new user, data may be corrupted."
                        ),
                        error=e
                    )

        return team

    def add_order_to_team(self, all_users, order_by_last_name=False):
        users = {
            "order": [],
            "data": {}
        }

        to_sort = []

        for email in all_users:
            user = all_users[email]
            last_name = user.get("last_name") or ""
            first_name = user.get("first_name") or email.split("@")[0] or ""

            if order_by_last_name:
                to_sort.append([
                    last_name,
                    first_name,
                    email
                ])
            else:
                display_name = user.get("display_name") or ""

                if not display_name or display_name == email:
                    display_name = first_name

                    if display_name and last_name:
                        display_name = f"{display_name} {last_name}"

                to_sort.append([
                    display_name,
                    email
                ])

            users["data"][email] = user

        to_sort.sort()

        for pair in to_sort:
            users["order"].append(pair[-1])

        return users

    # At some point, we may want to actually permanently include this key in the user data,
    # which would also mean updating it anytime "first_name" and/or "last_name" are updated
    def set_display_name(self, user_data):
        if user_data.get("first_name"):
            user_data["display_name"] = user_data["first_name"]

            if user_data.get("last_name"):
                user_data["display_name"] += f" {user_data['last_name']}"

        elif user_data.get("email"):
            user_data["display_name"] = user_data["email"]

        return user_data

    def get_token_data(self, token):
        from base64 import urlsafe_b64decode

        for _ in range(3):
            try:
                token_data = urlsafe_b64decode(token)

                return token, token_data
            except:
                from traceback import format_exc

                error = format_exc().lower()

                if "incorrect padding" not in error:
                    return None, None

            token += "="

        return None, None


def Login(use_pin=False, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Login(use_pin)


def UpdateEmail(request_params={}, dash_context={}):
    return Users(request_params, dash_context).UpdateEmail()


def UpdatePassword(request_params={}, dash_context={}):
    return Users(request_params, dash_context).UpdatePassword()


def UploadUserImage(request_params={}, dash_context={}):
    return Users(request_params, dash_context).UploadUserImage()


def UpdatePIN(email="", pin="", token_validation=True, request_params={}, dash_context={}):
    return Users(request_params, dash_context).UpdatePIN(email, pin, token_validation)


def Validate(user_token=None, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Validate(user_token)


def ValidateCredentials(email, password, use_pin=False, return_login_dict=False, request_params={}, dash_context={}):
    return Users(request_params, dash_context).ValidateCredentials(email, password, use_pin, return_login_dict)


def GetAll(request_params={}, dash_context={}, include_order=False, order_by_last_name=False):
    return Users(request_params, dash_context).GetAll(include_order, order_by_last_name)


def GetUserDataPath(user_email_to_get, request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetUserDataPath(user_email_to_get)


def GetUserDataRoot(user_email_to_get, request_params={}, dash_context={}):
    return Users(request_params, dash_context).GetUserDataRoot(user_email_to_get)


def GetUserData(user_email_to_get, request_params={}, dash_context={}, create_if_missing=True):
    return Users(request_params, dash_context).GetUserData(user_email_to_get, create_if_missing)


def Reset(request_params={}, dash_context={}, user_email_domain_bypass_emails=[], send_reset_email=True):
    return Users(request_params, dash_context).Reset(user_email_domain_bypass_emails, send_reset_email)


def ResetResponse(request_params={}, dash_context={}):
    return Users(request_params, dash_context).ResetResponse()


# Deprecated, use Validate instead (same functionality, different name)
def GetByToken(user_token=None, request_params={}, dash_context={}):
    return Users(request_params, dash_context).Validate(user_token)


# Deprecated, use GetUserData instead (same functionality, different name)
def Get(user_email_to_get, request_params={}, dash_context={}, create_if_missing=True):
    return Users(request_params, dash_context).GetUserData(user_email_to_get, create_if_missing)
