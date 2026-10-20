#!/usr/bin/python3 -IS
"""Root publisher for a local systemd Unix socket; no Dash/application imports.

Identity comes exclusively from SO_PEERCRED, never from a request or environment.
Install this file and protocol.py in a root-owned, non-writable directory.
"""

import fcntl
import hashlib
import json
import os
import signal
import socket
import stat
import struct
import sys
import tempfile
import time
from contextlib import contextmanager
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))
from protocol import (MAX_FILE, VERSION, Rejected, digest, identifier, json_object,
                      read_body, read_header, relative_path, response)

POLICY_PATH = "/etc/dashsync/policy.json"
STATE_PATH = "/var/lib/dashsync"
GATES = {"monitoring", "credentials_rotated", "root_queue_retired",
         "retired_host_trust_removed", "os_updated", "root_jobs_demoted", "reviewed_source"}
FS_IOC_GETFLAGS = 0x80086601
FS_IOC_SETFLAGS = 0x40086602
FS_IMMUTABLE_FL = 0x10
MAX_HISTORY = 256 * 1024 * 1024


def trusted_directory(fd):
    info = os.fstat(fd)
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o022:
        raise Rejected("unsafe_directory", "Source directories must be root-owned and not writable by application accounts")
    return info


def open_absolute_directory(path, require_trusted=True):
    if not isinstance(path, str) or not path.startswith("/") or "\x00" in path:
        raise Rejected("configuration", "Invalid configured directory")
    if path == "/" or any(part in ("", ".", "..") for part in path[1:].split("/")):
        raise Rejected("configuration", "Noncanonical configured directory")
    fd = os.open("/", os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in path[1:].split("/"):
            new = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = new
            if require_trusted:
                trusted_directory(fd)
        return fd
    except BaseException:
        os.close(fd)
        raise


def private_directory(path):
    path = Path(path)
    path.mkdir(mode=0o700, parents=False, exist_ok=True)
    fd = open_absolute_directory(str(path))
    try:
        if os.fstat(fd).st_mode & 0o077:
            raise Rejected("configuration", "Publisher state must be private to root")
    finally:
        os.close(fd)
    return path


def load_policy(path=POLICY_PATH):
    parent, name = os.path.split(path)
    fd = open_absolute_directory(parent)
    try:
        source = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
    finally:
        os.close(fd)
    with os.fdopen(source, "rb") as stream:
        info = os.fstat(stream.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o077 or info.st_size > 262144 or info.st_nlink != 1:
            raise Rejected("configuration", "Policy must be a private root-owned regular file")
        return Policy(json_object(stream.read(262145)))


class Policy:
    def __init__(self, data):
        if set(data) != {"version", "gates", "actors", "packages"} or type(data.get("version")) is not int or data["version"] != VERSION:
            raise Rejected("configuration", "Invalid publisher policy")
        if not isinstance(data["gates"], dict) or set(data["gates"]) != GATES:
            raise Rejected("configuration", "Every activation gate must be recorded")
        if not isinstance(data["actors"], dict) or not isinstance(data["packages"], dict) or len(data["packages"]) > 64:
            raise Rejected("configuration", "Invalid actors or packages")
        uids = set()
        for name, actor in data["actors"].items():
            if not name.startswith("dashsync_"):
                raise Rejected("configuration", "A dedicated deployment identity is required")
            identifier(name)
            if not isinstance(actor, dict) or set(actor) != {"uid", "packages"}:
                raise Rejected("configuration", "Invalid deployment identity")
            uid = actor["uid"]
            if uid is not None:
                if type(uid) is not int or uid <= 0 or uid in uids:
                    raise Rejected("configuration", "Deployment UIDs must be unique and non-root")
                uids.add(uid)
            if not isinstance(actor["packages"], list) or any(p not in data["packages"] for p in actor["packages"]):
                raise Rejected("configuration", "Unknown deployment permission")
        for name, package in data["packages"].items():
            identifier(name)
            fields = {"enabled", "root", "device", "inode", "prefixes", "files", "protected", "extensions", "gid"}
            if not isinstance(package, dict) or set(package) != fields or type(package["enabled"]) is not bool:
                raise Rejected("configuration", "Invalid package policy")
            if not isinstance(package["root"], str) or not package["root"].startswith("/"):
                raise Rejected("configuration", "Package root must be absolute")
            for key in ("device", "inode", "gid"):
                if type(package[key]) is not int or package[key] < 0:
                    raise Rejected("configuration", "Invalid filesystem identity")
            for key in ("prefixes", "files", "protected"):
                if not isinstance(package[key], list):
                    raise Rejected("configuration", "Invalid source path policy")
                for path in package[key]:
                    relative_path(path)
            if not isinstance(package["extensions"], list) or any(not isinstance(e, str) or not e.startswith(".") or not e[1:].isalnum() for e in package["extensions"]):
                raise Rejected("configuration", "Explicit source extensions are required")
            if package["enabled"] and (not package["inode"] or not package["prefixes"]):
                raise Rejected("configuration", "Enabled packages require a pinned source directory and approved prefixes")
        self.data = data

    def ready(self):
        for evidence in self.data["gates"].values():
            if not isinstance(evidence, str) or not evidence.startswith("/"):
                raise Rejected("not_ready", "Production hardening gates remain closed")
            parent, name = os.path.split(evidence)
            fd = open_absolute_directory(parent)
            try:
                source = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
                try:
                    info = os.fstat(source)
                    if not stat.S_ISREG(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o022 or not info.st_size:
                        raise Rejected("not_ready", "Gate evidence must be a nonempty, protected root-owned record")
                finally:
                    os.close(source)
            finally:
                os.close(fd)

    def actor(self, uid):
        for name, actor in self.data["actors"].items():
            if actor["uid"] is not None and actor["uid"] == uid:
                return name
        raise Rejected("authentication", "This local identity has no deployment permission")

    def package(self, actor, name):
        if name not in self.data["actors"][actor]["packages"]:
            raise Rejected("permission", "Package access denied")
        package = self.data["packages"][name]
        if not package["enabled"]:
            raise Rejected("package_disabled", "Package publishing remains disabled")
        return package

    def path(self, package, path):
        relative_path(path)
        if path in package["protected"] or path.split("/")[-1].lower() in {"rootpoll.py", "runasroot.py"}:
            raise Rejected("permission", "Containment and privilege helpers require a separate reviewed change")
        if path not in package["files"] and not any(path.startswith(prefix + "/") for prefix in package["prefixes"]):
            raise Rejected("permission", "Path is outside approved source roots")
        if Path(path).suffix.lower() not in package["extensions"]:
            raise Rejected("permission", "File extension is not approved")


@contextmanager
def package_root(package):
    fd = open_absolute_directory(package["root"], require_trusted=False)
    try:
        info = trusted_directory(fd)
        if (info.st_dev, info.st_ino) != (package["device"], package["inode"]):
            raise Rejected("unsafe_directory", "Package directory identity changed; review before repinning")
        yield fd
    finally:
        os.close(fd)


@contextmanager
def source_parent(root, path, create=False):
    fd = os.dup(root)
    try:
        for part in path.split("/")[:-1]:
            try:
                new = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            except FileNotFoundError:
                if not create:
                    yield None
                    return
                with writable_directory(fd):
                    os.mkdir(part, mode=0o755, dir_fd=fd)
                new = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
                os.fchmod(new, 0o755)
            trusted_directory(new)
            os.close(fd)
            fd = new
        yield fd
    finally:
        os.close(fd)


def existing_file(parent, name):
    try:
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
    except FileNotFoundError:
        return None
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1 or info.st_uid != 0 or info.st_mode & 0o022 or info.st_mode & 0o7000:
            raise Rejected("unsafe_file", "Destination must be a protected, single-link root-owned regular file")
        if info.st_size > MAX_FILE:
            raise Rejected("too_large", "Existing file exceeds the deployment limit")
        return fd
    except BaseException:
        os.close(fd)
        raise


def file_hash(fd):
    if fd is None:
        return None
    os.lseek(fd, 0, os.SEEK_SET)
    result = hashlib.sha256()
    total = 0
    while True:
        chunk = os.read(fd, 65536)
        if not chunk:
            return result.hexdigest()
        total += len(chunk)
        if total > MAX_FILE:
            raise Rejected("too_large", "Existing file changed beyond the size limit")
        result.update(chunk)


def get_flags(fd):
    return struct.unpack("I", fcntl.ioctl(fd, FS_IOC_GETFLAGS, struct.pack("I", 0)))[0]


def set_flags(fd, flags):
    fcntl.ioctl(fd, FS_IOC_SETFLAGS, struct.pack("I", flags))


@contextmanager
def writable_directory(fd):
    trusted_directory(fd)
    flags = get_flags(fd)
    thawed = bool(flags & FS_IMMUTABLE_FL)
    if thawed:
        set_flags(fd, flags & ~FS_IMMUTABLE_FL)
    try:
        yield
    finally:
        if thawed:
            try:
                set_flags(fd, flags)
            except OSError:
                info = os.fstat(fd)
                print("dashsync_critical " + json.dumps({"reason": "directory_protection_restore_failed",
                      "device": info.st_dev, "inode": info.st_ino}), file=sys.stderr, flush=True)
                raise


class Publisher:
    def __init__(self, policy, state=STATE_PATH):
        self.policy = policy
        self.state = Path(state)

    def authorize(self, uid, header):
        actor = self.policy.actor(uid)
        self.policy.ready()
        if header["op"] != "manifest":
            package = self.policy.package(actor, header["package"])
            for path in header.get("paths", [header.get("path")]):
                self.policy.path(package, path)
        return actor

    def handle(self, actor, header, body):
        if header["op"] == "manifest":
            packages = {}
            for name in self.policy.data["actors"][actor]["packages"]:
                package = self.policy.data["packages"][name]
                if package["enabled"]:
                    with package_root(package):
                        packages[name] = {k: package[k] for k in ("prefixes", "files", "protected", "extensions")}
            return {"packages": packages}
        package = self.policy.package(actor, header["package"])
        with package_root(package) as root:
            if header["op"] == "hashes":
                hashes = {}
                for path in header["paths"]:
                    with source_parent(root, path) as parent:
                        fd = existing_file(parent, path.split("/")[-1]) if parent is not None else None
                        try:
                            hashes[path] = file_hash(fd)
                        finally:
                            if fd is not None:
                                os.close(fd)
                return {"hashes": hashes}
            return self.publish(root, package, header, body)

    @contextmanager
    def locked(self, key):
        private_directory(str(self.state))
        lockdir = private_directory(str(self.state / "locks"))
        fd = os.open(str(lockdir / key), os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            yield
        except BlockingIOError as exc:
            raise Rejected("busy", "Another publication is in progress; retry later") from exc
        finally:
            os.close(fd)

    def snapshot(self, package, path, fd):
        history = private_directory(str(self.state / "history"))
        total = 0
        count = 0
        for root, dirs, files in os.walk(history, followlinks=False):
            for filename in files:
                info = os.lstat(os.path.join(root, filename))
                if not stat.S_ISREG(info.st_mode):
                    raise Rejected("configuration", "Unexpected history file type")
                total += info.st_size
                count += 1
                if total + os.fstat(fd).st_size > MAX_HISTORY or count > 20000:
                    raise Rejected("history_full", "Reviewed history pruning is required before publishing")
        package_dir = private_directory(str(history / package))
        path_dir = private_directory(str(package_dir / digest(path.encode())))
        snapshot = path_dir / (str(time.time_ns()) + ".bin")
        os.lseek(fd, 0, os.SEEK_SET)
        with snapshot.open("xb") as output:
            os.chmod(snapshot, 0o600)
            while True:
                chunk = os.read(fd, 65536)
                if not chunk:
                    break
                output.write(chunk)
            output.flush()
            os.fsync(output.fileno())
        for old in sorted(path_dir.glob("*.bin"))[:-3]:
            old.unlink()

    def publish(self, root, package, header, body):
        # Validate again at the privileged write boundary, independent of receiver parsing.
        if len(body) != header["size"] or digest(body) != header["sha256"]:
            raise Rejected("invalid_request", "File transfer verification failed")
        path = header["path"]
        self.policy.path(package, path)
        key = digest((header["package"] + "/" + path).encode())
        with self.locked("publication"), self.locked(key):
            # A global nonblocking lock bounds history accounting and publication concurrency.
            staging = private_directory(str(self.state / "staging"))
            space = os.fstatvfs(root)
            if space.f_bavail * space.f_frsize < 32 * 1024 * 1024 + 3 * len(body):
                raise Rejected("storage", "Insufficient free space for safe publication")
            with tempfile.TemporaryFile(dir=staging) as staged:
                staged.write(body)
                staged.flush()
                os.fsync(staged.fileno())
                with source_parent(root, path, create=True) as parent, writable_directory(parent):
                    name = path.split("/")[-1]
                    old = existing_file(parent, name)
                    temp_name = ".dashsync-" + os.urandom(16).hex()
                    new = None
                    flags = 0
                    cleared = False
                    replaced = False
                    try:
                        previous = file_hash(old)
                        if previous == header["sha256"]:
                            unchanged_flags = get_flags(old)
                            if not unchanged_flags & FS_IMMUTABLE_FL:
                                set_flags(old, unchanged_flags | FS_IMMUTABLE_FL)
                            return {"sha256": previous, "unchanged": True}
                        if previous != header["previous"]:
                            raise Rejected("conflict", "Remote file changed; reconcile locally before retrying")
                        if old is not None:
                            flags = get_flags(old)
                            self.snapshot(header["package"], path, old)
                        new = os.open(temp_name, os.O_CREAT | os.O_EXCL | os.O_RDWR | os.O_NOFOLLOW, 0o600, dir_fd=parent)
                        staged.seek(0)
                        while True:
                            chunk = staged.read(65536)
                            if not chunk:
                                break
                            offset = 0
                            while offset < len(chunk):
                                offset += os.write(new, chunk[offset:])
                        mode = (stat.S_IMODE(os.fstat(old).st_mode) if old is not None
                                else (0o755 if "cgi-bin" in path.split("/") and path.endswith(".py") else 0o644))
                        os.fchown(new, 0, package["gid"])
                        os.fchmod(new, mode)
                        os.fsync(new)
                        # Source ancestors are root-owned/read-only. Recheck the entry before thawing.
                        entry = os.stat(name, dir_fd=parent, follow_symlinks=False) if old is not None else None
                        if old is not None and (entry.st_dev, entry.st_ino) != (os.fstat(old).st_dev, os.fstat(old).st_ino):
                            raise Rejected("conflict", "Destination identity changed")
                        if flags & FS_IMMUTABLE_FL:
                            set_flags(old, flags & ~FS_IMMUTABLE_FL)
                            cleared = True
                        os.replace(temp_name, name, src_dir_fd=parent, dst_dir_fd=parent)
                        replaced = True
                        set_flags(new, flags | FS_IMMUTABLE_FL)
                        os.fsync(parent)
                        return {"sha256": header["sha256"], "unchanged": False}
                    except BaseException:
                        if replaced:
                            # Report failure; never report success without immutable protection.
                            # Root ownership still denies application writes if flag restoration failed.
                            print("dashsync_critical " + json.dumps({"package": header["package"], "path": path,
                                  "reason": "post_replace_failure", "sha256": header["sha256"]}), file=sys.stderr, flush=True)
                        raise
                    finally:
                        if cleared and not replaced:
                            set_flags(old, flags)
                        if old is not None:
                            os.close(old)
                        if new is not None:
                            os.close(new)
                        if not replaced:
                            try:
                                os.unlink(temp_name, dir_fd=parent)
                            except FileNotFoundError:
                                pass


def serve(connection, policy_path=POLICY_PATH, state=STATE_PATH):
    actor, header = None, {}
    result = None
    connection.settimeout(45)
    started = time.monotonic()
    try:
        uid = struct.unpack("3i", connection.getsockopt(socket.SOL_SOCKET, socket.SO_PEERCRED, 12))[1]
        publisher = Publisher(load_policy(policy_path), state)
        with connection.makefile("rb") as stream:
            header = read_header(stream)
            actor = publisher.authorize(uid, header)
            body = read_body(stream, header)
        # Recheck revocation/gates after a potentially slow upload, before filesystem work.
        publisher = Publisher(load_policy(policy_path), state)
        actor = publisher.authorize(uid, header)
        result = response(**publisher.handle(actor, header, body))
    except Rejected as exc:
        result = response(ok=False, code=exc.code)
    except (OSError, ValueError, TypeError, KeyError):
        result = response(ok=False, code="publication_failed")
    finally:
        event = {"actor": actor, "op": header.get("op"), "package": header.get("package"),
                 "path": header.get("path"), "previous": header.get("previous"), "sha256": header.get("sha256"),
                 "elapsed_ms": int((time.monotonic() - started) * 1000)}
        event["result"] = json.loads(result)["ok"] if result else False
        if result and not event["result"]:
            event["code"] = json.loads(result)["code"]
        print("dashsync_publish " + json.dumps(event), file=sys.stderr, flush=True)
    connection.sendall(result)


def main():
    if os.geteuid() != 0:
        raise SystemExit("The publisher must run through its root-owned systemd socket")
    os.umask(0o077)
    signal.alarm(55)
    with socket.socket(fileno=os.dup(0)) as connection:
        if connection.family != socket.AF_UNIX:
            raise SystemExit("A local Unix socket is required")
        serve(connection)


if __name__ == "__main__":
    main()
