#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
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
        self.response     = {}
        self.last_status  = {}
        self.timestamp    = ""
        self.cmd_path     = None
        self.init_time    = datetime.now()
        self.fail_timeout = 60 # In seconds, the duration to monitor task

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

    @property
    def task_path(self):
        return os.path.join(self.request_path, self.task_id)

    def get_task_data(self, task_id):
        return Read(self.task_path)

    def Queue(self, command):
        if not command:
            raise Exception("RunAsRoot.Queue > Missing command directive!")

        self.state = {
            "cmd":             command,
            "cmd_result":      None,
            "complete":        False,
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

        self.response = {}
        self.response["status_log"]     = []
        self.response["complete"]       = False
        self.response["result"]         = None
        self.response["error"]          = None

        while True:

            task_complete = self.check_task_status()

            if task_complete:
                break

            sleep(0.9)

        self.response["result"], self.response["exited_cleanly"] = self.get_final_status()

        return self.response

    @property
    def uptime(self):
        init_uptime = datetime.now()-self.init_time
        return round(init_uptime.total_seconds(), 2)

    def check_task_status(self):
        if not os.path.exists(self.task_path):
            # The task has likely completed and is now removed
            self.response["complete"] = True
            return True

        if self.uptime >= self.fail_timeout:
            self.register_timeout_fail()
            return True

        task_data = self.get_task_data(self.task_id)

        include_update = False
        if len(self.response["status_log"]) == 0:
            include_update = True
        elif self.response["status_log"][-1]["started"] != task_data["started"]:
            include_update = True
        elif self.response["status_log"][-1]["complete"] != task_data["complete"]:
            include_update = True

        if include_update:
            self.response["status_log"].append({
                "uptime": self.uptime,
                "started": task_data["started"],
                "complete": task_data["complete"],
            })

        self.last_status = task_data.copy()

        return False

    def register_timeout_fail(self):
        # Called when this task has ran longer than the timeout
        # NOTE: It's possible the running task is still running just fine
        # This may not be a problem, it may just be a long running process
        # This function does not actually attempt to kill the job, it just
        # stops checking it and returns the thread so the request can continue
        self.response["error"] = "Task ran for over " + str(self.uptime)
        self.response["error"] += " seconds and is no longer being monitored. "
        self.response["error"] += "However, the task process may still be running."

        self.response["complete"] = True

    def get_final_status(self):
        final_path = self.task_path.replace("/rar/active/", "/rar/complete/")

        if os.path.exists(final_path) and not os.path.exists(self.task_path):
            return Read(final_path), True
        else:
            return self.last_status, False
























def Queue(command):
    return RunAsRoot().Queue(command)

if __name__ == "__main__":
    print("Interactive testing...")
    print(Queue("touch /root/test_as_root.txt"))
