#!/usr/bin/python
#
# 2022 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class _Meter:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Meter"

    @property
    def AssetPath(self):
        return "meter"

    @property
    def Abbreviation(self):
        return "m"

    @property
    def BaseConversionMultiplier(self):
        return 1

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Meter = _Meter()
