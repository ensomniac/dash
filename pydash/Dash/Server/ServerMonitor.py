#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com
#
# This is a somewhat specific script that is meant to be ran
# only on the primary dash / dash.guide box, currently oapi.
#
# It is intended to be ran by itself or as a minute cron:
#
# *   *   *   *   *   /usr/bin/python /var/www/vhosts/oapi.co/dash/github/dash/pydash/Dash/Server/ServerMonitor.py

import os
import sys
import json
import datetime

from subprocess import check_output
from Dash.Utils import OapiRoot, GetRandomID
from Dash.LocalStorage import Read, Write

class ServerMonitor:
    def __init__(self):
        pass

    @property
    def server_data_root(self):
        server_data_root = os.path.join(OapiRoot, "dash", "local", "server_monitor")

        if not os.path.exists(server_data_root):
            os.makedirs(server_data_root)
            self.conform_path(server_data_root)

        return server_data_root

    @property
    def server_state_data_path(self):
        return os.path.join(self.server_data_root, "server_state.json")

    def get_current_state(self):
        current_state = Read(self.server_state_data_path)

        if not current_state:
            current_state = {}
            current_state["available_disk_space"] = -1
            current_state["disk_history"] = []

        return current_state

    def get_available_disk_space(self):
        result = check_output("df -h", shell=True).decode()
        result = result.split("% /")[0].strip()
        percent_used = result.split()[-1].strip()

        try:
            percent_used = int(percent_used)
        except:
            raise Exception("Failed to parse output of df -h!")

        return percent_used

    def conform_path(self, full_path):
        cmd = "sudo chmod 755 " + full_path
        cmd += "; sudo chown ensomniac " + full_path
        cmd += "; sudo chgrp psacln " + full_path

        check_output(cmd, shell=True)

    def clean_history(self, current_state):
        print("\n\n*****\n\n")

        max_history = 60

        last_timestamp = None
        last_value    = None

        current_state["disk_history"]    = current_state["disk_history"][-max_history:]
        current_state["disk_history_hr"] = []

        for period in current_state["disk_history"]:
            # print(x)
            # x = (len(current_state["disk_history"])-1)-x

            if not last_timestamp:
                last_value = period[1]
                last_timestamp = datetime.datetime.fromisoformat(period[0])
                last_timestamp = last_timestamp - datetime.timedelta(hours=0, minutes=1)

            timestamp = datetime.datetime.fromisoformat(period[0])
            seconds_since = (timestamp-last_timestamp).total_seconds()
            space_changed = period[1]-last_value
            velocity = round(space_changed / seconds_since, 3)

            # print(period)
            # print(period, seconds_since, space_changed, velocity)
            history = {}
            history["seconds_since_last_report"] = seconds_since
            history["velocity_of_change"]        = velocity
            history["space_changed"]             = space_changed
            history["last_value"]                = last_value
            history["current_value"]             = period[1]
            history["timestamp"]                 = period[0]

            # print(history)
            current_state["disk_history_hr"].append(history)

            last_timestamp = timestamp
            last_value     = period[1]

        # current_state["disk_history"] = current_state["disk_history"][-max_history:]

        print("\n\n*****\n\n")

        return current_state

    def Monitor(self):

        current_state = self.get_current_state()

        if "disk_history" not in current_state:
            current_state["disk_history"] = []

        current_state["available_disk_space"] = self.get_available_disk_space()
        current_state["last_check"] = datetime.datetime.now().isoformat()
        current_state["disk_history"].append([current_state["last_check"], current_state["available_disk_space"]])

        current_state = self.clean_history(current_state)

        Write(self.server_state_data_path, current_state)
        self.conform_path(self.server_state_data_path)

        print(current_state)

if __name__ == "__main__":
    ServerMonitor().Monitor()