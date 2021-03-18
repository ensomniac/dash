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

    # TODO: Convert all params being passed around to self attrs
    def AddDocstringsAndFlags(self, index, line):
        is_class = False
        is_function = False
        comment_index = index - 2
        previous_index = index - 1
        line, stripped = self.conform_docstring_quotation_format(line, index)
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

        self.set_current_block_params(is_function, is_class, index, stripped, prev_stripped)

        ds_end_index, index_buffer = self.get_docstring_end_index(startswith, endswith, stripped, index)

        self.set_current_block_end_index(index)
        self.set_current_block_return_value(index)

        generated_ds_lines = self.get_missing_docstring(startswith, line)

        missing_params, included_params, missing_ds_components, incomplete_ds_components, iterate_ds_lines = \
            self.determine_missing_incomplete_components(index, ds_end_index, index_buffer, generated_ds_lines)

        incomplete_ds_components, missing_ds_components = \
            self.filter_out_generated_missing_incomplete_components(generated_ds_lines,
                                                                    incomplete_ds_components,
                                                                    missing_ds_components)

        if len(self.params_with_defaults) and iterate_ds_lines != generated_ds_lines:
            self.add_missing_default_value_tags(iterate_ds_lines)
            # iterate_ds_lines = self.add_missing_default_value_tags(iterate_ds_lines)

        if len(missing_ds_components) and not len(generated_ds_lines):
            ds_end_index, missing_ds_components, incomplete_ds_components = \
                self.insert_missing_components_to_existing_docstring(line, index, ds_end_index,
                                                                     missing_ds_components, incomplete_ds_components)

        ds_end_index = self.insert_newly_synthesized_docstring_lines(index, ds_end_index, generated_ds_lines)

        final_comment = self.compose_final_comment(missing_ds_components, incomplete_ds_components)

        # Insert final comment
        if len(final_comment):
            if com_stripped.startswith(self.comment_token):
                self.source_code[comment_index] = f"{formatted_line} {final_comment}"

            else:
                self.source_code.insert(previous_index,
                                        f"{' ' * self.GetIndentSpaceCount(previous_line)}"
                                        f"{formatted_line.lstrip()} {final_comment}")
                index += 1
                ds_end_index += 1

        if not len(generated_ds_lines):
            self.make_final_adjustments_to_existing_docstrings(index, ds_end_index, line, startswith, endswith)
            # index, ds_end_index = self.make_final_adjustments_to_existing_docstrings(index, ds_end_index, line, startswith, endswith)

        return line

    def insert_newly_synthesized_docstring_lines(self, index, ds_end_index, generated_lines):
        if len(generated_lines):
            for docstring_line in generated_lines:
                self.source_code.insert(index, docstring_line)

            ds_end_index = index + len(generated_lines)

        return ds_end_index

    def compose_final_comment(self, missing_comps, incomplete_comps):
        final_comment = ""

        if len(missing_comps) or len(incomplete_comps):
            final_comment = f"{self.incomplete_docstring_comment} - "

            if len(missing_comps):
                final_comment += f"Missing: {', '.join(missing_comps)}"

            if len(incomplete_comps):
                if "Missing: " in final_comment:
                    final_comment += " | "

                final_comment += "Incomplete"

                if "description" not in incomplete_comps \
                        and "return" not in incomplete_comps:
                    final_comment += " (needs type and/or desc)"

                final_comment += f": {', '.join(incomplete_comps)}"

        return final_comment

    def make_final_adjustments_to_existing_docstrings(self, index, ds_end_index, line, startswith, endswith):
        # Single-line docstrings
        if ds_end_index == index:

            # Insert line break after docstring, if missing
            if len(line.strip()) > 6 and startswith and endswith and len(self.source_code[index + 1].strip()):
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
            if ds_end_index == index:
                current_indent = " " * self.GetIndentSpaceCount(line)
                self.source_code[index] = f'{current_indent}"""'
                self.source_code.insert(index, current_indent + line.strip().replace('"""', ""))
                self.source_code.insert(index, f'{current_indent}"""')
                ds_end_index += 2

        # Multi-line docstrings
        else:
            # Insert line break after description, if missing
            if len(self.source_code[index + 2]) and (index + 2) != ds_end_index:
                self.source_code.insert(index + 2, "")
                ds_end_index += 1

            # Insert line break after docstring, if missing
            if len(self.source_code[ds_end_index + 1].strip()):
                self.source_code.insert(ds_end_index + 1, "")

        return index, ds_end_index

    def conform_docstring_quotation_format(self, line, index):
        stripped = line.strip()

        if stripped.startswith("'''") or stripped.endswith("'''"):
            line = line.replace("'''", '"""')
            stripped = line.strip()
            self.source_code[index] = line

        return line, stripped

    def determine_missing_incomplete_components(self, index, ds_end_index, index_buffer, generated_lines):
        missing_params = []
        included_params = []
        includes_desc = False
        missing_components = []
        includes_return = False
        incomplete_components = []

        if len(generated_lines):
            iterate_ds_lines = generated_lines
        else:
            iterate_ds_lines = self.source_code[index:(ds_end_index + index_buffer)]

        for docstring_line in iterate_ds_lines:
            cleaned_line = docstring_line.replace("'''", "").replace('"""', "")\
                .replace(self.doc_auto_gen_tag, "").strip()

            if len(cleaned_line) and not cleaned_line.startswith(":"):
                includes_desc = True

            if len(self.block_return) and ":return:" in cleaned_line:
                includes_return = True

                if not len(cleaned_line.split(":return:")[1].strip()):
                    incomplete_components.append("return")

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
                            incomplete_components.append(param)

        for param in self.current_block_params:
            if param not in included_params:
                missing_params.append(param)

        if not includes_desc:
            missing_components.append("description")

        for param in missing_params:
            missing_components.append(param)

        if len(self.block_return) and not includes_return:
            missing_components.append("return")

        return missing_params, included_params, missing_components, incomplete_components, iterate_ds_lines

    def reset_docstring_attrs(self, line_index):
        self.block_return = ""
        self.current_block_params = []
        self.params_with_defaults = {}
        self.current_docstring_index = line_index
        self.current_block_end_index = line_index

    def set_current_block_params(self, is_function, is_class, line_index, strip_line, prev_strip_line):
        if is_function:
            self.current_block_params = prev_strip_line.split("(")[1].split(")")[0].split(",")

        elif is_class:
            for num in self.iter_limit_range:
                init = "def __init__("

                if strip_line.startswith(init):
                    break

                if num < 1:
                    continue

                next_index = line_index + num

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

    def get_docstring_end_index(self, startswith, endswith, strip_line, line_index):
        index_buffer = 1
        ds_end_index = line_index

        if startswith \
                and (len(strip_line) == 3 and (strip_line == "'''" or strip_line == '"""')) \
                or (len(strip_line) > 3 and startswith and not endswith):

            for num in self.iter_limit_range:
                if num < 1:
                    continue

                next_index = line_index + num
                next_line = self.source_code[next_index]

                if "'''" in next_line or '"""' in next_line:
                    ds_end_index = next_index
                    break

            if ds_end_index == line_index:
                index_buffer = 2

        return ds_end_index, index_buffer

    def set_current_block_end_index(self, line_index):
        for num in self.iter_limit_range:
            if num < 1:
                continue

            next_index = line_index + num

            try:
                next_line = self.source_code[next_index]
            except:
                break

            strip = next_line.strip()

            if strip.startswith("def ") or strip.startswith("class "):
                break

            if len(strip):
                self.current_block_end_index = next_index

    def set_current_block_return_value(self, line_index):
        for block_line in reversed(self.source_code[line_index:(self.current_block_end_index + 1)]):
            if block_line.strip().startswith("return") and len(block_line.split("return")[1].strip()):
                try:
                    self.block_return = block_line.split("return ")[1].strip()
                except:
                    pass
                break

    def get_missing_docstring(self, startswith, line):
        generated_ds_lines = []

        if not startswith:
            indent = " " * self.GetIndentSpaceCount(line)

            for docstring_line in reversed(self.synthesize_docstring()):
                if len(docstring_line):
                    generated_ds_lines.append(f"{indent}{docstring_line}")
                else:
                    generated_ds_lines.append(docstring_line)

        return generated_ds_lines

    def filter_out_generated_missing_incomplete_components(self, generated_ds_lines, incomplete_comps, missing_comps):
        if len(generated_ds_lines):
            for generated_line in generated_ds_lines:
                default = ": (default="
                gen_strip = generated_line.strip()

                if default in generated_line and gen_strip.endswith(")"):
                    param = generated_line.split(default)[0].split(" ")[-1].strip()

                    if param not in incomplete_comps:
                        incomplete_comps.append(param)

                for component in missing_comps:
                    if component == "return" and gen_strip.startswith(":return"):
                        missing_comps.remove("return")

                        if gen_strip == ":return:" and "return" not in incomplete_comps:
                            incomplete_comps.append("return")

                    elif component == "description" and gen_strip == self.doc_auto_gen_tag:
                        missing_comps.remove("description")

                        if "description" not in incomplete_comps:
                            incomplete_comps.append("description")

                    elif f"{component}:" in generated_line:
                        call = f":param {component}:"

                        missing_comps.remove(component)

                        if (call in generated_line or not len(generated_line.split(call)[-1].strip())) \
                                and component not in incomplete_comps:
                            incomplete_comps.append(component)

        incomplete_comps, missing_comps = \
            self.prioritize_desc_return_in_final_comment_list(incomplete_comps, missing_comps)

        return incomplete_comps, missing_comps

    def prioritize_desc_return_in_final_comment_list(self, incomplete_comps, missing_comps):
        for component_list in [missing_comps, incomplete_comps]:
            for component_str in ["return", "description"]:
                if component_str in component_list:
                    component_list.insert(0, component_list.pop(component_list.index(component_str)))

        return incomplete_comps, missing_comps

    def add_missing_default_value_tags(self, iterate_lines):
        for source_index, source_line in enumerate(self.source_code):
            if source_line in iterate_lines \
                    and source_line.strip().startswith(":param") \
                    and "(default=" not in source_line:

                param = source_line.strip().replace(":param", "").split(":")[0].split(" ")[-1].strip()

                if param in self.params_with_defaults and self.params_with_defaults.get(param):
                    default_tag = f" (default={self.params_with_defaults[param]})"

                    self.source_code[source_index] += default_tag
                    iterate_lines[iterate_lines.index(source_line)] += default_tag

        return iterate_lines

    def insert_missing_components_to_existing_docstring(self, line, index, ds_end_index,
                                                        missing_comps, incomplete_comps):
        ds_indent = " " * self.GetIndentSpaceCount(line)
        missing_ds_components_adjusted = [c for c in missing_comps if c != "description"]

        if "return" in missing_ds_components_adjusted:
            missing_ds_components_adjusted.append(missing_ds_components_adjusted
                                                  .pop(missing_ds_components_adjusted.index("return")))
        if len(missing_ds_components_adjusted):

            # If single-line, convert it to multi-line
            if ds_end_index == index:
                self.source_code[index] = f'{ds_indent}"""'
                self.source_code.insert(index, ds_indent + line.strip().replace('"""', ""))
                self.source_code.insert(index, f'{ds_indent}"""')
                ds_end_index += 2

            if len(self.source_code[ds_end_index - 1].strip()):
                self.source_code.insert(ds_end_index, "")
                ds_end_index += 1

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

                self.source_code.insert(ds_end_index, new_line)
                ds_end_index += 1
                missing_comps.remove(m_component)

                if incomplete and m_component not in incomplete_comps:
                    incomplete_comps.append(m_component)

        return ds_end_index, missing_comps, incomplete_comps

    def synthesize_docstring(self):
        """
        Creates a list of newly synthesized docstring lines, in order.
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
