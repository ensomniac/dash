#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash.Api.Core import ApiCore


class ApiSync(ApiCore):  # TODO: TEST
    def __init__(self, asset_path="", as_module=False):
        ApiCore.__init__(self, execute_as_module=as_module, asset_path=asset_path)

        self.Add(self.dashsync_live,  requires_authentication=False)
        self.Add(self.github_webhook, requires_authentication=False)

    def dashsync_live(self):
        self.ValidateParams(["remote_path"])
        self.ValidateParams(["fmod"], falsy=True)

        from gzip import decompress

        if os.path.exists(self.Params["remote_path"]):
            os.remove(self.Params["remote_path"])

        file_text = decompress(self.Params["fmod"]).decode()

        # TODO: Replace with Dash.LocalStorage.Write?
        #  Or keep this lightweight without protections?
        open(self.Params["remote_path"], "w").write(file_text)

        response = {"success": os.path.exists(self.Params["remote_path"])}

        if not response["success"]:
            return self.SetResponse(response)

        # TODO: Replace with Dash.LocalStorage.ConformPermissions?
        #  Or keep this lightweight without protections?
        os.system(f"chmod 755 {self.Params['remote_path']}")
        os.system(f"chown ensomniac {self.Params['remote_path']}")
        os.system(f"chgrp psacln {self.Params['remote_path']}")

        return self.SetResponse(response)

    def github_webhook(self):
        from Dash.GitHub import WebhookForAssetPath

        return self.SetResponse(WebhookForAssetPath(
            dash_context_or_asset_path=self.DashContext,
            payload=self.ParseParam("payload", dict, {})
        ))
