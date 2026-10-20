#!/usr/bin/python3 -IS
"""Read-only activation preflight. This tool never changes ownership or gates."""

import argparse
import json
import os
import pwd
import stat
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))
from publisher import (GATES, POLICY_PATH, Rejected, existing_file, load_policy,
                       package_root, trusted_directory)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--policy", default=POLICY_PATH)
    args = parser.parse_args()
    policy = load_policy(args.policy)
    failures = []
    try:
        policy.ready()
    except (Rejected, OSError) as exc:
        failures.append("Production gate records are incomplete or unprotected")
    for name, actor in policy.data["actors"].items():
        try:
            account = pwd.getpwnam(name)
            if actor["uid"] != account.pw_uid or not actor["uid"]:
                failures.append(name + ": provisioned UID does not match policy")
            home = os.stat(account.pw_dir, follow_symlinks=False)
            if not stat.S_ISDIR(home.st_mode) or home.st_uid != 0 or home.st_mode & 0o022 or account.pw_shell != "/bin/sh":
                failures.append(name + ": forced-command home/shell is not protected")
            key = Path("/etc/dashsync/authorized_keys") / name
            info = key.lstat()
            if not stat.S_ISREG(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o022 or not info.st_size:
                failures.append(name + ": no protected authorized public key file")
        except KeyError:
            failures.append(name + ": deployment account is not provisioned")
        except OSError:
            failures.append(name + ": deployment home or authorized key is missing")
    for name, package in policy.data["packages"].items():
        if not package["enabled"]:
            continue
        try:
            with package_root(package) as root:
                for prefix in package["prefixes"]:
                    fd = os.dup(root)
                    try:
                        for part in prefix.split("/"):
                            new = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
                            os.close(fd)
                            fd = new
                            trusted_directory(fd)
                    finally:
                        os.close(fd)
        except (Rejected, OSError):
            failures.append(name + ": pinned source directories are missing or writable by application accounts")
    print(json.dumps({"ready": not failures, "failures": failures,
                      "enabled_packages": [name for name, package in policy.data["packages"].items() if package["enabled"]]}, indent=2))
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
