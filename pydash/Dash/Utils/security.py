#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class OnePass:
    __signin_pass_: str
    _session_token: str

    def __init__(self, account_shorthand):
        from Dash.Utils import OapiRoot

        self.account_shorthand = account_shorthand  # In most cases, a Dash Context asset path

        self._last_session_token_dt = None
        self._on_server = os.path.exists(OapiRoot)

    @property
    def __signin_pass(self):
        if not hasattr(self, "__signin_pass_"):
            from Dash.LocalStorage import GetPrivKey

            # For now, going to just expect that this location is predictable, following this pattern
            self.__signin_pass_ = GetPrivKey("op_si_p", [self.account_shorthand])

        return self.__signin_pass_

    @property
    def session_token(self):
        needed = not hasattr(self, "_session_token")

        if not needed and self._last_session_token_dt:
            from datetime import datetime

            # Check if 9 mins have passed (1 min pad)
            if (datetime.now() - self._last_session_token_dt).seconds >= 540:
                needed = True

        if needed:
            from subprocess import run, CalledProcessError

            try:
                self._session_token = run(  # Good for 10 mins
                    ["op", "signin", "--account", self.account_shorthand, "--raw"],
                    input=self.__signin_pass,
                    text=True,
                    capture_output=True,
                    check=True
                ).stdout.strip()

            except CalledProcessError as e:
                raise Exception(f"Failed to sign in to 1pass:\n{e.stderr}") from e

            from datetime import datetime

            self._last_session_token_dt = datetime.now()

        return self._session_token

    # Ideally, should always call this when done with an
    # instance, but will happen on its own after 10 mins
    def SignOut(self):
        from subprocess import run, CalledProcessError

        try:
            return run(
                ["op", "signout", "--all"],
                text=True,
                capture_output=True,
                check=True
            ).stdout.strip()

        except CalledProcessError as e:
            raise Exception(f"Failed to sign out of 1pass:\n{e.stderr}") from e

    def GetValue(self, item_name, field_name, vault_name="", _secret_reference=""):
        if "one-time password" in field_name:
            item = self.GetItem(item_name)

            for field in item["fields"]:
                if field["label"] != field_name:
                    continue

                return field["totp"]

            raise ValueError(f"Failed to locate OTP field '{field_name}' in item '{item_name}'")

        from subprocess import run, CalledProcessError

        try:
            return run(
                (
                    [
                        "op",
                        "read",
                        _secret_reference or f"op://{vault_name}/{item_name}/{field_name}"
                    ]
                    if (_secret_reference or vault_name)
                    else ["op", "item", "get", item_name, "--field", field_name, "--reveal"]
                ),
                env=self.get_env(),
                capture_output=True,
                text=True,
                check=True
            ).stdout.strip()

        except CalledProcessError as e:
            raise Exception(f"Failed to get value from 1pass:\n{e.stderr}") from e

    def GetItem(self, item_name):
        from json import loads, JSONDecodeError
        from subprocess import run, CalledProcessError

        try:
            return loads(run(
                ["op", "item", "get", item_name, "--format", "json"],
                env=self.get_env(),
                capture_output=True,
                text=True,
                check=True
            ).stdout)

        except CalledProcessError as e:
            raise Exception(f"Failed to get item from 1pass:\n{e.stderr}") from e

        except JSONDecodeError as e:
            raise Exception(f"Failed to parse item output from 1pass:\n{e}") from e

    def GetItemList(self):
        from json import loads, JSONDecodeError
        from subprocess import run, CalledProcessError

        try:
            return loads(run(
                ["op", "item", "list", "--format", "json"],
                env=self.get_env(),
                capture_output=True,
                text=True,
                check=True
            ).stdout)

        except CalledProcessError as e:
            raise Exception(f"Failed to get item list from 1pass:\n{e.stderr}") from e

        except JSONDecodeError as e:
            raise Exception(f"Failed to parse item list output from 1pass:\n{e}") from e

    def CreateItem(self, vault_name, item_name, url="", tags=[], category="login", password_recipe="", debug=False):
        from subprocess import run, CalledProcessError

        args = [
            "op",
            "item",
            "create",
            "--category",
            category,
            "--vault",
            vault_name,
            "--title",
            item_name
        ]

        if url:
            args.extend(["--url", url])

        if tags:
            tags.extend(["--tags", ",".join(tags)])

        args.append("--generate-password")

        if password_recipe:  # Ex: "letters,digits,symbols,32"
            args.append(password_recipe)

        if debug:
            args.append("--dry-run")

        try:
            return run(
                args,
                env=self.get_env(),
                capture_output=True,
                text=True,
                check=True
            ).stdout.strip()

        except CalledProcessError as e:
            raise Exception(f"Failed to create 1pass item:\n{e.stderr}") from e

    # If this hangs when running within an IDE, run the script directly in the terminal
    def EditItem(self, item_name_or_id, item_name="", vault_name="", tags=[], url="", debug=False):
        from subprocess import run, CalledProcessError

        args = [
            "op",
            "item",
            "edit",
            item_name_or_id
        ]

        if item_name:
            args.extend(["--title", item_name])

        if vault_name:
            args.extend(["--vault", vault_name])

        if tags:
            args.extend(["--tags", ",".join(tags)])

        if url:
            args.extend(["--url", url])

        if debug:
            args.append("--dry-run")

        # TODO: Use assignment statements to edit an item's built-in and custom fields
        #  - https://developer.1password.com/docs/cli/item-edit/#edit-built-in-and-custom-fields

        try:
            return run(
                args,
                env=self.get_env(),
                capture_output=True,
                text=True,
                check=True
            ).stdout.strip()

        except CalledProcessError as e:
            raise Exception(f"Failed to edit 1pass item:\n{e.stderr}") from e

    def get_env(self):
        return {f"OP_SESSION_{self.account_shorthand}": self.session_token} if self._on_server else {}
