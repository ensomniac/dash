#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def FormatTime(dt_obj, time_format=1, tz="utc"):
    """
    Format a timestamp string using a datetime object.

    :param datetime.datetime dt_obj: source datetime object
    :param int time_format: (default=1)
    :param str tz: (default="utc")
    :return: strftime-formatted timestamp
    :rtype: string
    """

    if tz != "utc":
        dt_obj = change_dt_tz(dt_obj, tz)

    time_markup = dt_obj.strftime("%I:%M %p").lower()

    if time_markup.startswith("0"):
        time_markup = time_markup[1:]

    day = int(dt_obj.strftime("%d"))

    if 4 <= day <= 20 or 24 <= day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][day % 10 - 1]

    day_string = f"{day}{suffix}"
    date_markup = dt_obj.strftime(f"%A, %B {day_string} %Y")

    # Display just the date
    if time_format == 0:
        return date_markup

    # Display just the date in a human-readable format
    if time_format == 1:
        return dt_obj.strftime("%m/%d/%y at %I:%M %p")

    # Format: Sunday, July 17th 2011 at 12:15pm
    if time_format == 2:
        return dt_obj.strftime(f"%A, %B {day}{suffix} %Y at %I:%M %p")

    # Format: 4/24/2017
    if time_format == 3:
        return f"{dt_obj.month}/{dt_obj.day}/{dt_obj.year}"

    # Format: 12:15 PM
    if time_format == 4:
        formatted_time = dt_obj.strftime("%I:%M %p")

        if formatted_time[0] == "0":
            formatted_time = formatted_time[1:]

        return formatted_time

    # Format: 12:15:01pm
    if time_format == 5:
        return dt_obj.strftime("%I:%M:%S %p")

    # Format: July 17th, 2011
    if time_format == 6:
        return dt_obj.strftime(f"%B {day}{suffix}, %Y")

    # Format: 4_24_11
    if time_format == 7:
        return dt_obj.strftime("%m_%d_%y")

    # Format: Monday, July 17th
    if time_format == 8:
        return dt_obj.strftime(f"%A %B {day}{suffix}")

    # Format: 12 days ago / 2 months ago
    if time_format == 9:
        from datetime import datetime

        timesince = (datetime.now() - dt_obj)

        if timesince.days == 0:
            return "Today"

        if timesince.days == 1:
            return "Yesterday"

        if timesince.days <= 30:
            return f"{timesince.days} days ago"

        if timesince.days <= 45:
            return "A month ago"

        if timesince.days <= 75:
            return f"{timesince.days} days ago"

        # More than 75 days ago
        return f"{int(round(timesince.days / 30.0))} months ago"

    # Format: 4/24
    if time_format == 10:
        return f"{dt_obj.month}/{dt_obj.day}"

    # Format: 02/04/2022
    if time_format == 11:
        return dt_obj.strftime("%m/%d/%Y")

    # Format: Sunday, July 17, 2011
    if time_format == 12:
        return dt_obj.strftime(f"%A, %B {day}, %Y")

    # Format: 02.04.2022
    if time_format == 13:
        return dt_obj.strftime("%m.%d.%Y")

    # Format: July 17th, 2011 at 7:15PM (non-zero-padded hour)
    if time_format == 14:
        return f"{dt_obj.strftime(f'%B {day}{suffix}, %Y')} at {dt_obj.strftime('%I').lstrip('0')}:{dt_obj.strftime('%M%p')}"

    # Format: 020422_2153
    if time_format == 15:
        return dt_obj.strftime("%m%d%y_%H%M")

    # Format: July 17, 2011
    if time_format == 16:
        return dt_obj.strftime(f"%B {day}, %Y")

    # Format date and time in a human-readable format
    return f"{date_markup} at {time_markup}"


def GetAssetPath(string):
    from unidecode import unidecode

    cleaned = []
    asset_path = ""
    cleaned_split = []

    # Replacing the hyphen here is okay at the top-level, but everything else should be handled below
    string = unidecode(string.strip().lower().replace("-", "_"))

    # TODO: This function should account for camelCase, and convert it to camel_case

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


def ValidateEmailAddress(email):
    email = email.lower()

    if not email:
        return False

    domain = email.split("@")[-1]

    if not domain:
        return False

    if len(email) and (email.count("@") != 1 or "." not in domain):
        return False

    if not len(domain.split(".")[0]) or not len(domain.split(".")[-1]) or not len(email.split("@")[0]):
        return False

    return True


def change_dt_tz(dt_obj, tz):
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
