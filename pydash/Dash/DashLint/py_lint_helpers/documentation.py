# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com 

import os
import sys

# Note: Some of this functionality may end up being able to be shared with JSLint,
# however, I'm currently uncertain of that, so it will be made separate for now.


class PyDoc:
    source_code: list
    comment_token: str
    comment_prefix: str
    iter_limit_range: range
    GetIndentSpaceCount: callable
    GetFormattedCommentedLine: callable

    def __init__(self):
        super().__init__()

        self.block_return = ""
        self.final_comment = ""
        self.index_ds_buffer = 1
        self.ds_end_index = None
        self.ds_ends_with = False
        self.iterate_ds_lines = []
        self.missing_ds_params = []
        self.block_is_class = False
        self.ds_starts_with = False
        self.included_ds_params = []
        self.generated_ds_lines = []
        self.current_block_params = []
        self.params_with_defaults = {}
        self.block_is_function = False
        self.synthesized_docstring = []
        self.missing_ds_components = []
        self.current_block_end_index = 0
        self.incomplete_ds_components = []
        self.add_multiple_return_possibilities_tag = False
        self.doc_auto_gen_tag = "(DashLint auto-generated docstring)"
        self.multiple_return_possibilities_tag = "(more than one return possibility)"

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
        | - The main description (this block) should be separated from the params etc. by a single line break.
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

    def AddDocstringsAndFlags(self, index, line):
        comment_index = index - 2
        previous_index = index - 1
        line, stripped = self.conform_docstring_quotation_format(line, index)

        self.reset_docstring_attrs(index)
        self.conform_docstring_return_syntax()

        self.ds_ends_with = stripped.endswith("'''") or stripped.endswith('"""')
        self.ds_starts_with = stripped.startswith("'''") or stripped.startswith('"""')

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
            self.block_is_function = True
        elif prev_stripped.startswith("class "):
            self.block_is_class = True

        if not self.block_is_function and not self.block_is_class:
            return line

        if len(com_stripped) and com_stripped.startswith(self.comment_token):
            formatted_line = self.GetFormattedCommentedLine(comment_line)
        else:
            formatted_line = self.GetFormattedCommentedLine("", without_original=True)

        self.get_current_block_params(index, stripped, prev_stripped)

        self.ds_end_index = index

        if (
            (self.ds_starts_with and (len(stripped) == 3 and (stripped == "'''" or stripped == '"""')))
            or (len(stripped) > 3 and self.ds_starts_with and not self.ds_ends_with)
        ):
            self.get_docstring_end_index(index)

        self.get_current_block_end_index(index)
        self.get_current_block_return_value(index)
        self.get_missing_docstring(line, index)
        self.determine_missing_incomplete_components(index)
        self.filter_out_generated_missing_incomplete_components()

        if len(self.params_with_defaults) and self.iterate_ds_lines != self.generated_ds_lines:
            self.add_missing_default_value_tags_to_existing_docstring()

        if len(self.missing_ds_components) and not len(self.generated_ds_lines):  # TODO: need to add default tag too
            self.insert_missing_components_to_existing_docstring(line, index)

        self.insert_newly_synthesized_docstring_lines(index)
        self.compose_final_comment()

        # Insert final comment
        if len(self.final_comment):
            if com_stripped.startswith(self.comment_token):
                self.source_code[comment_index] = f"{formatted_line} {self.final_comment}"

            else:
                self.source_code.insert(previous_index,
                                        f"{' ' * self.GetIndentSpaceCount(previous_line)}"
                                        f"{formatted_line.lstrip()} {self.final_comment}")
                index += 1
                self.ds_end_index += 1

        if not len(self.generated_ds_lines):
            index = self.make_final_adjustments_to_existing_docstrings(index, line)

        self.make_final_adjustments_to_all_docstrings(index)

        return line

    def make_final_adjustments_to_all_docstrings(self, index):
        # Add multiple returns possibilities tag
        if self.add_multiple_return_possibilities_tag:
            for num in self.iter_limit_range:
                prev_index = self.ds_end_index - num

                if prev_index < index:
                    break

                if self.source_code[prev_index].strip().startswith(":return:"):
                    self.source_code[prev_index] = f"{self.source_code[self.ds_end_index - num]} {self.multiple_return_possibilities_tag}"

                    break

    def conform_docstring_return_syntax(self):
        for source_index, source_line in enumerate(self.source_code):
            if source_line.strip().startswith(":returns:"):
                self.source_code[source_index] = source_line.replace(":returns:", ":return:")

    def insert_newly_synthesized_docstring_lines(self, index):
        if len(self.generated_ds_lines):
            for docstring_line in self.generated_ds_lines:
                self.source_code.insert(index, docstring_line)

            self.ds_end_index = index + len(self.generated_ds_lines)

    def compose_final_comment(self):
        if not len(self.missing_ds_components) and not len(self.incomplete_ds_components):
            return

        self.final_comment = f"{self.incomplete_docstring_comment} - "

        if len(self.missing_ds_components):
            self.final_comment += f"Missing: {', '.join(self.missing_ds_components)}"

        if len(self.incomplete_ds_components):
            if "Missing: " in self.final_comment:
                self.final_comment += " | "

            self.final_comment += "Incomplete"

            if (
                "description" not in self.incomplete_ds_components
                and "return" not in self.incomplete_ds_components
            ):
                self.final_comment += " (needs type and/or desc)"

            self.final_comment += f": {', '.join(self.incomplete_ds_components)}"

    def make_final_adjustments_to_existing_docstrings(self, index, line):
        line_indent = " " * self.GetIndentSpaceCount(line)
        strip = line.strip()

        # Single-line docstrings
        if self.ds_end_index == index:

            # Insert line break after docstring, if missing
            if (
                len(strip) > 6
                and self.ds_starts_with
                and self.ds_ends_with
                and len(self.source_code[index + 1].strip())
            ):
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
            if self.ds_end_index == index:
                self.source_code[index] = f'{line_indent}"""'
                self.source_code.insert(index, line_indent + strip.replace('"""', ""))
                self.source_code.insert(index, f'{line_indent}"""')
                self.ds_end_index += 2

        # Multi-line docstrings
        else:
            # Drop description if on same line as starting quotes
            if strip.startswith('"""') and len(strip) > 3:
                self.source_code[index] = f"{line_indent}{strip[:3]}"
                self.source_code.insert(index + 1, f"{line_indent}{strip[3:].strip()}")
                self.ds_end_index += 1

            # Insert line break after description, if missing
            if len(self.source_code[index + 2]) and (index + 2) != self.ds_end_index:
                self.source_code.insert(index + 2, "")
                self.ds_end_index += 1

            # Remove line break inside end of docstring, if present
            if not len(self.source_code[self.ds_end_index - 1].strip()):
                self.source_code.pop(self.ds_end_index - 1)
                self.ds_end_index -= 1

            # Insert line break after docstring, if missing
            if len(self.source_code[self.ds_end_index + 1].strip()):
                self.source_code.insert(self.ds_end_index + 1, "")
                # Don't +1 to self.ds_end_index here!

        return index

    def conform_docstring_quotation_format(self, line, index):
        stripped = line.strip()

        if stripped.startswith("'''") or stripped.endswith("'''"):
            line = line.replace("'''", '"""')
            stripped = line.strip()
            self.source_code[index] = line

        return line, stripped

    def determine_missing_incomplete_components(self, index):
        includes_desc = False
        includes_return = False
        includes_rtype = False

        if len(self.generated_ds_lines):
            self.iterate_ds_lines = self.generated_ds_lines
        else:
            self.iterate_ds_lines = self.source_code[index:(self.ds_end_index + self.index_ds_buffer)]

        for docstring_line in self.iterate_ds_lines:
            cleaned_line = docstring_line.replace(
                "'''", ""
            ).replace(
                '"""', ""
            ).replace(
                self.doc_auto_gen_tag, ""
            ).strip()

            if len(cleaned_line) and not cleaned_line.startswith(":"):
                includes_desc = True

            if len(self.block_return) and ":return:" in cleaned_line:
                includes_return = True

                if not len(cleaned_line.split(":return:")[1].strip()):
                    self.incomplete_ds_components.append("return")

            if len(self.block_return) and ":rtype:" in cleaned_line:
                includes_rtype = True

                if not len(cleaned_line.split(":rtype:")[1].strip()):
                    self.incomplete_ds_components.append("rtype")

            if cleaned_line.startswith(":param"):
                for param in self.current_block_params:
                    if f"{param}:" in cleaned_line and param not in self.included_ds_params:
                        self.included_ds_params.append(param)
                        split = cleaned_line.split(f"{param}:")

                        # Param missing description or missing type declaration
                        if (
                            not len(split[1].strip())
                            or (
                                "(default=" in split[1].strip()
                                and not len(split[1].split("(default=")[0].strip())
                            )
                            or not len(split[0].split(":param")[1].strip())
                        ):
                            self.incomplete_ds_components.append(param)

        for param in self.current_block_params:
            if param not in self.included_ds_params:
                self.missing_ds_params.append(param)

        if not includes_desc:
            self.missing_ds_components.append("description")

        for param in self.missing_ds_params:
            self.missing_ds_components.append(param)

        if len(self.block_return):
            if not includes_return:
                self.missing_ds_components.append("return")
            if not includes_rtype:
                self.missing_ds_components.append("rtype")

    def reset_docstring_attrs(self, line_index):
        self.block_return = ""
        self.final_comment = ""
        self.index_ds_buffer = 1
        self.ds_end_index = None
        self.ds_ends_with = False
        self.iterate_ds_lines = []
        self.missing_ds_params = []
        self.block_is_class = False
        self.ds_starts_with = False
        self.included_ds_params = []
        self.generated_ds_lines = []
        self.current_block_params = []
        self.params_with_defaults = {}
        self.block_is_function = False
        self.synthesized_docstring = []
        self.missing_ds_components = []
        self.incomplete_ds_components = []
        self.current_block_end_index = line_index
        self.add_multiple_return_possibilities_tag = False

    def get_current_block_params(self, line_index, strip_line, prev_strip_line):
        if self.block_is_function:
            self.current_block_params = prev_strip_line.split("(")[1].split(")")[0].split(",")

        elif self.block_is_class:
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

    def get_docstring_end_index(self, line_index):
        for num in self.iter_limit_range:
            if num < 1:
                continue

            next_index = line_index + num
            next_line = self.source_code[next_index]

            if "'''" in next_line or '"""' in next_line:
                self.ds_end_index = next_index
                break

        if self.ds_end_index == line_index:
            self.index_ds_buffer = 2

    def get_current_block_end_index(self, line_index):
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

    def get_current_block_return_value(self, line_index):
        return_statements = 0
        last_return_found = False

        for block_line in reversed(self.source_code[line_index:(self.current_block_end_index + 1)]):

            # Ryan - the space in "return " below is intentional, please don't change.
            # If it is triggering an error, please give me the details, so I
            # can debug that fringe case and rework this if needed, thanks!
            if block_line.strip().startswith("return ") and len(block_line.split("return ")[1].strip()):
                return_statements += 1

                if last_return_found:
                    continue
                try:
                    self.block_return = block_line.split("return ")[1].strip()

                    comment_stub = f"{self.comment_token} {self.comment_prefix}"

                    if comment_stub in self.block_return:
                        self.block_return = self.block_return.split(comment_stub)[0].rstrip()

                    if self.block_return and self.block_return.startswith("self.SetResponse"):
                        self.block_return = "response"

                    last_return_found = True
                except:
                    pass

        if last_return_found and len(self.block_return) and return_statements > 1:
            # self.block_return += f" {self.multiple_return_possibilities_tag}"
            self.add_multiple_return_possibilities_tag = True

    def get_missing_docstring(self, line, line_index):
        if not self.ds_starts_with:
            indent = " " * self.GetIndentSpaceCount(line)

            for docstring_line in reversed(self.synthesize_docstring(line_index)):
                if len(docstring_line):
                    self.generated_ds_lines.append(f"{indent}{docstring_line}")
                else:
                    self.generated_ds_lines.append(docstring_line)

    def filter_out_generated_missing_incomplete_components(self):
        if not len(self.generated_ds_lines):
            self.prioritize_desc_return_in_final_comment_list()
            return

        for generated_line in self.generated_ds_lines:
            default = ": (default="
            gen_strip = generated_line.strip()

            if default in generated_line and gen_strip.endswith(")"):
                param = generated_line.split(default)[0].split(" ")[-1].strip()

                if param not in self.incomplete_ds_components:
                    self.incomplete_ds_components.append(param)

            for component in self.missing_ds_components:
                if component == "return" and gen_strip.startswith(":return"):
                    self.missing_ds_components.remove("return")

                    if gen_strip == ":return:" and "return" not in self.incomplete_ds_components:
                        self.incomplete_ds_components.append("return")

                elif component == "description" and gen_strip == self.doc_auto_gen_tag:
                    self.missing_ds_components.remove("description")

                    if "description" not in self.incomplete_ds_components:
                        self.incomplete_ds_components.append("description")

                elif f"{component}:" in generated_line:
                    call = f":param {component}:"

                    self.missing_ds_components.remove(component)

                    if (
                        (call in generated_line or not len(generated_line.split(call)[-1].strip()))
                        and component not in self.incomplete_ds_components
                    ):
                        self.incomplete_ds_components.append(component)

        self.prioritize_desc_return_in_final_comment_list()

    def prioritize_desc_return_in_final_comment_list(self):
        for component_list in [self.missing_ds_components, self.incomplete_ds_components]:
            for component_str in ["rtype", "return", "description"]:
                if component_str in component_list:
                    component_list.insert(0, component_list.pop(component_list.index(component_str)))

    def add_missing_default_value_tags_to_existing_docstring(self):
        for source_index, source_line in enumerate(self.source_code):
            if (
                source_line in self.iterate_ds_lines
                and source_line.strip().startswith(":param")
                and "(default=" not in source_line
            ):
                param = source_line.strip().replace(":param", "").split(":")[0].split(" ")[-1].strip()

                if param in self.params_with_defaults and self.params_with_defaults.get(param):
                    default_tag = f" (default={self.params_with_defaults[param]})"

                    self.source_code[source_index] += default_tag
                    self.iterate_ds_lines[self.iterate_ds_lines.index(source_line)] += default_tag

    def insert_missing_components_to_existing_docstring(self, line, index):
        ds_indent = " " * self.GetIndentSpaceCount(line)
        missing_ds_comps_adj = [c for c in self.missing_ds_components if c != "description"]

        for keyword in ["return", "rtype"]:
            if keyword in missing_ds_comps_adj:
                missing_ds_comps_adj.append(missing_ds_comps_adj.pop(missing_ds_comps_adj.index(keyword)))

        if not len(missing_ds_comps_adj):
            return

        self.convert_single_line_docstring_to_multi_line(line, index, ds_indent)

        previous_ds_line = self.source_code[self.ds_end_index - 1].strip()

        if len(previous_ds_line) and not previous_ds_line.startswith(":"):
            self.source_code.insert(self.ds_end_index, "")
            self.ds_end_index += 1

        for m_component in missing_ds_comps_adj:
            incomplete = True

            if m_component == "return":
                if len(self.block_return):
                    new_line = f"{ds_indent}:return: {self.block_return}"
                    incomplete = False
                else:
                    new_line = f"{ds_indent}:return:"

            elif m_component == "rtype":
                param_type = self.attempt_to_determine_type(self.block_return, index, self.current_block_end_index)

                if len(param_type):
                    new_line = f"{ds_indent}:rtype: {param_type}"
                    incomplete = False
                else:
                    new_line = f"{ds_indent}:rtype:"

            else:
                new_line = f"{ds_indent}:param {m_component}:"

            if m_component in self.params_with_defaults and self.params_with_defaults.get(m_component):
                new_line += f" (default={self.params_with_defaults[m_component]})"

            if ":param" in new_line:
                for num in self.iter_limit_range:
                    if num < 1:
                        continue

                    prev_line = self.source_code[self.ds_end_index - num]

                    if ":return:" in prev_line or ":rtype:" in prev_line:
                        continue

                    self.source_code.insert((self.ds_end_index - num) + 1, new_line)
                    break
            else:
                # Might need a similar thing as above at some point to ensure return and rtype are inserted in order
                self.source_code.insert(self.ds_end_index, new_line)

            self.ds_end_index += 1
            self.missing_ds_components.remove(m_component)

            if incomplete and m_component not in self.incomplete_ds_components:
                self.incomplete_ds_components.append(m_component)

    def convert_single_line_docstring_to_multi_line(self, line, index, indent):
        if self.ds_end_index == index:
            self.source_code[index] = f'{indent}"""'
            self.source_code.insert(index, indent + line.strip().replace('"""', ""))
            self.source_code.insert(index, f'{indent}"""')
            self.ds_end_index += 2

    def synthesize_docstring(self, current_line_index):
        """
        Creates a list of newly synthesized docstring lines, in order.
        :return: list of synthesized docstring lines
        :rtype: list
        """

        self.synthesized_docstring = []
        self.synthesized_docstring.append('"""')
        self.synthesized_docstring.append(self.doc_auto_gen_tag)
        self.synthesized_docstring.append("")

        self.evaluate_params(current_line_index)

        if len(self.block_return):
            self.synthesized_docstring.append(f":return: {self.block_return}")

            param_type = self.attempt_to_determine_type(self.block_return, current_line_index,
                                                        self.current_block_end_index)
            if len(param_type):
                self.synthesized_docstring.append(f":rtype: {param_type}")
            else:
                self.synthesized_docstring.append(f":rtype:")

        self.synthesized_docstring.append('"""')
        self.synthesized_docstring.append("")

        if len(self.synthesized_docstring) == 5:
            self.synthesized_docstring.pop(2)

        return self.synthesized_docstring

    def evaluate_params(self, line_index):
        for param in self.current_block_params:
            line = ":param "
            param_type = self.attempt_to_determine_type(param, line_index,
                                                        self.current_block_end_index)
            if len(param_type):
                line += f"{param_type} "

            line += f"{param}:"

            if param in self.params_with_defaults and self.params_with_defaults.get(param):
                line += f" (default={self.params_with_defaults[param]})"

            self.synthesized_docstring.append(line)

    def attempt_to_determine_type(self, param, start_index, end_index):
        value = ""

        for block_line in self.source_code[start_index:(end_index + 1)]:
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
            param_type = self.check_value_for_type(value)
        else:
            param_type = self.check_value_for_type(param)

        if not param_type and param == "response":
            param_type = "dict"

        return param_type

    def check_value_for_type(self, value):
        value = str(value)
        param_type = ""

        try:
            int(value)

            return "int"
        except:
            pass

        if value.count(".") == 1 and not value.startswith(".") and not value.endswith("."):
            try:
                float(value)

                return "float"
            except:
                pass

        if (value.startswith('"') or value.startswith("'")) and (value.endswith('"') or value.endswith("'")):
            param_type = "str"

        elif value.startswith("[") and value.endswith("]"):
            param_type = "list"

        elif value.startswith("{") and value.endswith("}"):
            param_type = "dict"

        elif value == "False" or value == "True":
            param_type = "bool"

        elif value == "None":
            param_type = "NoneType"

        # This check has to be last
        elif value.startswith("(") and value.endswith(")") or value.count(", ") >= 1:
            param_type = "tuple"

        return param_type
