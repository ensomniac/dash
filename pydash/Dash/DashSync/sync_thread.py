#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import json

from gzip import compress
from requests import post
from random import randint
from threading import Timer
from datetime import datetime
from os.path import expanduser
from Dash.UtilsNew import Memory
from subprocess import check_output
from Dash.DashLint import DashLint as Lint


class SyncThread:
    _initialized: bool

    def __init__(self, package, root_path, is_client, on_change_cb=None):
        self.context = package
        self.root_path = root_path
        self.is_client = is_client
        self.needs_git_push = False
        self.on_change_cb = on_change_cb

        self.seconds_before_reindex = 5

        self.files = {}
        self.last_reindex_time = datetime.now()
        self.start_time = datetime.now()
        self.last_commit_attempt = None
        self.check_timeout = randint(100, 150) * 0.01

        self.index_all()
        self.check()

    @property
    def Name(self):
        needs_sync_addl = ""

        if self.needs_git_push:
            needs_sync_addl = "* GIT * "

        if self.is_client:
            return needs_sync_addl + self.context["display_name"] + " (Client)"
        else:
            return needs_sync_addl + self.context["display_name"] + " (Server)"

    def index_all(self):
        self.last_reindex_time = datetime.now()

        paths = [self.root_path]

        python_path = self.root_path.replace("/server/", "/python/")

        if python_path != self.root_path and os.path.exists(python_path):
            paths.append(python_path)

        for index_path in paths:
            self.index_all_from_path(index_path)

        if not hasattr(self, "_initialized"):
            # Don't do anything if this happened on startup
            self._initialized = True

            msg = "[" + self.Name + "] Tracking "
            msg += str(len(list(self.files.keys()))) + " files..."
            print(msg)

            self.broadcast_git_status()

            return

            # print(f"\t[{self.Name}] Re-indexed complete")

    def index_all_from_path(self, root_path):

        # print("index: " + str(root_path))

        all_files = [
            os.path.join(dp, f)
            for dp, dn, fn in os.walk(os.path.expanduser(root_path))
            for f in fn
        ]

        for abspath in all_files:

            if "/.git/" in abspath or ".pyc" in abspath or "/.D" in abspath:
                continue

            if ".idea" in abspath:
                continue

            if abspath not in self.files:
                self.files[abspath] = {}
                self.files[abspath]["abspath"] = abspath
                self.files[abspath]["last_timestamp"] = os.path.getmtime(abspath)

            # self.files[abspath] = {"abspath": abspath}

    def check(self):
        # print(f"\t[{self.Name}] LivesyncWatchThread > check()....")

        Timer(self.check_timeout, self.check).start()

        time_since_index = int(
            (datetime.now() - self.last_reindex_time).total_seconds()
        )

        if time_since_index >= self.seconds_before_reindex:
            self.index_all()
            self.broadcast_git_status()
            return

        self.check_timestamps()

    def broadcast_git_status(self):
        if not self.context.get("usr_path_git"):
            return

        # if "/dash/" not in self.context["usr_path_git"]: return

        cmd = "cd " + self.context["usr_path_git"].replace(" ", "\ ") + ";"
        cmd += "git status;"

        git_status = check_output([cmd], shell=True).decode()

        has_changes = False

        if "changes not staged for commit" in git_status.lower():
            has_changes = True

        if "untracked files" in git_status.lower():
            has_changes = True

        if "nothing to commit, working tree clean" not in git_status.lower():
            has_changes = True

        if "to publish your local commits" in git_status.lower():
            has_changes = True

        params = {
            "f": "set_sync_state",
            "token": Memory.UserToken,
            "asset_path": self.context["asset_path"],
            "git_status": git_status,
            "has_changes": has_changes
        }

        response = post(
            "https://dash.guide/Users",
            data=params
        )

        try:
            response = json.loads(response.text)
        except:
            print("== SERVER ERROR == x43")
            print(response.text)
            return

        if response.get("error"):
            print("== SERVER ERROR == x87")
            print(response)
            return

        if not response.get("success"):
            print("\n\n*** SERVER ERROR set_sync_state() ***\n\n")
        # else:
        #     print("\tServer notified!")

        if has_changes:
            msg = "* " + self.context.get("asset_path") + " > "
            msg += "GitHub > Needs commit/push ("
            msg += self.context.get("usr_path_git") + ")"
            print(msg)

        if response.get("livesync_git_commit_request"):
            self.attempt_git_commit(response["livesync_git_commit_request"])

    def attempt_git_commit(self, commit_request):
        # A request to commit and
        if self.on_change_cb and self.context["asset_path"] == "pydash":
            # TODO: Fix this garbage hack
            # There is a slightly strange thing in that we monitor pydash
            # and dash differently but they are in the same package.
            # This hook says "this is dash client code, not pydash"
            return

        seconds_since_start = (datetime.now() - self.start_time).total_seconds()

        if seconds_since_start < 3:
            return

        if self.last_commit_attempt:
            seconds_since_attempt = (datetime.now() - self.last_commit_attempt).total_seconds()
            if seconds_since_attempt < 30:
                # Don't attempt again for another 30 seconds
                return

        print("\n\n\n********* SERVER GIT COMMIT REQUEST ************")
        print("Initiated by: " + commit_request["initiated_by"])
        print("Commit msg: '" + commit_request["commit_msg"] + "'\n")

        self.last_commit_attempt = datetime.now()

        git_cmd = "cd " + self.context["usr_path_git"].replace(" ", "\ ") + ";"
        git_cmd += "git add .;"
        git_cmd += "git commit . -m '" + commit_request["commit_msg"] + "';"
        git_cmd += "git push;"

        git_result = check_output([git_cmd], shell=True).decode()

        params = {
            "f": "set_livesync_git_result",
            "token": Memory.UserToken,
            "asset_path": self.context["asset_path"],
            "git_result": git_result
        }

        response = post(
            "https://dash.guide/Users",
            data=params
        )

        try:
            response = json.loads(response.text)
        except:
            print("== SERVER ERROR == x81")
            print(response.text)
            print("*************************\n\n\n")
            return

        if response.get("error"):
            print("== SERVER ERROR == x82")
            print(response.text)
            print("*************************\n\n\n")
            return

        print("Success!")
        print("*************************\n\n\n")

    def check_timestamps(self):
        for filename in self.files:

            last_timestamp = self.files[filename]["last_timestamp"]

            if not os.path.exists(self.files[filename]["abspath"]):
                print("\tRE-INDEX...")

                self.index_all()

                break

            current_timestamp = os.path.getmtime(self.files[filename]["abspath"])

            if last_timestamp == current_timestamp:
                continue

            self.files[filename]["last_timestamp"] = current_timestamp

            if self.on_change_cb:

                print(f"\n\t[{self.Name}] *** -> {filename} updated -> Custom Callback...")

                self.on_change_cb()

            else:

                print(f"\n\t[{self.Name}] *** -> {filename} updated -> Lint & Sync...")

                lint_succeeded, msg = Lint.Process(
                    is_client=self.is_client,
                    dash_context=self.context,
                    code_path=self.files[filename]["abspath"]
                )

                if lint_succeeded:
                    Timer(0.0, self.upload_change, args=[filename]).start()
                    print(f"\t\t\t{msg}")
                else:
                    print(f"\t\t * Fatal DashLint ERROR: This must be resolved before this file can be synced\n\t\t\t{msg}")

            self.broadcast_git_status()

    def upload_change(self, filename):

        local_path = self.files[filename]["abspath"]

        if self.is_client:
            print("TODO: PATH FOR CLIENT")
            return
        else:
            remote_path = local_path.replace(
                self.context["usr_path_git"], self.context["srv_path_git_oapi"]
            ).replace("cgi-bin/cgi-bin", "cgi-bin")

        msg = "\n\t[" + self.Name + "] Uploading " + filename + "..."
        msg += "\n\t\tLocal: " + local_path
        msg += "\n\t\tRemote: " + remote_path
        print(msg)

        # Move this into utils:
        dash_data_path = os.path.join(expanduser("~"), ".dash")
        dash_data = json.loads(open(dash_data_path, "r").read())
        token = dash_data["user"]["token"]

        params = {
            "f": "live",
            "token": token,
            "local_path": local_path,
            "remote_path": remote_path,
            "context": json.dumps(self.context),
            "is_client": self.is_client
        }

        # Send the contents of the file as compressed binary
        files = {"fmod": compress(open(local_path, "r").read().encode())}

        response = post(
            "https://dash.guide/Sync",
            data=params,
            files=files,
        ).text

        try:
            response = json.loads(response)
        except:
            print("\n**** Server Sync Error ****\n")
            print(response)
            return

        if response.get("success"):
            print("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            print(">>>>>>>>> Upload: Success! >>>>>>>>>")
            print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n")

            if not self.needs_git_push:
                self.needs_git_push = True
                # print("\t\t\t * Don't forget to commit your changes to GitHub! *")

            # print()

        else:
            print("== SERVER ERROR ==")
            print(response)
