# 2021 Ensomniac
# Ryan Martin ryan@ensomniac.com

# Stub for a module to run whenever a python (or .js?) file is saved

# Notes / Thoughts for Python
#
# + Modify python headers with authors / timestamp
# + Compile the code to check for syntax issues
# + Put a comment next to imports that aren't being used
# + Time the compilation / read time for each file and flag time consuming imports
# + How about a quick check to make sure no asset_paths leak from one package to another?
# + Create a format for comment / description (like this) and force it to exist - for docs?
# + Consider a formatting ability to specify that the name of a function had changed so that we can auto migrate other code
# + Possible auto formatting idea: make sure that @propertys are grouped together
# + Search the code for instances of TODO - where we can add that in comments to flag important things

import sys
import os
import json
import getpass
import requests

from .lint_utils import LintUtils
from .js_lint    import JSLinter
from .py_lint    import PyLinter

class DashLint:
    def __init__(self):
        pass

    def Process(self, is_client, context, file_path):
        lint_succeeded = True

        if file_path.endswith(".py"):
            lint_succeeded = PyLinter.Process(is_client, context, file_path)
        elif file_path.endswith(".js"):
            lint_succeeded = JSLinter.Process(is_client, context, file_path)

        return lint_succeeded

DashLint = DashLint()