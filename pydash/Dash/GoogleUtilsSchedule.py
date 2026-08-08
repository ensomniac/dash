#!/usr/bin/python
#
# Ensomniac 2026 Ryan Martin ryan@ensomniac.com
#                Andrew Stet stetandrew@gmail.com

"""Provider-independent validation for scheduled Google uploads."""


def ValidateYouTubeSchedule(future_iso, visibility, now=None):
    """Return a canonical UTC publish time after validating YouTube's contract."""

    if future_iso is None or future_iso == "":
        return ""

    if visibility != "private":
        raise ValueError("Scheduled YouTube uploads must use private provider visibility")

    if type(future_iso) is not str:
        raise ValueError("Future ISO must be a timezone-aware ISO 8601 timestamp")

    from datetime import datetime, timezone
    from dateutil.parser import isoparse

    try:
        publish_at = isoparse(future_iso.strip())
    except (TypeError, ValueError, OverflowError) as error:
        raise ValueError("Future ISO must be a timezone-aware ISO 8601 timestamp") from error

    if publish_at.tzinfo is None or publish_at.utcoffset() is None:
        raise ValueError("Future ISO must include a timezone offset")

    if now is None:
        now = datetime.now(timezone.utc)

    if not isinstance(now, datetime) or now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("Current time must be a timezone-aware datetime")

    publish_at = publish_at.astimezone(timezone.utc)
    now = now.astimezone(timezone.utc)

    if publish_at <= now:
        raise ValueError("Future ISO must be in the future")

    return publish_at.isoformat().replace("+00:00", "Z")
