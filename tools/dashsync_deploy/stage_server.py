#!/usr/bin/python3 -IS
"""Stage inactive root-owned runtime copies. Does not create users or enable SSH.

Run as root from a reviewed source checkout. Re-running never overwrites policy.
"""

import hashlib
import json
import os
import shutil
import stat
import sys
import tempfile
from pathlib import Path


def main():
    if os.geteuid() != 0:
        raise SystemExit("Root is required to install protected runtime copies")
    os.umask(0o077)
    source = Path(__file__).resolve().parent
    destination = Path("/usr/local/libexec/dashsync")
    config = Path("/etc/dashsync")
    for path in (destination, config):
        if path.is_symlink():
            raise SystemExit("Refusing a symlink installation directory")
        path.mkdir(mode=0o755, parents=False, exist_ok=True)
        info = path.stat()
        if info.st_uid != 0 or stat.S_IMODE(info.st_mode) & 0o022:
            raise SystemExit("Installation directories must be root-owned and protected")
    files = ["protocol.py", "publisher.py", "receiver.py", "admin.py",
             "dashsync-publish.socket", "dashsync-publish@.service", "sshd.conf.example"]
    hashes = {}
    for name in files:
        original = source / name
        if original.is_symlink() or not original.is_file():
            raise SystemExit("Missing reviewed runtime file: " + name)
        fd, temporary = tempfile.mkstemp(dir=destination)
        try:
            with os.fdopen(fd, "wb") as output:
                output.write(original.read_bytes())
                output.flush()
                os.fsync(output.fileno())
            os.chmod(temporary, 0o644)
            os.replace(temporary, destination / name)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
        hashes[name] = hashlib.sha256(original.read_bytes()).hexdigest()
    policy = config / "policy.json"
    if not policy.exists() and not policy.is_symlink():
        with policy.open("xb") as output:
            output.write((source / "policy.example.json").read_bytes())
        policy.chmod(0o600)
    print(json.dumps({"staged": hashes, "policy": str(policy), "active": False}, indent=2))
    print("No accounts, keys, systemd units, SSH rules, or firewall rules were activated.")


if __name__ == "__main__":
    main()
