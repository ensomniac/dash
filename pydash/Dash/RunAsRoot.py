#!/usr/bin/python

import datetime
import json
import os
import pathlib
import threading
import time

from Dash.Utils import Utils

class RunAsRoot:
    def __init__(self):
        # TODO: Put this path in dash guide
        self.request_path = "/var/www/vhosts/oapi.co/dash/local/rar/active/"

        self.task_id = None
        self.cmd = None
        self.cmd_path = None
        self.start_time = None
        self.fail_timeout = 10 # In seconds
        self.state = None
        self.timestamp = ""

    def Queue(self, command):
        self.task_id = Utils.GetRandomID()
        self.cmd = command
        self.cmd_path = os.path.join(self.request_path, self.task_id)
        self.start_time = datetime.datetime.now()

        self.state = {
            "cmd": self.cmd,
            "complete": False,
            "output": None,
            "id": self.task_id,
        }

        open(self.cmd_path, "w").write(json.dumps(self.state))

        self.timestamp = datetime.datetime.fromtimestamp(
            pathlib.Path(self.cmd_path).stat().st_mtime
        )

        self.check_status()

        while not self.state or not self.state.get("complete"):
            time.sleep(0.2)

        return self.state

    def check_status(self):
        if self.state and self.state.get("complete"):
            return

        age = int((datetime.datetime.now() - self.start_time).total_seconds())

        if age > self.fail_timeout:
            self.fail()
            # return # unreachable

        threading.Timer(1.2, self.check_status, []).start()
        timestamp_now = datetime.datetime.fromtimestamp(
            pathlib.Path(self.cmd_path).stat().st_mtime
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
        self.state[
            "output"
        ] = f"Failed to complete task after {str(self.fail_timeout)} seconds. Force killed."

        os.remove(self.cmd_path)

        open(self.cmd_path.replace("/rar/active/", "/rar/complete/"), "w").write(
            json.dumps(self.state)
        )


def Queue(command):
    return RunAsRoot().Queue(command)


if __name__ == "__main__":
    print("Interactive testing...")

    result = Queue("touch /root/test_as_root.txt")

    print(result)
