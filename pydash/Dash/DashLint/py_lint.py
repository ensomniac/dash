# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from .lint_utils import LintUtils
from .py_compile_check import CompileToCheckForErrors


class PyLinter:
    def __init__(self):
        self.is_client = False
        self.dash_context = None
        self.code_path = ""
        self.comment_token = "#"
        # self.header = ""

        self.source_code = []
        self.iter_limit_range = range(0, 101)
        self.starts_with_keyword = ""
        self.line_break_quantity = 1
        self.group = False
        self.exception = ""
        self.company_name = ""
        self.shebang = "#!/usr/bin/python"
        self.include_shebang = False
        self.comment_prefix = "(Dash Lint)"
        self.line_length_flag_suffix = "(excluding comments)"
        self.copyright_persons = []

        # These are a bit arbitrary/undecided for now
        self.total_line_length_max = 500
        self.individual_line_length_max = 100

        # Any comment string variable names like these MUST end in '_comment'
        self.super_comment = "TODO: Convert to super()"
        self.path_comment = "This may include a hard-coded path - use 'os.path.join()' instead"
        self.individual_line_length_comment = f"Line length exceeds {self.individual_line_length_max}"
        self.total_line_length_comment = f"File's total line count exceeds {self.total_line_length_max}"
        self.missing_docstring_comment = "TODO: Missing Docstring"
        self.incomplete_docstring_comment = "TODO: Incomplete Docstring"

        # The above comment options are compiled in to a list used when checking for invalid/outdated comments
        self.all_comment_options = self.get_all_current_comment_options()

    def Process(self, is_client, dash_context, code_path):
        self.is_client = is_client
        self.dash_context = dash_context
        self.code_path = code_path
        self.source_code = LintUtils.GetCodeLineListFromFile(code_path)
        self.company_name = dash_context["code_copyright_text"]
        self.copyright_persons = LintUtils.GetFileAuthors()
        # self.header = LintUtils.GetCodeHeader(self.comment_token, dash_context, code_path)

        if "/cgi-bin/" in code_path:
            self.include_shebang = True

        return CompileToCheckForErrors(self.code_path)
        # return CompileToCheckForErrors(self.code_path, debug_text=dash_context)
        # return CompileToCheckForErrors(self.code_path, linted_code_line_list_to_print=self.source_code)

    def get_all_current_comment_options(self):
        comment_options = []

        for attr in self.__dict__:
            if attr.endswith("_comment"):
                comment_options.append(self.__dict__[attr])

        return comment_options


PyLinter = PyLinter()
