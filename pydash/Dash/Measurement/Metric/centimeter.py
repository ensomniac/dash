#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class _Centimeter:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Centimeter"

    @property
    def AssetPath(self):
        return "centimeter"

    @property
    def Abbreviation(self):
        return "cm"

    @property
    def BaseConversionMultiplier(self):
        return 0.01

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Centimeter = _Centimeter()
