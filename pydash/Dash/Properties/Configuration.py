#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash import LocalStorage
from Dash.Properties.SharedProperty import SharedProperty


class Configuration:
    _dash_context: dict

    def __init__(self, config_type, config_module):
        self.asset_path = "authentic"
        self.config_type = config_type  # vibe / model / component
        self.config_module = config_module  # Vibes() etc
        self.sp_objects = []  # Shared property objects

    @property
    def DashContext(self):
        if not hasattr(self, "_dash_context"):
            from Dash import PackageContext as Context

            self._dash_context = Context.Get(self.asset_path)

        return self._dash_context

    @property
    def StorePath(self):
        return f"sb_config_{self.config_type}"

    @property
    def SharedProperties(self):
        shared_properties = []

        for sp in self.sp_objects:
            shared_properties.append(sp.ToDict())

        return shared_properties

    def AddProperty(
            self,
            display_name,
            key,
            prop_type,
            min_value=None,
            max_value=None,
            default_value=None,
            property_set_key=None
    ):
        self.sp_objects.append(SharedProperty(
            display_name=display_name,
            key=key,
            prop_type=prop_type,
            min_value=min_value,
            max_value=max_value,
            default_value=default_value,
            property_set_key=property_set_key,
        ))

    def CreateConfig(self):
        from Dash.Properties import MergeDefaultValues

        additional_data = MergeDefaultValues(
            {"config_type": self.config_type},
            self.SharedProperties,
            self.config_module
        )

        created_config = LocalStorage.New(
            dash_context=self.DashContext,
            store_path=self.StorePath,
            additional_data=additional_data
        )

        response = self.GetAll()
        response["config_type"] = self.config_type
        response["new_id"] = created_config["id"]

        return response

    def GetAll(self):
        response = LocalStorage.GetAll(
            dash_context=self.DashContext,
            store_path=self.StorePath
        )

        response["shared_properties"] = []

        for sp in self.sp_objects:
            response["shared_properties"].append(sp.ToDict())

        return response

    def SetConfigProperty(self, obj_id):
        result = LocalStorage.SetProperty(
            dash_context=self.DashContext,
            store_path=self.StorePath,
            obj_id=obj_id
        )

        return result

    def Delete(self, obj_id):
        delete_result = LocalStorage.Delete(
            dash_context=self.DashContext,
            store_path=self.StorePath,
            obj_id=obj_id
        )

        result = self.GetAll()
        result["delete_result"] = delete_result
        result["config_type"] = self.config_type

        return result
