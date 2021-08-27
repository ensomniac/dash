#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash.Properties.SharedPropertyType import Float, String, Int, Bool, PropertySet


class _SharedPropertyTypes:
    _all: dict

    def __init__(self):
        self.Float = Float(self)
        self.Bool = Bool(self)
        self.Int = Int(self)
        self.String = String(self)
        self.PropertySet = PropertySet(self)

        # Generic example
        # from Dash.Properties.SharedPropertyType import SharedPropertyType
        # self.String = SharedPropertyType(self, "String", "string")

    def Subscribe(self, shared_property_type_obj):
        if not hasattr(self, "_all"):
            self._all = {}

        self._all[shared_property_type_obj.AssetPath] = shared_property_type_obj

    def GetByAssetPath(self, asset_path):
        if not hasattr(self, "_all"):
            return None

        return self._all.get(asset_path)


def Validate(asset_path, value_to_validate, config_module, validation_options={}):
    prop = SharedPropertyTypes.GetByAssetPath(asset_path)

    if not prop:
        return {"error": f"Failed to locate property by asset_path: '{asset_path}'"}

    if validation_options:
        prop.SetValidationOptions(validation_options)

    return prop.Validate(value_to_validate, config_module)


SharedPropertyTypes = _SharedPropertyTypes()
