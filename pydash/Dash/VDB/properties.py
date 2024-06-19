#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

import os
import sys

from Dash.Utils import Memory


class Properties:
    _user: dict
    _sort_by_key: str
    _dash_context: dict
    get_sort_by_key: callable

    def __init__(self):
        self.temp = {}
        self.collections = {}
        self.asset_bundle_queue_root = os.path.join(self.DashContext["srv_path_local"], "asset_bundle_queue")

        # Intended to be overwritten
        self.unofficial_types = []
        self.pipeline_3d_types = []
        self.type_combo_options_rename_map = {}
        self.irrelevant_3d_pipeline_vdb_kws = []

    @property
    def User(self):
        if not self._user:
            self._user = Memory.User

            if not self._user:
                from Dash import AdminEmails

                self._user = Memory.SetUser(AdminEmails[0])

        return self._user

    @property
    def DashContext(self):
        if not self._dash_context:
            self._dash_context = Memory.DashContext

            if not self._dash_context:
                from Dash.PackageContext import GetAssetPath

                self._dash_context = Memory.SetContext(GetAssetPath())

        return self._dash_context

    @property
    def is_local(self):
        return not bool(Memory.Global.RequestData)

    @property
    def sort_by_key(self):
        if not hasattr(self, "_sort_by_key"):
            self._sort_by_key = self.get_sort_by_key()

        return self._sort_by_key
