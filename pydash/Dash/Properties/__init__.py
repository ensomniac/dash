#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


def MergeDefaultValues(data, shared_properties):
    """
    From a set of shared_properties, merge any default values for any
    properties that have one, or set an existing enum if one exists
    """

    for item in shared_properties:
        if item.get("default_value"):
            data[item["key"]] = item["default_value"]
        elif item.get("property_set_key"):
            data[item["key"]] = get_first_enum_for_property_set(item["property_set_key"])

    return data


def GetModuleByConfigType(config_type):
    config_module = None

    if config_type == "component":
        from .Components import Components

        config_module = Components()

    return config_module


def GetConfig(config_type):
    config_module = GetModuleByConfigType(config_type)

    if not config_module:
        return {"error": f"Unknown config type: {config_type}"}

    return config_module.GetAll()


def GetComponents():
    from .Components import Components

    return Components().GetAll()


def SetConfigProperty(config_type, obj_id, key, value):
    config_module = GetModuleByConfigType(config_type)

    if not config_module:
        return {"error": f"Unknown config type: {config_type}"}

    return config_module.SetConfigProperty(obj_id, key, value)


def CreateConfig(config_type):
    config_module = GetModuleByConfigType(config_type)

    if not config_module:
        return {"error": f"Unknown config type: {config_type}"}

    return config_module.CreateConfig()


def DeleteConfig(config_type, obj_id):
    config_module = GetModuleByConfigType(config_type)

    if not config_module:
        return {"error": f"Unknown config type: {config_type}"}

    return config_module.Delete(obj_id)


def get_first_enum_for_property_set(property_set_key):
    prop_module = GetModuleByConfigType(property_set_key)

    if not prop_module:
        raise Exception(f"Unknown property module: '{property_set_key}'")

    all_props = prop_module.GetAll()

    if not all_props["order"]:
        raise Exception(f"Property Set has no existing options. Create them first for: {property_set_key}")

    # TODO: Add some magic key that can be used to target one object as the
    #  default for a collection, rather than defaulting to the first

    return all_props["order"][0]
