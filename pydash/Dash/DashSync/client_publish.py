"""Publish committed static client files after a successful local Git push.

Git inspection stays local. Only bounded data files use the existing SSH
publisher; neither the server nor this module executes repository build hooks.
"""
import datetime as dt
import json
import os
from pathlib import Path
import re
import time
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen

from .protocol import HASH, MAX_FILE, MAX_PATHS, Rejected, digest, identifier, json_object, relative_path
from .transport import bounded_process

RECEIPT = 'bin/dashsync_release.json'
MAX_METADATA = 262144
MAX_RELEASE_BYTES = 32 * 1024 * 1024
MAX_RELEASE_FILES = 256
REVISION = re.compile(r'[a-f0-9]{40}\Z')


def cache_bust(body, changed, revision):
    try:
        text = body.decode('utf8')
    except UnicodeDecodeError as error:
        raise Rejected('invalid_file', 'Client index must be UTF-8') from error
    def replace(match):
        parts = urlsplit(match[2]);path = parts.path.lstrip('/')
        if path.startswith('./'):path = path[2:]
        if parts.scheme or parts.netloc or path not in changed:
            return match[0]
        query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k != 'v']
        query.append(('v', revision[:12]))
        return match[1] + urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment)) + match[3]
    return re.sub(r'''((?:src|href)\s*=\s*["'])([^"']+)(["'])''', replace, text).encode('utf8')


