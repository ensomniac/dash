#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
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

import os
import sys


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

        return_data["payload"]        = loads(return_data["payload"])
        return_data["repository"]     = return_data["payload"]["repository"]["name"]
        return_data["sender_details"] = return_data["payload"]["sender"]
        return_data["sender"]         = return_data["sender_details"]["login"]
        return_data["hook_type"]      = "Unknown hook type"

        commits = []

        try:
            commits = return_data["payload"]["commits"]
        except:
            pass

        if not commits:
            return_data["msg"] = "Ignoring - no commits"

            return return_data

        from Dash import PersonalContexts
        from Dash.Utils import SendEmail, JSON2HTML

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

        SendEmail(
            subject=subject,
            notify_email_list=email_list,
            msg=msg,
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
            # Just update git, nothing else
            pass
        else:
            cmds.append(f"rm -rf {dest_path}*")
            cmds.append(f"cp -r {local_git_path}* {dest_path}")

        cmds.append(f"chmod 755 {dest_path} -R")
        cmds.append(f"chown ensomniac {dest_path} -R")
        cmds.append(f"chgrp psacln {dest_path} -R")

        # TODO: Check to see if there is already a
        # github command running for this site!

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
        email_list_csv = self.DashContext.get("email_git_webhook_csv")

        if not email_list_csv:
            from Dash import AdminEmails

            email_list_csv = AdminEmails[0]

        email_list = [email.strip() for email in email_list_csv.split(",")]
        git_result = self.git_pull_clean()

        if payload:
            self.email_git_payload_response(payload, email_list, git_result)

        if (
            "/shop_io" in self.DashContext.get("git_repo", "")
            or "/shop_io" in self.DashContext.get("srv_path_git_oapi", "")
        ):
            self.update_shop_io_index()

        non_critical_command = {}

        if self.DashContext["asset_path"] == "analog":
            non_critical_command["args"] = [
                "python",
                os.path.join(self.DashContext["srv_path_git_oapi"], "python", "MinFrontendVDB.py")
            ]

        elif self.DashContext["asset_path"] == "pydash":
            non_critical_command["args"] = [
                "rsync",
                "-azP",
                "--delete",
                "-e",
                "ssh",
                "--rsync-path=sudo rsync",
                self.DashContext["srv_path_http_root"],
                f"rmartin@72.167.225.180:{self.DashContext['srv_path_http_root']}"
            ]

        if non_critical_command:
            from subprocess import run

            if non_critical_command["args"][0] != "sudo":
                non_critical_command["args"].insert(0, "sudo")

            try:
                run(non_critical_command["args"], check=True)

            except Exception as e:
                from Dash.Utils import SendEmail

                if not non_critical_command.get("error"):
                    non_critical_command["error"] = (
                        "Failed to run non-critical command after processing "
                        f"GitHub webhook for {self.DashContext['asset_path']}"
                    )

                args = "\n - ".join(non_critical_command["args"])

                SendEmail(
                    subject=f"DashGuide GitHub Webhook Non-Critical Error: {self.DashContext['asset_path']}",
                    msg=f"{non_critical_command['error']}\n\nArgs:\n{args}\n\nError:\n{e}"
                )

        return {
            "email_list": email_list,
            "git_result": git_result
        }

    def git_pull_clean(self):
        from Dash.RunAsRoot import Queue

        return Queue(
            [
                f"cd {self.DashContext['srv_path_git_oapi']}; git checkout .",
                f"cd {self.DashContext['srv_path_git_oapi']}; git clean -fd",
                f"cd {self.DashContext['srv_path_git_oapi']}; git pull",
                f"cd {self.DashContext['srv_path_git_oapi']}; git checkout .",
                f"cd {self.DashContext['srv_path_git_oapi']}; git clean -fd",
                f"cd {self.DashContext['srv_path_git_oapi']}; git checkout .",
                f"cd {self.DashContext['srv_path_git_oapi']}; git pull",
                f"chmod 755 {self.DashContext['srv_path_git_oapi']} -R",
                f"chown ensomniac {self.DashContext['srv_path_git_oapi']} -R",
                f"chgrp psacln {self.DashContext['srv_path_git_oapi']} -R"
            ]
        )

    def email_git_payload_response(self, payload, email_list, git_result):
        from Dash.Utils import JSON2HTML, SendEmail

        if payload["repository"]["name"] == "shop_io":
            repo_tag = f" ({self.DashContext['asset_path']})"
        else:
            repo_tag = ""

        subject = " -> ".join([
            "GitHub",
            f"{payload['repository']['name']}{repo_tag}",
            payload["sender"]["login"]
        ])

        if git_result.get("error"):
            subject = f"[ERROR] {subject}"

        SendEmail(
            subject=subject,
            notify_email_list=email_list,
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
            strict_notify=True
        )

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
        #         'author': {'name': 'Ryan Martin', 'email': 'ryan@ensomniac.com', 'username': 'ensomniac'},
        #         'committer': {'name': 'Ryan Martin', 'email': 'ryan@ensomniac.com', 'username': 'ensomniac'},
        #         'added': [], 'removed': [],
        #         'modified': ['README.md']
        #     }
        # ]
        commits = github_payload.get("commits")

        if len(commits) == 1:
            commit_lines.append("<b>GitHub Commit:</b>")
        else:
            commit_lines.append(f"<b>{len(commits)} GitHub Commits:</b>")

        for commit in commits:
            author = commit["committer"]

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


def WebhookForAssetPath(dash_context, payload={}):
    return _Webhook(dash_context).ForAssetPath(payload)
