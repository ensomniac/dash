# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

import sys
import os
import json
import datetime
import random
import threading
import requests
import gzip
import subprocess

from os.path import expanduser

from Dash.DashLint import DashLint as Lint
from Dash.Utils import Utils

class SyncThread:
    def __init__(self, package, root_path, is_client, on_change_cb=None):
        self.context = package
        self.root_path = root_path
        self.is_client = is_client
        self.needs_git_push = False
        self.on_change_cb = on_change_cb

        self.seconds_before_reindex = 5

        self.files = {}
        self.last_reindex_time = datetime.datetime.now()
        self.check_timeout = random.randint(100, 150) * 0.01

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
        self.last_reindex_time = datetime.datetime.now()

        files = {}
        all_files = [
            os.path.join(dp, f)
            for dp, dn, fn in os.walk(os.path.expanduser(self.root_path))
            for f in fn
        ]

        for abspath in all_files:
            if "/.git/" in abspath or ".pyc" in abspath or "/.D" in abspath:
                continue

            files[abspath.split("/")[-1]] = {"abspath": abspath}

        if len(list(self.files.keys())) == len(list(files.keys())):
            # The number of files is the same, nothing to do
            return

        self.files = files

        for filename in self.files:
            abspath = self.files[filename]["abspath"]
            self.files[filename]["last_timestamp"] = os.path.getmtime(abspath)

        if not hasattr(self, "_initialized"):
            # Don't do anything if this happened on startup
            self._initialized = True

            msg = "[" + self.Name + "] Tracking "
            msg += str(len(list(self.files.keys()))) + " files..."
            print(msg)

            self.broadcast_git_status()

            return

        print(f"\t[{self.Name}] Re-indexed complete")

    def check(self):
        # print(f"\t[{self.Name}] LivesyncWatchThread > check()....")

        threading.Timer(self.check_timeout, self.check).start()

        time_since_index = int(
            (datetime.datetime.now() - self.last_reindex_time).total_seconds()
        )

        if time_since_index >= self.seconds_before_reindex:
            self.index_all()
            self.broadcast_git_status()
            return

        self.check_timestamps()

    def broadcast_git_status(self):
        if not self.context.get("usr_path_git"): return
        # if "/dash/" not in self.context["usr_path_git"]: return

        cmd = "cd " + self.context["usr_path_git"].replace(" ", "\ ") + ";"
        cmd += "git status;"

        git_status = subprocess.check_output([cmd], shell=True).decode()

        has_changes = False

        if "changes not staged for commit" in git_status.lower():
            has_changes = True

        if "untracked files" in git_status.lower():
            has_changes = True

        if "nothing to commit, working tree clean" not in git_status.lower():
            has_changes = True

        if "to publish your local commits" in git_status.lower():
            has_changes = True

        params = {}
        params["f"] = "set_sync_state"
        params["token"] = Utils.UserToken
        params["asset_path"] = self.context["asset_path"]
        params["git_status"] = git_status
        params["has_changes"] = has_changes

        response = requests.post(
            "https://dash.guide/Users",
            data=params
        )

        try:
            response = json.loads(response.text)
        except:
            print("== SERVER ERROR ==")
            print(response.text)
            return

        if response.get("error"):
            print("== SERVER ERROR ==")
            print(response)
            return

        if has_changes:
            msg = "* " + self.context.get("asset_path") + " > "
            msg += "GitHub > Needs commit/push ("
            msg += self.context.get("usr_path_git") + ")"
            print(msg)

    def check_timestamps(self):
        for filename in self.files:
            last_timestamp = self.files[filename]["last_timestamp"]

            if not os.path.exists(self.files[filename]["abspath"]):
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

                lint_succeeded = Lint.Process(
                    is_client=self.is_client,
                    context=self.context,
                    file_path=self.files[filename]["abspath"]
                )

                if lint_succeeded:
                    threading.Timer(0.0, self.upload_change, args=[filename]).start()
                else:
                    print("\t\t * Fatal lint error: This must be resolved before this file can be sync'd")

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

        params = {}
        params["f"] = "live"
        params["token"] = token
        params["local_path"] = local_path
        params["remote_path"] = remote_path
        params["context"] = json.dumps(self.context)
        params["is_client"] = self.is_client

        # Send the contents of the file as compressed binary
        files = {}
        files["fmod"] = gzip.compress(open(local_path, "r").read().encode())

        response = requests.post(
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

        if response["success"]:
            print("\t\t\tSuccess!")

            if not self.needs_git_push:
                self.needs_git_push = True
                print("\t\t\t * Don't forget to commit your changes to GitHub! *")
