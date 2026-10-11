"""The public reset response must never grant access to the reset link."""

import unittest
from unittest.mock import Mock, patch

from Dash.Api.Users import ApiUsers


class ResetPrivacyTests(unittest.TestCase):
    def api(self):
        api = ApiUsers.__new__(ApiUsers)
        api.Params = {"email": "user@example.invalid"}
        api.DashContext = {"asset_path": "candy"}
        api._user_email_domain_bypass_emails = []
        api.SetResponse = Mock(side_effect=lambda value: value)
        return api

    def test_public_reset_only_returns_delivery_confirmation(self):
        api = self.api()
        with patch("Dash.Users.Reset", return_value={
            "email": "user@example.invalid", "t": "secret-reset-link",
            "user": {"email": "user@example.invalid", "private": "data"},
            "success": True, "reset_email_sent": True,
        }) as reset:
            result = api.reset()
        self.assertEqual(result, {"email": "user@example.invalid", "success": True, "reset_email_sent": True})
        self.assertNotIn("secret-reset-link", str(result))
        reset.assert_called_once()

    def test_error_response_does_not_leak_private_details(self):
        with patch("Dash.Users.Reset", return_value={"error": "Unauthorized", "t": "secret", "_error": "private"}):
            self.assertEqual(self.api().reset(), {"error": "Unauthorized"})

    def test_terminate_account_without_profile_name(self):
        api = self.api()
        api.Params = {"email_to_term": "probe@example.invalid"}
        api.User = {"email": "operator@example.invalid"}
        api.ValidateParams = Mock()
        api._on_termination_callback = None
        with patch("Dash.Users.Get", return_value={"email": "probe@example.invalid"}), patch("Dash.LocalStorage.SetProperties", side_effect=lambda **kwargs: kwargs["properties"]):
            result = api.terminate()
        self.assertTrue(result["terminated"])
        self.assertEqual(result["terminated_by"], "operator@example.invalid")
        self.assertEqual(result["last_name"], "(Terminated)")


if __name__ == "__main__":
    unittest.main()
