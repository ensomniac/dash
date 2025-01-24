#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
This is a somewhat specific script that is meant to be run
only on the primary dash / dash.guide box, currently oapi.

It is intended to be run by itself or as a minute cron:
* * * * *   /usr/bin/python /var/www/vhosts/oapi.co/dash/github/dash/pydash/Dash/Server/ServerUsersCron.py

However, the script only actually processes accounts every 5 minutes
"""

import os
import sys

from datetime import datetime
from Dash.Utils import OapiRoot


class ServerUsersCron:
    _server_data_root: str

    def __init__(self, force=False):

        # This is the number of minutes a password request remains active. Applies to new users
        # as well as existing resets. After the timeout specified in Dash.Users.ResetResponse,
        # the user will see a "Your password reset link has expired" message. After
        # the below timeout, the file is removed and the use will see an error.
        self.max_pw_reset_timeout_min = 1440  # 24 hours

        if not (datetime.now().minute % 5 == 0) and not force:
            return  # Every five minutes (consider simply updating the cron schedule to `5 * * * * ` down the line)

        self.Run()

    @property
    def server_data_root(self):
        if not hasattr(self, "_server_data_root"):
            self._server_data_root = os.path.join(OapiRoot, "dash", "local", "server_monitor")

            if not os.path.exists(self._server_data_root):
                from Dash.LocalStorage import ConformPermissions

                os.makedirs(self._server_data_root)

                ConformPermissions(self._server_data_root)

        return self._server_data_root

    def Run(self):
        for site in os.listdir(OapiRoot):
            self.check_site_users(site)

    def check_site_users(self, site):
        users_root = os.path.join(OapiRoot, site, "local", "users")

        if not os.path.exists(users_root):
            return

        for user_email in os.listdir(users_root):
            user_root = os.path.join(users_root, user_email)

            if os.path.islink(user_root):
                continue

            self.check_site_user(user_root)

    def check_site_user(self, user_root):
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
                print(f"[{user_email}] Removing stale file: {min_since} minutes")

                os.remove(request_path)
            else:
                print(f"[{user_email}] Active request age: {min_since} minutes")

    def minutes_since_last_modified(self, file_path):
        return int((datetime.now() - datetime.fromtimestamp(os.path.getmtime(file_path))).total_seconds() / 60)


if __name__ == "__main__":
    ServerUsersCron()
