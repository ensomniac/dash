# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class PreCompile:
    code_path: str
    source_code: list

    def __init__(self):
        super().__init__()

    def CompileToCheckForErrors(self, print_linted_code_line_list=False, debug_text=""):
        try:
            compile(open(self.code_path, "r").read(), self.code_path, "exec")

            if len(debug_text):
                return True, f"\n{'-'*44}DEBUG START{'-'*44}\n\n{debug_text}\n\n{'-'*45}DEBUG END{'-'*45}\n"
            elif print_linted_code_line_list:
                return True, f"\n{'-'*41}LINT PREVIEW START{'-'*41}\n" \
                             + '\n'.join(self.source_code) \
                             + f"\n{'-'*42}LINT PREVIEW END{'-'*42}\n"
            else:
                return True, "(DashLint) Success!"

        except Exception as e:
            return False, e
