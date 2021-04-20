#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


def MergeDefaultValues(data, shared_properties, config_module):
    """
    From a set of shared_properties, merge any default values for any
    properties that have one, or set an existing enum if one exists
    """

    for item in shared_properties:
        if item.get("default_value"):
            data[item["key"]] = item["default_value"]
        elif item.get("property_set_key"):
            data[item["key"]] = get_first_enum_for_property_set(item["property_set_key"], config_module)

    return data


def GetComponents():
    from Dash.Properties.Components import Components

    return Components().GetAll()


def get_first_enum_for_property_set(property_set_key, config_module):
    if not config_module:
        raise Exception(f"Unknown property module: '{property_set_key}'")

    all_props = config_module.GetAll()

    if not all_props["order"]:
        raise Exception(f"Property Set has no existing options. Create them first for: {property_set_key}")

    # TODO: Add some magic key that can be used to target one object as the
    #  default for a collection, rather than defaulting to the first

    return all_props["order"][0]
