#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com
#
# This is a somewhat specific script that is meant to be run
# only on the primary dash / dash.guide box, currently oapi.
#
# It is intended to be run by itself or as a minute cron:
#
# *   *   *   *   *   /usr/bin/python /var/www/vhosts/oapi.co/dash/github/dash/pydash/Dash/Server/ServerMonitor.py

import os
import sys

from json import dumps
from Dash.Utils import OapiRoot
from subprocess import check_output
from datetime import datetime, timedelta
from Dash.LocalStorage import Read, Write


class ServerMonitor:
    _now: datetime
    _server_data_root: str

    def __init__(self):
        pass

    @property
    def server_data_root(self):
        if not hasattr(self, "_server_data_root"):
            self._server_data_root = os.path.join(OapiRoot, "dash", "local", "server_monitor")

            if not os.path.exists(self._server_data_root):
                os.makedirs(self._server_data_root)

                self.conform_path(self._server_data_root)

        return self._server_data_root

    @property
    def server_state_data_path(self):
        return os.path.join(self.server_data_root, "server_state.json")

    @property
    def now(self):
        if not hasattr(self, "_now"):
            self._now = datetime.now()

        return self._now

    def get_current_state(self):
        current_state = Read(self.server_state_data_path)

        if not current_state:
            current_state = {
                "available_disk_space": -1,
                "disk_history": []
            }

        return current_state

        # This function doesn't do what it's supposed to but leaving it here to avoid breaking anything
    def get_available_disk_space(self):
        percent_used = check_output("df -h", shell=True).decode().split("% /")[0].strip().split()[-1].strip()

        try:
            percent_used = int(percent_used)

        except Exception as e:
            raise Exception("Failed to parse output of df -h!") from e

        return percent_used

    def conform_path(self, full_path):
        check_output(
            "sudo chmod 755 " + full_path + "; sudo chown ensomniac " + full_path + "; sudo chgrp psacln " + full_path,
            shell=True
        )

    def clean_history(self, current_state):
        print("\n\n*****\n\n")

        max_history = 60

        last_timestamp = None
        last_value = None

        current_state["disk_history"] = current_state["disk_history"][-max_history:]
        current_state["disk_history_hr"] = []

        for period in current_state["disk_history"]:
            # print(x)

            # x = (len(current_state["disk_history"])-1)-x

            if not last_timestamp:
                last_value = period[1]
                last_timestamp = datetime.fromisoformat(period[0]) - timedelta(minutes=1)

            timestamp = datetime.fromisoformat(period[0])
            seconds_since = (timestamp - last_timestamp).total_seconds()
            space_changed = period[1] - last_value
            velocity = round(space_changed / seconds_since, 3)

            # print(period)
            # print(period, seconds_since, space_changed, velocity)

            history = {
                "seconds_since_last_report": seconds_since,
                "velocity_of_change": velocity,
                "space_changed": space_changed,
                "last_value": last_value,
                "current_value": period[1],
                "timestamp": period[0]
            }

            # print(history)

            current_state["disk_history_hr"].append(history)

            last_timestamp = timestamp
            last_value = period[1]

        # current_state["disk_history"] = current_state["disk_history"][-max_history:]

        print("\n\n*****\n\n")

        return current_state

    def get_disk_usage(self):
        from math import ceil
        from shutil import disk_usage

        usage = disk_usage("/")

        # Don't use `usage.total`, must combine `usage.used` and
        # `usage.free` instead to get the closest match to the output of `df`
        used = ceil((usage.used / (usage.used + usage.free)) * 100)

        prefix = ""
        send_email = False

        if used >= 99:
            prefix = f"🚨🚨 EMERGENCY 🚨🚨"
            send_email = self.now.minute % 10 == 0  # Every ten minutes

        elif used >= 98:
            prefix = f"🚨 CRITICAL 🚨"
            send_email = self.now.minute == 0  # Every hour

        elif used >= 97:
            prefix = f"🚨 CRITICAL"
            send_email = self.now.hour % 4 == 0 and self.now.minute == 0  # Every four hours

        elif used >= 95:
            prefix = f"‼️URGENT"
            send_email = self.now.hour == 12 and self.now.minute == 0  # Every day

        elif used >= 93:
            weekday = self.now.weekday()
            prefix = "⚠️ MEDIUM"
            send_email = (weekday == 1 or weekday == 4) and self.now.hour == 12 and self.now.minute == 0  # Twice a week

        elif used >= 91:
            prefix = "⚠️ EARLY"
            send_email = self.now.weekday() == 3 and self.now.hour == 12 and self.now.minute == 0  # Once a week

        if not send_email:
            return used

        from Dash.Utils import SendEmail

        SendEmail(
            subject=f"{prefix} WARNING: {used}% Disk Usage",
            msg=f"{prefix} WARNING: Server disk usage is at {used}%"
        )

        return used

    def Monitor(self):
        current_state = self.get_current_state()

        if "disk_history" not in current_state:
            current_state["disk_history"] = []

        current_state["disk_usage"] = self.get_disk_usage()

        # This function doesn't do what it's supposed to but leaving it here to avoid breaking anything
        current_state["available_disk_space"] = self.get_available_disk_space()

        current_state["last_check"] = self.now.isoformat()
        current_state["disk_history"].append([current_state["last_check"], current_state["available_disk_space"]])

        current_state = self.clean_history(current_state)

        Write(self.server_state_data_path, current_state)

        self.conform_path(self.server_state_data_path)

        print(dumps(current_state, indent=4, sort_keys=True))
        print(f"\n\n *** DISK USAGE AT: {current_state['disk_usage']}% ***\n")


if __name__ == "__main__":
    ServerMonitor().Monitor()
