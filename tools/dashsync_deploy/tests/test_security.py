"""Isolated security/compatibility tests. Never imports a production application.

Run: python3 -m unittest discover -s tools/dashsync_deploy/tests -v
Root-only filesystem tests use a temporary private directory under /root.
"""

import contextlib
import ast
import importlib.util
import io
import json
import os
import socket
import shutil
import subprocess
import stat
import struct
import sys
import tempfile
import threading
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

HERE = Path(__file__).resolve().parent
SERVER = HERE if (HERE / "publisher.py").exists() else HERE.parent
CLIENT = HERE if (HERE / "transport.py").exists() else HERE.parents[2] / "pydash" / "Dash" / "DashSync"


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


namespace = types.ModuleType("_dashsync_test_client")
namespace.__path__ = [str(CLIENT)]
sys.modules[namespace.__name__] = namespace
protocol = load("_dashsync_test_client.protocol", CLIENT / "protocol.py")
transport = load("_dashsync_test_client.transport", CLIENT / "transport.py")
watcher = load("_dashsync_test_client.sync_thread", CLIENT / "sync_thread.py")
publisher = load("_dashsync_test_publisher", SERVER / "publisher.py")
server_protocol = sys.modules["protocol"]


def put(path="server/example.py", content=b"print('new')\n", previous=None):
    return {"version": 1, "op": "put", "package": "example", "path": path,
            "previous": previous, "size": len(content), "sha256": protocol.digest(content)}


@unittest.skipUnless(sys.platform.startswith("linux") and os.geteuid() == 0 and shutil.which("sshd"), "needs the installed Linux SSH parser and root host-key access")
class SSHTemplateTests(unittest.TestCase):
    def test_template_parses_and_restricts_only_deployment_accounts(self):
        template = SERVER / "sshd.conf.example"
        result = subprocess.run([shutil.which("sshd"), "-T", "-f", str(template), "-C", "user=dashsync_ryan,host=fixture.invalid,addr=192.0.2.10"], check=True, capture_output=True, text=True)
        values = dict(line.split(None, 1) for line in result.stdout.splitlines())
        self.assertEqual(values["forcecommand"], "/usr/bin/python3 -I -S /usr/local/libexec/dashsync/receiver.py")
        for key, expected in {"disableforwarding":"yes", "permittty":"no", "permituserrc":"no", "permituserenvironment":"no", "passwordauthentication":"no", "kbdinteractiveauthentication":"no"}.items():
            self.assertEqual(values[key], expected)
        other = subprocess.run([shutil.which("sshd"), "-T", "-f", str(template), "-C", "user=fixture_admin,host=fixture.invalid,addr=192.0.2.10"], check=True, capture_output=True, text=True)
        self.assertIn("forcecommand none\n", other.stdout)


class ProtocolTests(unittest.TestCase):
    def test_client_and_privileged_protocol_copies_match(self):
        self.assertEqual((CLIENT / "protocol.py").read_bytes(), (SERVER / "protocol.py").read_bytes())

    def test_binary_roundtrip(self):
        body = bytes(range(256))
        stream = io.BytesIO(protocol.encode_request(put(content=body), body))
        header = protocol.read_header(stream)
        self.assertEqual(protocol.read_body(stream, header), body)

    def test_unsafe_paths(self):
        for path in ("/etc/passwd", "../escape.py", "server/../escape.py", "server//x.py", "server/.env", "server/.git/config", "server/local/x.py", "server/a;id.py", "server/a$(id).py", "server/a\nb.py", "server/a\\b.py", "server/x.key"):
            with self.subTest(path=path), self.assertRaises(protocol.Rejected):
                protocol.relative_path(path)

    def test_malformed_headers(self):
        for raw in (b'{"version":1,"version":1,"op":"manifest"}\n', b'{}\n', b'[]\n', b'{"version":1,"op":"shell"}\n', b'{"version":1,"op":"manifest","command":"id"}\n', b'x' * (protocol.MAX_HEADER + 1)):
            with self.subTest(raw=raw[:64]), self.assertRaises(protocol.Rejected):
                protocol.read_header(io.BytesIO(raw))

    def test_oversize_and_boolean_size(self):
        for size in (protocol.MAX_FILE + 1, -1, True):
            header = put()
            header["size"] = size
            with self.assertRaises(protocol.Rejected):
                protocol.validate_header(header)

    def test_incomplete_corrupt_and_trailing_body(self):
        header = put(content=b"data")
        for body in (b"dat", b"DATA", b"dataextra"):
            with self.assertRaises(protocol.Rejected):
                protocol.read_body(io.BytesIO(body), header)

    def test_maximum_batch_is_bounded(self):
        path = "/".join(["a" * 100] * 10) + "/x.py"
        paths = [path[:-4] + str(i) + ".py" for i in range(protocol.MAX_PATHS)]
        header = {"version": 1, "op": "hashes", "package": "example", "paths": paths}
        self.assertLess(len(protocol.encode_request(header)), protocol.MAX_HEADER)


class ClientTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "repo" / "server").mkdir(parents=True)
        for name in ("key", "known_hosts"):
            (self.root / name).write_text("fixture")
            (self.root / name).chmod(0o600)
        self.config = {"version": 1, "hosts": {"oapi": {
            "hostname": "example.invalid", "port": 22, "user": "dashsync_ryan",
            "identity_file": str(self.root / "key"), "known_hosts_file": str(self.root / "known_hosts")}},
            "packages": {"example": {"host": "oapi", "repo": str(self.root / "repo"), "watch": ["server"]}}}

    def write_config(self):
        path = self.root / "config.json"
        path.write_text(json.dumps(self.config))
        path.chmod(0o600)
        return path

    def test_local_configuration_needs_no_http_session(self):
        config = transport.load_config(self.write_config())
        self.assertEqual(config["packages"]["example"]["repo"], str(self.root / "repo"))

    def test_group_readable_config_is_rejected(self):
        path = self.write_config()
        path.chmod(0o640)
        with self.assertRaises(protocol.Rejected):
            transport.load_config(path)

    def test_command_in_hostname_and_unknown_fields_rejected(self):
        for hostname in ("-oProxyCommand=id", "host;id", "host$(id)"):
            self.config["hosts"]["oapi"]["hostname"] = hostname
            with self.assertRaises(protocol.Rejected):
                transport.load_config(self.write_config())

    def test_pinned_ssh_uses_argument_list_and_never_remote_commands(self):
        config = transport.load_config(self.write_config())
        with patch.object(transport, "bounded_process", return_value=b'{"version":1,"ok":true,"packages":{}}\n') as call:
            transport.SSHTransport(config["hosts"]["oapi"]).manifest()
        argv, payload = call.call_args.args
        self.assertEqual(argv[0], "/usr/bin/ssh")
        self.assertIn("StrictHostKeyChecking=yes", argv)
        self.assertIn("GlobalKnownHostsFile=/dev/null", argv)
        self.assertIn("ForwardAgent=no", argv)
        self.assertEqual(argv[-1], "dashsync-v1")
        self.assertNotIn("token", payload.decode())

    def test_remote_output_is_bounded(self):
        with self.assertRaises(protocol.Rejected):
            transport.bounded_process([sys.executable, "-c", "import sys; sys.stdout.write('x'*100000)"], b"", timeout=3)

    def test_connection_timeout_is_bounded(self):
        with self.assertRaises(protocol.Rejected):
            transport.bounded_process([sys.executable, "-c", "import time; time.sleep(10)"], b"", timeout=0.1)

    def test_compiler_does_not_publish_ssh_runtime_metadata(self):
        import shutil
        source = HERE / "ClientCompiler.py" if (HERE / "ClientCompiler.py").exists() else CLIENT.parent / "ClientCompiler.py"
        tree = ast.parse(source.read_text())
        cls = next(node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == "_ClientCompiler")
        cls.body = [node for node in cls.body if isinstance(node, ast.FunctionDef) and node.name in {"update_publish_index_source", "get_mobile_css_include", "version_arbitrary"}]
        namespace = {"os": os, "rmtree": shutil.rmtree, "copytree": shutil.copytree, "sys": sys}
        exec(compile(ast.Module(body=[cls], type_ignores=[]), str(source), "exec"), namespace)
        instance = namespace["_ClientCompiler"]()
        instance.VersionInfo = {"version": 1, "date_hr": "fixture"}
        instance.ClientPathMin = str(self.root / "compiled")
        instance.dist_tag = "fixture"
        (self.root / "compiled" / "dash").mkdir(parents=True)
        target = self.root / "client"
        target.mkdir()
        index = target / "index.html"
        index.write_text("<head>\n<title>Fixture</title>\n</head>\n")
        package = {"asset_path": "fixture", "display_name": "Fixture", "transport": object(),
                   "watch": ["server"], "sync_policy": {"prefixes": ["server"]}}
        with contextlib.redirect_stdout(io.StringIO()):
            instance.update_publish_index_source(package, str(index), str(target) + "/")
        result = index.read_text()
        self.assertIn('"asset_path"', result)
        for name in ("transport", "watch", "sync_policy"):
            self.assertNotIn('"' + name + '"', result)

    def test_remote_commit_fields_are_never_executed(self):
        host = transport.load_config(self.write_config())["hosts"]["oapi"]
        raw = b'{"version":1,"ok":true,"packages":{},"livesync_git_commit_request":{"commit_msg":"$(touch /tmp/never)"}}'
        with patch.object(transport, "bounded_process", return_value=raw) as command:
            self.assertEqual(transport.SSHTransport(host).manifest(), {})
            command.assert_called_once()

    def test_local_symlink_and_hardlink_are_rejected(self):
        root = self.root / "repo"
        (root / "outside.py").write_bytes(b"private")
        (root / "server" / "link.py").symlink_to(root / "outside.py")
        os.link(root / "outside.py", root / "server" / "hard.py")
        for path in ("server/link.py", "server/hard.py"):
            with self.assertRaises((OSError, protocol.Rejected)):
                watcher.read_local(root, path)

    def test_retry_preserves_pending_and_hash_conflict_stops_writes(self):
        root = self.root / "repo"
        source = root / "server" / "example.txt"
        source.write_text("old")
        fake = Mock()
        fake.hashes.return_value = {"server/example.txt": protocol.digest(b"old")}
        package = {"asset_path": "example", "usr_path_git": str(root), "watch": ["server"], "transport": fake,
                   "sync_policy": {"prefixes": ["server"], "files": [], "protected": [], "extensions": [".txt"]}}
        with contextlib.redirect_stdout(io.StringIO()):
            thread = watcher.SyncThread(package)
            source.write_text("new content")
            fake.request.side_effect = protocol.Rejected("connection", "offline")
            with patch.dict(sys.modules, {"Dash.DashLint": types.SimpleNamespace(DashLint=Mock())}):
                thread.check()
                self.assertIn("server/example.txt", thread.pending)
                self.assertNotIn("server/example.txt", thread.conflicts)
                thread.next_retry.clear()
                fake.request.side_effect = protocol.Rejected("conflict", "changed")
                thread.check()
                self.assertIn("server/example.txt", thread.conflicts)


