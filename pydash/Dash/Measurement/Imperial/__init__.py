#!/usr/bin/python
#
# 2022 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com


class _Imperial:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Imperial"

    @property
    def AssetPath(self):
        return "imperial"

    @property
    def UnitModules(self):
        return [
            self.Inch,
            self.Foot,
            self.Yard
        ]

    @property
    def UnitCombos(self):
        return self.get_all_unit_combos()

    @property
    def BaseUnit(self):
        return self.Inch.ToDict()

    @property
    def Inch(self):
        from .inch import Inch

        return Inch

    @property
    def Foot(self):
        from .foot import Foot

        return Foot

    @property
    def Yard(self):
        from .yard import Yard

        return Yard

    def ToDict(self):
        from .. import SystemToDict

        return SystemToDict(self)

    def get_all_unit_combos(self):
        from .. import UnitToDict

        units = []

        for mod in self.UnitModules:
            units.append(UnitToDict(mod))

        return units


Imperial = _Imperial()
