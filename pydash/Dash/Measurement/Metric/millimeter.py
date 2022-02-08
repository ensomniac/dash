#!/usr/bin/python
#
# 2022 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class _Millimeter:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Millimeter"

    @property
    def AssetPath(self):
        return "millimeter"

    @property
    def Abbreviation(self):
        return "mm"

    @property
    def BaseConversionMultiplier(self):
        return 0.001

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Millimeter = _Millimeter()
