#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class __Decimeter:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Decimeter"

    @property
    def AssetPath(self):
        return "decimeter"

    @property
    def Abbreviation(self):
        return "dm"

    @property
    def BaseConversionMultiplier(self):
        return 0.1

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Decimeter = __Decimeter()
