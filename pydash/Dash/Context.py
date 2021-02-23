#!/usr/bin/python

import os
# from Dash.Paths import server_paths

# Server pathing info, and more

class DashContext:
    def __init__(self, asset_path, display_name=None, domain=None):

        # TODO: Migrate this when the context concept changes:
        self.oapi_root = "/var/www/vhosts/oapi.co/"

        self.__asset_path = asset_path
        self.__root_store = os.path.join(
            self.oapi_root, self.__asset_path, "local"
        )
        self.__users_root_store = os.path.join(self.__root_store, "users")
        self.__domain = domain or f"{self.__asset_path}.io"
        self.__display_name = display_name or f"{self.__asset_path.title()} IO"
        self.__admin_from_email = "ryan@ensomniac.com"

        self.__has_client = True

        if domain is None:
            self.__has_client = False

    def ToDict(self, client_only=False):
        data = {
            "asset_path": self.__asset_path,
            "domain": self.__domain,
            "admin_from_email": self.__admin_from_email,
            "display_name": self.__display_name,
        }

        if not client_only:
            data["root_store"] = self.__root_store
            data["users_root_store"] = self.__users_root_store

        return data

    @property
    def AssetPath(self):
        return self.__asset_path

    @property
    def RootStore(self):
        return self.__root_store

    @property
    def UsersRootStore(self):
        return self.__users_root_store

    @property
    def Domain(self):
        return self.__domain

    @property
    def DisplayName(self):
        return self.__display_name

    @property
    def AdminFromEmail(self):
        return self.__admin_from_email

    @property
    def HasClient(self):
        return self.__has_client

def Create(asset_path, display_name=None, domain=None):
    return DashContext(asset_path, display_name, domain)



