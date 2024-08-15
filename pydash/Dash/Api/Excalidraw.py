#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import cgi
import json

class Excalidraw:
    def __init__(self, params, dash_context, user):
        self._params = params
        self._dash_context = dash_context
        self._user = user
        self._graph_id = self._params.get("graph_id")

    @property
    def Params(self):
        return self._params

    @property
    def DashContext(self):
        return self._dash_context

    @property
    def User(self):
        return self._user

    @property
    def ID(self):
        return self._graph_id

    @property
    def store_root(self):
        return os.path.join(self.DashContext["srv_path_local"], "excalidraw", self.ID + "/")

    @property
    def data_path(self):
        return os.path.join(self.store_root, "data.json")

    def Run(self):

        if not self.ID:
            return {"error": "Missing graph_id"}

        if self.Params.get("get_scene_data"):
            return self.get_scene_data()

        if self.Params.get("set_scene_data"):
            return self.set_scene_data()

        response = {}
        response["error"] = "Unknown function"
        response["ID"] = self.ID
        response["Params"] = self.Params
        response["DashContext"] = self.DashContext
        response["User"] = self.User

        return response

    def get_default_scene_data(self):
        scene_data = {}
        scene_data["id"]        = self.ID
        scene_data["version"]   = 1
        scene_data["elements"]  = []
        scene_data["app_state"] = {}
        scene_data["app_state"]["viewBackgroundColor"] = "#9fa6d6"

        return scene_data

    def get_scene_data(self):

        if os.path.exists(self.data_path):
            from Dash.LocalStorage import Read
            scene_data = Read(self.data_path)
        else:
            scene_data = self.get_default_scene_data()

            from Dash.LocalStorage import Write
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)

        return scene_data

    def set_scene_data(self):
        from Dash.LocalStorage import Read, Write
        import json

        if not os.path.exists(self.data_path):
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)

        scene_data = self.get_scene_data()

        scene_data_json = self.Params.get("scene_data_json")

        new_scene_data  = json.loads(scene_data_json)
        new_app_state = new_scene_data["appState"]
        new_elements = new_scene_data["elements"]

        scene_data["app_state"] = new_scene_data["appState"]
        scene_data["elements"] = new_scene_data["elements"]

        if "version" not in scene_data:
            scene_data["version"] = 1

        scene_data["version"] += 1

        Write(self.data_path, scene_data)

        response = {}
        response["f"] = "set_scene_data"
        response["saved"] = scene_data
        # response["new_scene_data"] = new_scene_data

        # response["new_app_state"] = new_app_state
        # response["new_elements"]  = new_elements



        # response["saved"] = scene_data
        # response["scene_data_json"] = scene_data_json
        # response["scene_data"] = scene_data
        # response["ID"] = self.ID
        # response["Params"] = self.Params
        # response["DashContext"] = self.DashContext
        # response["User"] = self.User
        return response






