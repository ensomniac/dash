"""Invalid tokens fail closed; real session validation keeps its format."""

import base64
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from Dash.Users import Users


class UserTokenValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.users = Users({"token": "placeholder"}, {"srv_path_local": self.temp.name})
        self.users.get_user_info = Mock(return_value={"email": "user@example.invalid"})
        self.users.get_user_init = Mock(return_value={"ready": True})

    def token(self, payload=b"Browser/1.0_|_user@example.invalid"):
        return base64.urlsafe_b64encode(payload).decode()

    def session(self, token):
        directory = Path(self.temp.name) / "users/user@example.invalid/sessions"
        directory.mkdir(parents=True, exist_ok=True)
        (directory / token).write_text("{}")

    def test_malformed_token_corpus_rejected_without_exception_or_identity_lookup(self):
        for token in ["codex-invalid-verification", "invalid", "%%%", "../secret", "☃", "x" * 4097,
                      self.token(b"Browser_|_\xff"), self.token(b"no delimiter"),
                      self.token(b"Browser_|_../../admin@example.invalid"),
                      self.token(b"Browser_|_/admin@example.invalid"),
                      self.token(b"Browser_|_admin\\x@example.invalid"),
                      self.token(b"Browser_|_admin\x00@example.invalid"),
                      self.token(b"Browser_|_not-an-email"), {"bad": True}, 123]:
            with self.subTest(token=repr(token)[:60]):
                result = self.users.Validate(token)
                self.assertEqual(result, {"error": "Invalid token"})
        self.users.get_user_info.assert_not_called()

    def test_valid_format_without_session_cannot_authenticate_or_disclose_paths(self):
        result = self.users.Validate(self.token())
        self.assertEqual(result, {"error": "Invalid Login x7283"})
        self.users.get_user_info.assert_not_called()

    def test_existing_session_accepts_padded_token(self):
        token = self.token()
        self.session(token)
        self.assertTrue(self.users.Validate(token)["valid_login"])
        self.users.get_user_info.assert_called_once_with("user@example.invalid")

    def test_existing_session_accepts_omitted_padding(self):
        token = self.token()
        self.assertTrue(token.endswith("="))
        self.session(token)
        self.assertTrue(self.users.Validate(token.rstrip("="))["valid_login"])

    def test_initialization_still_runs_for_valid_session(self):
        token = self.token()
        self.session(token)
        self.users.request_params["init"] = True
        result = self.users.Validate(token)
        self.assertEqual(result["init"], {"ready": True})
        self.users.get_user_init.assert_called_once_with("user@example.invalid")

    def test_validate_user_returns_none_for_malformed_token(self):
        self.users.request_params["token"] = "codex-invalid-verification"
        self.assertIsNone(self.users.ValidateUser())

    def test_terminated_account_cannot_reuse_existing_session(self):
        token = self.token()
        self.session(token)
        self.users.get_user_info.return_value = {"email": "user@example.invalid", "terminated": True}
        self.assertEqual(self.users.Validate(token), {"error": "Unauthorized"})
        self.users.get_user_init.assert_not_called()

    def test_new_logins_issue_independent_unpredictable_sessions(self):
        user_root = str(Path(self.temp.name) / "users/user@example.invalid")
        self.users.ValidateCredentials = Mock(return_value={"email": "user@example.invalid", "user_root": user_root})
        with patch.dict("os.environ", {"HTTP_USER_AGENT": "Same browser", "REMOTE_ADDR": "192.0.2.1"}):
            first = self.users.Login()["token"]
            second = self.users.Login()["token"]
        self.assertNotEqual(first, second)
        for token in (first, second):
            self.assertNotIn(b"Same browser", base64.urlsafe_b64decode(token))
            self.assertTrue(self.users.Validate(token)["valid_login"])

    def test_oversized_and_non_string_tokens_rejected_by_decoder(self):
        for value in [None, 1, {}, b"bytes", "x" * 4097]:
            self.assertEqual(self.users.get_token_data(value), (None, None))


if __name__ == "__main__":
    unittest.main()
