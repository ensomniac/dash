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
    GetIndentSpaces: Callable
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

    # TODO: Break this function up
    def AddDocStringFlags(self, index, line):
        index_buffer = 1
        is_class = False
        final_comment = ""
        missing_params = []
        is_function = False
        included_params = []
        stripped = line.strip()
        includes_return = False
        comment_index = index - 2
        previous_index = index - 1
        docstring_end_index = index
        includes_description = False
        generated_docstring_lines = []
        missing_docstring_components = []
        incomplete_docstring_components = []
        endswith = stripped.endswith("'''") or stripped.endswith('"""')
        startswith = stripped.startswith("'''") or stripped.startswith('"""')

        self.block_return = ""
        self.current_block_params = []
        self.params_with_defaults = {}
        self.current_docstring_index = index
        self.current_block_end_index = index

        try:
            previous_line = self.source_code[previous_index]
            comment_line = self.source_code[comment_index]
        except IndexError:
            return line

        prev_stripped = previous_line.strip()

        if prev_stripped.startswith("def "):
            is_function = True
        elif prev_stripped.startswith("class "):
            is_class = True

        if not is_function and not is_class:
            return line

        # print(f"LINE: {line}")
        # print(f"PREVIOUS LINE: {previous_line}")
        # print(f"COMMENT LINE: {comment_line}")

        if len(comment_line.strip()) and comment_line.startswith(self.comment_token):
            formatted_line = self.GetFormattedCommentedLine(comment_line)
        else:
            formatted_line = self.GetFormattedCommentedLine("", without_original=True)

        # Get block params
        if is_function:
            self.current_block_params = prev_stripped.split("(")[1].split(")")[0].split(",")

        elif is_class:
            for num in self.iter_limit_range:
                if num < 1:
                    continue

                next_index = index + num

                try:
                    next_line = self.source_code[next_index]
                except:
                    break

                if "def __init__(" in next_line:
                    self.current_block_params = next_line.strip().split("(")[1].split(")")[0].split(",")
                    break

        if "self" in self.current_block_params:
            self.current_block_params.remove("self")

        self.params_with_defaults = {bp.split("=")[0].strip(): bp.split("=")[1].strip() for bp in self.current_block_params if "=" in bp}
        self.current_block_params = [p.split("=")[0].strip() if "=" in p else p.strip() for p in self.current_block_params if len(p)]

        # Synthesize docstring if missing
        if not startswith:
            indent = ' ' * self.GetIndentSpaces(line)

            for docstring_line in reversed(self.SynthesizeDocstring()):
                if len(docstring_line):
                    generated_docstring_lines.append(f"{indent}{docstring_line}")
                else:
                    generated_docstring_lines.append(docstring_line)

        if self.incomplete_docstring_comment not in comment_line:

            # Get docstring end index
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
            for block_line in reversed(self.source_code[index:(self.current_block_end_index + 1)]):
                if block_line.strip().startswith("return") and len(block_line.split("return")[1].strip()):
                    self.block_return = block_line.split("return")[1].strip()
                    break

            # Determine missing/incomplete components
            if len(generated_docstring_lines):
                iterate_lines = generated_docstring_lines
            else:
                iterate_lines = self.source_code[index:(docstring_end_index + index_buffer)]

            # print(f"\nEXISTING DOCSTRING: {iterate_lines}")

            for docstring_line in iterate_lines:
                cleaned_line = docstring_line.replace("'''", "").replace('"""', "")\
                    .replace(self.doc_auto_gen_tag, "").strip()

                if len(cleaned_line) and not cleaned_line.startswith(":"):
                    # print(f"\tCLEANED: {cleaned_line}")
                    includes_description = True

                if len(self.block_return) and ":return:" in cleaned_line:
                    includes_return = True

                    if not len(cleaned_line.split(":return:")[1].strip()):
                        incomplete_docstring_components.append("return")

                if cleaned_line.startswith(":param"):
                    for param in self.current_block_params:
                        if f"{param}:" in cleaned_line and param not in included_params:
                            included_params.append(param)

                            if not len(cleaned_line.split(f"{param}:")[1].strip()):
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
                    for component in missing_docstring_components:
                        if component == "return" and generated_line.strip().startswith(":return"):
                            missing_docstring_components.remove("return")

                            if generated_line.strip() == ":return:" and "return" not in incomplete_docstring_components:
                                incomplete_docstring_components.append("return")

                        elif component == "description" and generated_line.strip() == self.doc_auto_gen_tag:
                            missing_docstring_components.remove("description")

                            if "description" not in incomplete_docstring_components:
                                incomplete_docstring_components.append("description")

                        elif f"{component}:" in generated_line:
                            call = f":param {component}:"

                            missing_docstring_components.remove(component)

                            if (call in generated_line or not len(generated_line.split(call)[-1].strip())) \
                                    and component not in incomplete_docstring_components:
                                incomplete_docstring_components.append(component)

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

        # TODO: Add another portion to the incomplete docstring checks that makes sure params have type
        #  declarations and default value tags if they have default values,
        #  and that each line like param and return and var have a description
        #  (accounting for extra text such as the default value declaration and not counting that as part of the description)
        #  and that there's a line break after the main description

        # TODO: (Maybe) replace any instance of ''' docstring syntax with """ ?

        # Insert newly synthesized lines
        if len(generated_docstring_lines):
            for docstring_line in generated_docstring_lines:
                self.source_code.insert(index, docstring_line)

        # Insert final comment
        if len(final_comment):
            # print(f"FINAL: {previous_line}")
            if comment_line.strip().startswith(self.comment_token):
                self.source_code[comment_index] = f"{formatted_line} {final_comment}"

            else:
                self.source_code.insert(previous_index,
                                        f"{' ' * self.GetIndentSpaces(previous_line)}"
                                        f"{formatted_line.lstrip()} {final_comment}")

        # Add line break after existing single-line docstring if missing
        if docstring_end_index == index and len(stripped) > 6 and startswith and endswith:
            if len(self.source_code[index + 1].strip()):
                self.source_code.insert(index + 1, "")

        return line

    def SynthesizeDocstring(self):
        # """
        # Creates a list of newly synthesized docstring lines, in order.
        # :return: list of docstring lines
        # """

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

    def docstring_example(self, param1, param2=None):
        """
        This is an ideal function docstring example.
        All docstrings should include a description first, like this,
        followed by params and return descriptions, if applicable.
        For each param, you must also specify the type, as seen below.

        :param str param1: any test variable
        :param int param2: any test variable (Default value = None)
        :return: Tuple of param1, param2    <- return is not applicable in this example function
        """

        pass
