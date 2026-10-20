"""DashSync v1: one bounded JSON header followed by uncompressed file bytes.

This module is also installed by value in the root-owned receiver directory.
It deliberately has no application imports.
"""

import hashlib
import json
import re

VERSION = 1
MAX_FILE = 10 * 1024 * 1024
MAX_HEADER = 49152
MAX_RESPONSE = 65536
MAX_PATHS = 32
IDENTIFIER = re.compile(r"[a-z][a-z0-9_]{0,63}\Z")
HASH = re.compile(r"[a-f0-9]{64}\Z")
COMPONENT = re.compile(r"[A-Za-z0-9_][A-Za-z0-9_. -]{0,127}\Z")
DENIED_PARTS = frozenset({
    "local", "local_storage", "uploads", "attachments", "credentials", "secrets",
    "sessions", "tokens", "node_modules", "__pycache__", "venv", "env", "rar",
})
DENIED_SUFFIXES = (".pem", ".key", ".p12", ".pfx", ".pyc", ".sqlite", ".db")


class Rejected(ValueError):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def identifier(value):
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        raise Rejected("invalid_request", "Invalid package identifier")
    return value


def relative_path(value):
    if not isinstance(value, str) or len(value) > 1024:
        raise Rejected("invalid_path", "Invalid relative path")
    parts = value.split("/")
    if len(parts) > 24 or any(not COMPONENT.fullmatch(p) for p in parts):
        raise Rejected("invalid_path", "Unsafe path component")
    if any(p.lower() in DENIED_PARTS for p in parts):
        raise Rejected("invalid_path", "Private or generated directory is excluded")
    if parts[-1].lower().endswith(DENIED_SUFFIXES):
        raise Rejected("invalid_path", "Private or generated file is excluded")
    return value


def digest(data):
    return hashlib.sha256(data).hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise Rejected("invalid_request", "Duplicate JSON field")
        result[key] = value
    return result


def json_object(raw):
    try:
        result = json.loads(raw, object_pairs_hook=unique_object)
    except (ValueError, UnicodeError, RecursionError) as exc:
        raise Rejected("invalid_request", "Invalid JSON") from exc
    if not isinstance(result, dict):
        raise Rejected("invalid_request", "Expected a JSON object")
    return result


def validate_header(header):
    if type(header.get("version")) is not int or header["version"] != VERSION:
        raise Rejected("upgrade_required", "DashSync SSH protocol v1 is required")
    op = header.get("op")
    fields = {
        "manifest": {"version", "op"},
        "hashes": {"version", "op", "package", "paths"},
        "put": {"version", "op", "package", "path", "previous", "size", "sha256"},
    }
    if not isinstance(op, str) or op not in fields or set(header) != fields[op]:
        raise Rejected("invalid_request", "Unknown operation or fields")
    if op == "manifest":
        return header
    identifier(header["package"])
    if op == "hashes":
        paths = header["paths"]
        if not isinstance(paths, list) or not 1 <= len(paths) <= MAX_PATHS:
            raise Rejected("invalid_request", "Invalid path batch")
        for path in paths:
            relative_path(path)
        if len(set(paths)) != len(paths):
            raise Rejected("invalid_request", "Duplicate paths")
    else:
        relative_path(header["path"])
        if type(header["size"]) is not int or not 0 <= header["size"] <= MAX_FILE:
            raise Rejected("too_large", "Files must be at most 10 MiB")
        for key in ("previous", "sha256"):
            value = header[key]
            if key == "previous" and value is None:
                continue
            if not isinstance(value, str) or not HASH.fullmatch(value):
                raise Rejected("invalid_request", "Invalid content hash")
    return header


def read_header(stream):
    raw = stream.readline(MAX_HEADER + 1)
    if len(raw) > MAX_HEADER or not raw.endswith(b"\n"):
        raise Rejected("invalid_request", "Missing or oversized request header")
    return validate_header(json_object(raw))


def read_body(stream, header):
    size = header.get("size", 0)
    body = stream.read(size)
    if len(body) != size:
        raise Rejected("invalid_request", "Incomplete file transfer")
    if stream.read(1):
        raise Rejected("invalid_request", "Trailing data is forbidden")
    if header["op"] == "put" and digest(body) != header["sha256"]:
        raise Rejected("invalid_request", "Content hash does not match")
    return body


def encode_request(header, body=b""):
    validate_header(header)
    raw = json.dumps(header, separators=(",", ":")).encode() + b"\n"
    if len(raw) > MAX_HEADER or len(body) != header.get("size", 0):
        raise Rejected("invalid_request", "Invalid request length")
    if header["op"] == "put" and digest(body) != header["sha256"]:
        raise Rejected("invalid_request", "Content hash does not match")
    return raw + body


def response(ok=True, **fields):
    raw = json.dumps({"version": VERSION, "ok": ok, **fields}, separators=(",", ":")).encode() + b"\n"
    if len(raw) > MAX_RESPONSE:
        raise Rejected("response_too_large", "Response limit exceeded")
    return raw
