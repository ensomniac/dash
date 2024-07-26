#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def FormatTime(dt_obj, time_format=1, tz="utc", update_tz=True):
    """
    Format a timestamp string using a datetime object.

    :param datetime.datetime dt_obj: source datetime object
    :param int time_format: (default=1)
    :param str tz: (default="utc")
    :param bool update_tz: If tz is not "utc", update the dt_obj's timezone (default=True)

    :return: strftime-formatted timestamp
    :rtype: string
    """

    if "/" in tz:  # Get the abbreviation instead of the full name
        from pytz import timezone
        from datetime import datetime

        # Instantiating a dt object is the only way to get the abbreviation
        # because of daylight savings time considerations (ex: EST vs EDT)
        tz = datetime.now(timezone(tz)).strftime("%Z").lower()

    if update_tz and tz != "utc":
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
    date_markup = dt_obj.strftime(f"%A, %B {day_string}, %Y")

    # Format: Monday, October 9th, 2023
    if time_format == 0:
        return date_markup

    # Format: 10/09/23 at 02:51 PM
    if time_format == 1:
        return dt_obj.strftime("%m/%d/%y at %I:%M %p")

    # Format: Sunday, July 17th 2011 at 12:15pm
    if time_format == 2:
        return dt_obj.strftime(f"%A, %B {day}{suffix} %Y at %I:%M %p")

    # Format: 4/24/2017
    if time_format == 3:
        return f"{dt_obj.month}/{dt_obj.day}/{dt_obj.year}"

    # Format: 6:15 PM
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
        return (
            f"{dt_obj.strftime(f'%B {day}{suffix}, %Y')} at "
            f"{dt_obj.strftime('%I').lstrip('0')}:{dt_obj.strftime('%M%p')}"
        )

    # Format: 020422_2153
    if time_format == 15:
        return dt_obj.strftime("%m%d%y_%H%M")

    # Format: July 17, 2011
    if time_format == 16:
        return dt_obj.strftime(f"%B {day}, %Y")

    # Format: 6:15 PM/EST
    if time_format == 17:
        formatted_time = dt_obj.strftime("%I:%M %p")
        tz_name = (tz if not update_tz else (dt_obj.strftime("%Z") or tz)).upper()

        if formatted_time[0] == "0":
            formatted_time = formatted_time[1:]

        return f"{formatted_time}/{tz_name}"

    # Format: 06:15 PM/EST
    if time_format == 18:
        formatted_time = dt_obj.strftime("%I:%M %p")
        tz_name = (tz if not update_tz else (dt_obj.strftime("%Z") or tz)).upper()

        return f"{formatted_time}/{tz_name}"

    # Format: 06:15 PM
    if time_format == 19:
        return dt_obj.strftime("%I:%M %p")

    # Format: 02/04/22
    if time_format == 20:
        return dt_obj.strftime("%m/%d/%y")

    # Format: Monday, Feb 17
    if time_format == 21:
        month = dt_obj.strftime("%B")[0:3]

        return dt_obj.strftime(f"%A, {month} {day}")

    # Format: 2/14
    if time_format == 22:
        return dt_obj.strftime("%-m/%-d")

    # Format: Monday, October 9th, 2023 at 2:51 pm
    return f"{date_markup} at {time_markup}"


def GetReadableHoursMins(secs, include_secs=False):
    mins = secs // 60
    hours = mins // 60

    secs %= 60
    mins %= 60

    secs = max(secs, 0)
    mins = max(mins, 0)
    hours = max(hours, 0)

    if not include_secs:
        if secs >= 30:
            mins += 1

        if mins == 0 and secs:
            mins += 1

    # Adjust for overflow
    if mins == 60:
        mins = 0

        hours += 1

    readable = f"{int(hours)}h {int(mins)}m"

    if include_secs:
        readable += f" {int(secs)}s"

    return readable


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


def Abbreviate(string, length=3, excluded_abbreviations=[], _retry=0):
    if length < 2:
        raise ValueError("Length must be at least 2")

    abbreviation = ""
    cleaned = "".join([c for c in string.strip() if c.isalpha()])
    remaining = [c for c in cleaned]

    if _retry < 1:
        remaining = [c for c in cleaned if c.isupper()]  # Prioritize upper-case letters

        if remaining:
            # Get lower-case letters only after the last upper-case letter
            remaining.extend([c for c in cleaned[(cleaned.rfind(remaining[-1]) + 1):] if c.islower()])

        if len(remaining) < length:
            remaining.extend([c for c in cleaned if c.islower()])

    if _retry < 2:
        filtered = [c for c in remaining if c not in "aeiou"]  # Consonants only

        if len(filtered) >= length:
            remaining = filtered

    if _retry < 3:
        filtered = sorted(set(remaining), key=remaining.index)  # Remaining unique letters, preserving order

        if len(filtered) >= length:
            remaining = filtered

    if len(remaining) < length:
        remaining = [c for c in cleaned]

    # Attempt to add distinctive letters, considering phonetic patterns
    for letter in remaining:
        if len(abbreviation) >= length:
            break

        abbreviation += letter

    abbreviation = abbreviation.lower()

    if abbreviation in excluded_abbreviations or len(abbreviation) < length:
        _retry += 1

        if _retry >= 4:
            from itertools import combinations

            for comb in combinations(remaining, length):
                abrv = "".join(comb).lower()

                if abrv not in excluded_abbreviations:
                    return abrv

            raise ValueError(
                "Failed to generate abbreviation. Tried 5 different ways, "
                "including checking every possible order-respective combination."
            )

        return Abbreviate(string, length, excluded_abbreviations, _retry)

    return abbreviation


def GetRandomHexColor():
    from random import randint

    return f"#{randint(0, 0xFFFFFF):06x}"


def change_dt_tz(dt_obj, tz):
    if str(dt_obj.time()) == "00:00:00":
        return dt_obj

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
