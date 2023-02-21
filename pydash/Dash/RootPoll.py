#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import json

from pathlib import Path
from threading import Timer
from datetime import datetime
from Dash.Utils import OapiRoot
from traceback import format_exc
from subprocess import check_output, STDOUT, CalledProcessError


class PollRequests:
    def __init__(self):
        self.request_path = os.path.join(OapiRoot, "dash", "local", "rar", "active/")

        self.check_process_running()

        self.checks = 0
        self.fail_timeout = 20  # In seconds (formerly 10, but git updates were failing for some repos that take a bit longer)

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
        pids = []
        result = check_output(["ps -eaf"], shell=True).decode()

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
        # print(">> " + task_path) -

        try:
            task_state = json.loads(open(task_path, "r").read())
        except:
            # We may want to just remove the file in this case, but starting with this for now
            error = f"Initial error: {error}\nSubsequent error: Failed to read task file, removing it: {task_path}"
            task_state = {}
            # force_move = True  # Need this?

        if "initial_task_state" not in task_state:
            task_state["initial_task_state"] = {k: v for k, v in task_state.items()}

        task_state["complete"] = True
        task_state["error"] = True
        task_state["output"] = error

        if force_move:
            print(f"FAIL & MOVE: {task_path}")

            os.remove(task_path)

            open(task_path.replace("/rar/active/", "/rar/complete/"), "w").write(
                json.dumps(task_state)
            )
        else:
            print(f"FAIL: {task_path}")

            open(task_path, "w").write(json.dumps(task_state))

    def run_task(self, task_path):
        error_occurred = False
        task_state = json.loads(open(task_path, "r").read())

        if not task_state.get("cmd"):
            self.fail(task_path, "Missing command", force_move=True)

            return

        cmd_type = type(task_state["cmd"])

        if cmd_type is list:
            from time import sleep

            log_result = {}

            # check_output takes a list of commands, but it appears it joins those commands
            # with a semicolon to run them (though I can't find confirmation), which we don't
            # want, so we'll fire off an individual call for each command instead
            for index, command in enumerate(task_state["cmd"]):
                log_result[f"({index + 1}) {command}"] = self.run_task_command(command)

                task_state["output"] = log_result

                open(task_path, "w").write(json.dumps(task_state))

                # Some commands are failing due to the index.lock file still existing when they're run,
                # which leads me to believe the commands are being executed too quickly. Adding a little
                # delay in between each one should hopefully resolve that (if my suspicion is correct).
                sleep(0.1)  # Increase by increments of 0.1 if needed

        elif cmd_type is str:
            log_result = self.run_task_command(task_state["cmd"])

        else:
            error_occurred = True
            log_result = f"Invalid command type: {cmd_type}"

        task_state = json.loads(open(task_path, "r").read())

        task_state["complete"] = True
        task_state["error"] = error_occurred
        task_state["cmd_type"] = str(cmd_type)
        task_state["output"] = log_result

        open(task_path, "w").write(json.dumps(task_state))

    def run_task_command(self, command):
        try:
            output = check_output([command], shell=True, stderr=STDOUT).decode().strip()

            return output.split("\n") if "\n" in output else output

        except CalledProcessError as e:
            return [
                e.output.decode() or e.stdout.decode(),
                str(e)
            ]


if __name__ == "__main__":
    PollRequests()
