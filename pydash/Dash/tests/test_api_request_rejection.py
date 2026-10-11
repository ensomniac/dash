"""No-network regression coverage for malformed-request alert amplification."""

import contextlib
import io
import json
import os
import unittest
from unittest.mock import Mock, patch

from Dash.Api.Core import ApiCore, ApiRequestError, get_response_status


class ApiRequestRejectionTests(unittest.TestCase):
    def api(self, params=None, user=None, as_module=False):
        api = ApiCore.__new__(ApiCore)
        api._params = params or {}
        api._user = user or {}
        api._execute_as_module = as_module
        api._send_email_on_error = True
        api._public = {}
        api._private = {}
        api._response = {"error": "Unauthorized"}
        api._render_html = False
        api._missing_return_data_tag = "Missing return data x8765"
        api.set_dash_globals = Mock()
        api.SendEmail = Mock()
        api.ReturnResponse = Mock()
        return api

    def test_unknown_function_rejected_without_email(self):
        api = self.api({"f": "get_nft", "token": "secret"})
        with contextlib.redirect_stderr(io.StringIO()) as log:
            api.Run()
        self.assertEqual(api.Response, {"error": "Unknown Function x4543"})
        self.assertIn("400 Bad Request", get_response_status(api.Response))
        api.SendEmail.assert_not_called()
        api.ReturnResponse.assert_called_once()
        self.assertNotIn("secret", log.getvalue())
        self.assertIn('"reason": "unknown_function"', log.getvalue())
        self.assertTrue(api._send_email_on_error)

    def test_missing_function_rejected_without_email(self):
        api = self.api()
        with contextlib.redirect_stderr(io.StringIO()):
            api.Run()
        api.SendEmail.assert_not_called()
        self.assertIn("Unknown Function", api.Response["error"])

    def test_probe_burst_never_emails(self):
        with contextlib.redirect_stderr(io.StringIO()):
            for index in range(250):
                api = self.api({"f": f"probe_{index}"})
                api.Run()
                api.SendEmail.assert_not_called()

    def test_rejection_log_is_bounded_and_cannot_inject_lines(self):
        api = self.api({"f": "bad\nname" + "x" * 500, "token": "secret", "message": "private"})
        with patch.dict(os.environ, {"REMOTE_ADDR": "192.0.2.1"}), contextlib.redirect_stderr(io.StringIO()) as log:
            api.Run()
        lines = log.getvalue().splitlines()
        self.assertEqual(len(lines), 1)
        record = json.loads(lines[0].split(" ", 1)[1])
        self.assertEqual(len(record["function"]), 128)
        self.assertEqual(record["remote_addr"], "192.0.2.1")
        self.assertNotIn("secret", log.getvalue())
        self.assertNotIn("private", log.getvalue())

    def test_missing_required_parameter_rejected_without_traceback_or_email(self):
        api = self.api({"f": "known"})
        api._public["known"] = lambda: api.ValidateParams(["message"])
        with contextlib.redirect_stderr(io.StringIO()) as log:
            api.Run()
        self.assertEqual(api.Response, {"error": "Missing param 'message'"})
        self.assertIn("400 Bad Request", get_response_status(api.Response))
        api.SendEmail.assert_not_called()
        self.assertIn('"reason": "missing_parameter"', log.getvalue())

    def test_false_zero_and_empty_are_supported_when_presence_is_required(self):
        api = self.api({"zero": 0, "false": False, "empty": ""})
        api.ValidateParams(["zero", "false", "empty"], falsy=True)
        with self.assertRaisesRegex(ApiRequestError, "Missing .falsy. param 'absent'"):
            api.ValidateParams(["absent"], falsy=True)

    def test_missing_falsy_parameter_uses_client_error_path(self):
        api = self.api({"f": "known"})
        api._public["known"] = lambda: api.ValidateParams(["missing"], falsy=True)
        with contextlib.redirect_stderr(io.StringIO()):
            api.Run()
        self.assertEqual(api.Response["error"], "Missing (falsy) param 'missing'")
        api.SendEmail.assert_not_called()

    def test_value_error_inside_handler_still_emails(self):
        api = self.api({"f": "broken"})
        def broken():
            raise ValueError("database result is invalid")
        api._public["broken"] = broken
        api.Run()
        api.SendEmail.assert_called_once_with(from_set_response=True)
        self.assertIn("Traceback", api.Response["error"])

    def test_invalid_validation_configuration_still_emails(self):
        api = self.api({"f": "broken"})
        api._public["broken"] = lambda: api.ValidateParams(123)
        api.Run()
        api.SendEmail.assert_called_once_with(from_set_response=True)

    def test_rejection_does_not_disable_subsequent_real_error(self):
        api = self.api({"f": "unknown"})
        with contextlib.redirect_stderr(io.StringIO()):
            api.Run()
        api.SetResponse({"error": "genuine failure"})
        api.SendEmail.assert_called_once_with(from_set_response=True)

    def test_public_handler_succeeds(self):
        api = self.api({"f": "read"})
        api._public["read"] = lambda: api.SetResponse({"value": 1})
        api.Run()
        self.assertEqual(api.Response, {"value": 1, "error": None})
        api.SendEmail.assert_not_called()

    def test_private_handler_requires_authenticated_user(self):
        for user in ({}, {"email": "operator@example.invalid"}):
            with self.subTest(authenticated=bool(user)):
                api = self.api({"f": "private"}, user=user)
                handler = Mock(side_effect=lambda: api.SetResponse({"ok": True}))
                api._private["private"] = handler
                api.Run()
                self.assertEqual(handler.call_count, int(bool(user)))
                self.assertEqual(api.Response["error"], None if user else "Unauthorized")
                api.SendEmail.assert_not_called()

    def test_module_validation_remains_a_value_error(self):
        api = self.api(as_module=True)
        with self.assertRaises(ValueError):
            api.ValidateParams("message")

    def test_module_run_does_not_dispatch(self):
        api = self.api({"f": "anything"}, as_module=True)
        api.Run()
        api.ReturnResponse.assert_not_called()
        api.SendEmail.assert_not_called()


if __name__ == "__main__":
    unittest.main()
