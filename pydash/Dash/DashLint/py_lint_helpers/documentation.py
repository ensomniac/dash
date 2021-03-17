# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com 

import os
import sys

from typing import Callable

# Note: Some of this functionality may end up being able to be shared with JSLint,
# however, I'm currently uncertain of that, so it will be made separate for now.


class PyDoc:
    source_code: list
    comment_token: str
    iter_limit_range: range
    GetIndentSpaceCount: Callable
    GetFormattedCommentedLine: Callable

    def __init__(self):
        super().__init__()

        self.doc_auto_gen_tag = "(DashLint auto-generated docstring)"
        self.synthesized_docstring = []
        self.params_with_defaults = {}
        self.current_block_params = []
        self.current_docstring_index = 0
        self.current_block_end_index = 0
        self.block_return = ""

        # Any comment string variable names like these MUST end in '_comment'
        self.incomplete_docstring_comment = "TODO: Finish Docstring"

    # noinspection PyUnusedLocal
    def DocstringExample(self, param1, param2=0):
        """
        | This is an ideal docstring example for a function.
        | All guidelines mentioned are illustrated in the code of this docstring example.
        |
        | ------ Description Guidelines ------
        | - All docstrings should include a description, of one line or more, first.
        | - If desired, description lines can be separated by line breaks by adding "|" followed by a space,
          to the front of the description line, preceding any of the main description line's text.
        | - The main description (this block) should be separated from the params etc by a single line break.
        | - Descriptions should be followed by params and return descriptions, if applicable.
        | - Return descriptions can be an explainer, or simply state the variable being returned.
        |
        | ------ Declaration Guidelines ------
        | - In addition to a param description, you must also specify the param type.
        | - Lastly, if applicable, the default param value must also be included at the end of the param description.

        :param str param1: test string, can be empty, doesn't do anything
        :param int param2: test int, can be nothing, doesn't do anything (default=0)
        :return: Example1 - docstring for this function | Example2 - self.DocstringExample.__doc__
        """

        return self.DocstringExample.__doc__

    # def get_current_block_params(self, is_function, is_class, line_index, strip_line, prev_strip_line):
    #     if is_function:
    #         self.current_block_params = prev_strip_line.split("(")[1].split(")")[0].split(",")
    #
    #     elif is_class:
    #         for num in self.iter_limit_range:
    #             init = "def __init__("
    #
    #             if strip_line.startswith(init):
    #                 break
    #
    #             if num < 1:
    #                 continue
    #
    #             next_index = line_index + num
    #
    #             try:
    #                 next_line = self.source_code[next_index]
    #             except:
    #                 break
    #
    #             if next_line.strip().startswith(init):
    #                 self.current_block_params = next_line.strip().split("(")[1].split(")")[0].split(",")
    #                 break
    #
    #     if "self" in self.current_block_params:
    #         self.current_block_params.remove("self")
    #
    #     self.params_with_defaults = {bp.split("=")[0].strip(): bp.split("=")[1].strip()
    #                                  for bp in self.current_block_params if "=" in bp}
    #     self.current_block_params = [p.split("=")[0].strip() if "=" in p else p.strip()
    #                                  for p in self.current_block_params if len(p)]

    # def get_docstring_end_index(self, startswith, endswith, strip_line, line_index):
    #     index_buffer = 1
    #     docstring_end_index = line_index
    #
    #     if startswith \
    #             and (len(strip_line) == 3 and (strip_line == "'''" or strip_line == '"""')) \
    #             or (len(strip_line) > 3 and startswith and not endswith):
    #
    #         for num in self.iter_limit_range:
    #             if num < 1:
    #                 continue
    #
    #             next_index = line_index + num
    #             next_line = self.source_code[next_index]
    #
    #             if "'''" in next_line or '"""' in next_line:
    #                 docstring_end_index = next_index
    #                 break
    #
    #         if docstring_end_index == line_index:
    #             index_buffer = 2
    #
    #     return docstring_end_index, index_buffer
    #
    # def get_current_block_end_index(self, line_index):
    #     for num in self.iter_limit_range:
    #         if num < 1:
    #             continue
    #
    #         next_index = line_index + num
    #
    #         try:
    #             next_line = self.source_code[next_index]
    #         except:
    #             break
    #
    #         strip = next_line.strip()
    #
    #         if strip.startswith("def ") or strip.startswith("class "):
    #             break
    #
    #         if len(strip):
    #             self.current_block_end_index = next_index
    #
    # def get_current_block_return_value(self, line_index):
    #     for block_line in reversed(self.source_code[line_index:(self.current_block_end_index + 1)]):
    #         if block_line.strip().startswith("return") and len(block_line.split("return")[1].strip()):
    #             try:
    #                 self.block_return = block_line.split("return ")[1].strip()
    #             except:
    #                 pass
    #             break

    # def get_missing_docstring(self, startswith):
    #     if not startswith:
    #         indent = " " * self.GetIndentSpaceCount(line)
    #
    #         for docstring_line in reversed(self.synthesize_docstring()):
    #             if len(docstring_line):
    #                 generated_docstring_lines.append(f"{indent}{docstring_line}")
    #             else:
    #                 generated_docstring_lines.append(docstring_line)

    # TODO: Break this function up
    def AddDocstringsAndFlags(self, index, line):
        index_buffer = 1
        final_comment = ""
        stripped = line.strip()
        comment_index = index - 2
        previous_index = index - 1
        docstring_end_index = index
        is_class = is_function = includes_return = includes_description = False
        missing_params = included_params = generated_docstring_lines = \
            missing_docstring_components = incomplete_docstring_components = []

        # Convert ''' format to """
        if stripped.startswith("'''") or stripped.endswith("'''"):
            line = line.replace("'''", '"""')
            stripped = line.strip()
            self.source_code[index] = line

        endswith = stripped.endswith("'''") or stripped.endswith('"""')
        startswith = stripped.startswith("'''") or stripped.startswith('"""')

        self.reset_docstring_attrs(index)

        try:
            previous_line = self.source_code[previous_index]
            comment_line = self.source_code[comment_index]
        except IndexError:
            return line

        if self.incomplete_docstring_comment in comment_line:
            return line

        prev_stripped = previous_line.strip()
        com_stripped = comment_line.strip()

        if prev_stripped.startswith("def "):
            is_function = True
        elif prev_stripped.startswith("class "):
            is_class = True

        if not is_function and not is_class:
            return line

        if len(com_stripped) and com_stripped.startswith(self.comment_token):
            formatted_line = self.GetFormattedCommentedLine(comment_line)
        else:
            formatted_line = self.GetFormattedCommentedLine("", without_original=True)

        # Get block params
        # self.get_current_block_params(is_function, is_class, index, stripped, prev_stripped)
        if is_function:
            self.current_block_params = prev_stripped.split("(")[1].split(")")[0].split(",")

        elif is_class:
            for num in self.iter_limit_range:
                init = "def __init__("

                if stripped.startswith(init):
                    break

                if num < 1:
                    continue

                next_index = index + num

                try:
                    next_line = self.source_code[next_index]
                except:
                    break

                if next_line.strip().startswith(init):
                    self.current_block_params = next_line.strip().split("(")[1].split(")")[0].split(",")
                    break

        if "self" in self.current_block_params:
            self.current_block_params.remove("self")

        self.params_with_defaults = {bp.split("=")[0].strip(): bp.split("=")[1].strip()
                                     for bp in self.current_block_params if "=" in bp}
        self.current_block_params = [p.split("=")[0].strip() if "=" in p else p.strip()
                                     for p in self.current_block_params if len(p)]

        # Get docstring end index
        # docstring_end_index, index_buffer = self.get_docstring_end_index(startswith, endswith, stripped, index)
        if startswith and (len(stripped) == 3 and (stripped == "'''" or stripped == '"""')) \
                or (len(stripped) > 3 and startswith and not endswith):

            for num in self.iter_limit_range:
                if num < 1:
                    continue

                next_index = index + num
                next_line = self.source_code[next_index]

                if "'''" in next_line or '"""' in next_line:
                    docstring_end_index = next_index
                    break

            if docstring_end_index == index:
                index_buffer = 2

        # Get current block end index
        # self.get_current_block_end_index(index)
        for num in self.iter_limit_range:
            if num < 1:
                continue

            next_index = index + num

            try:
                next_line = self.source_code[next_index]
            except:
                break

            strip = next_line.strip()

            if strip.startswith("def ") or strip.startswith("class "):
                break

            if len(strip):
                self.current_block_end_index = next_index

        # Get return value
        # self.get_current_block_return_value(index)
        for block_line in reversed(self.source_code[index:(self.current_block_end_index + 1)]):
            if block_line.strip().startswith("return") and len(block_line.split("return")[1].strip()):
                try:
                    self.block_return = block_line.split("return ")[1].strip()
                except:
                    pass
                break

        # Synthesize docstring if missing
        # self.get_missing_docstring()
        if not startswith:
            indent = " " * self.GetIndentSpaceCount(line)

            for docstring_line in reversed(self.synthesize_docstring()):
                if len(docstring_line):
                    generated_docstring_lines.append(f"{indent}{docstring_line}")
                else:
                    generated_docstring_lines.append(docstring_line)

        # Determine missing/incomplete components
        if len(generated_docstring_lines):
            iterate_docstring_lines = generated_docstring_lines
        else:
            iterate_docstring_lines = self.source_code[index:(docstring_end_index + index_buffer)]

        for docstring_line in iterate_docstring_lines:
            cleaned_line = docstring_line.replace("'''", "").replace('"""', "")\
                .replace(self.doc_auto_gen_tag, "").strip()

            if len(cleaned_line) and not cleaned_line.startswith(":"):
                includes_description = True

            if len(self.block_return) and ":return:" in cleaned_line:
                includes_return = True

                if not len(cleaned_line.split(":return:")[1].strip()):
                    incomplete_docstring_components.append("return")

            if cleaned_line.startswith(":param"):
                for param in self.current_block_params:
                    if f"{param}:" in cleaned_line and param not in included_params:
                        included_params.append(param)
                        split = cleaned_line.split(f"{param}:")

                        # Param missing description or missing type declaration
                        if not len(split[1].strip()) \
                                or ("(default=" in split[1].strip()
                                    and not len(split[1].split("(default=")[0].strip())) \
                                or not len(split[0].split(":param")[1].strip()):
                            incomplete_docstring_components.append(param)

        for param in self.current_block_params:
            if param not in included_params:
                missing_params.append(param)

        if not includes_description:
            missing_docstring_components.append("description")

        for param in missing_params:
            missing_docstring_components.append(param)

        if len(self.block_return) and not includes_return:
            missing_docstring_components.append("return")

        # Filter out previously found missing/incomplete components that have now been generated
        if len(generated_docstring_lines):
            for generated_line in generated_docstring_lines:
                default = ": (default="
                gen_strip = generated_line.strip()

                if default in generated_line and gen_strip.endswith(")"):
                    param = generated_line.split(default)[0].split(" ")[-1].strip()

                    if param not in incomplete_docstring_components:
                        incomplete_docstring_components.append(param)

                for component in missing_docstring_components:
                    if component == "return" and gen_strip.startswith(":return"):
                        missing_docstring_components.remove("return")

                        if gen_strip == ":return:" and "return" not in incomplete_docstring_components:
                            incomplete_docstring_components.append("return")

                    elif component == "description" and gen_strip == self.doc_auto_gen_tag:
                        missing_docstring_components.remove("description")

                        if "description" not in incomplete_docstring_components:
                            incomplete_docstring_components.append("description")

                    elif f"{component}:" in generated_line:
                        call = f":param {component}:"

                        missing_docstring_components.remove(component)

                        if (call in generated_line or not len(generated_line.split(call)[-1].strip())) \
                                and component not in incomplete_docstring_components:
                            incomplete_docstring_components.append(component)

        # Move description and return strings to front of final comment lists
        for component_list in [missing_docstring_components, incomplete_docstring_components]:
            for component_str in ["return", "description"]:
                if component_str in component_list:
                    component_list.insert(0, component_list.pop(component_list.index(component_str)))

        # Add missing default value tags
        if len(self.params_with_defaults) and iterate_docstring_lines != generated_docstring_lines:
            for source_index, source_line in enumerate(self.source_code):
                if source_line in iterate_docstring_lines \
                        and source_line.strip().startswith(":param") \
                        and "(default=" not in source_line:

                    param = source_line.strip().replace(":param", "").split(":")[0].split(" ")[-1].strip()

                    if param in self.params_with_defaults and self.params_with_defaults.get(param):
                        default_tag = f" (default={self.params_with_defaults[param]})"

                        self.source_code[source_index] += default_tag
                        iterate_docstring_lines[iterate_docstring_lines.index(source_line)] += default_tag

        # Insert missing params and/or missing return to existing docstring
        if len(missing_docstring_components) and not len(generated_docstring_lines):
            ds_indent = " " * self.GetIndentSpaceCount(line)
            missing_ds_components_adjusted = [c for c in missing_docstring_components if c != "description"]

            if "return" in missing_ds_components_adjusted:
                missing_ds_components_adjusted.append(missing_ds_components_adjusted
                                                      .pop(missing_ds_components_adjusted.index("return")))
            if len(missing_ds_components_adjusted):

                # If single-line, convert it to multi-line
                if docstring_end_index == index:
                    self.source_code[index] = f'{ds_indent}"""'
                    self.source_code.insert(index, ds_indent + stripped.replace('"""', ""))
                    self.source_code.insert(index, f'{ds_indent}"""')
                    docstring_end_index += 2

                if len(self.source_code[docstring_end_index - 1].strip()):
                    self.source_code.insert(docstring_end_index, "")
                    docstring_end_index += 1

                for m_component in missing_ds_components_adjusted:
                    incomplete = True

                    if m_component == "return":
                        if len(self.block_return):
                            new_line = f"{ds_indent}:return: {self.block_return}"
                            incomplete = False
                        else:
                            new_line = f"{ds_indent}:return:"
                    else:
                        new_line = f"{ds_indent}:param {m_component}:"

                    self.source_code.insert(docstring_end_index, new_line)
                    docstring_end_index += 1
                    missing_docstring_components.remove(m_component)

                    if incomplete and m_component not in incomplete_docstring_components:
                        incomplete_docstring_components.append(m_component)

        # Insert newly synthesized lines
        if len(generated_docstring_lines):
            for docstring_line in generated_docstring_lines:
                self.source_code.insert(index, docstring_line)

            docstring_end_index = index + len(generated_docstring_lines)

        # Compose final comment
        if len(missing_docstring_components) or len(incomplete_docstring_components):
            final_comment = f"{self.incomplete_docstring_comment} - "

            if len(missing_docstring_components):
                final_comment += f"Missing: {', '.join(missing_docstring_components)}"

            if len(incomplete_docstring_components):
                if "Missing: " in final_comment:
                    final_comment += " | "

                final_comment += "Incomplete"

                if "description" not in incomplete_docstring_components \
                        and "return" not in incomplete_docstring_components:
                    final_comment += " (needs type and/or desc)"

                final_comment += f": {', '.join(incomplete_docstring_components)}"

        # Insert final comment
        if len(final_comment):
            if com_stripped.startswith(self.comment_token):
                self.source_code[comment_index] = f"{formatted_line} {final_comment}"

            else:
                self.source_code.insert(previous_index,
                                        f"{' ' * self.GetIndentSpaceCount(previous_line)}"
                                        f"{formatted_line.lstrip()} {final_comment}")
                index += 1
                docstring_end_index += 1

        # Final adjustments for existing docstrings
        if not len(generated_docstring_lines):

            # Single-line docstrings
            if docstring_end_index == index:

                # Insert line break after docstring, if missing
                if len(stripped) > 6 and startswith and endswith and len(self.source_code[index + 1].strip()):
                    for num in self.iter_limit_range:
                        if num < 1:
                            continue

                        try:
                            if self.source_code[index + (num - 1)] == line:
                                self.source_code.insert(index + num, "")
                                index += (num - 1)
                                break
                        except:
                            pass

                # Convert to multi-line
                if docstring_end_index == index:
                    current_indent = " " * self.GetIndentSpaceCount(line)
                    self.source_code[index] = f'{current_indent}"""'
                    self.source_code.insert(index, current_indent + stripped.replace('"""', ""))
                    self.source_code.insert(index, f'{current_indent}"""')
                    docstring_end_index += 2

            # Multi-line docstrings
            else:
                # Insert line break after description, if missing
                if len(self.source_code[index + 2]) and (index + 2) != docstring_end_index:
                    self.source_code.insert(index + 2, "")
                    docstring_end_index += 1

                # Insert line break after docstring, if missing
                if len(self.source_code[docstring_end_index + 1].strip()):
                    self.source_code.insert(docstring_end_index + 1, "")

        return line

    def reset_docstring_attrs(self, line_index):
        self.block_return = ""
        self.current_block_params = []
        self.params_with_defaults = {}
        self.current_docstring_index = line_index
        self.current_block_end_index = line_index

    def synthesize_docstring(self, test=None):
        """
        Creates a list of newly synthesized docstring lines, in order.
        :param test: testing
        :return: list of synthesized docstring lines
        """

        self.synthesized_docstring = []
        self.synthesized_docstring.append('"""')
        self.synthesized_docstring.append(self.doc_auto_gen_tag)
        self.synthesized_docstring.append("")

        self.evaluate_params()

        if len(self.block_return):
            self.synthesized_docstring.append(f":return: {self.block_return}")

        self.synthesized_docstring.append('"""')
        self.synthesized_docstring.append("")

        if len(self.synthesized_docstring) == 5:
            self.synthesized_docstring.pop(2)

        return self.synthesized_docstring

    def evaluate_params(self):
        for param in self.current_block_params:
            line = ":param "
            param_type = self.attempt_to_determine_param_type(param)

            if len(param_type):
                line += f"{param_type} "

            line += f"{param}:"

            if param in self.params_with_defaults and self.params_with_defaults.get(param):
                line += f" (default={self.params_with_defaults[param]})"

            self.synthesized_docstring.append(line)

    def attempt_to_determine_param_type(self, param):
        # This will only catch re-assignments of the params, given they are fairly simple assignments

        value = ""
        param_type = ""

        for block_line in self.source_code[self.current_docstring_index:(self.current_block_end_index + 1)]:
            stripped = block_line.strip()

            if not stripped.startswith(f"{param} = "):
                continue

            try:
                value = stripped.split(" = ")[-1].strip()
            except:
                pass

            if len(value):
                break

        if len(value):
            try:
                int(value)
                return "int"
            except:
                pass

            if (value.startswith('"') or value.startswith("'")) \
                    and (value.endswith('"') or value.endswith("'")):
                param_type = "str"

            elif value.startswith("[") and value.endswith("]"):
                param_type = "list"

            elif value.startswith("{") and value.endswith("}"):
                param_type = "dict"

            elif value.startswith("(") and value.endswith(")"):
                param_type = "tuple"

            elif value == "False" or value == "True":
                param_type = "bool"

        return param_type
