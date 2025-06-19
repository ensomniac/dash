#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import cgi
import json

from Dash.PackageContext import Get

class ApiSync:
    def __init__(self):

        self.Add(self.github_webhook, requires_authentication=False)
        self.Add(self.dashsync_live,  requires_authentication=False)

    def dashsync_live(self):
        from gzip import decompress

        if os.path.exists(self.Params["remote_path"]):
            os.remove(self.Params["remote_path"])

        file_text = decompress(self.Params.get("fmod")).decode()

        open(self.Params["remote_path"], "w").write(file_text)

        response = {
            # "user": self.Params["dash_user"]["email"], # User was already validated via dash.guide
            "success": os.path.exists(self.Params["remote_path"])
        }

        if not response["success"]:
            return self.SetResponse(response)

        os.system(f"chmod 755 {self.Params['remote_path']}")
        os.system(f"chown ensomniac {self.Params['remote_path']}")
        os.system(f"chgrp psacln {self.Params['remote_path']}")

        return self.SetResponse(response)


    def github_webhook(self):
        # This was previously handled on the dash.guide global site
        # The code below was cloned, with the idea being that we should
        # sunset the dash.guide method for all sites moving forward
        # in favor of this new method, since this method works across multiple
        # servers and doesn't require a centralized dash.guide repo

        self.SetParam("asset_path", self.DashContext["asset_path"])
        self.ValidateParams(["asset_path"])

        # I left the webhook_for_asset_path separate because we may still need that
        # for the altona / shop_io split...

        return self.SetResponse(self.webhook_for_asset_path(self.Params["asset_path"]))

    # -----------------------------------------------------------------------------

    def webhook_for_asset_path(self, asset_path):
        dash_context = Get(asset_path)

        if not dash_context:
            raise ValueError("Invalid asset_path")

        if not dash_context.get("srv_path_git_oapi"):
            raise ValueError("This asset_path is not set up for Github/Webhook")

        email_list_csv = dash_context.get("email_git_webhook_csv")

        if not email_list_csv:
            from Dash import AdminEmails

            email_list_csv = AdminEmails[0]

        email_list = [email.strip() for email in email_list_csv.split(",")]
        git_result = self.git_pull_clean(dash_context["srv_path_git_oapi"])

        if self.Params.get("payload"):
            self.email_git_payload_response(json.loads(self.Params["payload"]), email_list, git_result, dash_context)

        if "/shop_io" in dash_context.get("git_repo", "") or "/shop_io" in dash_context.get("srv_path_git_oapi", ""):
            self.update_shop_io_index(dash_context)

        if asset_path == "analog":
            from subprocess import run

            run(
                ["sudo", "python", os.path.join(dash_context["srv_path_git_oapi"], "python", "MinFrontendVDB.py")],
                check=True
            )

        return {
            "email_list": email_list,
            "git_result": git_result
        }

    def update_shop_io_index(self, dash_context):
        index_path = os.path.join(dash_context["srv_path_git_oapi"], "client", "index.html")

        with open(index_path) as file:
            content = file.read()

        content = content.replace("Shop IO", dash_context["display_name"])

        if os.path.exists(os.path.join(dash_context["srv_path_local"], "images", "apple-touch-icon.png")):
            content = content.replace(
                "analog.technology/local/images/shop-",
                f"{dash_context['domain']}/local/images/"
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

                    if key in dash_context:
                        if third_quotation_index is None:
                            quotations = [i for i, c in enumerate(line) if c == '"']
                            third_quotation_index = quotations[3 - 1] if len(quotations) >= 3 else -1

                        if not injected_key_added:
                            injected_key_added = True

                            updated_content.append(f'{" " * 16}"injected":{" " * (third_quotation_index - 27)}true,')

                        line = f'{line[:third_quotation_index]}"{dash_context[key]}",'

                if "};" in line:
                    if updated_content[-1].endswith(","):
                        updated_content[-1] = updated_content[-1][:-1]  # Remove comma

                    inside_context = False

            updated_content.append(line)

        with open(index_path, "w") as file:
            file.write("\n".join(updated_content))

    def email_git_payload_response(self, payload, email_list, git_result, dash_context):
        from Dash.Utils import JSON2HTML

        if payload["repository"]["name"] == "shop_io":
            repo_tag = f" ({dash_context['asset_path']})"
        else:
            repo_tag = ""

        subject = " -> ".join([
            self.__class__.__name__,
            f"{payload['repository']['name']}{repo_tag}",
            payload["sender"]["login"]
        ])

        if git_result.get("error"):
            subject = f"[ERROR] {subject}"

        self.SendEmail(
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
                    "<br><br><b>Full Github Payload:</b><br>",
                    JSON2HTML(payload)
                ])
            ),
            strict_notify=True
        )

    def get_commit_email_highlight(self, github_payload):
        # commits_example = [
        #     {
        #         'id': '442dbbcd446fecb596c62d146f25f3b3f9b13b99',
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

        commit_lines = []
        commits = github_payload.get("commits")

        if len(commits) == 1:
            commit_lines.append("<b>GitHub Commit:</b>")
        else:
            commit_lines.append(f"<b>{len(commits)} GitHub Commits:</b>")

        for commit in commits:
            author = commit["committer"]
            files_added = commit["added"]
            files_removed = commit["removed"]
            files_modified = commit["modified"]

            commit_lines.append(f"&emsp;>> <b><i>'{commit['message']}'</i></b> - {author['name']} ({author['email']})")

            if files_modified:
                commit_lines = self.add_commit_files(commit_lines, "Modified", files_modified)

            if files_added:
                commit_lines = self.add_commit_files(commit_lines, "Added", files_added)

            if files_removed:
                commit_lines = self.add_commit_files(commit_lines, "Removed", files_removed)

        return f"<span style='font-size:130%;'>{'<br>'.join(commit_lines)}<br></span>"

    def add_commit_files(self, lines, label, file_list):
        for filename in file_list:
            lines.append(f"&emsp;&emsp;&emsp; | <b>{label}: </b>{filename}")

        return lines

    def git_pull_clean(self, github_path):
        from Dash.RunAsRoot import Queue

        return Queue(
            [
                f"cd {github_path}; git checkout .",
                f"cd {github_path}; git clean -fd",
                f"cd {github_path}; git pull",
                f"cd {github_path}; git checkout .",
                f"cd {github_path}; git clean -fd",
                f"cd {github_path}; git checkout .",
                f"cd {github_path}; git pull",
                f"chmod 755 {github_path} -R",
                f"chown ensomniac {github_path} -R",
                f"chgrp psacln {github_path} -R"
            ]
        )