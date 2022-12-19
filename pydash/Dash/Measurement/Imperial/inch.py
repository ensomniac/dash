#!/usr/bin/python
#
# 2023 Ensomniac Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class _Inch:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Inch"

    @property
    def AssetPath(self):
        return "inch"

    @property
    def Abbreviation(self):
        return "in"

    @property
    def Symbol(self):
        return "″"

    @property
    def BaseConversionMultiplier(self):
        return 1

    def ToDict(self):
        from .. import UnitToDict

        return UnitToDict(self)


Inch = _Inch()
