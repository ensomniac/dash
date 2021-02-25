# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

import sys
import os

from .lint_utils import LintUtils

class PyLinter:
    def __init__(self):
        self.is_client = False
        self.dash_context = None
        self.code_path = ""
        self.header = ""
        self.comment_token = "#"
        # self.lint_succeeded = True
        # self.error = ""

    def Process(self, is_client, dash_context, code_path):
        self.is_client = is_client
        self.dash_context = dash_context
        self.code_path = code_path
        self.header = LintUtils.GetCodeHeader(self.comment_token, dash_context, code_path)

        return self.compile_to_check_for_errors()

    def compile_to_check_for_errors(self):
        try:
            compile(open(self.code_path, "r").read(), self.code_path, "exec")
            return True, "(DashLint) Success!"
        except Exception as e:
            return False, e


PyLinter = PyLinter()
