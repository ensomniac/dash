# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
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

            file_name = self.code_path.split("/")[-1]

            if len(debug_text):
                return True, f"\n{'-'*44}DEBUG START{'-'*44}\n\n{debug_text}\n\n{'-'*45}DEBUG END{'-'*45}\n"

            if print_linted_code_line_list:
                return True, (
                    f"\n{'-'*30}LINT PREVIEW START ({file_name}){'-'*30}\n"
                    + '\n'.join(self.source_code)
                    + f"\n{'-'*31}LINT PREVIEW END ({file_name}){'-'*31}\n"
                )

            return True, "(DashLint) Success!"

        except Exception as e:
            return False, e
