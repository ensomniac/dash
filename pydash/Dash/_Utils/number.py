#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def GetRandomID():
    from random import randint
    from datetime import datetime

    now = str(datetime.today())

    return f"{now.split('.')[0].strip().replace('-', '').replace(' ', '').replace(':', '').strip()}" \
           f"{now.split('.')[-1].strip()[:3]}" \
           f"{str(randint(0, 99))}"


def Lerp(valA, valB, t):
    if t > 1:
        t = 1

    if t < 0:
        t = 0

    return valA + t * (valB - valA)


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
