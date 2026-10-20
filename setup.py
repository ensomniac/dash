"""Install the developer CLI without browser sessions, passwords, or sudo.

Run on your development computer: python3 setup.py
Configure ~/.config/dashsync/config.json using tools/dashsync_deploy/README.md.
"""

import os
import shlex
import site
import sys
from pathlib import Path


def main():
    if os.geteuid() == 0 or Path("/var/www/vhosts/oapi.co/logs").exists():
        raise SystemExit("Run this installer as your normal user on a development computer")
    if sys.version_info < (3, 9):
        raise SystemExit("DashSync SSH requires Python 3.9 or newer")
    root = Path(__file__).resolve().parent
    module = root / "pydash"
    if not (module / "Dash" / "__init__.py").is_file() or "\n" in str(module):
        raise SystemExit("Run setup.py from the reviewed Dash repository")
    if sys.prefix != sys.base_prefix:
        install = Path(site.getsitepackages()[0])
        bindir = Path(sys.prefix) / "bin"
    else:
        install = Path(site.getusersitepackages())
        bindir = Path.home() / ".local" / "bin"
    install.mkdir(parents=True, exist_ok=True)
    bindir.mkdir(parents=True, exist_ok=True)
    (install / "dash-pydash.pth").write_text(str(module) + "\n")
    cli = bindir / "dashsync"
    if cli.is_symlink():
        raise SystemExit("Remove the old dashsync symlink before installing the CLI")
    cli.write_text("#!/bin/sh\nexec " + shlex.quote(sys.executable) + " -c 'from Dash.DashSync import DashSync; DashSync()' \"$@\"\n")
    cli.chmod(0o700)
    print(f"Installed {cli}. Add {bindir} to PATH if needed.")
    print("Configure your local repository roots, an approved SSH key, and a verified known_hosts file.")
    print("Then run dashsync --check-config. No dash.guide login is required.")


if __name__ == "__main__":
    main()