@unittest.skipUnless(os.geteuid() == 0 and sys.platform.startswith("linux"), "Privileged publisher tests require root on isolated Linux")
class PublisherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="dashsync-tests-", dir="/root")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / "repo"
        (self.repo / "server").mkdir(parents=True)
        self.record = self.root / "gate.txt"
        self.record.write_text("Isolated test evidence, never a production attestation\n")
        info = self.repo.stat()
        self.data = {"version": 1, "gates": {name: str(self.record) for name in publisher.GATES},
                     "actors": {"dashsync_fixture": {"uid": 65534, "packages": ["example"]}},
                     "packages": {"example": {"enabled": True, "root": str(self.repo), "device": info.st_dev,
                                  "inode": info.st_ino, "prefixes": ["server"], "files": [],
                                  "protected": ["server/protected.py"], "extensions": [".py"], "gid": 0}}}
        self.policy = publisher.Policy(self.data)
        self.subject = publisher.Publisher(self.policy, str(self.root / "state"))

    def expect_code(self, code, fn):
        with self.assertRaises(publisher.Rejected) as caught:
            fn()
        self.assertEqual(caught.exception.code, code)

    def authorize(self, header):
        return self.subject.authorize(65534, header)

    def write(self, content=b"old"):
        path = self.repo / "server" / "example.py"
        path.write_bytes(content)
        return path

    def test_unknown_identity_and_root_denied(self):
        for uid in (0, 12345):
            self.expect_code("authentication", lambda: self.subject.authorize(uid, {"op": "manifest"}))

    def test_closed_gate_denies_before_filesystem_write(self):
        self.data["gates"]["monitoring"] = None
        self.expect_code("not_ready", lambda: self.authorize(put()))
        self.assertFalse((self.root / "state").exists())

    def test_disabled_and_cross_package_denied(self):
        header = put()
        header["package"] = "other"
        self.expect_code("permission", lambda: self.authorize(header))
        self.data["packages"]["example"]["enabled"] = False
        self.expect_code("package_disabled", lambda: self.authorize(put()))

    def test_protected_privilege_and_unapproved_paths_denied(self):
        for path in ("server/protected.py", "server/RootPoll.py", "server/RunAsRoot.py", "other/x.py", "server/file.sh"):
            self.expect_code("permission", lambda: self.authorize(put(path)))

    def test_manifest_contains_only_permissions_not_destination_paths(self):
        result = self.subject.handle(self.authorize({"op": "manifest"}), {"op": "manifest"}, b"")
        self.assertEqual(set(result["packages"]), {"example"})
        self.assertNotIn("root", result["packages"]["example"])

    def test_untrusted_source_directory_and_repinning_denied(self):
        self.repo.chmod(0o777)
        self.expect_code("unsafe_directory", lambda: self.subject.handle("dashsync_fixture", {"op": "manifest"}, b""))
        self.repo.chmod(0o755)
        self.data["packages"]["example"]["inode"] += 1
        self.expect_code("unsafe_directory", lambda: self.subject.handle("dashsync_fixture", {"op": "manifest"}, b""))

    def test_final_and_parent_symlink_and_hardlink_denied(self):
        outside = self.root / "outside.py"
        outside.write_bytes(b"private")
        path = self.repo / "server" / "example.py"
        path.symlink_to(outside)
        with self.assertRaises(OSError):
            self.subject.handle("dashsync_fixture", {"op": "hashes", "package": "example", "paths": ["server/example.py"]}, b"")
        path.unlink()
        os.link(outside, path)
        self.expect_code("unsafe_file", lambda: self.subject.handle("dashsync_fixture", {"op": "hashes", "package": "example", "paths": ["server/example.py"]}, b""))
        path.unlink()
        (self.repo / "server" / "linked").symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(OSError):
            self.subject.handle("dashsync_fixture", {"op": "hashes", "package": "example", "paths": ["server/linked/outside.py"]}, b"")

    def test_stale_hash_conflicts_without_changing_file(self):
        path = self.write()
        self.expect_code("conflict", lambda: self.subject.handle("dashsync_fixture", put(previous="0" * 64), b"print('new')\n"))
        self.assertEqual(path.read_bytes(), b"old")

    def test_atomic_update_and_lost_ack_retry_with_mocked_flags(self):
        path = self.write()
        body = b"print('new')\n"
        header = put(content=body, previous=protocol.digest(b"old"))
        with patch.object(publisher, "get_flags", return_value=publisher.FS_IMMUTABLE_FL), patch.object(publisher, "set_flags") as flags:
            result = self.subject.handle("dashsync_fixture", header, body)
            self.assertEqual(result["sha256"], protocol.digest(body))
            self.assertEqual(path.read_bytes(), body)
            self.assertTrue(any(args.args[1] & publisher.FS_IMMUTABLE_FL for args in flags.call_args_list))
            again = self.subject.handle("dashsync_fixture", header, body)
            self.assertTrue(again["unchanged"])
        history = list((self.root / "state" / "history").rglob("*.bin"))
        self.assertEqual([file.read_bytes() for file in history], [b"old"])

    def test_replace_failure_restores_prior_flags_and_content(self):
        path = self.write()
        header = put(previous=protocol.digest(b"old"))
        with patch.object(publisher, "get_flags", return_value=publisher.FS_IMMUTABLE_FL), patch.object(publisher, "set_flags") as flags, patch.object(publisher.os, "replace", side_effect=OSError("fixture interruption")):
            with self.assertRaises(OSError):
                self.subject.handle("dashsync_fixture", header, b"print('new')\n")
            self.assertEqual(flags.call_args_list[-1].args[1], publisher.FS_IMMUTABLE_FL)
        self.assertEqual(path.read_bytes(), b"old")
        self.assertEqual(list(path.parent.glob(".dashsync-*")), [])

    def test_lost_ack_cannot_acknowledge_mutable_content(self):
        path = self.write()
        with patch.object(publisher, "get_flags", return_value=0), patch.object(publisher, "set_flags", side_effect=OSError("fixture flag failure")):
            with self.assertRaises(OSError):
                self.subject.handle("dashsync_fixture", put(content=b"old"), b"old")
        self.assertEqual(path.read_bytes(), b"old")

    def test_corrupt_body_rejected_at_privileged_boundary(self):
        self.expect_code("invalid_request", lambda: self.subject.handle("dashsync_fixture", put(), b"corrupt"))
        self.assertFalse((self.repo / "server" / "example.py").exists())

    def test_publication_lock_rejects_concurrency(self):
        with self.subject.locked("publication"):
            self.expect_code("busy", lambda: self.subject.handle("dashsync_fixture", put(), b"print('new')\n"))

    def test_history_retains_only_three_prior_versions(self):
        path = self.write()
        with patch.object(publisher, "get_flags", return_value=0), patch.object(publisher, "set_flags"):
            for value in range(6):
                body = str(value).encode()
                header = put(content=body, previous=protocol.digest(path.read_bytes()))
                self.subject.handle("dashsync_fixture", header, body)
        self.assertEqual(len(list((self.root / "state" / "history").rglob("*.bin"))), 3)

    def test_real_filesystem_immutable_flag(self):
        path = self.write()
        fd = os.open(path, os.O_RDONLY)
        try:
            flags = publisher.get_flags(fd)
            try:
                publisher.set_flags(fd, flags | publisher.FS_IMMUTABLE_FL)
            except PermissionError:
                self.skipTest("CAP_LINUX_IMMUTABLE is unavailable on this test filesystem")
        finally:
            os.close(fd)
        try:
            body = b"new"
            self.subject.handle("dashsync_fixture", put(content=body, previous=protocol.digest(b"old")), body)
            fd = os.open(path, os.O_RDONLY)
            try:
                self.assertTrue(publisher.get_flags(fd) & publisher.FS_IMMUTABLE_FL)
            finally:
                os.close(fd)
        finally:
            fd = os.open(path, os.O_RDONLY)
            try:
                publisher.set_flags(fd, publisher.get_flags(fd) & ~publisher.FS_IMMUTABLE_FL)
            finally:
                os.close(fd)

    def test_immutable_directories_support_updates_and_new_subdirectories(self):
        directory = self.repo / "server"
        fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
        before = publisher.get_flags(fd)
        publisher.set_flags(fd, before | publisher.FS_IMMUTABLE_FL)
        path = directory / "nested" / "example.py"
        try:
            body = b"new nested source\n"
            header = put(path="server/nested/example.py", content=body)
            self.subject.handle("dashsync_fixture", header, body)
            self.assertTrue(publisher.get_flags(fd) & publisher.FS_IMMUTABLE_FL)
            self.assertEqual(path.read_bytes(), body)
            self.assertEqual(stat.S_IMODE(path.parent.stat().st_mode), 0o755)
        finally:
            publisher.set_flags(fd, before)
            os.close(fd)
            if path.exists():
                source = os.open(path, os.O_RDONLY)
                try:
                    publisher.set_flags(source, publisher.get_flags(source) & ~publisher.FS_IMMUTABLE_FL)
                finally:
                    os.close(source)

    def test_frozen_parent_and_file_are_restored_after_replacement(self):
        path = self.write()
        parent = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
        source = os.open(path, os.O_RDONLY)
        parent_flags, file_flags = publisher.get_flags(parent), publisher.get_flags(source)
        publisher.set_flags(parent, parent_flags | publisher.FS_IMMUTABLE_FL)
        publisher.set_flags(source, file_flags | publisher.FS_IMMUTABLE_FL)
        os.close(source)
        try:
            body = b"replaced with frozen parent\n"
            self.subject.handle("dashsync_fixture", put(content=body, previous=protocol.digest(b"old")), body)
            self.assertEqual(path.read_bytes(), body)
            self.assertTrue(publisher.get_flags(parent) & publisher.FS_IMMUTABLE_FL)
            source = os.open(path, os.O_RDONLY)
            try:
                self.assertTrue(publisher.get_flags(source) & publisher.FS_IMMUTABLE_FL)
            finally:
                os.close(source)
        finally:
            publisher.set_flags(parent, parent_flags)
            os.close(parent)
            source = os.open(path, os.O_RDONLY)
            try:
                publisher.set_flags(source, publisher.get_flags(source) & ~publisher.FS_IMMUTABLE_FL)
            finally:
                os.close(source)

    def test_real_peer_credentials_cannot_be_forged_by_header(self):
        left, right = socket.socketpair(socket.AF_UNIX)
        self.addCleanup(left.close)
        self.addCleanup(right.close)
        header = {"version": 1, "op": "manifest"}
        # The peer is root, while the only configured deployment identity is UID 65534.
        with patch.object(publisher, "load_policy", return_value=self.policy), contextlib.redirect_stderr(io.StringIO()):
            thread = threading.Thread(target=publisher.serve, args=(left,))
            thread.start()
            right.sendall(server_protocol.encode_request(header))
            right.shutdown(socket.SHUT_WR)
            reply = json.loads(right.recv(4096))
            thread.join(timeout=3)
        self.assertFalse(thread.is_alive())
        self.assertEqual(reply["code"], "authentication")

    def test_real_unprivileged_peer_publishes_without_source_access(self):
        policy_file = self.root / "policy.json"
        policy_file.write_text(json.dumps(self.data))
        policy_file.chmod(0o600)
        listener = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        address = "\0dashsync-fixture-" + os.urandom(16).hex()
        listener.bind(address)
        listener.listen(1)
        listener.settimeout(5)
        body = b"isolated source fixture\n"
        payload = server_protocol.encode_request(put(content=body), body)
        pid = os.fork()
        if pid == 0:
            try:
                listener.close()
                os.setgroups([])
                os.setgid(65534)
                os.setuid(65534)
                with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
                    client.settimeout(5)
                    client.connect(address)
                    client.sendall(payload)
                    client.shutdown(socket.SHUT_WR)
                    reply = json.loads(client.recv(4096))
                os._exit(0 if reply.get("ok") else 1)
            except BaseException:
                os._exit(2)
        path = self.repo / "server" / "example.py"
        try:
            with listener.accept()[0] as connection, contextlib.redirect_stderr(io.StringIO()) as log:
                publisher.serve(connection, str(policy_file), str(self.root / "state"))
            _, status = os.waitpid(pid, 0)
            self.assertEqual(os.waitstatus_to_exitcode(status), 0)
            self.assertEqual(path.read_bytes(), body)
            self.assertIn('"actor": "dashsync_fixture"', log.getvalue())
            self.assertNotIn(body.decode().strip(), log.getvalue())
        finally:
            listener.close()
            if path.exists():
                fd = os.open(path, os.O_RDONLY)
                try:
                    publisher.set_flags(fd, publisher.get_flags(fd) & ~publisher.FS_IMMUTABLE_FL)
                finally:
                    os.close(fd)


