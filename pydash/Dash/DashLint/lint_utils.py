# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

import sys
import os
import datetime

class LintUtils:
    def __init__(self):
        pass

    def GetCodeHeader(self, comment_tkn, context, file_path):
        # comment_tkn = # or //

        # print(context["code_copyright_text"])

        today = datetime.datetime.today()

        header_line = comment_tkn + " " + str(today.year) + " "
        header_line += context["code_copyright_text"]

        authors_line = comment_tkn + " " + self.get_file_authors(file_path)

        lines = []
        lines.append(header_line)
        lines.append(authors_line)
        lines.append(comment_tkn + " Last Checked TS") # TODO
        lines.append("")

        return "\n".join(lines)

    def get_file_authors(self, file_path):
        # Ryan Martin ryan@ensomniac.com, Andrew Stet stetandrew@gmail.com
        #
        # Andrew - I'm not sure what the best way to gather these names
        # are but it seems like git log would be a good start
        # and then making sure that whoever is currently logged
        # in and running this linter should be included if they
        # triggered the change and do not already exist in git's history?
        #
        # https://www.commandlinefu.com/commands/view/4519/list-all-authors-of-a-particular-git-project
        # git shortlog -s # This is project specific, not file specific
        # git shortlog -s <relative file path> # file specific
        return "Authors: ..."


LintUtils = LintUtils()