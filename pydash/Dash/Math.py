#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys

class _Math:
    def __init__(self):
        pass

    def InverseLerp(self, min, max, val, unclamped=False):
        if min:
            min = float(min)
        else:
            min = 0

        if max:
            max = float(max)
        else:
            max = 0

        if val:
            val = float(val)
        else:
            val = 0

        if min == max: return 0.5

        t = float(val - min) / float(max - min)

        if unclamped:
            return t

        if t > 1: t = 1
        if t < 0: t = 0
        return t

    def Lerp(self, valA, valB, t):
        if t > 1: t = 1
        if t < 0: t = 0
        x = valA + t * (valB - valA)
        return x


Math = _Math()
