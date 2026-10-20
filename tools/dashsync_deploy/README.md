# DashSync over SSH

DashSync watches approved local source files and uploads saved changes through restricted SSH. Git commits and pushes remain local developer actions. Legacy HTTP deployment and server-triggered local Git execution are retired.

## Developer setup

The server administrator must enable the SSH receiver and grant your package access before uploads can work. Installing this client does not activate a server.

1. Update your local Dash checkout and install the CLI as your normal user:

   ```sh
   git pull --ff-only origin 1.0.0
   python3 setup.py
   ```

2. Put the configuration supplied by your administrator at `~/.config/dashsync/config.json`. It identifies your existing SSH key, verified server host key, and local project folders. A template is available in `client.example.json`. Review all paths before using it. Use mode 0700 for the configuration directory and 0600 for the configuration, private key, and dedicated known_hosts file. Only include watch directories that exist on your computer.
3. Validate and run:

   ```sh
   dashsync --check-config
   dashsync
   ```

Use Python 3.9 or newer. The installer uses your active virtual environment, or your user Python packages and `~/.local/bin`. Make sure the installed CLI directory is on PATH; the installer prints its location. No dashboard login is required.

Existing keys can be reused when their private halves stayed on trusted computers. Keys exposed on a compromised host must be replaced. Separate deployment keys make revocation independent of administrative access. Private keys stay on developer computers; SSH agent forwarding is disabled. Pin the server host key after independent verification—`ssh-keyscan` alone does not verify server identity.

Saving an approved file uploads an addition/update. Existing local/server differences are not sent at startup. Deletions/renames require a deliberate deployment. Connection failures retain pending changes for retry. A remote hash conflict pauses that file: compare and reconcile its contents through an approved read-only method, restart the watcher, and save the reconciled file. Local files retain unsynced work when the watcher stops.

Local Dash client compilation/distribution is retained. Compiler context comes from your local configuration; SSH transport objects and deployment policies are not placed in browser JavaScript. Add generated client directories to watch roots only after the corresponding publication rules are reviewed.

## Administrator setup

Stage the reviewed server files as root:

```sh
python3 -I -S tools/dashsync_deploy/stage_server.py
```

This installs protected runtime copies in `/usr/local/libexec/dashsync` and creates `/etc/dashsync/policy.json` only if absent. It creates no accounts, installs no active units or SSH rules, and enables no packages. The example policy is deliberately disabled. Real package inventory, identity allowlists, credentials, and incident records belong outside this repository.

Before activation:

- Privileged helpers use `-I -S`: isolated Python with automatic site initialization disabled. Their standard-library-only runtime must never load application-controlled `.pth` files or `sitecustomize`.
- Record completed host hardening in protected gate-evidence files: independent monitoring, credential exposure review/revocation, removal of arbitrary root queues and retired deployment trust, supported OS updates, removal of root-run application dependencies, and independent source review. Gate paths are operator attestations, not automatic proof that the work happened. Do not clear gates to suppress a client error.
- For each package, review its root, device/inode pin, approved prefixes/extensions, and protected files. Source directories and files must be root-owned and protected against application writes. Retain appropriate application-readable modes and immutable flags. Do not recursively change an entire subscription or bulk-unfreeze code. Writable ancestors outside the package root are tolerated only because the root is pinned by inode and every component is opened without following symlinks; directories inside that root must be protected.
- Provision dedicated `dashsync_` system accounts in group `dashsync`, with `/bin/sh` and root-owned, non-writable empty homes. Use no sudo or application groups. A nologin shell prevents the forced command from working. Record actual account UIDs and grant packages independently to each developer.
- Install chosen public keys in protected root-owned `/etc/dashsync/authorized_keys/<account>` files, with `restrict,from="<approved CIDRs>"` options. Preserve management firewall restrictions. Review and install `sshd.conf.example` with its final `Match all`; use `sshd -t` and effective per-account configuration checks before reloading. Verify ForceCommand, no forwarding/PTY/user startup files, global `PermitUserEnvironment no`, and the root-owned key location. Retain independent administrative and console access.
- Run `python3 -I -S /usr/local/libexec/dashsync/admin.py`. After its prerequisites pass, install the reviewed socket/service templates in `/etc/systemd/system`, validate them with `systemd-analyze verify`, and enable the socket. Test both developers against a non-public scratch target before enabling production packages individually. External hosts need their own reviewed receiver and policy.

The unprivileged SSH forced command accepts one fixed protocol and forwards it to a local Unix socket. The root publisher derives identity from kernel SO_PEERCRED, reloads protected policy after upload, checks package/path/hash permissions again, and manages exact source files and immutable flags. It does not import applications, run Git/shell commands, evaluate content, or accept caller-selected destination roots.

## Limits and recovery

- One JSON header up to 48 KiB, one uncompressed file up to 10 MiB, SHA-256 integrity, and compare-with-previous-hash publication. Hash requests contain up to 32 paths; responses are capped at 64 KiB. Transfers have a 60-second deadline; receiver/publisher lifetimes and socket I/O are bounded. Systemd limits memory/concurrency and publication is serialized.
- Uploads stage in root-private `/var/lib/dashsync/staging`. The publisher creates a private temporary file next to the destination, then atomically replaces one file. Root ownership protects source during exact parent-directory/file thawing; immutable protection is restored before success. New nested source directories are readable and root-owned.
- Publication is atomic per file. Changes needing multiple files to activate together require a deliberate maintenance deployment.
- Three prior versions per destination are kept under `/var/lib/dashsync/history/<package>/<SHA256(relative-path)>/`, with a 256 MiB aggregate ceiling. Full history stops publication pending reviewed pruning. This is bounded operational recovery, not a full backup or incident archive.
- Export `dashsync_publish` and `dashsync_critical` journal events independently. They contain actor, package, relative path, hashes, outcome, and timing; no content or credentials. Treat interrupted publishers and protection-restoration failures as immediate integrity checks. Never report a failed protection step as a successful deployment.
- Remove a policy UID/grant to block subsequent publication checks, and remove its public key to prevent new SSH authentications. An operation already publishing may finish within its bounded lifetime. Disable a package or stop its socket to suspend deployment. Restore selected reviewed files and their protections administratively; never restore unsafe HTTP deployment, exposed credentials, arbitrary root queues, or authentication bypasses.

## Tests

```sh
python3 -m unittest discover -s tools/dashsync_deploy/tests -v
```

The tests use isolated fixtures. Privileged publisher tests require root on isolated Linux; never run them against production package roots. Optional Dash Guide integration tests require its separate checkout. A real developer-machine SSH test is still required during activation.
