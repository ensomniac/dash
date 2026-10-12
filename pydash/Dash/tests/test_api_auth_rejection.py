"""Auth rejections preserve responses without error emails or secret echoes."""
import contextlib
import io
import unittest
from unittest.mock import Mock, patch
from Dash.Api.Core import ApiCore
from Dash.Api.Users import ApiUsers

class AuthApi(ApiCore, ApiUsers):
    pass

class AuthRejectionTests(unittest.TestCase):
    def api(self):
        api = AuthApi.__new__(AuthApi)
        api._params = {"f": "validate"}
        api._missing_return_data_tag = "Missing response"
        api._send_email_on_error = True
        api._execute_as_module = False
        api._render_html = False
        api._on_init_callback = None
        api._user_email_domain_bypass_emails = []
        api._dash_context = {"asset_path": "altona"}
        api._user = {}
        api.SendEmail = Mock()
        return api

    def test_each_public_auth_route_rejects_without_email_or_private_fields(self):
        for method, target in [("r", "ResetResponse"), ("reset", "Reset"), ("login", "Login"), ("validate", "Validate")]:
            with self.subTest(method=method):
                api = self.api()
                with patch("Dash.Users." + target, return_value={"error": "Invalid credentials", "p": "secret-password", "_error": "private path"}), contextlib.redirect_stderr(io.StringIO()):
                    result = getattr(api, method)()
                self.assertEqual(result, {"error": "Invalid credentials"})
                api.SendEmail.assert_not_called()
                self.assertTrue(api._send_email_on_error)

    def test_successful_login_keeps_token_and_initialization(self):
        api = self.api()
        result = {"token": "opaque-credential", "user": {}, "init": {"ready": True}}
        with patch("Dash.Users.Login", return_value=result):
            self.assertEqual(api.login()["init"], {"ready": True})
        api.SendEmail.assert_not_called()

    def test_real_auth_exception_still_alerts(self):
        api = self.api()
        with patch("Dash.Users.Validate", side_effect=RuntimeError("storage unavailable")):
            api.run(api.validate)
        api.SendEmail.assert_called_once()
        self.assertIn("storage unavailable", api.Response["error"])

if __name__ == "__main__":
    unittest.main()
