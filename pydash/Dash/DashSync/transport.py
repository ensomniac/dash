"""SSH-only transport. Configuration and repository locations are developer-local."""

import json
import os
import re
import selectors
import stat
import subprocess
import time
from pathlib import Path

from .protocol import MAX_RESPONSE, VERSION, Rejected, encode_request, identifier, json_object, relative_path

CONFIG_PATH = Path.home() / ".config" / "dashsync" / "config.json"


def private_file(path):
    path = Path(path).expanduser()
    if not path.is_absolute() or path.is_symlink():
        raise Rejected("configuration", "Expected an absolute, non-symlink private file")
    info = path.stat()
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise Rejected("configuration", "DashSync configuration and SSH files must be owned by you, mode 0600")
    return path


def load_config(path=None):
    path = private_file(path or CONFIG_PATH)
    if path.stat().st_size > 65536:
        raise Rejected("configuration", "Configuration exceeds 64 KiB")
    config = json_object(path.read_bytes())
    if set(config) != {"version", "hosts", "packages"} or type(config.get("version")) is not int or config["version"] != VERSION:
        raise Rejected("configuration", "Expected DashSync SSH configuration v1; see tools/dashsync_deploy/README.md")
    if not isinstance(config["hosts"], dict) or not isinstance(config["packages"], dict):
        raise Rejected("configuration", "Invalid hosts or packages")
    if not config["hosts"] or len(config["hosts"]) > 32 or len(config["packages"]) > 64:
        raise Rejected("configuration", "Invalid configuration size")
    for name, host in config["hosts"].items():
        identifier(name)
        if not isinstance(host, dict) or set(host) != {"hostname", "port", "user", "identity_file", "known_hosts_file"}:
            raise Rejected("configuration", "Invalid SSH host configuration")
        if not isinstance(host["hostname"], str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9.:-]{0,252}", host["hostname"]):
            raise Rejected("configuration", "Invalid SSH hostname")
        if not isinstance(host["user"], str) or not re.fullmatch(r"dashsync_[a-z][a-z0-9_]{0,31}", host["user"]):
            raise Rejected("configuration", "A dedicated dashsync_ SSH identity is required")
        if type(host["port"]) is not int or not 1 <= host["port"] <= 65535:
            raise Rejected("configuration", "Invalid SSH port")
        for field in ("identity_file", "known_hosts_file"):
            host[field] = str(private_file(host[field]))
    for name, package in config["packages"].items():
        identifier(name)
        if not isinstance(package, dict) or set(package) - {"host", "repo", "watch", "context"}:
            raise Rejected("configuration", "Invalid local package configuration")
        if package.get("host") not in config["hosts"]:
            raise Rejected("configuration", "Unknown local SSH host")
        if not isinstance(package.get("repo"), str):
            raise Rejected("configuration", "A local repository root is required")
        repo = Path(package["repo"]).expanduser()
        if not repo.is_absolute() or not repo.is_dir() or repo.is_symlink():
            raise Rejected("configuration", "Repository roots must be existing absolute directories")
        package["repo"] = str(repo.resolve())
        if not isinstance(package.get("watch"), list) or not package["watch"]:
            raise Rejected("configuration", "Explicit local watch roots are required")
        for watch in package["watch"]:
            relative_path(watch)
            target = repo / watch
            if not target.is_dir() or target.is_symlink() or not target.resolve().is_relative_to(repo.resolve()):
                raise Rejected("configuration", "Watch roots must be directories inside the local repository")
        if not isinstance(package.get("context", {}), dict):
            raise Rejected("configuration", "Invalid local compiler context")
    return config


def bounded_process(argv, payload, timeout=60, output_limit=MAX_RESPONSE, env=None):
    """Drain all pipes without trusting the remote host to bound its output."""
    proc = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    output, error = bytearray(), bytearray()
    selector = selectors.DefaultSelector()
    pending = memoryview(payload)
    deadline = time.monotonic() + timeout
    try:
        for stream, events in ((proc.stdin, selectors.EVENT_WRITE), (proc.stdout, selectors.EVENT_READ), (proc.stderr, selectors.EVENT_READ)):
            os.set_blocking(stream.fileno(), False)
            selector.register(stream, events)
        while selector.get_map():
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise Rejected("connection", "SSH transfer timed out; changes remain pending")
            for key, _ in selector.select(min(remaining, 1)):
                stream = key.fileobj
                if stream is proc.stdin:
                    try:
                        count = os.write(stream.fileno(), pending[:65536])
                        pending = pending[count:]
                    except BrokenPipeError:
                        pending = pending[len(pending):]
                    if not pending:
                        selector.unregister(stream)
                        stream.close()
                else:
                    chunk = os.read(stream.fileno(), 8192)
                    if not chunk:
                        selector.unregister(stream)
                        stream.close()
                        continue
                    target, limit = (output, output_limit) if stream is proc.stdout else (error, 4096)
                    target.extend(chunk)
                    if len(target) > limit:
                        raise Rejected("connection", "SSH response exceeded its limit")
        proc.wait(timeout=max(0.01, deadline - time.monotonic()))
        if proc.returncode:
            raise Rejected("connection", "SSH failed: verify your new key, pinned host key, network access, and receiver activation")
        return bytes(output)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise Rejected("connection", "SSH connection failed; changes remain pending") from exc
    finally:
        selector.close()
        if proc.poll() is None:
            proc.kill()
        proc.wait()
        for stream in (proc.stdin, proc.stdout, proc.stderr):
            if not stream.closed:
                stream.close()


class SSHTransport:
    def __init__(self, host):
        self.host = host

    def request(self, header, body=b""):
        host = self.host
        argv = ["/usr/bin/ssh", "-F", "/dev/null", "-T",
                "-o", "BatchMode=yes", "-o", "IdentitiesOnly=yes",
                "-o", "StrictHostKeyChecking=yes", "-o", "GlobalKnownHostsFile=/dev/null",
                "-o", "UserKnownHostsFile=" + host["known_hosts_file"],
                "-o", "ClearAllForwardings=yes", "-o", "ForwardAgent=no",
                "-o", "PermitLocalCommand=no", "-o", "ConnectTimeout=10",
                "-o", "ServerAliveInterval=10", "-o", "ServerAliveCountMax=2",
                "-p", str(host["port"]), "-i", host["identity_file"],
                "-l", host["user"], "--", host["hostname"], "dashsync-v1"]
        raw = bounded_process(argv, encode_request({"version": VERSION, **header}, body))
        result = json_object(raw)
        if type(result.get("version")) is not int or result["version"] != VERSION or type(result.get("ok")) is not bool:
            raise Rejected("connection", "Invalid SSH receiver response")
        if not result["ok"]:
            code = result.get("code", "receiver_error")
            if not isinstance(code, str) or not re.fullmatch(r"[a-z_]{1,40}", code):
                code = "receiver_error"
            raise Rejected(code, "Receiver rejected request (" + code + "); changes remain pending")
        return result

    def manifest(self):
        result = self.request({"op": "manifest"})
        packages = result.get("packages")
        if not isinstance(packages, dict) or len(packages) > 64:
            raise Rejected("connection", "Invalid SSH package manifest")
        return packages

    def hashes(self, package, paths):
        result = self.request({"op": "hashes", "package": package, "paths": paths})
        values = result.get("hashes")
        if not isinstance(values, dict) or set(values) != set(paths):
            raise Rejected("connection", "Invalid remote hash response")
        from .protocol import HASH
        if any(value is not None and (not isinstance(value, str) or not HASH.fullmatch(value)) for value in values.values()):
            raise Rejected("connection", "Invalid remote file hash")
        return values
