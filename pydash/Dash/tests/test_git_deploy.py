import contextlib
import importlib
import io
import json
import os
import pwd
import shlex
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock


GitHubModule = importlib.import_module("Dash.GitHub")


class GitDeploymentTest(unittest.TestCase):
    def git(self, repository, *arguments):
        completed = subprocess.run(
            ["git", "-C", str(repository), *arguments],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        return completed.stdout.strip()

    def repositories(self, root):
        origin = root / "origin.git"
        publisher = root / "publisher"
        deployed = root / "deployed"
        subprocess.run(
            ["git", "init", "--bare", "--initial-branch=main", str(origin)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        subprocess.run(
            ["git", "clone", str(origin), str(publisher)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        self.git(publisher, "config", "user.name", "Deployment Test")
        self.git(publisher, "config", "user.email", "deployment-test@example.invalid")
        self.git(publisher, "checkout", "-b", "main")
        (publisher / ".gitignore").write_text("ignored.txt\n", encoding="utf-8")
        (publisher / "tracked.txt").write_text("one\n", encoding="utf-8")
        self.git(publisher, "add", ".gitignore", "tracked.txt")
        self.git(publisher, "commit", "-m", "Initial")
        self.git(publisher, "push", "-u", "origin", "main")
        subprocess.run(
            ["git", "clone", "--branch", "main", str(origin), str(deployed)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        self.git(deployed, "config", "user.name", "Deployment Test")
        self.git(deployed, "config", "user.email", "deployment-test@example.invalid")
        return origin, publisher, deployed

    @staticmethod
    def current_user():
        return pwd.getpwuid(os.geteuid()).pw_name

    def test_fast_forward_cleans_debris_and_preserves_ignored_files(self):
        with tempfile.TemporaryDirectory() as temporary_root:
            root = Path(temporary_root).resolve()
            _, publisher, deployed = self.repositories(root)
            locks = root / "locks"
            locks.mkdir()

            (deployed / "tracked.txt").write_text("dirty\n", encoding="utf-8")
            (deployed / "untracked.txt").write_text("remove\n", encoding="utf-8")
            (deployed / "ignored.txt").write_text("preserve\n", encoding="utf-8")

            (publisher / "tracked.txt").write_text("two\n", encoding="utf-8")
            self.git(publisher, "commit", "-am", "Update")
            self.git(publisher, "push")
            expected_revision = self.git(publisher, "rev-parse", "HEAD")

            result = GitHubModule.DeployGitRepository(
                str(deployed),
                lock_root=str(locks),
                git_user=self.current_user(),
            )

            self.assertTrue(result["ok"], result)
            self.assertTrue(result["changed"])
            self.assertEqual(result["revision"], expected_revision)
            self.assertEqual(self.git(deployed, "rev-parse", "HEAD"), expected_revision)
            self.assertEqual((deployed / "tracked.txt").read_text(), "two\n")
            self.assertFalse((deployed / "untracked.txt").exists())
            self.assertEqual((deployed / "ignored.txt").read_text(), "preserve\n")
            self.assertEqual(self.git(deployed, "status", "--porcelain"), "")

    def test_command_order_has_one_reset_and_one_clean(self):
        with tempfile.TemporaryDirectory() as temporary_root:
            root = Path(temporary_root).resolve()
            repository = root / "repository"
            (repository / ".git").mkdir(parents=True)
            locks = root / "locks"
            locks.mkdir()
            before = "a" * 40
            target = "b" * 40
            calls = []
            rev_parse_head_calls = 0

            def runner(stage, arguments, timeout_seconds):
                nonlocal rev_parse_head_calls
                calls.append((stage, list(arguments), timeout_seconds))
                if arguments == ["rev-parse", "--show-toplevel"]:
                    return str(repository)
                if arguments == ["symbolic-ref", "--quiet", "--short", "HEAD"]:
                    return "main"
                if arguments == ["rev-parse", "HEAD"]:
                    rev_parse_head_calls += 1
                    return before if rev_parse_head_calls == 1 else target
                if arguments == ["rev-parse", "FETCH_HEAD"]:
                    return target
                return ""

            result = GitHubModule.DeployGitRepository(
                str(repository),
                lock_root=str(locks),
                git_user=self.current_user(),
                git_runner=runner,
            )

            self.assertTrue(result["ok"], result)
            commands = [arguments for _, arguments, _ in calls]
            self.assertEqual(sum(command[:1] == ["fetch"] for command in commands), 1)
            self.assertEqual(sum(command[:1] == ["reset"] for command in commands), 1)
            self.assertEqual(sum(command[:1] == ["clean"] for command in commands), 1)
            self.assertLess(
                next(index for index, command in enumerate(commands) if command[0] == "fetch"),
                next(index for index, command in enumerate(commands) if command[0] == "reset"),
            )
            self.assertEqual(
                next(command for command in commands if command[0] == "clean"),
                ["clean", "-fd"],
            )

    def test_relative_broad_and_symlinked_repositories_fail_before_git(self):
        with tempfile.TemporaryDirectory() as temporary_root:
            root = Path(temporary_root).resolve()
            repository = root / "repository"
            (repository / ".git").mkdir(parents=True)
            linked = root / "linked"
            linked.symlink_to(repository, target_is_directory=True)
            calls = []

            def runner(stage, arguments, timeout_seconds):
                calls.append((stage, arguments, timeout_seconds))
                return ""

            for value in ("relative", "/", str(linked)):
                with self.subTest(repository=value):
                    result = GitHubModule.DeployGitRepository(
                        value,
                        lock_root=str(root),
                        git_user=self.current_user(),
                        git_runner=runner,
                    )
                    self.assertFalse(result["ok"])
                    self.assertEqual(result["stage"], "validate")
            self.assertEqual(calls, [])

    def test_lock_contention_is_bounded_and_does_not_call_git(self):
        with tempfile.TemporaryDirectory() as temporary_root:
            root = Path(temporary_root).resolve()
            repository = root / "repository"
            (repository / ".git").mkdir(parents=True)
            calls = []

            def runner(stage, arguments, timeout_seconds):
                calls.append((stage, arguments, timeout_seconds))
                return ""

            with GitHubModule._deployment_lock(str(repository), str(root), 0):
                result = GitHubModule.DeployGitRepository(
                    str(repository),
                    lock_root=str(root),
                    git_user=self.current_user(),
                    lock_wait_seconds=0,
                    git_runner=runner,
                )

            self.assertFalse(result["ok"])
            self.assertEqual(result["stage"], "lock")
            self.assertEqual(result["error_type"], "LockTimeout")
            self.assertEqual(calls, [])

    def test_git_failure_stops_and_does_not_expose_exception_text(self):
        with tempfile.TemporaryDirectory() as temporary_root:
            root = Path(temporary_root).resolve()
            repository = root / "repository"
            (repository / ".git").mkdir(parents=True)
            calls = []

            def runner(stage, arguments, timeout_seconds):
                calls.append(list(arguments))
                if arguments == ["rev-parse", "--show-toplevel"]:
                    return str(repository)
                if arguments == ["symbolic-ref", "--quiet", "--short", "HEAD"]:
                    return "main"
                if arguments == ["rev-parse", "HEAD"]:
                    return "a" * 40
                if arguments[0] == "fetch":
                    raise RuntimeError("secret remote URL and credential")
                return ""

            result = GitHubModule.DeployGitRepository(
                str(repository),
                lock_root=str(root),
                git_user=self.current_user(),
                git_runner=runner,
            )

            self.assertFalse(result["ok"])
            self.assertEqual(result["stage"], "fetch")
            self.assertEqual(result["error_type"], "RuntimeError")
            self.assertFalse(any(command[0] in ("reset", "clean") for command in calls))
            self.assertNotIn("secret", json.dumps(result))
            self.assertLess(len(json.dumps(result).encode("utf-8")), 4096)

    def test_non_fast_forward_stops_before_worktree_mutation(self):
        with tempfile.TemporaryDirectory() as temporary_root:
            root = Path(temporary_root).resolve()
            repository = root / "repository"
            (repository / ".git").mkdir(parents=True)
            calls = []

            def runner(stage, arguments, timeout_seconds):
                calls.append(list(arguments))
                if arguments == ["rev-parse", "--show-toplevel"]:
                    return str(repository)
                if arguments == ["symbolic-ref", "--quiet", "--short", "HEAD"]:
                    return "main"
                if arguments == ["rev-parse", "HEAD"]:
                    return "a" * 40
                if arguments == ["rev-parse", "FETCH_HEAD"]:
                    return "b" * 40
                if arguments[0] == "merge-base":
                    raise GitHubModule._GitDeploymentError(
                        "fast_forward",
                        "CalledProcessError",
                    )
                return ""

            result = GitHubModule.DeployGitRepository(
                str(repository),
                lock_root=str(root),
                git_user=self.current_user(),
                git_runner=runner,
            )

            self.assertFalse(result["ok"])
            self.assertEqual(result["stage"], "fast_forward")
            self.assertEqual(result["error_type"], "CalledProcessError")
            self.assertFalse(any(command[0] in ("reset", "clean") for command in calls))

    def test_webhook_queues_one_helper_command_and_parses_success(self):
        success = {
            "ok": True,
            "stage": "complete",
            "branch": "main",
            "before_revision": "a" * 40,
            "revision": "b" * 40,
            "changed": True,
            "lock_wait_ms": 2,
            "duration_ms": 37,
        }
        queue_envelope = {
            "error": None,
            "result": {
                "cmd_result": [{"result": json.dumps(success)}],
            },
        }
        webhook = GitHubModule._Webhook({
            "asset_path": "fantom",
            "srv_path_git_oapi": "/var/www/vhosts/oapi.co/fantom/github",
        })

        with mock.patch("Dash.RunAsRoot.Queue", return_value=queue_envelope) as queue:
            response = webhook.git_pull_clean()

        self.assertTrue(response["deployment"]["ok"])
        self.assertIsNone(response["error"])
        queue.assert_called_once()
        command = queue.call_args.args[0]
        self.assertIs(type(command), str)
        command_parts = shlex.split(command)
        self.assertEqual(command_parts[1:5], [
            "-m",
            "Dash.GitHub",
            "deploy-repository",
            "--repo",
        ])
        self.assertEqual(command_parts[5], "/var/www/vhosts/oapi.co/fantom/github")
        self.assertNotIn("git pull", command)
        self.assertNotIn("git checkout", command)
        self.assertNotIn("chmod", command)
        self.assertNotIn("chown", command)

    def test_webhook_marks_failed_and_malformed_results_as_errors(self):
        webhook = GitHubModule._Webhook({
            "asset_path": "fantom",
            "srv_path_git_oapi": "/var/www/vhosts/oapi.co/fantom/github",
        })
        failure = {
            "ok": False,
            "stage": "fetch",
            "error_type": "CalledProcessError",
            "duration_ms": 12,
        }
        envelopes = [
            {"error": None, "result": {"cmd_result": [{"result": json.dumps(failure)}]}},
            {"error": None, "result": {"cmd_result": [{"result": "private malformed output"}]}},
        ]

        for envelope in envelopes:
            with self.subTest(result=envelope["result"]["cmd_result"][0]["result"]):
                with mock.patch("Dash.RunAsRoot.Queue", return_value=envelope):
                    response = webhook.git_pull_clean()
                self.assertFalse(response["deployment"]["ok"])
                self.assertTrue(response["error"].startswith("Git deployment failed at "))
                self.assertNotIn("private malformed output", response["error"])

    def test_cli_emits_one_bounded_json_result(self):
        result = {
            "ok": False,
            "stage": "validate",
            "error_type": "InvalidRepository",
            "duration_ms": 0,
        }
        output = io.StringIO()
        with (
            mock.patch.object(GitHubModule, "DeployGitRepository", return_value=result),
            contextlib.redirect_stdout(output),
        ):
            exit_code = GitHubModule._deployment_cli([
                "deploy-repository",
                "--repo",
                "/invalid",
            ])

        self.assertEqual(exit_code, 0)
        lines = output.getvalue().splitlines()
        self.assertEqual(len(lines), 1)
        self.assertEqual(json.loads(lines[0]), result)
        self.assertLess(len(lines[0].encode("utf-8")), 4096)


if __name__ == "__main__":
    unittest.main()
