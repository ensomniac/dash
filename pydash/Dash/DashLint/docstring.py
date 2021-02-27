# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from typing import Callable


class DocString:
    source_code: list
    iter_limit_range: range
    GetIndentSpaces: Callable
    GetFormattedCommentedLine: Callable

    def __init__(self):
        # Any comment string variable names like these MUST end in '_comment'
        self.missing_docstring_comment = "TODO: Missing Docstring"
        self.incomplete_docstring_comment = "TODO: Incomplete Docstring"

    def AddDocStringFlags(self, index, line):
        previous_index = index - 1
        comment_index = index - 2
        previous_line = self.source_code[previous_index]
        comment_line = self.source_code[comment_index]

        if "def " in previous_line or "class " in previous_line:
            docstring_end_index = index
            block_end_index = index
            missing_docstring_components = []
            incomplete_docstring_components = []
            missing_params = []
            included_params = []
            block_params = []
            includes_description = False
            includes_return = False
            returns_something = False
            final_comment = ""
            index_buffer = 1
            add_line_break_before_comment = False

            if "def " in comment_line or "class " in comment_line:
                add_line_break_before_comment = True
                formatted_line = self.GetFormattedCommentedLine("", True)
            else:
                formatted_line = self.GetFormattedCommentedLine(comment_line)

            if "def " in previous_line:
                block_params = previous_line.strip().split("(")[1].split(")")[0].split(",")

            elif "class " in previous_line:
                for num in self.iter_limit_range:
                    if num < 1:
                        continue

                    next_index = index + num

                    try:
                        next_line = self.source_code[next_index]
                    except:
                        break

                    if "def __init__(" in next_line:
                        block_params = next_line.strip().split("(")[1].split(")")[0].split(",")
                        break

            if "self" in block_params:
                block_params.remove("self")

            block_params = [p.strip() for p in block_params if p]

            if not (line.strip().startswith("'''") or line.strip().startswith('"""')) and self.missing_docstring_comment not in comment_line:
                final_comment = self.missing_docstring_comment

            elif (line.strip().startswith("'''") or line.strip().startswith('"""')) and self.incomplete_docstring_comment not in comment_line:
                if not line.strip().endswith("'''") and not line.strip().endswith('"""'):
                    for num in self.iter_limit_range:
                        if num < 1:
                            continue

                        next_index = index + num
                        next_line = self.source_code[next_index]

                        if "'''" in next_line or '"""' in next_line:
                            docstring_end_index = next_index
                            break

                for num in self.iter_limit_range:
                    if num < 1:
                        continue

                    next_index = index + num
                    next_line = self.source_code[next_index]

                    if len(next_line.strip()):
                        block_end_index = index
                        break

                for block_line in self.source_code[index:(block_end_index + 1)]:
                    if "return" in block_line and len(block_line.split("return")[1].strip()):
                        returns_something = True
                        break

                if docstring_end_index == index:
                    index_buffer = 2

                for docstring_line in self.source_code[index:(docstring_end_index + index_buffer)]:
                    cleaned_line = docstring_line.strip().replace("'''", "").replace('"""', "")

                    if len(cleaned_line) and not cleaned_line.startswith(":"):
                        includes_description = True

                    if returns_something and ":return:" in cleaned_line:
                        includes_return = True

                        if not len(cleaned_line.split(":return:")[1].strip()):
                            incomplete_docstring_components.append("return")

                    if cleaned_line.startswith(":param"):
                        for param in block_params:
                            if f"{param}:" in cleaned_line and param not in included_params:
                                included_params.append(param)

                                if not len(cleaned_line.split(f"{param}:")[1].strip()):
                                    incomplete_docstring_components.append(param)

                for param in block_params:
                    if param not in included_params:
                        missing_params.append(param)

                if not includes_description:
                    missing_docstring_components.append("description")

                for param in missing_params:
                    missing_docstring_components.append(param)

                if returns_something and not includes_return:
                    missing_docstring_components.append("return")

                if len(missing_docstring_components) or len(incomplete_docstring_components):
                    final_comment = f"{self.incomplete_docstring_comment} - "

                    if len(missing_docstring_components):
                        final_comment += f"Missing: {', '.join(missing_docstring_components)}"

                    if len(incomplete_docstring_components):
                        if "Missing: " in final_comment:
                            final_comment += " | "

                        final_comment += f"Incomplete: {', '.join(incomplete_docstring_components)}"

            if len(final_comment):
                if comment_line.strip().startswith(self.comment_token):
                    self.source_code[comment_index] = f"{formatted_line} {final_comment}"

                    if add_line_break_before_comment:
                        self.source_code.insert(comment_index, "")
                else:
                    self.source_code.insert(previous_index, f"{' ' * self.GetIndentSpaces(previous_line)}{formatted_line.lstrip()} {final_comment}")

                    if add_line_break_before_comment:
                        self.source_code.insert(previous_index, "")

        return line
