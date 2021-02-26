# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from .cleanup import Cleanup
from .copyright import Copyright
from .lint_utils import LintUtils
from .spacing import GlobalSpacing
from .py_lint_helpers.flags import Flags
from .py_lint_helpers.py_spacing import PySpacing
from .py_lint_helpers.pre_compile import PreCompile
from .py_lint_helpers.style_formatting import FormatStyle


class PyLinter(
    LintUtils,
    Copyright,
    PreCompile,
    Flags,
    Cleanup,
    GlobalSpacing,
    PySpacing,
    FormatStyle,
):
    def __init__(self):
        super().__init__()

        self.comment_token = "#"
        self.include_shebang = False
        self.all_comment_options = self.GetAllCommentOptions()

    def Process(self, is_client, dash_context, code_path):
        self.update_init_attrs(is_client, dash_context, code_path)

        self.run_core()
        self.run_extras()

        # self.AddFlagComments()
        # self.WriteCodeListToFile()  # Leave off til the end

        return self.CompileToCheckForErrors()
        # return self.CompileToCheckForErrors(print_linted_code_line_list=True)
        # return self.CompileToCheckForErrors(debug_text=self.dash_context")

    def update_init_attrs(self, is_client, dash_context, code_path):
        self.is_client = is_client
        self.dash_context = dash_context
        self.code_path = code_path
        self.source_code = self.GetCodeLineListFromFile()
        self.company_name = dash_context["code_copyright_text"]
        self.copyright_lines = self.GetCopyright()

        if "/cgi-bin/" in code_path:
            self.include_shebang = True

    def run_core(self):
        # self.CleanupCommentsBeforeEval()
        # self.RemoveExtraLinesAtStartOfFile()
        # self.RemoveExtraLinesAtEndOfFile()
        # self.RemoveBlankLinesAtStartOfBlocks()
        # self.CheckClassSpacing()
        # self.CheckFunctionSpacing()
        # self.CheckNameMainSpacing()
        self.ValidateShebang()
        self.ValidateCopyright()
        # self.CheckImportSpacing()

    def run_extras(self):
        # TODO: Write these extra functions
        self.GatherToDos()
        self.CheckForOsAndSys()
        self.DropOneLineIfs()
        self.ConformDictCreation()
        self.ConformListCreation()
        self.FormatBlockSpacingIntoColumns()


PyLinter = PyLinter()
