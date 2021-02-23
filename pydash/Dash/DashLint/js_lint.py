# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

import sys
import os

from .lint_utils import LintUtils

class JSLinter:
    def __init__(self):
        pass

    def Process(self, is_client, context, file_path):
        lint_succeeded = True

        header = LintUtils.GetCodeHeader("//", context, file_path)

        return lint_succeeded

JSLinter = JSLinter()