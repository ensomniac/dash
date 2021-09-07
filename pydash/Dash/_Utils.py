#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

OapiRoot = os.path.join("/var", "www", "vhosts", "oapi.co")


class _Utils:
    _usr_token: str
    _global: callable

    def __init__(self):
        pass

    @property
    def Global(self):
        # This function is meant to return meaningful shared data in the context of a single request

        if not hasattr(self, "_global"):
            from Dash import __name__ as DashName

            self._global = sys.modules[DashName]

        if not hasattr(self._global, "RequestData"):
            self._global.RequestData = {}

        if not hasattr(self._global, "RequestUser"):
            self._global.RequestUser = None

        if not hasattr(self._global, "Context"):
            self._global.Context = None

        return self._global

    @property
    def UserToken(self):
        if not hasattr(self, "_usr_token"):
            try:
                from json import loads
                from os.path import expanduser

                dash_data_path = os.path.join(expanduser("~"), ".dash")
                dash_data = loads(open(dash_data_path, "r").read())

                self._usr_token = dash_data["user"]["token"]
            except:
                return None

        return self._usr_token

    def FormatTime(self, datetime_object, time_format=1, tz="utc"):
        """
        Format a timestamp string using a datetime object.

        :param datetime.datetime datetime_object: source datetime object
        :param int time_format: (default=1)
        :param str tz: (default="utc")
        :return: strftime-formatted timestamp
        :rtype: string
        """

        from datetime import datetime

        if tz != "utc":
            datetime_object = self.change_dt_tz(datetime_object, tz)

        time_markup = datetime_object.strftime("%I:%M %p").lower()

        if time_markup.startswith("0"):
            time_markup = time_markup[1:]

        day = int(datetime_object.strftime("%d"))

        if 4 <= day <= 20 or 24 <= day <= 30:
            suffix = "th"
        else:
            suffix = ["st", "nd", "rd"][day % 10 - 1]

        day_string = f"{day}{suffix}"
        date_markup = datetime_object.strftime(f"%A, %B {day_string} %Y")

        # Display just the date
        if time_format == 0:
            return date_markup

        # Display just the date in a human readable format
        elif time_format == 1:
            return datetime_object.strftime("%m/%d/%y at %I:%M %p")

        # Format: Sunday, July 17th 2011 at 12:15pm
        elif time_format == 2:
            return datetime_object.strftime(f"%A, %B {day}{suffix} %Y at %I:%M %p")

        # Format: 4/24/2017
        elif time_format == 3:
            return f"{datetime_object.month}/{datetime_object.day}/{datetime_object.year}"

        # Format: 12:15pm
        elif time_format == 4:
            formatted_time = datetime_object.strftime("%I:%M %p")

            if formatted_time[0] == "0":
                formatted_time = formatted_time[1:]

            return formatted_time

        # Format: 12:15:01pm
        elif time_format == 5:
            return datetime_object.strftime("%I:%M:%S %p")

        # Format: July 17th 2011
        elif time_format == 6:
            return datetime_object.strftime(f"%B {day}{suffix} %Y")

        # Format: 4_24_11
        elif time_format == 7:
            return datetime_object.strftime("%m_%d_%y")

        # Format: Monday, July 17th
        elif time_format == 8:
            return datetime_object.strftime(f"%A %B {day}{suffix}")

        # Format: 12 days ago / 2 months ago
        elif time_format == 9:
            timesince = (datetime.now() - datetime_object)

            if timesince.days == 0:
                return "Today"
            elif timesince.days == 1:
                return "Yesterday"
            elif timesince.days <= 30:
                return f"{timesince.days} days ago"
            elif timesince.days <= 45:
                return "A month ago"
            elif timesince.days <= 75:
                return f"{timesince.days} days ago"
            else:
                # More than 75 days ago
                return f"{int(round(timesince.days / 30.0))} months ago"

        # Format: 4/24
        elif time_format == 10:
            return f"{datetime_object.month}/{datetime_object.day}"

        # Format date and time in a human readable format
        else:
            return f"{date_markup} at {time_markup}"

    def GetRandomID(self):
        from random import randint
        from datetime import datetime

        now = str(datetime.today())

        return f"{now.split('.')[0].strip().replace('-', '').replace(' ', '').replace(':', '').strip()}" \
               f"{now.split('.')[-1].strip()[:3]}" \
               f"{str(randint(0, 99))}"

    def GetAssetPath(self, string):
        cleaned = []
        asset_path = ""
        cleaned_split = []
        string = string.strip().lower()

        # Replace slashes with spaces if they're between words
        if "/" in string:
            string_split = [c for c in string]

            for index, char in enumerate(string_split):
                if char != "/":
                    continue

                try:
                    if not string_split[index - 1].isalnum():
                        continue

                    if not string_split[index + 1].isalnum():
                        continue

                    string_split[index] = " "

                except IndexError:
                    pass

            string = "".join(string_split)

        string_split = string.split(" ")

        # Cleanly break the string into words with no spaces
        for index, word in enumerate(string_split):
            if not len(word):
                continue

            # Replace any number of spaces with one underscore
            if word == " ":
                try:
                    if string_split[index - 1] == " ":
                        continue

                    if string_split[index + 1] == " ":
                        continue

                except IndexError:
                    pass

                cleaned.append("_")
                continue

            cleaned.append(word)

        # Filter it further, skipping symbols and confirming underscores
        for char in [c for c in "_".join(cleaned)]:
            if char != "_" and not char.isalnum():
                continue

            # Prevent double underscores that would occur from skipped characters above
            if char == "_" and cleaned_split[-1] == "_":
                continue

            cleaned_split.append(char)

        # Compose final asset path
        for index, char in enumerate(cleaned_split):

            # Add underscore between current letter and previous number
            if char.isalpha():
                try:
                    prev = cleaned_split[index - 1]

                    try:
                        int(prev)

                        asset_path += "_"
                    except:
                        pass
                except IndexError:
                    pass

            asset_path += char

            # Add underscore between current letter and next number
            if char.isalpha():
                try:
                    nex = cleaned_split[index + 1]

                    try:
                        int(nex)

                        asset_path += "_"
                    except:
                        pass
                except IndexError:
                    pass

        return asset_path.strip("_")

    def OSListDirCleaned(self, path):
        cleaned_list = []

        for file in os.listdir(path):
            if file.startswith(".") or file.endswith(".meta"):
                continue

            cleaned_list.append(file)

        return cleaned_list

    def SendEmail(self, subject, notify_email_list=[], msg="", error=""):
        # This is a temporary stop until we setup Dash to be able to always run this, regardless of server
        if not os.path.exists(OapiRoot):
            raise Exception("The Mail Module can currently only run directly from the server.")

        import Mail

        sender = "ryan@ensomniac.com"

        if not msg:
            msg = subject

        if len(error) and error != "NoneType: None" and error != "None":
            msg += f"<br><br>Exception/Traceback:<br><br>{error}"

        if sender not in notify_email_list:
            notify_email_list.append(sender)

        message = Mail.create(sender)
        message.set_sender_name(f"Dash <{sender}>")

        for email_address in notify_email_list:
            message.add_recipient(f"{email_address.split('@')[0].strip().title()} <{email_address}>")

        message.set_subject(subject)
        message.set_body_html(msg)
        message.send()

    def UploadImage(self, dash_context, user, img_root, img_file, nested=False):
        from PIL import Image
        from io import BytesIO
        from datetime import datetime
        from Dash.LocalStorage import Write

        org_ext = "png"
        img = Image.open(BytesIO(img_file))
        img_data = {"id": self.GetRandomID()}
        img_data = self.process_exif_image_data(img_data, img)
        img_data["org_format"] = img.format.lower()

        if img_data["exif"] and "Orientation" in img_data["exif"]:
            img, rot_deg = self.rotate_image(img, img_data["exif"])
            img_data["rot_deg"] = rot_deg

        img_data["orig_width"] = img.size[0]
        img_data["orig_height"] = img.size[1]
        img_data["orig_aspect"] = img.size[0] / float(img.size[1])
        img_data["uploaded_by"] = user["email"]
        img_data["uploaded_on"] = datetime.now().isoformat()

        if "jpeg" in img_data["org_format"] or "jpg" in img_data["org_format"]:
            org_ext = "jpg"
        elif "gif" in img_data["org_format"]:
            org_ext = "gif"

        if nested:
            img_root = os.path.join(img_root, img_data["id"])

        os.makedirs(img_root, exist_ok=True)

        orig_path = os.path.join(img_root, f"{img_data['id']}_orig." + org_ext)
        thumb_path = os.path.join(img_root, f"{img_data['id']}_thb.jpg")
        thumb_square_path = os.path.join(img_root, f"{img_data['id']}_sq_thb.jpg")
        data_path = os.path.join(img_root, f"{img_data['id']}.json")

        img.save(orig_path)

        # Convert to RGB AFTER saving the original, otherwise we lose alpha channel if present
        img = img.convert("RGB")
        img_square = img.copy()
        thumb_size = 512

        if img.size[0] != img.size[1]:
            if img.size[0] > img.size[1]:  # Wider
                size = img.size[1]
                x = int((img.size[0]*0.5) - (size*0.5))

                img_square = img.crop((
                    x,         # x start
                    0,         # y start
                    x + size,  # x + width
                    size       # y + height
                ))
            else:  # Taller
                size = img.size[0]
                y = int((img.size[1]*0.5) - (size*0.5))

                img_square = img.crop((
                    0,        # x start
                    y,        # y start
                    size,     # x + width
                    y + size  # y + height
                ))
        else:
            # This image is already square
            pass

        if img_square.size[0] > thumb_size or img_square.size[1] > thumb_size:
            img_square = img_square.resize((thumb_size, thumb_size), Image.ANTIALIAS)

        if img.size[0] > thumb_size or img.size[1] > thumb_size:
            img.thumbnail((thumb_size, thumb_size), Image.ANTIALIAS)

        img.save(thumb_path, quality=40)
        img_square.save(thumb_square_path, quality=40)

        url_root = f"{dash_context['domain']}/local/"
        url_root += img_root.split(f"/{dash_context['asset_path']}/local/")[-1]

        thumb_url = f"{url_root}/{img_data['id']}_thb.jpg"
        thumb_sq_url = f"{url_root}/{img_data['id']}_sq_thb.jpg"
        orig_url = f"{url_root}/{img_data['id']}_orig." + org_ext

        img_data["thumb_url"] = "https://" + thumb_url.replace("//", "/")
        img_data["thumb_sq_url"] = "https://" + thumb_sq_url.replace("//", "/")
        img_data["orig_url"] = "https://" + orig_url.replace("//", "/")

        img_data["width"] = img.size[0]
        img_data["height"] = img.size[1]
        img_data["aspect"] = img.size[0] / float(img.size[1])

        Write(data_path, img_data)

        return img_data

    def process_exif_image_data(self, img_data, img):
        from PIL import ExifTags

        img_exif = img.getexif()
        img_data["exif"] = None

        if img_exif is None:
            return img_data["exif"]

        img_data["exif"] = {}
        for key, val in img_exif.items():
            if key in ExifTags.TAGS:

                processed = False

                if "." in str(val):
                    try:
                        img_data["exif"][str(ExifTags.TAGS[key])] = float(val)
                        processed = True
                    except:
                        pass

                if not processed:
                    try:
                        img_data["exif"][str(ExifTags.TAGS[key])] = int(val)
                        processed = True
                    except:
                        pass

                if not processed:
                    try:
                        img_data["exif"][str(ExifTags.TAGS[key])] = float(val)
                        processed = True
                    except:
                        pass

                if not processed:
                    img_data["exif"][str(ExifTags.TAGS[key])] = str(val)

            else:
                # [Ryan] I'm not really sure what this case looks like:
                img_data["exif"]["__" + str(key)] = str(val)

        return img_data

    def rotate_image(self, img, exif):
        rot_deg = 0

        if exif.get("Orientation") == 6:
            rot_deg = -90
        elif exif.get("Orientation") == 8:
            rot_deg = 90
        elif exif.get("Orientation") == 3:
            rot_deg = 180

        if rot_deg != 0:
            img = img.rotate(rot_deg, expand=True)

        return img, rot_deg

    def change_dt_tz(self, dt_obj, tz):
        from pytz import timezone as pytz_timezone

        if not dt_obj.tzinfo:
            dt_obj = pytz_timezone("UTC").localize(dt_obj)

        if tz == "est":
            dt_obj = dt_obj.astimezone(pytz_timezone("America/New_York"))

        elif tz == "pst":
            dt_obj = dt_obj.astimezone(pytz_timezone("America/Los_Angeles"))

        elif tz == "mst":
            dt_obj = dt_obj.astimezone(pytz_timezone("America/Denver"))

        elif tz == "cst":
            dt_obj = dt_obj.astimezone(pytz_timezone("America/Chicago"))

        return dt_obj


Utils = _Utils()


def GetRandomID():
    return Utils.GetRandomID()


def FormatTime(datetime_object, time_format=1, tz="utc"):
    return Utils.FormatTime(datetime_object, time_format, tz)


def SendEmail(subject, notify_email_list=[], msg="", error=""):
    return Utils.SendEmail(subject, notify_email_list, msg, error)