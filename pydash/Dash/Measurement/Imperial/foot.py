#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class __Foot:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Foot"

    @property
    def AssetPath(self):
        return "foot"

    @property
    def Abbreviation(self):
        return "ft"

    @property
    def Symbol(self):
        return "'"

    @property
    def BaseConversionMultiplier(self):
        return 12

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Foot = __Foot()
