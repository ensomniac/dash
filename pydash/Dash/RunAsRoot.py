#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import json

from time import sleep
from pathlib import Path
from threading import Timer
from datetime import datetime
from Dash.Utils import OapiRoot, GetRandomID
from Dash.LocalStorage import Read, Write

class RunAsRoot:
    def __init__(self):
        self.state        = {}
        self.timestamp    = ""
        self.cmd_path     = None
        self.init_time    = datetime.now()
        self.fail_timeout = 20  # In seconds (formerly 10, but git updates were failing for some repos that take a bit longer)

    @property
    def request_path(self):
        return os.path.join(
            OapiRoot,
            "dash",
            "local",
            "rar",
            "active/"
        )

    @property
    def task_id(self):
        if not hasattr(self, "_task_id"):
            self._task_id = GetRandomID()

        return self._task_id

    def get_task_path(self, task_id):
        return os.path.join(self.request_path, self.task_id)

    def get_task_data(self, task_id):
        return Read(self.get_task_path(self.task_id))

    def Queue(self, command):
        if not command:
            raise Exception("RunAsRoot.Queue > Missing command directive!")

        self.state = {
            "cmd":             command,
            "cmd_result":      None,
            "complete":        False,
            "output":          None,
            "started":         False,
            "id":              self.task_id,
            "queued_time_iso": self.init_time.isoformat(),
            "start_time_iso":  None,
            "last_poll_iso":   None,
            "cmd_path":        os.path.join(self.request_path, self.task_id)
        }

        cmd_type = type(self.state["cmd"])

        if cmd_type not in [list, str]:
            raise Exception("Unhandled command type: " + str(cmd_type))

        Write(self.state["cmd_path"], self.state)
        # open(self.state["cmd_path"], "w").write(json.dumps(self.state))

        self.timestamp = datetime.fromtimestamp(
            Path(self.state["cmd_path"]).stat().st_mtime
        )

        response = {}
        response["check"] = []

        iterations = 0

        while True:
            task_data = self.get_task_data(self.task_id)
            response["check"].append(str(task_data))
            iterations += 1
            sleep(1.0)

            if iterations > 10:
                break




        # self.check_status()

        # while not self.state or not self.state.get("complete"):
        #     sleep(0.2)

        return response

    def check_status(self):
        if self.state and self.state.get("complete"):
            return

        age = int((datetime.now() - self.start_time).total_seconds())

        if age > self.fail_timeout:
            self.fail()
            # return # unreachable

        Timer(1.2, self.check_status, []).start()

        timestamp_now = datetime.fromtimestamp(
            Path(self.cmd_path).stat().st_mtime
        )

        if self.timestamp == timestamp_now:
            # The file hasn't changed. Keep waiting
            return

        # The file has been changed / written to. We can move it and complete
        self.state = json.loads(open(self.cmd_path, "r").read())
        self.state["complete"] = True

        os.remove(self.cmd_path)

        open(self.cmd_path.replace("/rar/active/", "/rar/complete/"), "w").write(
            json.dumps(self.state)
        )

    def fail(self):
        self.state = json.loads(open(self.cmd_path, "r").read())
        self.state["complete"] = True
        self.state["error"] = True
        self.state["output"] = f"Failed to complete task after {self.fail_timeout} seconds. Force killed. Details: {self.state.get('output') or '(No additional error info)'}"

        os.remove(self.cmd_path)

        open(self.cmd_path.replace("/rar/active/", "/rar/complete/"), "w").write(
            json.dumps(self.state)
        )















def Queue(command):
    return RunAsRoot().Queue(command)

if __name__ == "__main__":
    print("Interactive testing...")
    print(Queue("touch /root/test_as_root.txt"))
