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
from Dash.Utils import OapiRoot
from traceback import format_exc
from subprocess import check_output, STDOUT, CalledProcessError
from Dash.LocalStorage import Read, Write

# Feb 21 2023 Change Notes (for Andrew)
#
# + Switched from a 'minute-cron' to a system that can live for longer, to
#       account for executions that may take long periods of time to run
#
# + Timing mechanism switched to total duration in minutes - this needs to
#       reflect the period that the cron uses to start this script
#
# + Converted self.request_path into a property
#
# + ** Added back in a check to see if the command was started, and
#          starting it ONLY if it hasn't been started :-)


class PollRequests:
    def __init__(self):
        # Check to see if another process (long process) is still
        # running on the server. If there is one, kill this process
        # and allow the other process to continue.
        self.check_process_running()

        self.run_duration_in_minutes = 1.0
        self.start_time              = datetime.now()
        self.task_fail_timeout_sec   = 60
        self.running_task_ids        = []

        # Check every couple seconds to monitor
        # active jobs or start new jobs
        self.periodic_check()

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
    def uptime(self):
        uptime_sec = datetime.now()-self.start_time
        uptime_sec = uptime_sec.total_seconds()
        return uptime_sec

    @property
    def active_requests(self):
        return os.listdir(self.request_path)

    def periodic_check(self):

        if self.uptime >= self.run_duration_in_minutes*60:
            if self.running_task_ids:
                print("Waiting for running tasks to exit: " + ", ".join(self.running_task_ids))
            else:
                print("\tComplete, exiting.\n")
                return

        Timer(1, self.periodic_check).start()

        self.monitor_active_requests()

    def monitor_active_requests(self):

        # If we don't have any active
        # requests, there's nothing to do
        if not self.active_requests:
            print("No active requests")
            return

        # For each task_id in the active folder, check it's status,
        # start it maybe, and make some important decisions
        for task_id in self.active_requests:
            if not task_id.isdigit(): continue
            self.monitor_task_status(task_id)

    def get_task_path(self, task_id):
        return os.path.join(self.request_path, task_id)

    def get_task_data(self, task_id):
        return Read(self.get_task_path(task_id))

    def monitor_task_status(self, task_id):
        # Monitor one active task. This function is called
        # every few seconds. Be careful!

        task_data = self.get_task_data(task_id)

        # This is the number of seconds from when the initial
        # task was queued, NOT the total number of seconds
        # that the job has been running. It may not have
        # even started yet...
        task_uptime = datetime.now()-datetime.fromisoformat(task_data["queued_time_iso"])
        task_uptime = task_uptime.total_seconds()

        if not task_data["started"]:
            # Well let's start this bad boy up!
            task_data = self.start_task(task_data)

        # This is the number of seconds a job has been running
        job_uptime = datetime.now()-datetime.fromisoformat(task_data["start_time_iso"])
        job_uptime = job_uptime.total_seconds()

        # Add the current time so that the parent script, RunAsRoot.py
        # can confirm that we're managing this task
        task_data["last_poll_iso"] = datetime.now().isoformat()

        print("Monitor active task: " + str(task_id), "Uptime: " + str(task_uptime) + " / " + str(job_uptime))

        Write(os.path.join(self.request_path, task_id), task_data)

        if job_uptime >= self.task_fail_timeout_sec:
            fail_msg = "Task runtime exceeded maximum of "
            fail_msg += str(self.task_fail_timeout_sec) + " seconds."
            Timer(0.1, self.terminate_task, [task_data["id"], fail_msg]).start()

    def start_task(self, task_data):
        # Start the task, modify task_data and return task_data

        if task_data["started"]:
            return

        task_data["started"]        = True
        task_data["start_time_iso"] = datetime.now().isoformat()

        cmd_type = type(task_data["cmd"])

        # We'll thread each of these using a timer so that the
        # initial parent function can write the start state
        # back to disk before we read it again

        if cmd_type is list:
            self.running_task_ids.append(task_data["id"])
            Timer(0.1, self.run_multiple_tasks, [task_data["id"]]).start()
        elif cmd_type is str:
            self.running_task_ids.append(task_data["id"])
            Timer(0.1, self.run_single_task, [task_data["id"]]).start()
        else:
            fail_msg = "Unhandled command type: " + str(cmd_type)
            Timer(0.1, self.terminate_task, [task_data["id"], fail_msg]).start()

        return task_data

    def terminate_task(self, task_id, fail_msg=None):

        task_data = self.get_task_data(task_id)
        task_data["complete"] = True
        task_data["error"] = fail_msg

        active_task_path = self.get_task_path(task_id)
        complete_task_path = active_task_path.replace("/rar/active/", "/rar/complete/")

        if not fail_msg:
            print("\tTask exited normally!\n")
        else:
            print("\tTask failed: " + str(fail_msg) + "\n")

        Write(complete_task_path, task_data)
        os.remove(active_task_path)

        print("\tMoved to " + complete_task_path)

        if task_id in self.running_task_ids:
            self.running_task_ids.remove(task_id)


    def run_multiple_tasks(self, task_id):
        print("\trun_multiple_tasks(" + task_id + ")")

        self.run_tasks(task_id, self.get_task_data(task_id)["cmd"])
        self.terminate_task(task_id)

    def run_single_task(self, task_id):
        print("\trun_single_task(" + task_id + ")")

        self.run_tasks(task_id, [self.get_task_data(task_id)["cmd"]])
        self.terminate_task(task_id)

    def run_tasks(self, task_id, tasks):
        cmd_result = []

        for cmd in tasks:
            cmd_result.append({"cmd": cmd, "result": self.run_task_command(cmd)})
            sleep(0.25)

        # Write the result back
        task_data = self.get_task_data(task_id)
        task_data["cmd_result"] = cmd_result
        Write(self.get_task_path(task_id), task_data)
        sleep(0.1)

    def run_task_command(self, command):

        result = None

        try:
            result = check_output([command], shell=True, stderr=STDOUT).decode().strip()
        except CalledProcessError as e:
            result = e.output.decode() or e.stdout.decode()
            result += " || " + str(e)

        return result









    def _periodic_check(self):
        # if self.checks >= 20:
        #     return

        # Timer(3, self.periodic_check).start()

        # self.checks += 1

        # requests = os.listdir(self.request_path)

        # if not requests:
        #     print("nothing")

        #     return

        # for task_id in requests:
        #     if task_id.startswith("."):
        #         continue

        task_path = os.path.join(self.request_path, task_id)

        timestamp_now = datetime.fromtimestamp(
            Path(task_path).stat().st_mtime
        )

        age = int((datetime.now() - timestamp_now).total_seconds())

        if age > self.fail_timeout * 2:
            # Give it slightly more time since it's more likely that the source task will kill it
            self.fail(task_path, "Task timed out", force_move=True)

            return

        print(f"[{str(age)}] {task_id}")

        try:
            self.run_task(task_path)
        except:
            self.fail(task_path, format_exc())

        # os.remove(os.path.join(self.request_path, task_id))

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

    # def fail(self, task_path, error, force_move=False):
    #     # print(">> " + task_path) -

    #     try:
    #         task_state = json.loads(open(task_path, "r").read())
    #     except:
    #         # We may want to just remove the file in this case, but starting with this for now
    #         error = f"Initial error: {error}\nSubsequent error: Failed to read task file, removing it: {task_path}"
    #         task_state = {}
    #         # force_move = True  # Need this?

    #     if "initial_task_state" not in task_state:
    #         task_state["initial_task_state"] = {k: v for k, v in task_state.items()}

    #     task_state["complete"] = True
    #     task_state["error"] = True
    #     task_state["output"] = error

    #     if force_move:
    #         print(f"FAIL & MOVE: {task_path}")

    #         os.remove(task_path)

    #         open(task_path.replace("/rar/active/", "/rar/complete/"), "w").write(
    #             json.dumps(task_state)
    #         )
    #     else:
    #         print(f"FAIL: {task_path}")

    #         open(task_path, "w").write(json.dumps(task_state))








    def run_task(self, task_path):
        error_occurred = False
        task_state = json.loads(open(task_path, "r").read())



        cmd_type = type(task_state["cmd"])

        if cmd_type is list:
            # from time import sleep

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

    def _run_task_command(self, command):
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
