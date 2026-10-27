"""Real isolated Git history; bounded fake data transport, no live repositories."""
import contextlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from test_security import CLIENT, load, protocol, transport

client = load('_dashsync_test_client.client_publish', CLIENT / 'client_publish.py')


class DataTransport:
    def __init__(self, files):
        self.files = dict(files)
        self.puts = []
        self.fail_path = None

    def hashes(self, package, paths):
        assert package == 'altona_client'
        assert 1 <= len(paths) <= protocol.MAX_PATHS
        return {p: protocol.digest(self.files[p]) if p in self.files else None for p in paths}

    def request(self, header, body):
        protocol.encode_request({'version': 1, **header}, body)
        assert header['package'] == 'altona_client'
        path = header['path']
        if path == self.fail_path:
            raise protocol.Rejected('connection', 'fixture disconnect')
        current = protocol.digest(self.files[path]) if path in self.files else None
        if current != header['previous']:
            raise protocol.Rejected('conflict', 'fixture concurrent change')
        self.files[path] = body
        self.puts.append(path)
        return {'sha256': protocol.digest(body)}


@unittest.skipUnless(shutil.which('git'), 'requires local Git')
class PushedClientTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / 'repo'
        self.remote = self.root / 'remote.git'
        self.env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
        self.env.update(GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL='/dev/null', LC_ALL='C')
        subprocess.run(['/usr/bin/git', 'init', '--bare', str(self.remote)], check=True, capture_output=True, env=self.env)
        self.repo.mkdir()
        self.git('init', '-b', '1.0.0')
        self.git('config', 'user.name', 'Isolated Fixture')
        self.git('config', 'user.email', 'fixture@example.invalid')
        self.git('config', 'commit.gpgsign', 'false')
        self.git('remote', 'add', 'origin', str(self.remote))
        self.write('client/bin/example.js', b'let version = 1;\n')
        self.write('client/index.html', b'<script src="bin/example.js?v=old"></script>\n')
        self.write('server/example.py', b'# backend stays outside client deployment\n')
        self.initial = self.commit('initial')
        self.push()
        files = {'bin/example.js': (self.repo / 'client/bin/example.js').read_bytes(),
                 'index.html': b'<script src="bin/example.js?v=old"></script>\n<!-- intentional live context -->\n'}
        receipt = {'version': 1, 'repository': 'ensomniac/fixture', 'branch': '1.0.0',
                   'commit': self.initial, 'published_at': '2026-10-27T00:00:00Z',
                   'files': {p: protocol.digest(b) for p, b in files.items()}}
        files[client.RECEIPT] = json.dumps(receipt).encode()
        self.transport = DataTransport(files)
        self.package = {'asset_path': 'altona', 'usr_path_git': str(self.repo), 'domain': 'example.invalid',
                        'transport': self.transport, 'client_sync_policy': {
                            'prefixes': ['bin', 'dash'], 'files': ['index.html'], 'protected': [],
                            'extensions': ['.js', '.css', '.html', '.json']}}
        self.subject = client.PushedClientPublisher(self.package)
        self.subject._public = lambda path, maximum: self.transport.files[path]

    def git(self, *args):
        return subprocess.run(['/usr/bin/git', '-C', str(self.repo), *args], env=self.env,
                              check=True, capture_output=True).stdout.decode().strip()

    def write(self, path, body):
        dest = self.repo / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(body)

    def commit(self, message):
        self.git('add', '-A')
        self.git('commit', '-m', message)
        return self.git('rev-parse', 'HEAD')

    def push(self):
        self.git('remote', 'set-url', 'origin', str(self.remote))
        self.git('push', 'origin', '1.0.0')
        self.git('remote', 'set-url', 'origin', 'git@github.com:ensomniac/fixture.git')

    def publish(self):
        with contextlib.redirect_stdout(io.StringIO()):
            return self.subject.publish_once()

    def change(self, path='client/bin/example.js', body=b'let version = 2;\n'):
        self.write(path, body)
        revision = self.commit('change')
        self.push()
        return revision

    def reject_without_put(self, code=None):
        with self.assertRaises(protocol.Rejected) as raised:
            self.publish()
        if code:self.assertEqual(raised.exception.code, code)
        self.assertEqual(self.transport.puts, [])

    def test_commit_without_push_never_deploys(self):
        self.write('client/bin/example.js', b'unpushed\n')
        self.commit('not pushed')
        self.assertEqual(self.publish()['changed'], 0)
        self.assertEqual(self.transport.puts, [])

    def test_successful_push_publishes_committed_bytes_preserves_dirty_work(self):
        tip = self.change()
        self.write('client/bin/example.js', b'unsaved follow-up is local\n')
        self.assertEqual(self.publish()['commit'], tip)
        self.assertEqual(self.transport.files['bin/example.js'], b'let version = 2;\n')
        self.assertEqual((self.repo / 'client/bin/example.js').read_bytes(), b'unsaved follow-up is local\n')
        self.assertIn(b'intentional live context', self.transport.files['index.html'])
        self.assertIn(('v=' + tip[:12]).encode(), self.transport.files['index.html'])
        self.assertEqual(self.transport.puts, ['bin/example.js', 'index.html', client.RECEIPT])

    def test_whole_plan_conflict_preflight_prevents_partial_writes(self):
        self.write('client/bin/second.js', b'second')
        self.change()
        self.transport.files['bin/example.js'] = b'unrelated live edit'
        self.reject_without_put('conflict')

    def test_partial_disconnect_preserves_receipt_and_retry_resumes(self):
        self.change()
        before = self.transport.files[client.RECEIPT]
        self.transport.fail_path = 'index.html'
        with self.assertRaises(protocol.Rejected):self.publish()
        self.assertEqual(self.transport.files[client.RECEIPT], before)
        self.assertEqual(self.transport.puts, ['bin/example.js'])
        self.transport.fail_path = None
        self.publish()
        self.assertEqual(self.transport.puts, ['bin/example.js', 'index.html', client.RECEIPT])

    def test_backend_only_push_does_not_write_backend_or_working_index(self):
        self.change('server/example.py', b'# pushed backend\n')
        self.assertEqual(self.publish()['changed'], 0)
        self.assertEqual(self.transport.puts, [client.RECEIPT])

    def test_deleted_static_file_requires_review(self):
        (self.repo / 'client/bin/example.js').unlink()
        self.commit('delete');self.push()
        self.reject_without_put('permission')

    def test_symlink_blob_rejected_before_put(self):
        os.symlink('/etc/passwd', self.repo / 'client/bin/link.js')
        self.commit('symlink');self.push()
        self.reject_without_put('invalid_file')

    def test_server_script_rejected_before_put(self):
        self.change('client/bin/execute.py', b'not publishable')
        self.reject_without_put('permission')

    def test_hidden_file_rejected_before_put(self):
        self.change('client/bin/.env', b'not publishable')
        self.reject_without_put('invalid_path')

    def test_private_directory_rejected_before_put(self):
        self.change('client/bin/secrets/value.json', b'not publishable')
        self.reject_without_put('invalid_path')

    def test_changed_index_conflict_is_not_overwritten(self):
        self.change('client/index.html', b'<html>new committed layout</html>')
        self.transport.files['index.html'] = b'unrelated edit after receipt'
        self.reject_without_put('conflict')

    def test_wrong_origin_or_forced_history_rejected(self):
        self.change()
        self.git('remote', 'set-url', 'origin', 'git@github.com:other/wrong.git')
        self.reject_without_put('configuration')
        self.git('remote', 'set-url', 'origin', 'https://github.com/ensomniac/fixture.git')
        self.git('checkout', '--orphan', 'other')
        self.write('client/bin/example.js', b'orphan')
        revision = self.commit('orphan')
        self.git('update-ref', 'refs/remotes/origin/1.0.0', revision)
        self.reject_without_put('conflict')

    def test_public_bytes_must_match_pinned_ssh_hashes(self):
        self.change()
        real_public = self.subject._public
        self.subject._public = lambda path, maximum: real_public(path, maximum) + b' '
        self.reject_without_put('conflict')

    def test_file_and_aggregate_bounds_precede_all_writes(self):
        self.change()
        with patch.object(client, 'MAX_FILE', 4):self.reject_without_put()
        with patch.object(client, 'MAX_RELEASE_BYTES', 4):self.reject_without_put('too_large')
        with patch.object(client, 'MAX_RELEASE_FILES', 0):self.reject_without_put('too_large')

    def test_existing_live_hash_equal_to_committed_blob_is_resumable(self):
        self.change()
        self.transport.files['bin/example.js'] = b'let version = 2;\n'
        self.publish()
        self.assertEqual(self.transport.puts, ['index.html', client.RECEIPT])

    def test_polling_skips_unchanged_remote_ref_and_retries_pending(self):
        with contextlib.redirect_stdout(io.StringIO()):self.subject.check()
        with patch.object(self.subject, 'publish_once') as publish:
            self.subject.next_check = 0;self.subject.check();publish.assert_not_called()
        self.change()
        self.transport.fail_path = 'bin/example.js'
        with contextlib.redirect_stdout(io.StringIO()):
            self.subject.next_check = 0;self.subject.check()
        self.assertNotEqual(self.subject.last_tip, self.git('rev-parse', 'HEAD'))
        self.transport.fail_path = None
        with contextlib.redirect_stdout(io.StringIO()):
            self.subject.next_check = 0;self.subject.check()
        self.assertEqual(self.subject.last_tip, self.git('rev-parse', 'HEAD'))

    def test_git_hooks_and_inherited_git_environment_never_execute(self):
        self.change()
        marker = self.root / 'hook-ran'
        hook = self.repo / '.git/hooks/post-checkout'
        hook.write_text('#!/bin/sh\ntouch ' + str(marker) + '\n');hook.chmod(0o700)
        with patch.dict(os.environ, {'GIT_DIR': '/nonexistent', 'GIT_WORK_TREE': '/etc'}):self.publish()
        self.assertFalse(marker.exists())

    def test_static_policy_never_accepts_script_extension(self):
        self.package['client_sync_policy']['extensions'].append('.py')
        with self.assertRaises(protocol.Rejected):client.PushedClientPublisher(self.package)

    def test_only_changed_asset_cache_parameters_are_updated(self):
        body = b'<script src="/bin/a.js?x=1&v=old#part"></script><a href="https://other.invalid/bin/a.js?v=old"></a><link href="bin/b.css?v=old">'
        changed = client.cache_bust(body, {'bin/a.js'}, 'a' * 40)
        self.assertIn(b'/bin/a.js?x=1&v=aaaaaaaaaaaa#part', changed)
        self.assertIn(b'https://other.invalid/bin/a.js?v=old', changed)
        self.assertIn(b'bin/b.css?v=old', changed)


class LocalProcessBoundsTests(unittest.TestCase):
    def test_git_blob_bound_does_not_increase_ssh_response_bound(self):
        command = ['/usr/bin/python3', '-I', '-S', '-c', 'import sys;sys.stdout.buffer.write(b"x"*70000)']
        with self.assertRaises(protocol.Rejected):transport.bounded_process(command, b'')
        self.assertEqual(len(transport.bounded_process(command, b'', output_limit=70000)), 70000)
