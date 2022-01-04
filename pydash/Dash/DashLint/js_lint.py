# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from .lint_utils import LintUtils
from .copyright import Copyright


class _JSLinter(LintUtils, Copyright):
    def __init__(self):
        super().__init__()

        self.comment_token = "//"

    def Process(self, is_client, dash_context, code_path):
        self.is_client = is_client
        self.dash_context = dash_context
        self.code_path = code_path
        self.source_code = self.GetCodeLineListFromFile()
        self.company_name = dash_context["code_copyright_text"]
        self.copyright_lines = self.GetCopyright()

        return self.compile_to_check_for_errors()

    def compile_to_check_for_errors(self):
        try:
            # Below is the py way, need js way to compile and check, may even
            # be the same, need to look in to it when getting to this
            # compile(open(self.code_path, "r").read(), self.code_path, "exec")

            return True, "(DashLint) Success!"
        except Exception as e:
            return False, e


JSLinter = _JSLinter()
