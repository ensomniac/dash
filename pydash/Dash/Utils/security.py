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
            self._session_token = self.run_command(
                args=["signin", "--account", self.account_shorthand, "--raw"],
                cmd_input=self.__signin_pass,
                error_prefix="Failed to sign in to 1pass",
                add_env=False
            )

            from datetime import datetime

            self._last_session_token_dt = datetime.now()

        return self._session_token

    # Ideally, should always call this when done with an
    # instance, but will happen on its own after 10 mins
    def SignOut(self):
        return self.run_command(
            args=["signout", "--all"],
            error_prefix="Failed to sign out of 1pass",
            add_env=False
        )

    def GetValue(self, item_name, field_name, vault_name="", _secret_reference=""):
        if "one-time password" in field_name:
            item = self.GetItem(item_name)

            for field in item["fields"]:
                if field["label"] != field_name:
                    continue

                return field["totp"]

            raise ValueError(f"Failed to locate OTP field '{field_name}' in item '{item_name}'")

        return self.run_command(
            args=(
                [
                    "read",
                    _secret_reference or f"op://{vault_name}/{item_name}/{field_name}"
                ]
                if (_secret_reference or vault_name)
                else ["item", "get", item_name, "--field", field_name, "--reveal"]
            ),
            error_prefix="Failed to get value from 1pass"
        )

    def GetItem(self, item_name):
        return self.run_command(
            args=["item", "get", item_name, "--format", "json"],
            error_prefix="Failed to get item from 1pass"
        )

    def GetItemList(self):
        return self.run_command(
            args=["item", "list", "--format", "json"],
            error_prefix="Failed to get item list from 1pass"
        )

    def CreateItem(
        self, vault_name, item_name, url="", tags=[], category="login", password_recipe="", debug=False
    ):
        args = [
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

        return self.run_command(
            args=args,
            error_prefix="Failed to create 1pass item"
        )

    # If this hangs when running within an IDE, run the script directly in the terminal
    def EditItem(self, item_name_or_id, item_name="", vault_name="", tags=[], url="", debug=False):
        args = [
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

        return self.run_command(
            args=args,
            error_prefix="Failed to edit 1pass item"
        )

    def run_command(self, args, cmd_input=None, error_prefix="", add_env=True):
        from json import JSONDecodeError
        from subprocess import CalledProcessError, run as sub_run

        op_arg_index = 2 if self._on_server else 0

        if self._on_server:
            # Have to run as root
            if args[0] != "sudo":
                args.insert(0, "sudo")

            # Preserve environment variables (session token) throughout sudo calls
            if args[1] != "-E":
                args.insert(1, "-E")

        if args[op_arg_index] != "op":
            args.insert(op_arg_index, "op")

        env = (
            ({f"OP_SESSION_{self.account_shorthand}": self.session_token} if self._on_server else None)
            if add_env else None
        )

        error_midfix = f"Command: {args}\nEnv: {env}"

        try:
            result = sub_run(
                args=args,
                text=True,
                check=True,
                input=cmd_input,
                capture_output=True,
                env=env
            ).stdout

        except CalledProcessError as e:
            raise Exception(
                f"{error_prefix or 'Failed to run 1pass command'}:\n{error_midfix}\nError: {e.stderr}"
            ) from e

        except JSONDecodeError as e:
            raise Exception(f"Failed to parse output from 1pass:\n{error_midfix}\nError: {e}") from e

        except FileNotFoundError as e:
            raise Exception(
                f"{error_prefix or 'Failed to run 1pass command (file not found?'}:\n{error_midfix}\nError: {e}"
            ) from e

        if "--format json" in " ".join(args):
            from json import loads

            return loads(result)

        return result.strip()
