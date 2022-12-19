#!/usr/bin/python
#
# 2023 Ensomniac Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com


class _Metric:
    def __init__(self):
        pass

    @property
    def DisplayName(self):
        return "Metric"

    @property
    def AssetPath(self):
        return "metric"

    @property
    def UnitModules(self):
        return [
            self.Millimeter,
            self.Centimeter,
            self.Decimeter,
            self.Meter
        ]

    @property
    def UnitCombos(self):
        return self.get_all_unit_combos()

    @property
    def BaseUnit(self):
        return self.Meter.ToDict()

    @property
    def Millimeter(self):
        from .millimeter import Millimeter

        return Millimeter

    @property
    def Centimeter(self):
        from .centimeter import Centimeter

        return Centimeter

    @property
    def Decimeter(self):
        from .decimeter import Decimeter

        return Decimeter

    @property
    def Meter(self):
        from .meter import Meter

        return Meter

    def ToDict(self):
        from .. import SystemToDict

        return SystemToDict(self)

    def get_all_unit_combos(self):
        units = []

        for mod in self.UnitModules:
            unit_combo = {
                "display_name": mod.DisplayName,
                "asset_path": mod.AssetPath,  # May need to be "id" for combos
                "abbreviation": mod.Abbreviation,
                "base_conversion_multiplier": mod.BaseConversionMultiplier,
            }

            units.append(unit_combo)

        return units


Metric = _Metric()
