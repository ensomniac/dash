"""Legacy HTTP deployment is permanently retired in favor of restricted SSH."""

from Dash.Api.Core import ApiCore


class ApiSync(ApiCore):
    def __init__(self, asset_path="", as_module=False):
        ApiCore.__init__(self, execute_as_module=as_module, asset_path=asset_path)
        self.Add(self.dashsync_live, requires_authentication=False)
        self.Add(self.github_webhook, requires_authentication=False)

    def dashsync_live(self):
        return self.reject_request("Deployment disabled: upgrade to DashSync SSH v1", "ssh_deployment_required")

    def github_webhook(self):
        return self.reject_request("HTTP deployment webhooks are disabled", "http_deployment_retired")
