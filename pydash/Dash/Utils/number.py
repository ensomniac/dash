#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def GetRandomID(date_based=True):
    from random import randint

    if not date_based:
        return randint(1000000000000000000, 9999999999999999999)

    from datetime import datetime

    now = str(datetime.today())

    return f"{now.split('.')[0].strip().replace('-', '').replace(' ', '').replace(':', '').strip()}" \
           f"{now.split('.')[-1].strip()[:3]}" \
           f"{randint(10, 99)}"


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
