#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys

from types import FunctionType


class ConfigManager:
    def __init__(self, config_type, config_module_function):
        if not isinstance(config_module_function, FunctionType):
            raise Exception(
                "Param 'config_module_function' must be a function, typically "
                "the context-appropriate variation of 'GetModuleByConfigType'"
            )

        self.config_type = config_type
        self.config_module = config_module_function(config_type)

        self.verify_module()

    def Create(self):
        return self.config_module.CreateConfig()

    def Delete(self, obj_id):
        return self.config_module.Delete(obj_id)

    def GetAll(self):
        return self.config_module.GetAll()

    def SetProperty(self, obj_id, key, value):
        return self.config_module.SetConfigProperty(obj_id, key, value)

    def verify_module(self):
        if not self.config_module:
            raise Exception(f"Unknown config type: {self.config_type}")

        if type(self.config_module) == property:
            raise Exception(f"Config module cannot be a property! ({self.config_type})")


def MergeDefaultValues(data, shared_properties, config_module):
    """
    From a set of shared_properties, merge any default values for any
    properties that have one, or set an existing enum if one exists
    """

    for item in shared_properties:

        # Don't use .get() here, if we have a default value, we want to set it
        if "default_value" in item and item["default_value"] is not None:
            data[item["key"]] = item["default_value"]

        elif item.get("property_set_key"):
            property_set_key = item["property_set_key"]
            config_module = ValidateConfigModule(property_set_key, config_module)
            data[item["key"]] = get_first_enum_for_property_set(property_set_key, config_module)

    return data


def GetComponents(dash_context_asset_path):
    from Dash.Properties.Components import Components

    return Components(dash_context_asset_path).GetAll()


def ValidateConfigModule(property_set_key, config_module):
    if isinstance(config_module, FunctionType):
        try:
            config_module = config_module(property_set_key)
        except Exception as e:
            raise Exception(f"Failed to get config/property module for: '{property_set_key}' ({e})")

    return config_module


def get_first_enum_for_property_set(property_set_key, config_module):
    if not config_module:
        raise Exception(f"Unknown config/property module: '{property_set_key}'")

    all_props = config_module.GetAll()

    if not all_props["order"]:
        raise Exception(f"Property Set has no existing options. Create them first for: {property_set_key}")

    # TODO: Add some magic key that can be used to target one object as the
    #  default for a collection, rather than defaulting to the first

    return all_props["order"][0]
