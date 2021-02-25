# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

import sys
import os

from .lint_utils import LintUtils

class PyLinter:
    def __init__(self):
        self.run_linter = False

    def Process(self, is_client, context, file_path):
        if not self.run_linter:
            return True

        lint_succeeded = True

        header = LintUtils.GetCodeHeader("#", context, file_path)

        return lint_succeeded

PyLinter = PyLinter()