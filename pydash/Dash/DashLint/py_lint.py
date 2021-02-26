# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from .lint_utils import LintUtils
from .copyright import Copyright
from .py_lint_helpers.pre_compile import PreCompile
from .py_lint_helpers.flags import Flags


class PyLinter(LintUtils, Copyright, PreCompile, Flags):
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
        # return self.CompileToCheckForErrors(debug_text=f"{self.group}, {self.shebang}, {self.line_length_flag_suffix}")
        # return self.CompileToCheckForErrors(print_linted_code_line_list=True)

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
        # self.cleanup_comments_before_evaluating()
        # self.remove_extra_lines_at_start_of_file()
        # self.remove_extra_lines_at_end_of_file()
        # self.remove_blank_lines_at_start_of_blocks()
        # self.check_class_spacing()
        # self.check_function_spacing()
        # self.check_name_main_spacing()
        self.ValidateShebang()
        self.ValidateCopyright()
        # self.check_import_spacing()
        pass

    def run_extras(self):
        # self.conform_dict_creation()
        # self.conform_list_creation()
        # self.drop_one_line_ifs()
        # self.format_block_spacing_into_columns()
        pass


PyLinter = PyLinter()