class LegacyClosureTests(unittest.TestCase):
    def test_http_deployment_handlers_only_reject(self):
        names = [("api_sync.py", "ApiSync", "dashsync_live"), ("api_sync.py", "ApiSync", "github_webhook"),
                 ("guide_sync.py", "Sync", "live"), ("guide_github.py", "GitHub", "webhook"),
                 ("guide_packages.py", "Packages", "get_sync_manifest")]
        if not (SERVER / "api_sync.py").exists():
            repo = SERVER.parents[1]
            guide = repo.parent / "dash_guide" / "server" / "cgi-bin"
            names = [(str(repo / "pydash/Dash/Api/Sync.py"), "ApiSync", "dashsync_live"),
                     (str(repo / "pydash/Dash/Api/Sync.py"), "ApiSync", "github_webhook"),
                     (str(guide / "Sync.py"), "Sync", "live"), (str(guide / "GitHub.py"), "GitHub", "webhook"),
                     (str(guide / "Packages.py"), "Packages", "get_sync_manifest")]
        fake = types.ModuleType("Dash.Api.Core")
        fake.ApiCore = type("ApiCore", (), {})
        dash = types.ModuleType("Dash")
        dash.LocalStorage = types.ModuleType("Dash.LocalStorage")
        date_parser = types.ModuleType("dateutil.parser")
        date_parser.isoparse = Mock()
        with patch.dict(sys.modules, {"Dash": dash, "Dash.Api.Core": fake, "dateutil.parser": date_parser}):
            for file, cls, method in names:
                if Path(file).is_absolute() and not Path(file).exists():
                    continue  # Optional Dash Guide integration needs its separate checkout.
                with self.subTest(file=file, method=method):
                    source = Path(file) if Path(file).is_absolute() else SERVER / file
                    module = load("_legacy_fixture", source)
                    instance = getattr(module, cls).__new__(getattr(module, cls))
                    instance.reject_request = Mock(return_value={"error": "retired"})
                    with patch("builtins.open", side_effect=AssertionError("HTTP handler opened a file")), patch("os.system", side_effect=AssertionError("HTTP handler invoked a shell")):
                        self.assertEqual(getattr(instance, method)(), {"error": "retired"})
                    instance.reject_request.assert_called_once()

    def test_old_status_client_never_receives_stored_git_commands(self):
        source = SERVER / "guide_users.py" if (SERVER / "guide_users.py").exists() else SERVER.parents[1].parent / "dash_guide/server/cgi-bin/Users.py"
        if not source.exists():
            self.skipTest("Dash Guide integration needs its separate checkout")
        core = types.ModuleType("Dash.Api.Core")
        core.ApiCore = type("ApiCore", (), {})
        users = types.ModuleType("Dash.Api.Users")
        users.ApiUsers = type("ApiUsers", (), {})
        storage = types.ModuleType("Dash.LocalStorage")
        storage.CreateOrUpdate = Mock(return_value={"livesync_git_commit_request": {"commit_msg": "$(touch /tmp/never)"}})
        with patch.dict(sys.modules, {"Dash.Api.Core": core, "Dash.Api.Users": users, "Dash.LocalStorage": storage}):
            module = load("_legacy_users_fixture", source)
            instance = module.Users.__new__(module.Users)
            instance.User = {"email": "fixture@example.invalid"}
            instance.DashContext = {}
            instance.Params = {"asset_path": "pydash", "git_status": "fixture", "has_changes": "true"}
            instance.SetResponse = lambda value: value
            result = instance.set_sync_state()
        self.assertEqual(result, {"success": True})
        self.assertFalse(hasattr(module.Users, "request_livesync_git_commit"))
        self.assertFalse(hasattr(module.Users, "set_livesync_git_result"))


if __name__ == "__main__":
    unittest.main()
