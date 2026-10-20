#!/usr/bin/python3
"""Unprivileged SSH forced command; it cannot choose a privileged operation."""

import os
import resource
import signal
import socket
import sys

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))
from protocol import MAX_RESPONSE, Rejected, encode_request, read_body, read_header, response

SOCKET_PATH = "/run/dashsync/publish.sock"


def main():
    signal.alarm(55)
    resource.setrlimit(resource.RLIMIT_AS, (128 * 1024 * 1024, 128 * 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_CPU, (10, 10))
    try:
        if os.environ.get("SSH_ORIGINAL_COMMAND") != "dashsync-v1":
            raise Rejected("upgrade_required", "Only the DashSync SSH v1 client is accepted")
        header = read_header(sys.stdin.buffer)
        body = read_body(sys.stdin.buffer, header)
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
            connection.settimeout(45)
            connection.connect(SOCKET_PATH)
            connection.sendall(encode_request(header, body))
            connection.shutdown(socket.SHUT_WR)
            with connection.makefile("rb") as stream:
                result = stream.read(MAX_RESPONSE + 1)
            if len(result) > MAX_RESPONSE:
                raise Rejected("connection", "Publisher response exceeded its limit")
        sys.stdout.buffer.write(result)
    except Rejected as exc:
        sys.stdout.buffer.write(response(ok=False, code=exc.code))
    except OSError:
        sys.stdout.buffer.write(response(ok=False, code="not_ready"))


if __name__ == "__main__":
    main()
