#!/usr/bin/python
#
# 2022 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class _Foot:
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
        return "′"

    @property
    def BaseConversionMultiplier(self):
        return 1 / 12

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Foot = _Foot()
