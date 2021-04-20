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

    def __init__(self, dash_context_asset_path, config_type):
        self.asset_path = dash_context_asset_path
        self.config_type = config_type  # Ex: vibe / billing_status / component
        self.shared_property_objects = []

    @property
    def DashContext(self):
        if not hasattr(self, "_dash_context"):
            from Dash import PackageContext as Context

            self._dash_context = Context.Get(self.asset_path)

        return self._dash_context

    @property
    def StorePath(self):
        if self.asset_path == "authentic":
            # TODO: Authentic will need to be updated to the new format at some point
            return f"sb_config_{self.config_type}"

        else:
            # New format
            return os.path.join("config_properties", self.config_type)

    @property
    def SharedProperties(self):
        shared_properties = []

        for sp in self.shared_property_objects:
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
        self.shared_property_objects.append(SharedProperty(
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
            self
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

        for sp in self.shared_property_objects:
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
