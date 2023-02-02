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


class RunAsRoot:
    def __init__(self):
        self.cmd = None
        self.state = None
        self.timestamp = ""
        self.task_id = None
        self.cmd_path = None
        self.start_time = None
        self.fail_timeout = 20  # In seconds (formerly 10, but git updates were failing for some repos that take a bit longer)
        self.request_path = os.path.join(OapiRoot, "dash", "local", "rar", "active/")  # TODO: Put this path in dash guide

    def Queue(self, command):
        self.task_id = GetRandomID()
        self.cmd = command  # str or list
        self.cmd_path = os.path.join(self.request_path, self.task_id)
        self.start_time = datetime.now()

        self.state = {
            "cmd": self.cmd,
            "complete": False,
            "output": None,
            "id": self.task_id,
        }

        open(self.cmd_path, "w").write(json.dumps(self.state))

        self.timestamp = datetime.fromtimestamp(
            Path(self.cmd_path).stat().st_mtime
        )

        self.check_status()

        while not self.state or not self.state.get("complete"):
            sleep(0.2)

        return self.state

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
        self.state["output"] = f"Failed to complete task after {self.fail_timeout} seconds. Force killed.\n\n{self.state.get('output') or '(No additional error info)'}"

        os.remove(self.cmd_path)

        open(self.cmd_path.replace("/rar/active/", "/rar/complete/"), "w").write(
            json.dumps(self.state)
        )


def Queue(command):
    return RunAsRoot().Queue(command)


if __name__ == "__main__":
    print("Interactive testing...")
    print(Queue("touch /root/test_as_root.txt"))
