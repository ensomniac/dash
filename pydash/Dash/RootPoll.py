#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import json

from pathlib import Path
from threading import Timer
from datetime import datetime
from traceback import format_exc
from Dash.UtilsNew import OapiRoot
from subprocess import check_output


class PollRequests:
    def __init__(self):
        self.request_path = os.path.join(OapiRoot, "dash", "local", "rar", "active/")

        self.check_process_running()

        self.fail_timeout = 10  # In seconds
        self.checks = 0

        self.periodic_check()

    def check_process_running(self):
        from psutil import Process

        pid_list = self.get_pids("python")
        another_process_running = False

        for pid in pid_list:
            if str(pid) == str(os.getpid()):
                continue

            process = Process(int(pid))

            if "PollRequests.py" not in str(process.cmdline()):
                continue

            another_process_running = True
            break

        if another_process_running:
            sys.exit("Waiting on another process...")

    def get_pids(self, script_name):
        result = check_output(["ps -eaf"], shell=True).decode()
        pids = []

        try:
            for line in result.split("\n"):
                if script_name not in line:
                    continue
                if "terminated" in line.lower():
                    continue
                if "PollRequests.py" not in line:
                    continue

                pid = str(line.split()[1].strip())
                pids.append(pid)
        except:
            pass

        return pids

    def periodic_check(self):
        if self.checks >= 20:
            return

        Timer(3, self.periodic_check).start()

        self.checks += 1

        requests = os.listdir(self.request_path)

        if not requests:
            print("nothing")

            return

        for task_id in requests:
            if task_id.startswith("."):
                continue

            task_path = os.path.join(self.request_path, task_id)

            timestamp_now = datetime.fromtimestamp(
                Path(task_path).stat().st_mtime
            )

            age = int((datetime.now() - timestamp_now).total_seconds())

            if age > self.fail_timeout * 2:
                # Give it slightly more time since it's more likely that the source task will kill it
                self.fail(task_path, "Task timed out", force_move=True)

                continue

            print(f"[{str(age)}] {task_id}")

            try:
                self.run_task(task_path)
            except:
                self.fail(task_path, format_exc())

            # os.remove(os.path.join(self.request_path, task_id))

    def fail(self, task_path, error, force_move=False):
        # print(">> " + task_path)

        task_state = json.loads(open(task_path, "r").read())
        task_state["complete"] = True
        task_state["error"] = True
        task_state["output"] = error

        if force_move:
            print(f"FAIL & REMOVE: {task_path}")

            os.remove(task_path)

            open(task_path.replace("/rar/active/", "/rar/complete/"), "w").write(
                json.dumps(task_state)
            )
        else:
            print(f"FAIL: {task_path}")

            open(task_path, "w").write(json.dumps(task_state))

    def run_task(self, task_path):
        task_state = json.loads(open(task_path, "r").read())
        tmp_log = os.path.join("/var", "tmp", f"rar_{task_state['id']}")

        os.system(f"{task_state['cmd']} >> {tmp_log} 2>&1")

        log_result = None

        try:
            log_result = open(tmp_log, "r").read()
        except:
            pass

        task_state = json.loads(open(task_path, "r").read())
        task_state["complete"] = True
        task_state["error"] = False
        task_state["output"] = log_result

        open(task_path, "w").write(json.dumps(task_state))


if __name__ == "__main__":
    PollRequests()
