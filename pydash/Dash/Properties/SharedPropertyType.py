#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class SharedPropertyType:
    def __init__(
            self,
            types,
            display_name,
            asset_path,
            min_value=None,
            max_value=None,
            default_value=None,
            property_set_key=None,
    ):
        self._types = types
        self._display_name = display_name
        self._asset_path = asset_path

        # Optional
        self._min_value = min_value
        self._max_value = max_value
        self._default_value = default_value
        self._property_set_key = property_set_key

        self._types.Subscribe(self)

    @property
    def AssetPath(self):
        return self._asset_path

    @property
    def MinValue(self):
        return self._min_value

    @property
    def MaxValue(self):
        return self._max_value

    @property
    def DefaultValue(self):
        return self._default_value

    @property
    def PropertySetKey(self):
        return self._property_set_key

    def ToDict(self):
        return {
            "display_name": self._display_name,
            "asset_path": self._asset_path
        }

    def Validate(self, value, config_module):
        return {"error": f"No validation data for property type: {self.AssetPath}"}

    def SetValidationOptions(self, validation_options={}):
        if validation_options.get("min_value"):
            self._min_value = validation_options["min_value"]

        if validation_options.get("max_value"):
            self._max_value = validation_options["max_value"]

        if validation_options.get("default_value"):
            self._default_value = validation_options["default_value"]

        if validation_options.get("default_value"):
            self._default_value = validation_options["default_value"]

        if validation_options.get("property_set_key"):
            self._property_set_key = validation_options["property_set_key"]


class String(SharedPropertyType):
    def __init__(self, types_module):
        SharedPropertyType.__init__(self, types_module, "String", "string")

    def Validate(self, value, config_module):
        try:
            value = str(value)
        except:
            return {"error": f"Value must be a string. Received: '{value}'"}

        return {"valid": True}


class Bool(SharedPropertyType):
    def __init__(self, types_module):
        SharedPropertyType.__init__(self, types_module, "Bool", "bool")

    def Validate(self, value, config_module):
        if not isinstance(value, bool):
            return {"error": f"Value must be a bool. Received: '{value}'"}

        return {"valid": True}


class Float(SharedPropertyType):
    def __init__(self, types_module):
        SharedPropertyType.__init__(self, types_module, "Float", "float")

    def Validate(self, value, config_module):
        try:
            value = float(value)
        except:
            return {"error": f"Value must be a float. Received: '{value}'"}

        if self.MaxValue is not None and value > self.MaxValue:
            return {"error": f"Value exceeds maximum limit of {self.MaxValue}. Received: {value}"}

        if self.MinValue is not None and value < self.MinValue:
            return {"error": f"Value exceeds minimum limit of {self.MinValue}. Received: {value}"}

        return {"valid": True}


class Int(SharedPropertyType):
    def __init__(self, types_module):
        SharedPropertyType.__init__(self, types_module, "Int", "int")

    def Validate(self, value, config_module):
        try:
            value = int(value)
        except:
            return {"error": f"Value must be an integer. Received: '{value}'"}

        if self.MaxValue is not None and value > self.MaxValue:
            return {"error": f"Value exceeds maximum limit of {self.MaxValue}. Received: {value}"}

        if self.MinValue is not None and value < self.MinValue:
            return {"error": f"Value exceeds minimum limit of {self.MinValue}. Received: {value}"}

        return {"valid": True}


class PropertySet(SharedPropertyType):
    def __init__(self, types_module):
        SharedPropertyType.__init__(self, types_module, "PropertySet", "property_set")

    def Validate(self, value, config_module):
        if not self.PropertySetKey:
            return {"error": "Missing PropertySetKey!"}

        from . import ValidateConfigModule

        config_module = ValidateConfigModule(self.PropertySetKey, config_module)

        if not config_module:
            return {"error": f"Invalid PropertySetKey - unable to locate property by name: {self.PropertySetKey}"}

        options = config_module.GetAll()
        data = options["data"]
        order = options["order"]

        if value not in order:
            error_msg = f"Invalid option. Must be an ID of a {self.PropertySetKey} object. Available options: "

            for pid in order:
                display_name = data[pid].get("display_name") or "Unnamed"
                error_msg += f"\n + {display_name} (ID: {pid})"

            return {"error": error_msg}

        return {"valid": True}
