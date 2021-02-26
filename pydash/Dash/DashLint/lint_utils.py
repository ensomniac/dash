# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class LintUtils:
    def __init__(self):
        # These default attribute values are shared between PyLinter and
        # JSLinter before being set in each respective Linter
        self.group = False
        self.exception = ""
        self.code_path = ""
        self.source_code = []
        self.is_client = False
        self.company_name = ""
        self.comment_token = ""
        self.dash_context = None
        self.copyright_lines = []
        self.line_break_quantity = 1
        self.starts_with_keyword = ""
        self.comment_prefix = "(Dash Lint)"
        self.iter_limit_range = range(0, 101)

        super().__init__()

    def GetCodeLineListFromFile(self):
        return open(self.code_path).read().split("\n")

    def WriteCodeListToFile(self):
        file = open(self.code_path, "w")
        file.write("\n".join(self.source_code))
        file.close()

    def GetFormattedCommentedLine(self, line, without_original=False):
        if "#" in line:
            if self.comment_prefix in line:
                formatted_line = f"{line},"
            else:
                formatted_line = f"{line}, {self.comment_prefix}"
        else:
            if without_original:
                formatted_line = f"# {self.comment_prefix}"
            else:
                formatted_line = f"{line}  # {self.comment_prefix}"

        return formatted_line

    def GetAllCommentOptions(self):
        """
        # Comment options throughout the module are compiled in to a list
        # used when checking for invalid/outdated comments
        :return: List of comment strings used for flags
        """
        comment_options = []

        for attr in self.__dict__:
            if attr.endswith("_comment"):
                comment_options.append(self.__dict__[attr])

        return comment_options

    def GetIndentSpaces(self, line):
        spaces = 0

        for char in [c for c in line]:
            if char == " ":
                spaces += 1
            else:
                break

        return spaces

# Disabling below interface to be able to use this class within super() call
# LintUtils = LintUtils()
