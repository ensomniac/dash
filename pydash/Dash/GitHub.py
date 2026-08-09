#!/usr/bin/python
#
# Ensomniac 2026 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| When setting up a new repo, you likely have to run this on the server:
| https://stackoverflow.com/questions/1580596/how-do-i-make-git-ignore-file-mode-chmod-changes
|
| git config core.fileMode false
|
| or set it globally:
| git config --global core.fileMode false
"""

import contextlib
import fcntl
import hashlib
import json
import os
import pwd
import re
import shlex
import shutil
import stat
import subprocess
import sys
import time


_DEPLOY_HASH = re.compile(r"^[0-9a-f]{40}$")
_DEPLOY_BRANCH = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")
_DEPLOY_RESULT_MAX_BYTES = 4096


class _GitDeploymentError(Exception):
    def __init__(self, stage, error_type):
        self.stage = stage
        self.error_type = error_type
        super().__init__(stage)


def _safe_deployment_error_type(error):
    error_type = type(error).__name__
    if (
           type(error_type) is not str
        or not error_type
        or len(error_type) > 80
        or any(not (character.isalnum() or character == "_") for character in error_type)
    ):
        return "Exception"
    return error_type


def _validate_deployment_repository(repository):
    if (
           type(repository) is not str
        or not repository
        or len(repository) > 4096
        or not os.path.isabs(repository)
        or any(ord(character) < 32 for character in repository)
    ):
        raise _GitDeploymentError("validate", "InvalidRepository")

    normalized = os.path.normpath(repository)
    canonical = os.path.realpath(normalized)
    broad_targets = {
        "/",
        os.path.realpath(os.path.expanduser("~")),
        "/var",
        "/var/www",
        "/var/www/vhosts",
    }
    if (
           canonical != normalized
        or canonical in broad_targets
        or os.path.islink(normalized)
        or not os.path.isdir(canonical)
    ):
        raise _GitDeploymentError("validate", "InvalidRepository")

    git_directory = os.path.join(canonical, ".git")
    if os.path.islink(git_directory) or not os.path.isdir(git_directory):
        raise _GitDeploymentError("validate", "InvalidRepository")

    return canonical


def _deployment_git_prefix(git_user):
    if (
           type(git_user) is not str
        or not git_user
        or len(git_user) > 128
        or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", git_user)
    ):
        raise _GitDeploymentError("validate", "InvalidGitUser")

    try:
        target_user = pwd.getpwnam(git_user)
    except KeyError:
        raise _GitDeploymentError("validate", "InvalidGitUser") from None

    git_binary = shutil.which("git")
    if not git_binary:
        raise _GitDeploymentError("validate", "GitUnavailable")

    if os.geteuid() == target_user.pw_uid:
        return [git_binary]

    if os.geteuid() != 0:
        raise _GitDeploymentError("validate", "InvalidGitUser")

    sudo_binary = shutil.which("sudo")
    if not sudo_binary:
        raise _GitDeploymentError("validate", "SudoUnavailable")

    return [sudo_binary, "-n", "-u", git_user, "--", git_binary]


def _build_deployment_git_runner(repository, git_user):
    prefix = _deployment_git_prefix(git_user)
    environment = os.environ.copy()
    environment["GIT_TERMINAL_PROMPT"] = "0"
    environment["LC_ALL"] = "C"

    def run_git(stage, arguments, timeout_seconds):
        command = [
            *prefix,
            "-c", "core.fileMode=false",
            "-C", repository,
            *arguments,
        ]
        try:
            completed = subprocess.run(
                command,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                env=environment,
                timeout=timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired:
            raise _GitDeploymentError(stage, "TimeoutExpired") from None
        except OSError as error:
            raise _GitDeploymentError(
                stage,
                _safe_deployment_error_type(error),
            ) from None

        if completed.returncode != 0:
            raise _GitDeploymentError(stage, "CalledProcessError")

        return completed.stdout.strip()

    return run_git


@contextlib.contextmanager
def _deployment_lock(repository, lock_root, wait_seconds):
    if (
           type(lock_root) is not str
        or not os.path.isabs(lock_root)
        or os.path.realpath(lock_root) != os.path.normpath(lock_root)
        or os.path.islink(lock_root)
        or not os.path.isdir(lock_root)
    ):
        raise _GitDeploymentError("lock", "InvalidLockRoot")

    if (
           isinstance(wait_seconds, bool)
        or not isinstance(wait_seconds, (int, float))
        or wait_seconds < 0
        or wait_seconds > 30
    ):
        raise _GitDeploymentError("lock", "InvalidLockTimeout")

    lock_name = "dash-git-deploy-" + hashlib.sha256(
        repository.encode("utf-8")
    ).hexdigest()[:24] + ".lock"
    directory_flags = os.O_RDONLY
    if hasattr(os, "O_DIRECTORY"):
        directory_flags |= os.O_DIRECTORY
    if hasattr(os, "O_CLOEXEC"):
        directory_flags |= os.O_CLOEXEC
    directory_descriptor = os.open(lock_root, directory_flags)

    lock_flags = os.O_CREAT | os.O_RDWR
    if hasattr(os, "O_CLOEXEC"):
        lock_flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        lock_flags |= os.O_NOFOLLOW
    try:
        lock_descriptor = os.open(
            lock_name,
            lock_flags,
            0o600,
            dir_fd=directory_descriptor,
        )
    except Exception:
        os.close(directory_descriptor)
        raise

    try:
        lock_stat = os.fstat(lock_descriptor)
        if not stat.S_ISREG(lock_stat.st_mode) or lock_stat.st_nlink != 1:
            raise _GitDeploymentError("lock", "InvalidLockFile")

        deadline = time.monotonic() + float(wait_seconds)
        while True:
            try:
                fcntl.flock(lock_descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise _GitDeploymentError("lock", "LockTimeout") from None
                time.sleep(0.05)

        yield
    finally:
        try:
            fcntl.flock(lock_descriptor, fcntl.LOCK_UN)
        finally:
            os.close(lock_descriptor)
            os.close(directory_descriptor)


def DeployGitRepository(
    repository,
    lock_root="/run/lock",
    git_user="ensomniac",
    lock_wait_seconds=10,
    git_runner=None,
):
    """Deploy one fast-forward Git revision with bounded, sanitized output."""

    started = time.monotonic()
    current_stage = "validate"
    try:
        repository = _validate_deployment_repository(repository)
        run_git = git_runner or _build_deployment_git_runner(repository, git_user)

        current_stage = "lock"
        lock_started = time.monotonic()
        with _deployment_lock(repository, lock_root, lock_wait_seconds):
            lock_wait_ms = int((time.monotonic() - lock_started) * 1000)
            command_deadline = time.monotonic() + 45

            def invoke(stage, arguments, maximum_seconds=20):
                remaining = command_deadline - time.monotonic()
                if remaining <= 0:
                    raise _GitDeploymentError(stage, "TimeoutExpired")
                return run_git(stage, arguments, min(maximum_seconds, remaining))

            current_stage = "inspect"
            top_level = os.path.realpath(invoke(
                "inspect",
                ["rev-parse", "--show-toplevel"],
                10,
            ))
            if top_level != repository:
                raise _GitDeploymentError("inspect", "InvalidRepository")

            branch = invoke(
                "inspect",
                ["symbolic-ref", "--quiet", "--short", "HEAD"],
                10,
            )
            if (
                   not _DEPLOY_BRANCH.fullmatch(branch)
                or ".." in branch
                or "//" in branch
                or branch.endswith("/")
            ):
                raise _GitDeploymentError("inspect", "InvalidBranch")

            before_revision = invoke("inspect", ["rev-parse", "HEAD"], 10)
            if not _DEPLOY_HASH.fullmatch(before_revision):
                raise _GitDeploymentError("inspect", "InvalidRevision")

            current_stage = "fetch"
            invoke("fetch", ["fetch", "--prune", "origin", branch], 25)
            target_revision = invoke("fetch", ["rev-parse", "FETCH_HEAD"], 10)
            if not _DEPLOY_HASH.fullmatch(target_revision):
                raise _GitDeploymentError("fetch", "InvalidRevision")

            current_stage = "fast_forward"
            invoke(
                "fast_forward",
                ["merge-base", "--is-ancestor", before_revision, target_revision],
                10,
            )

            current_stage = "reset"
            invoke("reset", ["reset", "--hard", target_revision], 15)

            current_stage = "clean"
            invoke("clean", ["clean", "-fd"], 15)

            current_stage = "verify"
            deployed_revision = invoke("verify", ["rev-parse", "HEAD"], 10)
            worktree_status = invoke(
                "verify",
                ["status", "--porcelain=v1", "--untracked-files=all"],
                10,
            )
            if deployed_revision != target_revision:
                raise _GitDeploymentError("verify", "RevisionMismatch")
            if worktree_status:
                raise _GitDeploymentError("verify", "DirtyWorktree")

        return {
            "ok": True,
            "stage": "complete",
            "branch": branch,
            "before_revision": before_revision,
            "revision": target_revision,
            "changed": before_revision != target_revision,
            "lock_wait_ms": lock_wait_ms,
            "duration_ms": int((time.monotonic() - started) * 1000),
        }

    except _GitDeploymentError as error:
        return {
            "ok": False,
            "stage": error.stage,
            "error_type": error.error_type,
            "duration_ms": int((time.monotonic() - started) * 1000),
        }
    except Exception as error:
        return {
            "ok": False,
            "stage": current_stage,
            "error_type": _safe_deployment_error_type(error),
            "duration_ms": int((time.monotonic() - started) * 1000),
        }


def _deployment_result_from_queue(queue_result):
    invalid = {
        "ok": False,
        "stage": "result",
        "error_type": "InvalidResult",
    }
    if type(queue_result) is not dict:
        return invalid

    task_result = queue_result.get("result")
    if type(task_result) is not dict:
        return invalid
    command_results = task_result.get("cmd_result")
    if type(command_results) is not list or len(command_results) != 1:
        return invalid
    command_result = command_results[0]
    if type(command_result) is not dict:
        return invalid
    raw_result = command_result.get("result")
    if (
           type(raw_result) is not str
        or len(raw_result.encode("utf-8")) > _DEPLOY_RESULT_MAX_BYTES
    ):
        return invalid

    try:
        result = json.loads(raw_result)
    except (TypeError, ValueError, json.JSONDecodeError):
        return invalid
    if type(result) is not dict or type(result.get("ok")) is not bool:
        return invalid

    duration_ms = result.get("duration_ms")
    if type(duration_ms) is not int or duration_ms < 0 or duration_ms > 60000:
        return invalid

    if not result["ok"]:
        stage = result.get("stage")
        error_type = result.get("error_type")
        if (
               type(stage) is not str
            or not re.fullmatch(r"[a-z_]{1,40}", stage)
            or type(error_type) is not str
            or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]{0,79}", error_type)
        ):
            return invalid
        return {
            "ok": False,
            "stage": stage,
            "error_type": error_type,
            "duration_ms": duration_ms,
        }

    expected_types = {
        "stage": str,
        "branch": str,
        "before_revision": str,
        "revision": str,
        "changed": bool,
        "lock_wait_ms": int,
    }
    if any(type(result.get(key)) is not value_type for key, value_type in expected_types.items()):
        return invalid
    if (
           result["stage"] != "complete"
        or not _DEPLOY_BRANCH.fullmatch(result["branch"])
        or not _DEPLOY_HASH.fullmatch(result["before_revision"])
        or not _DEPLOY_HASH.fullmatch(result["revision"])
        or result["lock_wait_ms"] < 0
        or result["lock_wait_ms"] > 30000
    ):
        return invalid
    return {
        key: result[key]
        for key in (
            "ok",
            "stage",
            "branch",
            "before_revision",
            "revision",
            "changed",
            "lock_wait_ms",
            "duration_ms",
        )
    }


class PathSet:
    def __init__(self):
        self._all = []

    @property
    def All(self):
        return self._all

    def Add(self, name, local_git_root, local_git_path, dest_path):
        path_details = {
            "name": name,
            "local_git_root": local_git_root,
            "local_git_path": local_git_path,
            "dest_path": dest_path,
        }

        self._all.append(path_details)


class GitHub:
    def __init__(self):
        self.users = []

    def UpdateAndNotify(self, params, path_set, email_list):
        from json import loads

        return_data = {"payload": params.get("payload")}

        if not return_data["payload"]:
            return_data["error"] = "No GitHub Payload"

            return return_data

        return_data["payload"] = loads(return_data["payload"])
        return_data["repository"] = return_data["payload"]["repository"]["name"]
        return_data["sender_details"] = return_data["payload"]["sender"]
        return_data["sender"] = return_data["sender_details"]["login"]
        return_data["hook_type"] = "Unknown hook type"

        try:
            commits = return_data["payload"]["commits"]
        except:
            commits = []

        if not commits:
            return_data["msg"] = "Ignoring - no commits"

            return return_data

        from Dash import PersonalContexts
        from Dash.Utils import JSON2HTML, SendEmail

        subject = f"GitHub -> {return_data['repository']} -> {return_data['sender']}"
        msg = "<b>Git Webhook Response</b><br><br>"
        git_update_result = {}

        for path_details in path_set.All:
            git_update_result[path_details["name"]] = self.UpdateFromWebhook(
                local_git_root=path_details["local_git_root"],
                local_git_path=path_details["local_git_path"],
                dest_path=path_details["dest_path"],
            )

        return_data["server_git_update"] = git_update_result

        msg += "<b>Git Pull Result (via Dash):</b><br>"

        html = JSON2HTML(return_data["server_git_update"])

        msg += f"{html}<br><b>GitHub Commits:</b><br>"

        for commit_details in commits:
            msg += JSON2HTML(commit_details)

        msg += "<br><b>Full GitHub Payload:</b><br>"
        msg += f"{JSON2HTML(return_data['payload'])}<br>"

        for email in PersonalContexts:
            if return_data["repository"] in PersonalContexts[email]["repo_names"]:
                email_list = [email]

                break

        # TODO: this needs to use the outer scope's `send_email` func
        #  but we need to first introduce dash context at this level
        SendEmail(
            subject=subject,
            msg=msg,
            notify_email_list=email_list,
            strict_notify=True
        )

        del return_data["payload"]
        del return_data["sender_details"]

        return return_data

    def UpdateFromWebhook(self, local_git_root, local_git_path, dest_path):
        from . import RunAsRoot

        for path in [local_git_path, local_git_root, dest_path]:
            if not path.endswith("/"):
                path += "/"

        cmds = [
            f"cd {local_git_root}; git pull",
            f"cd {local_git_root}; git clean -f -d",
            f"cd {local_git_root}; git reset HEAD .",
            f"cd {local_git_root}; git checkout . -f",
            f"cd {local_git_root}; git clean -fd",
            f"cd {local_git_root}; git checkout . -f",
            f"cd {local_git_root}; git pull",
            f"cd {local_git_root}; git status"  # So we can see this in the output field of the email
        ]

        if local_git_root == dest_path:
            pass  # Just update git, nothing else
        else:
            cmds.append(f"rm -rf {dest_path}*")
            cmds.append(f"cp -r {local_git_path}* {dest_path}")

        cmds.append(f"chmod 755 {dest_path} -R")
        cmds.append(f"chown ensomniac {dest_path} -R")
        cmds.append(f"chgrp psacln {dest_path} -R")

        # TODO: Check to see if there is already a GitHub command running for this site!

        # return RunAsRoot.Queue(";".join(cmds))  # Chaining the commands led to silent failures when commands would abort before the other commands were called.
        return RunAsRoot.Queue(cmds)


class _Webhook:
    def __init__(self, dash_context_or_asset_path=None):
        if type(dash_context_or_asset_path) is str:
            from Dash.PackageContext import Get as GetDashContext

            self.DashContext = GetDashContext(dash_context_or_asset_path)

        elif type(dash_context_or_asset_path) is dict:
            self.DashContext = dash_context_or_asset_path

        else:
            raise ValueError(
                "Invalid asset_path or dash_context "
                f"({type(dash_context_or_asset_path)}): {dash_context_or_asset_path}"
            )

        if (
            not self.DashContext
            or not self.DashContext.get("asset_path")
            or not self.DashContext.get("srv_path_git_oapi")
        ):
            raise NotImplementedError(f"This Dash Context is not set up for GitHub/Webhook:\n{self.DashContext}")

    def ForAssetPath(self, payload={}):
        should_process, ignored_payload = self.should_process_payload(payload)

        if not should_process:
            return {
                "email_list": [],
                "git_result": {},
                **ignored_payload
            }

        email_list_csv = self.DashContext.get("email_git_webhook_csv")

        if not email_list_csv:
            from Dash import AdminEmails

            email_list_csv = AdminEmails[0]

        email_list = [email.strip() for email in email_list_csv.split(",")]
        git_result = self.git_pull_clean()

        if payload:
            self.email_git_payload_response(payload, email_list, git_result)

            # Silencing this now that FV has folded
            # if not git_result.get("error") and self.DashContext["asset_path"] == "candy":
            #     self.PostToSlack(payload)

        if (
            "/shop_io" in self.DashContext.get("git_repo", "")
            or "/shop_io" in self.DashContext.get("srv_path_git_oapi", "")
        ):
            self.update_shop_io_index()

        non_critical_command = {}

        if self.DashContext["asset_path"] == "analog":
            path = os.path.join(self.DashContext["srv_path_git_oapi"], "python", "MinFrontendVDB.py")

            non_critical_command["args"] = f"python {path}"

        elif self.DashContext["asset_path"] == "pydash":
            root = self.DashContext["srv_path_http_root"]

            if not root.endswith("/"):
                root += "/"  # Important for the command to work properly

            non_critical_command["command"] = f'rsync -azP --delete -e "ssh" --rsync-path="sudo rsync" {root} rmartin@72.167.225.180:{root}'

        if non_critical_command:
            from Dash.RunAsRoot import Queue

            cmd = non_critical_command["command"]
            result = Queue(cmd)

            if result.get("error"):
                if not non_critical_command.get("error"):
                    non_critical_command["error"] = (
                        "Failed to run non-critical command after processing "
                        f"GitHub webhook for {self.DashContext['asset_path']}"
                    )

                send_email(
                    dash_context=self.DashContext,
                    subject=f"Dash GitHub Webhook Non-Critical Error: {self.DashContext['asset_path']}",
                    msg=f"{non_critical_command['error']}\n\nCommand:\n{cmd}\n\nError:\n{result['error']}"
                )

            # Uncomment for debugging
            # else:
            #     from Dash.Utils import JSON2HTML
            #
            #     send_email(
            #         dash_context=self.DashContext,
            #         subject="Non-Critical Command Success DEBUG",
            #         msg=f"Command:\n{cmd}\n\nResult:\n{JSON2HTML(result)}"
            #     )

        return {
            "email_list": email_list,
            "git_result": git_result
        }

    def PostToSlack(self, payload={}):
        msg = self.get_commit_slack_highlight(payload)

        if not msg:
            return {}

        from Dash import AdminEmails

        token = ""
        users_root = os.path.join(self.DashContext["srv_path_local"], "users")

        for email in AdminEmails:
            email_root = os.path.join(users_root, email, "sessions")

            if not os.path.exists(email_root):
                continue

            tokens = os.listdir(email_root)

            if not tokens:
                continue

            # Sort by created time (oldest first, newest last)
            tokens.sort(key=lambda fn: os.path.getctime(os.path.join(email_root, fn)))

            token = tokens[-1]

            break

        data = {}
        url = f"https://{self.DashContext['domain']}/Slack"

        try:
            from requests import post

            data = {
                "f": "post_message",
                "message": msg,
                "token": token
            }

            r = post(url, data)

            try:
                r = r.json()
            except:
                raise Exception(r.text)

            if r.get("error"):
                raise Exception(r["error"])

            return r

        except Exception as e:
            from Dash.Utils import JSON2HTML

            send_email(
                dash_context=self.DashContext,
                subject=f"Dash GitHub Webhook Non-Critical Error: {self.DashContext['asset_path']}",
                msg=f"Failed to post to Slack.\n\nURL: {url}\n\nPayload:\n{JSON2HTML(data)}\n\nError:\n{e}"
            )

            return {}

    def should_process_payload(self, payload):
        if not payload:
            return True, {}

        ref = payload.get("ref", "")
        repository = payload.get("repository", {})
        default_branch = repository.get("default_branch", "")

        ignored_payload = {
            "ignored": True,
            "ref": ref,
            "default_branch": default_branch
        }

        if not ref:
            ignored_payload["reason"] = "Ignoring webhook payload without a Git ref"

            return False, ignored_payload

        branch_ref_prefix = "refs/heads/"

        if not ref.startswith(branch_ref_prefix):
            ignored_payload["reason"] = f"Ignoring non-branch ref: {ref}"

            return False, ignored_payload

        ignored_payload["branch"] = ref.replace(branch_ref_prefix, "", 1)

        if not default_branch:
            ignored_payload["reason"] = "Ignoring branch webhook payload without a repository default branch"

            return False, ignored_payload

        if ignored_payload["branch"] != default_branch:
            ignored_payload["reason"] = f"Ignoring non-default branch: {ignored_payload['branch']}"

            return False, ignored_payload

        return True, {}

    def git_pull_clean(self):
        from Dash.RunAsRoot import Queue

        command = shlex.join([
            sys.executable,
            "-m",
            "Dash.GitHub",
            "deploy-repository",
            "--repo",
            self.DashContext["srv_path_git_oapi"],
        ])
        queue_result = Queue(command)
        response = dict(queue_result) if type(queue_result) is dict else {}
        deployment_result = _deployment_result_from_queue(queue_result)
        response["deployment"] = deployment_result

        if not deployment_result["ok"]:
            response["error"] = (
                response.get("error")
                or "Git deployment failed at " + deployment_result["stage"]
            )

        return response

    def email_git_payload_response(self, payload, email_list, git_result):
        if not payload.get("commits"):
            return

        from Dash.Utils import JSON2HTML

        subject = " -> ".join([
            "GitHub",
            self.get_repo_name(payload),
            payload["sender"]["login"]
        ])

        if git_result.get("error"):
            subject = f"[ERROR] {subject}"

        send_email(
            dash_context=self.DashContext,
            subject=subject,
            msg=(
                "\n".join([
                    "<b>GIT WEBHOOK RESPONSE</b>",
                    "<hr>",
                    self.get_commit_email_highlight(payload),
                    "<hr><br><br>",
                    "<b>Dash Command Stack Result:</b><br>",
                    JSON2HTML(git_result),
                    "<br><br><b>Full GitHub Payload:</b><br>",
                    JSON2HTML(payload)
                ])
            ),
            notify_email_list=email_list,
            strict_notify=True
        )

    def get_repo_name(self, github_payload):
        repo_name = github_payload["repository"]["name"]

        if github_payload["repository"]["name"] == "shop_io":
            repo_name += f" ({self.DashContext['asset_path']})"

        return repo_name

    def get_commit_email_highlight(self, github_payload):
        commit_lines = []

        # Ex: [
        #     {
        #         'id': '442dbbcd446fecb596c62d146f25f3b3f9b13b99',  # noqa
        #         'tree_id': 'ce5a8439d7cdd66fea158cd844497bf86469eac5',
        #         'distinct': True,
        #         'message': 'Webhook testing',
        #         'timestamp': '2023-02-22T10:18:15-05:00',
        #         'url': 'https://github.com/ensomniac/smartsioux/commit/442dbbcd446fecb596c62d146f25f3b3f9b13b99',
        #         'author': {
        #             'name': 'Ryan Martin',
        #             'email': 'ryan@ensomniac.com',
        #             'username': 'ensomniac'
        #         },
        #         'committer': {
        #             'name': 'Ryan Martin',
        #             'email': 'ryan@ensomniac.com',
        #             'username': 'ensomniac'
        #         },
        #         'added': [],
        #         'removed': [],
        #         'modified': ['README.md']
        #     }
        # ]
        commits = github_payload.get("commits", [])

        if len(commits) == 1:
            commit_lines.append("<b>GitHub Commit:</b>")
        else:
            commit_lines.append(f"<b>{len(commits)} GitHub Commits:</b>")

        for commit in commits:
            author = commit.get("committer") or commit["author"]

            commit_lines.append(
                f"&emsp;>> <b><i>'{commit['message']}'</i></b> - {author['name']} ({author['email']})"
            )

            if commit.get("modified"):
                commit_lines = self.add_commit_files(commit_lines, "Modified", commit["modified"])

            if commit.get("added"):
                commit_lines = self.add_commit_files(commit_lines, "Added", commit["added"])

            if commit.get("removed"):
                commit_lines = self.add_commit_files(commit_lines, "Removed", commit["removed"])

        return f"<span style='font-size:130%;'>{'<br>'.join(commit_lines)}<br></span>"

    def get_commit_slack_highlight(self, github_payload):
        commits = []
        authors = {}
        skip = ["dash update"]
        bots = ["arthurslugworth", "web-flow"]

        for commit in github_payload.get("commits", []):
            msg = commit.get("message", "")

            if msg in skip or msg.lower().strip() in skip:
                continue

            author = commit.get("committer") or commit["author"]
            username = author["username"]

            if username in bots:
                continue

            if username not in authors:
                authors[username] = author

            commits.append(commit)

        if not commits:
            return ""

        commit_lines = []
        author_keys = list(authors.keys())
        single_author = authors[author_keys[0]] if len(author_keys) == 1 else None
        repo_name = self.get_repo_name(github_payload)
        header_text = ">*"

        header_text += ("New git commit to" if len(commits) == 1 else f"{len(commits)} new git commits to")
        header_text += f" `{repo_name}`*"

        if single_author:
            header_text += f" _by {single_author['name']} (`{single_author['username']}`)_"

        header_text += " :github-logo:"

        commit_lines.append(header_text)

        for commit in commits:
            msg = commit["message"]

            if not msg[0].isupper():
                msg = f"{msg[0].upper()}{msg[1:]}"

            commit_lines.append(f"  ● _{msg}_")

            if not single_author:
                author = commit.get("committer") or commit["author"]

                commit_lines.append(
                    f"         ○ Author: {author['name']} (`{author['username']}`)"
                )

            tally_text = []

            if commit.get("modified"):
                tally_text.append(f"{len(commit['modified'])} modified")

            if commit.get("added"):
                tally_text.append(f"{len(commit['added'])} added")

            if commit.get("removed"):
                tally_text.append(f"{len(commit['removed'])} removed")

            if tally_text:
                commit_lines.append(
                    f"         ○ Files: {', '.join(tally_text)}"
                )

        return "\n".join(commit_lines)

    def add_commit_files(self, lines, label, file_list):
        for filename in file_list:
            lines.append(f"&emsp;&emsp;&emsp; | <b>{label}: </b>{filename}")

        return lines

    def update_shop_io_index(self):
        index_path = os.path.join(self.DashContext["srv_path_git_oapi"], "client", "index.html")

        with open(index_path) as file:
            content = file.read()

        content = content.replace("Shop IO", self.DashContext["display_name"])

        if os.path.exists(os.path.join(self.DashContext["srv_path_local"], "images", "apple-touch-icon.png")):
            content = content.replace(
                "analog.technology/local/images/shop-",
                f"{self.DashContext['domain']}/local/images/"
            )

        updated_content = []
        inside_context = False
        injected_key_added = False
        third_quotation_index = None

        for line in content.split("\n"):
            if "DASH_CONTEXT" in line:
                inside_context = True

            elif inside_context and "modified" not in line:
                if ":" in line and '"' in line:
                    key = line.split(":")[0].strip().replace('"', "")

                    if key in self.DashContext:
                        if third_quotation_index is None:
                            quotations = [i for i, c in enumerate(line) if c == '"']
                            third_quotation_index = quotations[3 - 1] if len(quotations) >= 3 else -1

                        if not injected_key_added:
                            injected_key_added = True

                            updated_content.append(
                                f'{" " * 16}"injected":{" " * (third_quotation_index - 27)}true,'
                            )

                        line = f'{line[:third_quotation_index]}"{self.DashContext[key]}",'

                if "};" in line:
                    if updated_content[-1].endswith(","):
                        updated_content[-1] = updated_content[-1][:-1]  # Remove comma

                    inside_context = False

            updated_content.append(line)

        with open(index_path, "w") as file:
            file.write("\n".join(updated_content))


def UpdateFromWebhook(local_git_root, local_git_path, dest_path):
    try:
        result = GitHub().UpdateFromWebhook(
            local_git_root=local_git_root,
            local_git_path=local_git_path,
            dest_path=dest_path,
        )
    except:
        from traceback import format_exc

        result = {"error": f"ERROR: {format_exc()}"}

    return result


def UpdateAndNotify(params, path_set, email_list):
    try:
        result = GitHub().UpdateAndNotify(
            params=params,
            path_set=path_set,
            email_list=email_list,
        )
    except:
        from traceback import format_exc

        result = {"error": f"ERROR: {format_exc()}"}

    return result


def WebhookForAssetPath(dash_context_or_asset_path, payload={}):
    return _Webhook(dash_context_or_asset_path).ForAssetPath(payload)


def PostToSlack(dash_context_or_asset_path, payload={}):
    return _Webhook(dash_context_or_asset_path).PostToSlack(payload)


# Wrapper for the classes in this script, not intended to be used outside of this script
def send_email(dash_context, subject, msg, notify_email_list=[], strict_notify=False):
    from Dash.Utils import SendEmail

    try:
        SendEmail(
            subject=subject,
            notify_email_list=notify_email_list,
            msg=msg,
            strict_notify=strict_notify
        )

    except:
        if not dash_context.get("admin_from_email"):
            raise

        SendEmail(
            subject=subject,
            notify_email_list=notify_email_list,
            msg=msg,
            strict_notify=strict_notify,
            sender_email=dash_context["admin_from_email"]
        )


def _deployment_cli(argv=None):
    import argparse

    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    deploy_parser = subparsers.add_parser("deploy-repository")
    deploy_parser.add_argument("--repo", required=True)
    args = parser.parse_args(argv)

    if args.command == "deploy-repository":
        result = DeployGitRepository(args.repo)
    else:
        result = {
            "ok": False,
            "stage": "arguments",
            "error_type": "InvalidCommand",
            "duration_ms": 0,
        }

    output = json.dumps(result, separators=(",", ":"), sort_keys=True)
    if len(output.encode("utf-8")) > _DEPLOY_RESULT_MAX_BYTES:
        output = json.dumps({
            "ok": False,
            "stage": "result",
            "error_type": "ResultTooLarge",
            "duration_ms": 0,
        }, separators=(",", ":"), sort_keys=True)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(_deployment_cli())
