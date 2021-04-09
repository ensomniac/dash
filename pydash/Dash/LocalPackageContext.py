#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys
from Dash.Utils import Utils

class LocalPackageContext:
    def __init__(self, asset_path, display_name, domain, local_git_root):
        self.asset_path = asset_path
        self.display_name = display_name
        self.domain = domain
        self.server_client_paths = self.find_server_client_paths(local_git_root)

    def find_server_client_paths(self, local_git_root):
        # Search through all folders and find the one that
        # has a server & client folder in it.
        # TODO: Actually confirm that those two folders contain
        # what we are expecting them to

        from pathlib import Path

        server_client_root = None
        server_root = None
        client_root = None

        dirs = [local_git_root]

        for root, directories, filenames in os.walk(local_git_root):
            for directory in directories:
                full_path = os.path.join(root, directory)
                if ".git" in full_path: continue
                if full_path not in dirs: dirs.append(full_path)

        for full_path in dirs:
            server_path = os.path.join(full_path, "server/")
            client_path = os.path.join(full_path, "client/")

            if not os.path.exists(server_path): continue
            if not os.path.exists(client_path): continue

            server_client_root = full_path + "/"
            server_root = server_path
            client_root = client_path

            break

        if not server_client_root:
            print("Failed to locate server/client folder for Dash context")
            print("Root: " + local_git_root)
            sys.exit()

        print("Located paths for '" + self.asset_path + "':")
        print("\tserver_client_root: " + server_client_root)
        print("\tserver_root: " + server_root)
        print("\tclient_root: " + client_root + "\n")

        dirs = {}
        dirs["server_client_root"] = server_client_root
        dirs["server_root"] = server_root
        dirs["client_root"] = client_root

        return dirs

    @property
    def AssetPath(self):
        return self.asset_path

    @property
    def DisplayName(self):
        return self.display_name

    @property
    def Domain(self):
        return self.domain

    @property
    def LocalGitRoot(self):
        return self.server_client_paths["server_client_root"]

    @property
    def LocalGitClientRoot(self):
        return os.path.join(self.LocalGitRoot, "client/")

    @property
    def LocalGitServerRoot(self):
        return os.path.join(self.LocalGitRoot, "server/")

    # SERVER PATHS / OAPI
    @property
    def RemoteRoot(self):
        return Utils.Paths.Server.GetRoot(self.AssetPath)

    @property
    def RemoteCgiBinRoot(self):
        return Utils.Paths.Server.GetBin(self.AssetPath)

    @property
    def RemoteGitRoot(self):
        return Utils.Paths.Server.GetGitRoot(self.AssetPath)

    @property
    def RemoteGitServerRoot(self):
        return Utils.Paths.Server.GetGitServerRoot(self.AssetPath)

    @property
    def RemoteGitClientRoot(self):
        return Utils.Paths.Server.GetGitClientRoot(self.AssetPath)
