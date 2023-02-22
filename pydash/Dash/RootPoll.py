#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import json

from time import sleep
from threading import Timer
from datetime import datetime
from Dash.Utils import OapiRoot
from traceback import format_exc
from subprocess import check_output, STDOUT, CalledProcessError
from Dash.LocalStorage import Read, Write

############################################################
#  This code runs on the server every minute via a cron    #
#  It is responsible for monitoring the state of existing  #
#  tasks and for starting tasks that have not yet started  #
############################################################

# Feb 21 2023 Change Notes (for Andrew)
#
# + This script now does more of the heavy lifting that RunAsRoot.py used to
#       do. Instead, RunAsRoot.py is now simplified, and only responsible for
#       writing the initial task to disk and monitoring the task's progress.
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
        return uptime_sec.total_seconds()

    @property
    def active_requests(self):
        return os.listdir(self.request_path)

    def periodic_check(self):
        # Basic maintenence of the runtime loop

        if self.uptime >= self.run_duration_in_minutes*60:
            if self.running_task_ids:
                print("Waiting for running tasks to exit: " + ", ".join(self.running_task_ids))
            else:
                print("\tComplete, exiting.\n")
                return

        Timer(1, self.periodic_check).start()

        if self.uptime > 60*5:
            self.send_warning_notification()

        self.monitor_active_requests()

    def send_warning_notification(self):
        if hasattr(self, "_warning_notification_sent"):
            return

        self._warning_notification_sent = True

        kill_cmd = "sudo kill -9 " + str(os.getpid())

        print("Send warning!")
        subject = "Warning: Dash.RootPoll has been running for a long time!"
        body = "Current process run time: " + str(self.uptime) + "<br><br>"
        body += "RootPoll.py is a cron that is restarted each minute. If an instance "
        body += "continues running long after a minute, a process that was started is "
        body += "likely hung for a long time or requiring extra time. Regardless, this "
        body += "needs to be looked into since a new cron will not start until this is resolved."
        body += "<br><br>"
        body += "Killing this process now with '" + kill_cmd + "'"

        from Dash.Utils import SendEmail

        result = SendEmail(
            subject           = subject,
            notify_email_list = ["ryan@ensomniac.com"],
            msg               = body,
            error             = None,
            strict_notify     = True,
            sender_email      = "ryan@ensomniac.com",
            sender_name       = "Ryan Martin"
        )

        os.system(kill_cmd)

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
        # self.terminate_task() is called regardless of
        # whether a task was successful or not

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






if __name__ == "__main__":
    PollRequests()


