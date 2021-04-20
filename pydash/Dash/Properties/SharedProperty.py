#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys


class SharedProperty:
    def __init__(
            self,
            display_name,
            key,
            prop_type,
            min_value=None,
            max_value=None,
            default_value=None,
            property_set_key=None,
    ):
        self._display_name = display_name
        self._key = key
        self._prop_type = prop_type
        self._min_value = min_value
        self._max_value = max_value
        self._default_value = default_value
        self._property_set_key = property_set_key

    def ToDict(self):
        data = {}
        data["display_name"] = self._display_name
        data["key"] = self._key
        data["prop_type"] = self._prop_type.ToDict()

        if self._min_value is not None:
            data["min_value"] = self._min_value

        if self._max_value is not None:
            data["max_value"] = self._max_value

        if self._default_value is not None:
            data["default_value"] = self._default_value

        if self._property_set_key is not None:
            data["property_set_key"] = self._property_set_key

        return data


def Validate(property_data, value_to_validate, config_module, validation_options={}):
    from Dash.Properties.SharedPropertyTypes import Validate

    return Validate(
        property_data,
        value_to_validate,
        config_module,
        validation_options=validation_options,
    )
