import unittest

from datetime import datetime, timezone

from Dash.GoogleUtilsSchedule import ValidateYouTubeSchedule


class TestValidateYouTubeSchedule(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 8, 8, 16, 0, tzinfo=timezone.utc)

    def test_unscheduled_upload_is_unchanged(self):
        self.assertEqual(ValidateYouTubeSchedule("", "public", now=self.now), "")

    def test_future_offset_is_normalized_to_utc(self):
        self.assertEqual(
            ValidateYouTubeSchedule(
                "2026-08-08T13:30:00-04:00",
                "private",
                now=self.now
            ),
            "2026-08-08T17:30:00Z"
        )

    def test_exact_current_time_is_not_future(self):
        with self.assertRaisesRegex(ValueError, "must be in the future"):
            ValidateYouTubeSchedule("2026-08-08T16:00:00Z", "private", now=self.now)

    def test_offsetless_timestamp_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "timezone offset"):
            ValidateYouTubeSchedule("2026-08-08T17:00:00", "private", now=self.now)

    def test_malformed_timestamp_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "timezone-aware ISO 8601"):
            ValidateYouTubeSchedule("tomorrow", "private", now=self.now)

    def test_scheduled_upload_must_enter_provider_as_private(self):
        for visibility in ("public", "unlisted"):
            with self.subTest(visibility=visibility):
                with self.assertRaisesRegex(ValueError, "private provider visibility"):
                    ValidateYouTubeSchedule(
                        "2026-08-08T17:00:00Z",
                        visibility,
                        now=self.now
                    )


if __name__ == "__main__":
    unittest.main()
