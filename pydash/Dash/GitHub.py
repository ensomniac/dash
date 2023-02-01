#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
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
        from json import loads, dumps

        return_data = {"payload": params.get("payload")}

        if not return_data["payload"]:
            return_data["error"] = "No GitHub Payload"

            return return_data

        return_data["payload"] = loads(return_data["payload"])
        return_data["repository"] = return_data["payload"]["repository"]["name"]
        return_data["sender_details"] = return_data["payload"]["sender"]
        return_data["sender"] = return_data["sender_details"]["login"]
        return_data["hook_type"] = "Unknown hook type"

        commits = []

        try:
            commits = return_data["payload"]["commits"]
        except:
            pass

        if not commits:
            return_data["msg"] = "Ignoring - no commits"

            return return_data

        from json2html import json2html
        from Dash.Utils import SendEmail
        from Dash import PersonalContexts

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

        html = json2html.convert(json=dumps(return_data["server_git_update"]))

        msg += f"{html}<br><b>Github Commits:</b><br>"

        for commit_details in commits:
            msg += json2html.convert(json=dumps(commit_details))

        msg += "<br><b>Full Github Payload:</b><br>"
        msg += f"{json2html.convert(json=dumps(return_data['payload']))}<br>"

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
            f"cd {local_git_root}",
            "git pull",
            "git clean -f -d",
            "git reset HEAD .",
            "git checkout . -f",
            "git clean -f -d",
            "git checkout . -f",
            "git pull",
            "git status"  # So we can see this in the output field of the email
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

        # return RunAsRoot.Queue(";".join(cmds))  # Chaining the commands led to silent failures when commands would abort before the other commands were called
        return RunAsRoot.Queue(cmds)


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
