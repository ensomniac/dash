#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com
#
# This is a somewhat specific script that is meant to be run
# only on the primary dash / dash.guide box, currently oapi.
#
# It is intended to be run by itself or as a minute cron:

# *   *   *   *   *   /usr/bin/python /var/www/vhosts/oapi.co/dash/github/dash/pydash/Dash/Server/ServerUsersCron.py

# However, the script only actually processes accounts every 5 minutes

import os
import sys

from datetime import datetime, timedelta
from subprocess import check_output
from Dash.Utils import OapiRoot
from Dash.LocalStorage import Read, Write

class ServerUsersCron:
    def __init__(self, force=False):

        # This is the number of minutes a password request remains active
        # Applies to new users as well as existing resets
        # After 5 minutes, the user will see a "Your password reset link has expired" message
        # After 10 (or whatever number is below) the file is removed and the use will see an error
        self.max_pw_reset_timeout_min = 10

        now = datetime.now()
        is_multiple_of_five = (now.minute % 5 == 0)

        if not is_multiple_of_five and not force:
            return

        self.Run()

    @property
    def server_data_root(self):
        server_data_root = os.path.join(OapiRoot, "dash", "local", "server_monitor")

        if not os.path.exists(server_data_root):
            os.makedirs(server_data_root)
            self.conform_path(server_data_root)

        return server_data_root

    def Run(self):

        for site in os.listdir(OapiRoot):
            self.check_site_users(site)

    def check_site_users(self, site):
        site_root  = os.path.join(OapiRoot, site)
        site_local = os.path.join(site_root, "local")
        users_root = os.path.join(site_local, "users")

        if not os.path.exists(users_root):
            return

        for user_email in os.listdir(users_root):
            user_root = os.path.join(users_root, user_email)
            if os.path.islink(user_root):
                continue

            self.check_site_user(site, user_root)

    def check_site_user(self, site, user_root):
        user_email = os.path.basename(user_root)
        reset_root = os.path.join(user_root, "reset_requests")

        if not os.path.exists(reset_root):
            return

        requests = os.listdir(reset_root)

        if not requests:
            return

        for request in requests:
            request_path = os.path.join(reset_root, request)
            min_since = self.minutes_since_last_modified(request_path)

            if min_since >= self.max_pw_reset_timeout_min:
                print("[" + user_email + "] Removing stale file: " + str(min_since) + " minutes")
                os.remove(request_path)
            else:
                print("[" + user_email + "] Active request age: " + str(min_since) + " minutes")

    def minutes_since_last_modified(self, file_path):
        # Get the last modified time of the file
        modification_time = os.path.getmtime(file_path)
        # Convert it to a datetime object
        modification_datetime = datetime.fromtimestamp(modification_time)
        # Get the current time
        current_datetime = datetime.now()
        # Calculate the difference in minutes
        difference_in_minutes = (current_datetime - modification_datetime).total_seconds() / 60
        return int(difference_in_minutes)

if __name__ == "__main__":
    ServerUsersCron()
