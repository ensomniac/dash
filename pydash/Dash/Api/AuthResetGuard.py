"""Emergency public reset admission; does not change login or stored credentials."""
import fcntl
import json
import os
from pathlib import Path
import re
import stat
import time


def admit_public_reset(context, params, now=None):
    email = str(params.get("email", "")).strip().lower()
    if len(email) > 254 or not re.fullmatch(
        r"[a-z0-9.!#$%&'*+=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+", email
    ):
        return False
    try:
        users = (Path(context["srv_path_local"]) / "users").resolve()
        candidate = users / email
        if candidate.is_symlink() or not candidate.is_dir():
            return False  # Public reset must never provision a new account.
        account = candidate.resolve()
        if account.parent != users:
            return False
        fd = os.open(str(account / ".public-reset-admission"),
                     os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, "r+") as guard:
            fcntl.flock(guard.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            if not stat.S_ISREG(os.fstat(guard.fileno()).st_mode):
                return False
            stored = guard.read(4097)
            if len(stored) > 4096:
                return False
            recent = json.loads(stored) if stored else []
            if not isinstance(recent, list) or any(type(x) not in (int, float) for x in recent):
                return False
            stamp = time.time() if now is None else now
            recent = [x for x in recent if x > stamp - 900]
            if len(recent) >= 3 or any(x > stamp - 60 for x in recent):
                return False
            recent.append(stamp)
            guard.seek(0)
            json.dump(recent, guard)
            guard.truncate()
            guard.flush()
            os.fsync(guard.fileno())
        return True
    except (OSError, ValueError, TypeError, KeyError):
        return False
