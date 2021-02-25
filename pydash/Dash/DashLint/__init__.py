# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
Stub for a module to run whenever a python (or .js?) file is saved

Notes / Thoughts for Python:

+ Modify python headers with authors / timestamp
+ Compile the code to check for syntax issues
+ Put a comment next to imports that aren't being used
+ Time the compilation / read time for each file and flag time consuming imports
+ How about a quick check to make sure no asset_paths leak from one package to another?
+ Create a format for comment / description (like this) and force it to exist - for docs?
+ Consider a formatting ability to specify that the name of a function had changed so that we can auto migrate other code
+ Possible auto formatting idea: make sure that @propertys are grouped together
+ Search the code for instances of TODOs - where we can add that in comments to flag important things
+ Look in cgi-bin files for an htaccess key value pair and auto generate .htaccess mapping
"""

import os
import sys

from .js_lint    import JSLinter
from .py_lint    import PyLinter
from .lint_utils import LintUtils


class DashLint:
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


DashLint = DashLint()
