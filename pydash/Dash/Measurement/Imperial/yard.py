#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class __Yard:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Yard"

    @property
    def AssetPath(self):
        return "yard"

    @property
    def Abbreviation(self):
        return "yd"

    @property
    def BaseConversionMultiplier(self):
        return 36

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Yard = __Yard()
