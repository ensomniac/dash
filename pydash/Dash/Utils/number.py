#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def GetRandomID(date_based=True):
    """
    Get a random (date-based or not) number to use as an ID.

    :param date_based: Use datetime.today() as a basis instead of a fully-random number (default=True)

    :rtype: str
    :return: A 19-digit number, formatted as a string.
    """

    from random import randint

    if not date_based:
        return str(randint(1000000000000000000, 9999999999999999999))

    from datetime import datetime

    now = str(datetime.today())

    return (
        # 2-digit year, 2-digit month, 2-digit day, 2-digit hour, 2-digit minute, 2-digit second
        f"{now.split('.')[0].strip().replace('-', '').replace(' ', '').replace(':', '').strip()}"
        
        # 3-digit millisecond/microsecond (must zfill because this can technically, but very rarely, be less than three chars long)
        f"{now.split('.')[-1].strip()[:3].zfill(3)}"
        
        # 2-digit random number (must keep this range to ensure it's always exactly two digits)
        f"{randint(10, 99)}"
    )


def Lerp(val_a, val_b, t):
    if t > 1:
        t = 1

    if t < 0:
        t = 0

    return val_a + t * (val_b - val_a)


def InverseLerp(_min, _max, val, unclamped=False):
    if _min:
        _min = float(_min)
    else:
        _min = 0

    if _max:
        _max = float(_max)
    else:
        _max = 0

    if val:
        val = float(val)
    else:
        val = 0

    if _min == _max:
        return 0.5

    t = float(val - _min) / float(_max - _min)

    if unclamped:
        return t

    if t > 1:
        t = 1

    if t < 0:
        t = 0

    return t


def MovePointAroundCircle(circle_center_x, circle_center_y, point_x, point_y, rotation_degrees):
    import math

    r = math.hypot(point_x - circle_center_x, point_y - circle_center_y)
    theta = math.atan2(point_y - circle_center_y, point_x - circle_center_x) + math.radians(rotation_degrees)

    return (
        circle_center_x + (r * math.cos(theta)),  # Moved point X
        circle_center_y + (r * math.sin(theta))   # Moved point Y
    )


def ScaleChildWithParent(parent_x, parent_y, parent_w, parent_h, child_x, child_y, scale_factor):
    import math

    # Calculate the ratio of the distance between the old small rectangle center and the old big rectangle
    # center to the distance between the old big rectangle center and a corner of the old big rectangle
    distance_ratio = math.sqrt((child_x - parent_x) ** 2 + (child_y - parent_y) ** 2) / math.sqrt(parent_w ** 2 + parent_h ** 2)

    # Calculate the new distance between the new small rectangle center and the new big rectangle center
    new_distance = distance_ratio * math.sqrt((parent_w * scale_factor) ** 2 + (parent_h * scale_factor) ** 2)

    # Calculate the angle between the line connecting the old small
    # rectangle center and the old big rectangle center and the x-axis
    angle = math.atan2(child_y - parent_y, child_x - parent_x)

    # Calculate the new center coordinates of the small rectangle
    return (
        parent_x + new_distance * math.cos(angle),  # New x-coordinate of the child center
        parent_y + new_distance * math.sin(angle)   # New y-coordinate of the child center
    )


def GetOrdinalSuffix(num):
    if type(num) is str:
        if "." in num:
            num = float(num)
        else:
            num = int(num)

    if num % 100 in [11, 12, 13]:
        return "th"

    if num % 10 == 1:
        return "st"

    if num % 10 == 2:
        return "nd"

    if num % 10 == 3:
        return "rd"

    return "th"


def GetReadableByteSize(total_bytes):
    """
    Converts a size in bytes to a human-readable format using the decimal system.
    This iterates through the units of measurement (Bytes, Kilobytes, Megabytes, etc.)
    and divides the total number of bytes by 1000 to move to the next unit of measurement
    until it finds the most suitable one (where the number is less than 1000). It then formats
    the number to two decimal places and returns it as a string, along with the unit of measurement.
    """

    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if abs(total_bytes) < 1000.0:
            return f"{total_bytes:3.2f}{unit}B"

        total_bytes /= 1000.0

    return f"{total_bytes:.2f}YB"
