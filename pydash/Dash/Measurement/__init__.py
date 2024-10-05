#!/usr/bin/python
#
# 2024 Ensomniac Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com


class Measurement:
    _value: float
    _unit: callable
    _system: callable

    def __init__(self, system, unit, value):
        """
        Object that manages operations between measurements

        :param str system: metric or imperial
        :param str unit: inch, meter, etc.
        :param float value: numerical value of unit
        """

        self.system_asset_path = system
        self.unit_asset_path = unit
        self.value = value

    @property
    def System(self):
        if not hasattr(self, "_system"):
            self._system = self.validate_system(self.system_asset_path)

        return self._system

    @property
    def Unit(self):
        if not hasattr(self, "_unit"):
            self._unit = self.validate_unit(self.unit_asset_path)

        return self._unit

    @property
    def Value(self):
        if not hasattr(self, "_value"):
            self._value = self.validate_value(self.value)

        return self._value

    @property
    def ValueInBaseUnits(self):
        """
        Ex: Get inch value (Imperial base unit) of self.Value when self.Unit is foot
        """

        return self.Value * self.Unit.BaseConversionMultiplier

    def ConvertTo(self, target_unit, readable=False):
        """
        :param str target_unit: inch, meter, etc.
        :param bool readable: Return a readable string with relevant symbols instead of number
        """

        target_unit = self.validate_unit(target_unit)
        value = self.Value * target_unit.BaseConversionMultiplier

        if readable and type(value) is float and self.Unit.Symbol and target_unit.Symbol:
            split = str(value).split(".")
            whole = int(split[0])
            partial = int(float(f".{split[1]}") / target_unit.BaseConversionMultiplier)

            if self.System.AssetPath == "imperial":
                return f"{whole}{target_unit.Symbol} {partial}{self.Unit.Symbol}"

            elif self.System.AssetPath == "metric":
                pass  # TODO?

        return value

    def ToDict(self):
        return {
            "system": self.System.ToDict(),
            "unit": self.Unit.ToDict(),
            "base_unit": self.System.BaseUnit,
            "value": self.Value,
            "value_in_base_units": self.ValueInBaseUnits
        }

    def validate_system(self, system):
        system = system.lower().strip()

        if system == "metric":
            from .Metric import Metric

            return Metric

        if system == "imperial":
            from .Imperial import Imperial

            return Imperial

        raise Exception("Invalid measurement system, must be either 'metric' or 'imperial'")

    def validate_unit(self, unit):
        unit = unit.lower().strip().rstrip("es").rstrip("s")

        for unit_module in self.System.UnitModules:
            if unit_module.AssetPath == unit:
                return unit_module

        # List of all unit asset paths
        options = ', '.join([u['asset_path'] for u in self.System.UnitCombos])

        raise Exception(f"Invalid measurement unit, options: {options}")

    def validate_value(self, value):
        try:
            return float(value)

        except Exception as e:
            raise ValueError("Invalid measurement value type, must be float or int") from e


def Convert(system, source_unit, source_unit_value, target_unit, readable=False):
    return Measurement(system, source_unit, source_unit_value).ConvertTo(target_unit, readable)


def SystemToDict(system_module):
    return {
        "display_name": system_module.DisplayName,
        "asset_path": system_module.AssetPath,
        "units": [m.AssetPath for m in system_module.UnitModules],
    }


def UnitToDict(unit_module):
    data = {
        "display_name": unit_module.DisplayName,
        "asset_path": unit_module.AssetPath,
        "abbreviation": unit_module.Abbreviation,
        "base_conversion_multiplier": unit_module.BaseConversionMultiplier,
    }

    if hasattr(unit_module, "Symbol"):
        data["symbol"] = unit_module.Symbol

    return data
