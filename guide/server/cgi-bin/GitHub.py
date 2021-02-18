#!/usr/bin/python
#
# Altona 2021 Ryan Martin, ryan@ensomniac.com

import os
import sys


from Dash import ApiCore
from Dash.Paths import server_paths


class GithubAPI:
    def __init__(self, as_module=False):
        if not ApiCore.Init(self, as_module):
            return

        self.Add(self.webhook, requires_authentication=False)

        self.Run()

    def webhook(self):
        from Dash import GitHub

        git_paths = GitHub.PathSet()
        altona_root = os.path.join(server_paths.oapi_root, "altona")
        altona_server_path = os.path.join(altona_root, "github", "altona_server")
        altona_client_path = os.path.join(altona_root, "github", "altona_client")

        git_paths.Add(
            name="server",
            local_git_root=altona_server_path,
            local_git_path=os.path.join(altona_server_path, "cgi-bin"),
            dest_path=os.path.join(altona_root, "cgi-bin"),
        )

        git_paths.Add(
            name="client",
            local_git_root=altona_client_path,
            local_git_path=altona_client_path,
            dest_path=altona_client_path,
        )

        return self.set_return_data(
            GitHub.UpdateAndNotify(
                params=self.data,
                path_set=git_paths,
                email_list=[
                    "ryan@ensomniac.com",
                    "katie@altonametal.com",
                    "stetandrew@gmail.com",
                ],
            )
        )


if __name__ == "__main__":
    GithubAPI()