class PushedClientPublisher:
    def __init__(self, package):
        self.context = package
        self.name = package['asset_path']
        self.remote_package = identifier(self.name + '_client')
        self.repo = Path(package['usr_path_git'])
        self.transport = package['transport']
        self.policy = package['client_sync_policy']
        if not isinstance(self.policy, dict) or set(self.policy) != {'prefixes', 'files', 'protected', 'extensions'}:
            raise Rejected('configuration', 'Invalid static client publication policy')
        for key in ('prefixes', 'files', 'protected'):
            if not isinstance(self.policy[key], list):raise Rejected('configuration', 'Invalid static path permissions')
            for path in self.policy[key]:relative_path(path)
        if (not isinstance(self.policy['extensions'], list) or any(not isinstance(ext, str) or not re.fullmatch(r'\.[a-zA-Z0-9]+', ext) for ext in self.policy['extensions'])
                or any(ext.lower() in {'.py', '.php', '.cgi', '.sh', '.phtml'} for ext in self.policy['extensions'])):
            raise Rejected('configuration', 'Client publishing requires a static-files-only grant')
        domain = package.get('domain', '')
        if not isinstance(domain, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9.-]{0,252}', domain):
            raise Rejected('configuration', 'A public client domain is required in local context')
        self.base_url = 'https://' + domain
        self.metadata = None
        self.last_tip = None
        self.last_error = None
        self.next_check = 0

    def _git(self, *arguments, limit=MAX_METADATA):
        environment = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
        environment.update(GIT_TERMINAL_PROMPT='0', GIT_OPTIONAL_LOCKS='0', GIT_PAGER='cat', LC_ALL='C')
        argv = ['/usr/bin/git', '--no-pager', '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', '-C', str(self.repo), *arguments]
        try:
            return bounded_process(argv, b'', timeout=20, output_limit=limit, env=environment)
        except (Rejected, OSError) as error:
            raise Rejected('git', 'Local Git inspection failed. Fetch the approved branch history and retry; repository hooks are disabled.') from error

    def _public(self, path, maximum):
        request = Request(self.base_url + '/' + path, headers={'Accept-Encoding': 'identity', 'Cache-Control': 'no-cache'})
        try:
            with urlopen(request, timeout=15) as response:
                if response.geturl() != self.base_url + '/' + path:
                    raise Rejected('connection', 'Deployment metadata unexpectedly redirected')
                data = response.read(maximum + 1)
        except OSError as error:
            raise Rejected('connection', 'Cannot read public deployment metadata; changes remain pending') from error
        if len(data) > maximum:
            raise Rejected('too_large', 'Public deployment metadata exceeds its bound')
        return data

    def _receipt(self):
        raw = self._public(RECEIPT, MAX_METADATA)
        if self.transport.hashes(self.remote_package, [RECEIPT])[RECEIPT] != digest(raw):
            raise Rejected('conflict', 'Deployment receipt changed during reading or differs from the pinned SSH receiver; retry')
        meta = json_object(raw)
        if (set(meta) != {'version', 'repository', 'branch', 'commit', 'published_at', 'files'}
                or type(meta['version']) is not int or meta['version'] != 1
                or not isinstance(meta['commit'], str) or not REVISION.fullmatch(meta['commit'])
                or not isinstance(meta['repository'], str) or not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', meta['repository'])
                or not isinstance(meta['branch'], str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._/-]{0,127}', meta['branch'])
                or '..' in meta['branch'] or '//' in meta['branch'] or meta['branch'].endswith('/')
                or not isinstance(meta['published_at'], str) or len(meta['published_at']) > 40
                or not isinstance(meta['files'], dict) or not 1 <= len(meta['files']) <= 2000
                or 'index.html' not in meta['files']):
            raise Rejected('connection', 'Invalid client deployment receipt')
        for path, value in meta['files'].items():
            relative_path(path)
            if not isinstance(value, str) or not HASH.fullmatch(value):
                raise Rejected('connection', 'Invalid recorded client file hash')
        self.metadata = meta
        return meta, digest(raw)

    def _origin(self, expected):
        raw = self._git('remote', 'get-url', 'origin').decode('utf8').strip()
        if raw.startswith('git@github.com:'):
            name = raw[len('git@github.com:'):]
        else:
            parsed = urlsplit(raw)
            if parsed.scheme not in {'https', 'ssh'} or parsed.hostname not in {'github.com', 'ssh.github.com'}:
                raise Rejected('configuration', 'The local origin must identify the approved GitHub repository')
            name = parsed.path.lstrip('/')
        if name.endswith('.git'):name = name[:-4]
        if name.lower() != expected.lower():
            raise Rejected('configuration', 'Local repository origin does not match the approved deployment')

    def _tip(self, branch):
        value = self._git('rev-parse', '--verify', 'refs/remotes/origin/' + branch + '^{commit}').decode().strip()
        if not REVISION.fullmatch(value):raise Rejected('git', 'Invalid pushed revision')
        return value

    def _scope(self, path):
        return path in self.policy['files'] or any(path.startswith(prefix + '/') for prefix in self.policy['prefixes'])

    def _allowed(self, path):
        relative_path(path)
        if (not self._scope(path) or path in self.policy['protected'] or path == RECEIPT
                or Path(path).suffix.lower() not in self.policy['extensions']):
            raise Rejected('permission', 'Committed client path is not approved: ' + path[:200])

    def _tree(self, revision):
        raw = self._git('ls-tree', '-r', '-z', '--full-tree', revision, '--', 'client', limit=1048576)
        result = {}
        for record in raw.split(b'\0'):
            if not record:continue
            fields, filename = record.split(b'\t', 1)
            mode, kind, sha = fields.decode('ascii').split()
            path = filename.decode('utf8')
            if path.startswith('client/'):
                result[path[7:]] = (mode, kind, sha)
        return result

    def publish_once(self):
        meta, receipt_hash = self._receipt()
        self._origin(meta['repository'])
        tip = self._tip(meta['branch'])
        if tip == meta['commit']:
            self.last_tip = tip;self.last_error = None
            print('[' + self.name + ' client] Already deployed ' + tip[:12] + '; watching pushed ' + meta['branch'])
            return {'commit': tip, 'changed': 0}
        try:
            self._git('merge-base', '--is-ancestor', meta['commit'], tip)
        except Rejected as error:
            raise Rejected('conflict', 'Pushed branch does not extend the deployed revision, or local history is incomplete. Fetch history and compare; no forced deployment was attempted.') from error
        old, new = self._tree(meta['commit']), self._tree(tip)
        paths = sorted(path for path in set(old) | set(new) if old.get(path) != new.get(path) and self._scope(path))
        if len(paths) > MAX_RELEASE_FILES:
            raise Rejected('too_large', 'Too many changed client files for one deployment')
        payloads = {};total = 0
        for path in paths:
            self._allowed(path)
            if path not in new:
                raise Rejected('permission', 'Client deletions/renames require reviewed deployment: ' + path[:200])
            mode, kind, sha = new[path]
            if mode not in {'100644', '100755'} or kind != 'blob':
                raise Rejected('invalid_file', 'Client symlinks and submodules cannot deploy')
            data = self._git('cat-file', 'blob', sha, limit=MAX_FILE)
            total += len(data)
            if len(data) > MAX_FILE or total > MAX_RELEASE_BYTES:
                raise Rejected('too_large', 'Client deployment exceeds its file/aggregate bound')
            payloads[path] = data
        # Preserve server-maintained index details when Git did not edit it.
        index_old = self._public('index.html', MAX_METADATA)
        index_hash = self.transport.hashes(self.remote_package, ['index.html'])['index.html']
        if digest(index_old) != index_hash:
            raise Rejected('conflict', 'Client index changed during reading; retry')
        index_new = cache_bust(payloads.get('index.html', index_old), set(payloads), tip)
        if index_new != index_old or 'index.html' in payloads:payloads['index.html'] = index_new
        if len(payloads) > MAX_RELEASE_FILES or sum(map(len, payloads.values())) > MAX_RELEASE_BYTES:
            raise Rejected('too_large', 'Client deployment exceeds its aggregate bound')
        current = {}
        names = sorted(payloads)
        for offset in range(0, len(names), MAX_PATHS):
            current.update(self.transport.hashes(self.remote_package, names[offset:offset + MAX_PATHS]))
        for path, data in payloads.items():
            expected = index_hash if path == 'index.html' and path not in paths else meta['files'].get(path)
            if current[path] not in (expected, digest(data)):
                raise Rejected('conflict', 'Server client file changed outside this deployment: ' + path[:200])
        files = dict(meta['files']);files.update({p: digest(data) for p, data in payloads.items()})
        receipt = {**meta, 'commit': tip, 'published_at': dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z'), 'files': files}
        raw_receipt = json.dumps(receipt, sort_keys=True, separators=(',', ':')).encode()
        if len(raw_receipt) > MAX_METADATA or len(files) > 2000:
            raise Rejected('too_large', 'Client deployment receipt exceeds its bound')
        for path in sorted(payloads, key=lambda p: (p == 'index.html', p)):
            data = payloads[path];sha = digest(data)
            if current[path] == sha:continue
            result = self.transport.request({'op': 'put', 'package': self.remote_package, 'path': path,
                'previous': current[path], 'size': len(data), 'sha256': sha}, data)
            if result.get('sha256') != sha:raise Rejected('connection', 'Receiver did not confirm client bytes')
        result = self.transport.request({'op': 'put', 'package': self.remote_package, 'path': RECEIPT,
            'previous': receipt_hash, 'size': len(raw_receipt), 'sha256': digest(raw_receipt)}, raw_receipt)
        if result.get('sha256') != digest(raw_receipt):raise Rejected('connection', 'Receiver did not confirm deployment receipt')
        self.metadata = receipt;self.last_tip = tip;self.last_error = None
        print('[' + self.name + ' client] Deployed pushed commit ' + tip[:12] + ' (' + str(len(paths)) + ' changed client files). Reload the page to load the new version.')
        return {'commit': tip, 'changed': len(paths)}

    def check(self):
        if time.monotonic() < self.next_check:return
        self.next_check = time.monotonic() + 5
        try:
            if self.metadata is None or self._tip(self.metadata['branch']) != self.last_tip:
                self.publish_once()
        except (Rejected, OSError, ValueError) as error:
            code = getattr(error, 'code', 'client_io')
            text = ' '.join(str(error).split())[:500]
            if self.last_error != (code, text):
                print('[' + self.name + ' client] Not deployed: ' + code + ': ' + text + '\n  Committed changes are retained; retrying in 15 seconds. Other source watchers continue.')
                self.last_error = code, text
            self.next_check = time.monotonic() + 15
