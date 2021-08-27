# #!/usr/bin/python
# #
# # 2021 Ryan Martin, ryan@ensomniac.com
# #      Andrew Stet, stetandrew@gmail.com

# import os
# import sys

# class LocalPaths:
#     def __init__(self):
#         self.root_andrew = os.path.join("/Users", "andrewstet", "altona_bin", "repos")
#         self.root_ryan = os.path.join("/Users", "rmartin", "Google Drive", "code")
#         self.request_path_ryan = os.path.join("/Users", "rmartin", "rar", "active")

#         self.root_path = self._get_root_path()

#     # @property
#     # def DashRoot(self):
#     #     # ex: /Users/rmartin/Google Drive/code/dash/
#     #     return os.path.join(self.root_path, "dash/")

#     # @property
#     # def DashClientBin(self):
#     #     # ex: /Users/rmartin/Google Drive/code/dash/dash/bin/
#     #     return os.path.join(self.DashRoot, "dash", "bin/")

#     # @property
#     # def PyDashRoot(self):
#     #     # ex: /Users/rmartin/Google Drive/code/dash/dash/bin/
#     #     return os.path.join(self.DashRoot, "pydash", "Dash/")

#     # # def GetServerRoot(self, asset_path):
#     # #     if os.path.exists("")


#     # def _get_root_path(self):
#     #     # Andrew - this is a little confusing - what is it the root path to?

#     #     if os.path.exists(self.root_ryan):
#     #         return self.root_ryan
#     #     elif os.path.exists(self.root_andrew):
#     #         return self.root_andrew
#     #     else:
#     #         return None

# class ServerPaths:
#     def __init__(self):
#         self.oapi_root = os.path.join("/var", "www", "vhosts", "oapi.co")
#         self.oapi_request_path = os.path.join(
#             self.oapi_root,
#             "ensomniac_io",
#             "tmp",
#             "rar",
#             "active"
#         )

#     def GetRoot(self, asset_path):
#         return os.path.join(self.oapi_root, asset_path + "/")

#     def GetBin(self, asset_path):
#         return os.path.join(self.GetRoot(asset_path), "cgi-bin/")

#     def GetGitRoot(self, asset_path):
#         return os.path.join(self.GetRoot(asset_path), "github/")

#     def GetGitServerRoot(self, asset_path):
#         return os.path.join(self.GetGitRoot(asset_path), "server/")

#     def GetGitClientRoot(self, asset_path):
#         return os.path.join(self.GetGitRoot(asset_path), "client/")


# class Paths:
#     def __init__(self):
#         self.local = LocalPaths()
#         self.server = ServerPaths()

#     @property
#     def Local(self):
#         return self.local

#     @property
#     def Server(self):
#         return self.server

# local_paths = LocalPaths() # Andrew - let's get rid of this and use paths for both
# server_paths = ServerPaths() # Andrew - let's get rid of this and use paths for both
# Paths = Paths()
