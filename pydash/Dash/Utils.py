#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class __Utils:
    _global: object
    _usr_token: object

    def __init__(self):
        pass

    @property
    def IsServer(self):
        return os.path.exists("/var/www/vhosts/oapi.co/logs/")

    @property
    def ServerLocalStorePath(self):
        return "/var/www/vhosts/oapi.co/dash/local/packages/"

    @property
    def Global(self):
        # This function is meant to return meaningful shared
        # data in the context of a single request

        if not hasattr(self, "_global"):
            import Dash
            self._global = sys.modules[Dash.__name__]

        if not hasattr(self._global, "RequestData"):
            self._global.RequestData = {}

        if not hasattr(self._global, "RequestUser"):
            self._global.RequestUser = None

        if not hasattr(self._global, "Context"):
            self._global.Context = None

        return self._global

    def GetRandomID(self):
        from random import randint
        from datetime import datetime

        now = str(datetime.today())

        return f"{now.split('.')[0].strip().replace('-', '').replace(' ', '').replace(':', '').strip()}" \
               f"{now.split('.')[-1].strip()[:3]}" \
               f"{str(randint(0, 99))}"

    def OSListDirCleaned(self, path):
        cleaned_list = []

        for file in os.listdir(path):
            if file.startswith(".") or file.endswith(".meta"):
                continue

            cleaned_list.append(file)

        return cleaned_list

    def SendEmail(self, subject, notify_email_list, msg=None):
        # This is a temporary stop until we setup Dash to be able to always run this, regardless of server
        if not os.path.exists("/var/www/vhosts/oapi.co/"):
            raise Exception("The Mail Module can currently only run directly from the server.")

        import Mail

        if not msg:
            msg = subject

        sender = "ryan@ensomniac.com"

        if sender not in notify_email_list:
            notify_email_list.append(sender)

        message = Mail.create(sender)
        message.set_sender_name(f"Dash <{sender}>")

        for email_address in notify_email_list:
            message.add_recipient(f"{email_address.split('@')[0].strip().title()} <{email_address}>")

        message.set_subject(subject)
        message.set_body_html(msg)
        message.send()

    @property
    def LocalPackages(self):
        # Andrew - I'm going to be moving these config objects
        # somewhere else since it's messy doing it like this
        # but for now let's keep it simple and assume there are only two of us

        from Dash.LocalPackageContext import LocalPackageContext

        pkg = []

        if self.IsRyansMachine:

            pkg.append(LocalPackageContext(
                asset_path="altona",
                display_name="Altona IO",
                domain="altona.io",
                local_git_root="/Users/rmartin/Google Drive/altona/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="analog",
                display_name="Analog Technology",
                domain="analog.technology",
                local_git_root="/Users/rmartin/Google Drive/analog/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="smartsioux",
                display_name="Smart Sioux",
                domain="smartsioux.com",
                local_git_root="/Users/rmartin/Google Drive/smartsioux/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="authentic",
                display_name="Authentic Tools Portal",
                domain="authentic.tools",
                local_git_root="/Users/rmartin/Google Drive/authentic/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="authentic",
                display_name="Authentic Tools Portal",
                domain="authentic.tools",
                local_git_root="/Users/rmartin/Google Drive/authentic/github/",
            ))

            pkg.append(LocalPackageContext(
                asset_path="dash_guide",
                display_name="Dash Guide",
                domain="dash.guide",
                local_git_root="/Users/rmartin/Google Drive/dash/",
            ))

        else:

            pkg.append(LocalPackageContext(
                asset_path="altona",
                display_name="Altona IO",
                domain="altona.io",
                local_git_root="/Users/andrewstet/altona_bin/repos/",
            ))

        for package_context in pkg:
            if not os.path.exists(package_context.LocalGitRoot):
                print(f"\nError: this path doesn't exist, but it should: '{package_context.LocalGitRoot}'\n")
                sys.exit()

        return pkg

    @property
    def IsRyansMachine(self):
        return os.path.exists("/Users/rmartin/")

    @property
    def UserToken(self):
        if not hasattr(self, "_usr_token"):
            try:
                from os.path import expanduser
                import json
                dash_data_path = os.path.join(expanduser("~"), ".dash")
                dash_data = json.loads(open(dash_data_path, "r").read())
                self._usr_token = dash_data["user"]["token"]
            except:
                return None

        return self._usr_token

    def FormatTime(self, datetime_object, time_format=1):
        from datetime import datetime

        time_markup = datetime_object.strftime('%I:%M %p').lower()
        if time_markup.startswith("0"):
            time_markup = time_markup[1:]

        day = int(datetime_object.strftime('%d'))

        if 4 <= day <= 20 or 24 <= day <= 30:
            suffix = "th"
        else:
            suffix = ["st", "nd", "rd"][day % 10 - 1]

        day_string = str(day) + suffix

        date_markup = datetime_object.strftime('%A, %B ' + day_string + ' %Y')

        if time_format == 0:
            # Display just the date in a human readable format
            formatted_time = date_markup
        elif time_format == 1:
            # Display the time like this: 4/24/11 at 12:15pm
            formatted_time = datetime_object.strftime('%m/%d/%y at %I:%M %p')
        elif time_format == 2:
            # Format time like this: Sunday, July 17th 2011 at 12:15pm
            day = int(datetime_object.strftime('%d'))
            if 4 <= day <= 20 or 24 <= day <= 30:
                suffix = "th"
            else:
                suffix = ["st", "nd", "rd"][day % 10 - 1]
            formatted_time = datetime_object.strftime('%A, %B ' + str(day) + suffix + ' %Y at %I:%M %p')
        elif time_format == 3:
            # Display the time like this: 4/24/2017
            formatted_time = str(datetime_object.month) + "/" + str(datetime_object.day) + "/" + str(datetime_object.year)
        elif time_format == 4:
            # Display the time like this: 12:15pm
            formatted_time = datetime_object.strftime('%I:%M %p')
            if formatted_time[0] == "0":
                formatted_time = formatted_time[1:]
        elif time_format == 5:
            # Display the time like this: 12:15:01pm
            formatted_time = datetime_object.strftime('%I:%M:%S %p')
        elif time_format == 6:
            # Format time like this: July 17th 2011
            day = int(datetime_object.strftime('%d'))
            if 4 <= day <= 20 or 24 <= day <= 30:
                suffix = "th"
            else:
                suffix = ["st", "nd", "rd"][day % 10 - 1]
            formatted_time = datetime_object.strftime('%B ' + str(day) + suffix + ' %Y')
        elif time_format == 7:
            # Display the time like this: 4_24_11
            formatted_time = datetime_object.strftime('%m_%d_%y')
        elif time_format == 8:
            # Format time like this: Monday, July 17th
            day = int(datetime_object.strftime('%d'))
            if 4 <= day <= 20 or 24 <= day <= 30:
                suffix = "th"
            else:
                suffix = ["st", "nd", "rd"][day % 10 - 1]
            formatted_time = datetime_object.strftime('%A %B ' + str(day) + suffix)
        elif time_format == 9:
            # Format time like this: 12 days ago / 2 months ago
            timesince = (datetime.now()-datetime_object)

            if timesince.days == 0:
                formatted_time = "Today"
            elif timesince.days == 1:
                formatted_time = "Yesterday"
            elif timesince.days <= 30:
                formatted_time = str(timesince.days) + " days ago"
            elif timesince.days <= 45:
                formatted_time = "A month ago"
            elif timesince.days <= 75:
                formatted_time = str(timesince.days) + " days ago"
            else:
                # More than 75 days ago
                formatted_time = str(int(round(timesince.days/30.0))) + " months ago"
        elif time_format == 10:
            # Display the time like this: 4/24
            formatted_time = str(datetime_object.month) + "/" + str(datetime_object.day)
        else:
            # Display the date and time in a human readable format
            formatted_time = date_markup + " at " + time_markup

        return formatted_time


Utils = __Utils()
