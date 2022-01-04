# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
Stub for a module to run whenever a python or javascript file is saved

Unresolved Notes / Thoughts for Python:

+ Time the compilation / read time for each file and flag time consuming imports
+ Create a format for comment / description (like this) and force it to exist - for docs?
+ Consider a formatting ability to specify that the name of a function had changed so that we can auto migrate other code
+ For js lint: Find print( and change to console.log(!
"""

import os
import sys

from .js_lint import JSLinter
from .py_lint import PyLinter
from .lint_utils import LintUtils


class _DashLint:
    def __init__(self):
        pass

    def Process(self, is_client, dash_context, code_path):
        lint_succeeded = True
        msg = "(DashLint) Did not run PyLinter or JSLinter. What's the file's extension?"

        if code_path.endswith(".py"):
            lint_succeeded, msg = PyLinter.Process(is_client, dash_context, code_path)
        elif code_path.endswith(".js"):
            lint_succeeded, msg = JSLinter.Process(is_client, dash_context, code_path)

        return lint_succeeded, msg


DashLint = _DashLint()
