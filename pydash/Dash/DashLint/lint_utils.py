# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class LintUtils:
    def __init__(self):
        pass

    # def GetCodeHeader(self, comment_token, dash_context, code_path):
    #     from datetime import datetime
    #
    #     lines = []
    #     lines.append(f"{comment_token} {datetime.today().year} {dash_context['code_copyright_text']}")
    #     lines.append(f"{comment_token} Author(s): {', '.join(self.GetFileAuthors(code_path))}")
    #     lines.append(f"{comment_token} {datetime.now()}")  # This may need to be a different type of timestamp
    #     lines.append("")
    #
    #     return "\n".join(lines)

    def GetCodeLineListFromFile(self, code_path):
        return open(code_path).read().split("\n")

    def WriteCodeListToFile(self, code_path, code_lines_list):
        file = open(code_path, "w")
        file.write("\n".join(code_lines_list))
        file.close()

    def GetFileAuthors(self):
        # Ryan Martin ryan@ensomniac.com, Andrew Stet stetandrew@gmail.com

        # Andrew - I'm not sure what the best way to gather these names
        # are but it seems like git log would be a good start
        # and then making sure that whoever is currently logged
        # in and running this linter should be included if they
        # triggered the change and do not already exist in git's history?

        # https://www.commandlinefu.com/commands/view/4519/list-all-authors-of-a-particular-git-project
        # git shortlog -s # This is project specific, not file specific
        # git shortlog -s <relative file path> # file specific
        # return "Authors: ..."

        # (Andrew) Looking into git solution, but I think we should actually leave this as a hard-coded global list.
        # We'd have to pick somewhere for it to live, maybe in the dash context
        # and we add it on Dash Guide, but each project may have different contributors
        # that could easily be globally specified.

        # Short term:
        return [
            "Ryan Martin, ryan@ensomniac.com",
            "Andrew Stet, stetandrew@gmail.com",
        ]


LintUtils = LintUtils()
