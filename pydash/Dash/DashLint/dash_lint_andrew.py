#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

# from Dash import Context
from datetime import datetime


class Lint:
    def __init__(self, code_path):
        self.code_path = code_path
        self.source_code = open(self.code_path).read().split("\n")
        self.iter_limit_range = range(0, 101)
        self.starts_with_keyword = ""
        self.line_break_quantity = 1
        self.group = False
        self.exception = ""
        self.shebang = "#!/usr/bin/python"
        self.comment_prefix = "(Dash Lint)"
        self.line_length_flag_suffix = "(excluding comments)"
        self.individual_line_length_max = 100  # This is a bit arbitrary/undecided for now
        self.total_line_length_max = 500  # This is a bit arbitrary/undecided for now

        # Any comment strings like the MUST end in '_comment'
        self.super_comment = "TODO: Convert to super()"
        self.path_comment = "This may include a hard-coded path - use 'os.path.join()' instead"
        self.individual_line_length_comment = f"Line length exceeds {self.individual_line_length_max}"
        self.total_line_length_comment = f"File's total line count exceeds {self.total_line_length_max}"
        self.missing_docstring_comment = "TODO: Missing Docstring"
        self.incomplete_docstring_comment = "TODO: Incomplete Docstring"

        # The above comment options are compiled in to a list used when checking for invalid/outdated comments
        self.all_comment_options = self.get_all_current_comment_options()

        # self.dash_context = Context.Get()  # Hook up
        self.include_shebang = True  # This needs to be determined from dash context somehow, maybe see if cgi is in path etc
        self.company_name = "Altona"  # This needs to come from dash context (display name I think)

        self.code_authors = [  # This also will come from dash context in some form now
            "Ryan Martin (ryan@ensomniac.com)",
            "Andrew Stet (stetandrew@gmail.com)",
        ]

        self.debug = ""

    def Run(self):
        # CORE
        self.cleanup_comments_before_evaluating()
        self.remove_extra_lines_at_start_of_file()
        self.remove_extra_lines_at_end_of_file()
        self.remove_blank_lines_at_start_of_blocks()
        self.check_class_spacing()
        self.check_function_spacing()
        self.check_name_main_spacing()
        self.validate_shebang()
        self.validate_copyright()
        self.check_import_spacing()

        # EXTRAS
        self.conform_dict_creation()
        self.conform_list_creation()
        self.drop_one_line_ifs()
        self.format_block_spacing_into_columns()

        # FINAL / LAST
        self.add_flag_comments()
        self.write_linted_file()

        return self.compile_to_check_for_errors()

    def write_linted_file(self):
        # file = open(self.code_path, "w")
        # file.write("\n".join(self.source_code))
        # file.close()

        # While testing
        print(f"{'-'*100}\n" + '\n'.join(self.source_code) + f"{'-'*100}\n")

        if len(self.debug):
            print(f"\n\nDEBUG:\n{self.debug}")

    def compile_to_check_for_errors(self):
        try:
            compile(open(self.code_path, "r").read(), self.code_path, "exec")
            return True, ""
        except Exception as e:
            return False, e

    def add_flag_comments(self):
        for index, line in enumerate(self.source_code):
            if line.strip().startswith("#"):
                continue

            # This works for many different cases when wanting to add a trailing comment based on a keyword
            line = self.add_flags_by_keyword(index, line, self.get_formatted_commented_line(line), self.super_comment, "ApiCore.Init(")

            # This list of comment flag functions is flexible and should be added to as we go along
            line = self.add_path_flags(index, line, self.get_formatted_commented_line(line))
            line = self.add_individual_line_length_flags(index, line, self.get_formatted_commented_line(line))
            line = self.add_docstring_flags(index, line)

            # THOUGHT: convert line to self variable and create func to set line and set line in self.source_code?

        self.add_total_line_length_flag()

    def add_docstring_flags(self, index, line):
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
                formatted_line = self.get_formatted_commented_line("", True)
            else:
                formatted_line = self.get_formatted_commented_line(comment_line)

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
                if comment_line.strip().startswith("#"):
                    self.source_code[comment_index] = f"{formatted_line} {final_comment}"

                    if add_line_break_before_comment:
                        self.source_code.insert(comment_index, "")
                else:
                    self.source_code.insert(previous_index, f"{' ' * self.get_indent_spaces(previous_line)}{formatted_line.lstrip()} {final_comment}")

                    if add_line_break_before_comment:
                        self.source_code.insert(previous_index, "")

        return line

    def get_formatted_commented_line(self, line, without_original=False):
        if "#" in line:
            if self.comment_prefix in line:
                formatted_line = f"{line},"
            else:
                formatted_line = f"{line}, {self.comment_prefix}"
        else:
            if without_original:
                formatted_line = f"# {self.comment_prefix}"
            else:
                formatted_line = f"{line}  # {self.comment_prefix}"

        return formatted_line

    def cleanup_comments_before_evaluating(self):
        for index, line in enumerate(self.source_code):

            # This will preemptively remove existing comments that we currently check for
            line = self.remove_known_comments(index, line)

            if line.strip().startswith("#"):
                continue

            # This section of comment update functions is flexible and should be added to as we go along
            line = self.update_line_length_comments(index, line)

            # Final cleanup
            line = self.remove_empty_comments(index, line)

    def get_all_current_comment_options(self):
        comment_options = []

        for attr in self.__dict__:
            if attr.endswith("_comment"):
                comment_options.append(self.__dict__[attr])

        return comment_options

    def remove_known_comments(self, index, line):
        if "#" in line:
            line_comments = line.split("#")[1].strip()

            for comment in self.all_comment_options:
                if comment in line_comments:
                    line = line.split("#")[0].rstrip()
                    self.source_code[index] = line

        return line

    def update_line_length_comments(self, index, line):
        individual_line_length_comment_base = self.individual_line_length_comment.split(str(self.individual_line_length_max))[0].strip()

        if individual_line_length_comment_base in line:
            existing_line_length_max = line.split(individual_line_length_comment_base)[1].strip().split(" ")[0].strip()

            if not existing_line_length_max.startswith(str(self.individual_line_length_max)) or ("#" in line and len(line.split("#")[0].rstrip()) < self.individual_line_length_max):
                line = line.replace(individual_line_length_comment_base, "").replace(existing_line_length_max, "").replace(self.line_length_flag_suffix, "")
                self.source_code[index] = line

        return line

    def add_flags_by_keyword(self, index, line, formatted_line, comment, keyword):
        if keyword in line and comment not in line:
            line = f"{formatted_line} {comment}"
            self.source_code[index] = line

        return line

    def add_path_flags(self, index, line, formatted_line):
        if (line.count("'") >= 2 or line.count('"') >= 2) and line.count("/") >= 2 and "os.path.join" not in line and self.path_comment not in line:
            line = f"{formatted_line} {self.path_comment}"
            self.source_code[index] = line

        return line

    def add_individual_line_length_flags(self, index, line, formatted_line):
        comment = self.individual_line_length_comment

        if len(line) > self.individual_line_length_max and comment not in line:
            if "#" in formatted_line:
                if len(line.split("#")[0].rstrip()) < self.individual_line_length_max:
                    return line
                else:
                    comment += f" {self.line_length_flag_suffix}"

            line = f"{formatted_line} {comment}"
            self.source_code[index] = line

        return line

    def remove_empty_comments(self, index, line):
        if "#" in line and not len(line.split("#")[1].replace(self.comment_prefix, "").replace(",", "").strip()):
            line = line.split("#")[0].rstrip()
            self.source_code[index] = line

        return line

    def update_line_total_comment(self):
        index = -2
        line = self.source_code[index]
        total_line_length_comment_base = self.total_line_length_comment.split(str(self.total_line_length_max))[0].strip()

        if total_line_length_comment_base in line:
            existing_line_total_max = line.split(total_line_length_comment_base)[1].strip().split(" ")[0].strip()

            if not existing_line_total_max.startswith(str(self.total_line_length_max)) or len(self.source_code) < self.total_line_length_max:
                line = line.replace(total_line_length_comment_base, "").replace(existing_line_total_max, "").replace(self.line_length_flag_suffix, "")
                self.source_code[index] = line

        self.remove_empty_comments(index, line)
        self.remove_extra_lines_at_end_of_file()

    def add_total_line_length_flag(self):
        self.update_line_total_comment()

        full_comment = f"# {self.comment_prefix} {self.total_line_length_comment}"

        if len(self.source_code) > self.total_line_length_max and full_comment not in self.source_code:
            self.source_code.insert(-1, "")
            self.source_code.insert(-1, full_comment)

    def validate_shebang(self):
        shebang_index = None

        for index, line in enumerate(self.source_code):
            if line.strip() == self.shebang:
                shebang_index = index
                break

        if self.include_shebang and shebang_index is None:
            self.source_code.insert(0, self.shebang)

        elif not self.include_shebang and type(shebang_index) == int:
            self.source_code.pop(shebang_index)

    def validate_copyright(self):
        copyright_lines = [f"# {self.company_name} {datetime.now().year} {self.code_authors[0]}"]
        existing_copyright_indexes = []
        new_copyright_full = ""
        existing_copyright_full = ""

        for person in self.code_authors[1:]:
            copyright_lines.append(f"# {' ' * (len(self.company_name) + 5)} {person}")

        for index, line in enumerate(self.source_code):
            if line.startswith(f"#") and "20" in line and "@" in line and index < 10:
                existing_copyright_indexes.append(index)
                index_check = index

                for _ in self.iter_limit_range:
                    index_check += 1

                    if self.source_code[index_check].startswith("#"):
                        existing_copyright_indexes.append(index_check)
                    else:
                        break
                break

        copyright_lines_reversed = copyright_lines
        copyright_lines_reversed.reverse()

        if len(existing_copyright_indexes):
            for index in existing_copyright_indexes:
                existing_copyright_full += self.source_code[index]

            for line in copyright_lines:
                new_copyright_full += line

            if not existing_copyright_full == new_copyright_full:
                for _ in range(0, len(existing_copyright_indexes)):
                    self.source_code.pop(existing_copyright_indexes[0])

                for line in copyright_lines_reversed:
                    self.source_code.insert(existing_copyright_indexes[0], line)
        else:
            if self.include_shebang:
                if self.source_code[1].strip() == "#":
                    for line in copyright_lines_reversed:
                        self.source_code.insert(2, line)
                else:
                    copyright_lines_reversed.append("#")

                    for line in copyright_lines_reversed:
                        self.source_code.insert(1, line)
            else:
                for line in copyright_lines_reversed:
                    self.source_code.insert(0, line)

        if self.source_code[0] == "#":
            self.source_code.pop(0)

    def remove_extra_lines_at_start_of_file(self):
        for _ in self.iter_limit_range:
            if not len(self.source_code[0]):
                self.source_code.pop(0)
            else:
                break

    def remove_extra_lines_at_end_of_file(self):
        for _ in self.iter_limit_range:
            if not len(self.source_code[-1]) and not len(self.source_code[-2]):
                self.source_code.pop()
            else:
                break

    def remove_blank_lines_at_start_of_blocks(self):
        for keyword in ["def ", "class ", '__name__ == "__main__"']:
            finished = False

            for _ in self.iter_limit_range:
                if finished:
                    break

                finished = self.remove_block_line(keyword)

    def check_class_spacing(self):
        self.check_specific_spacing("class ", 2)

    def check_import_spacing(self):
        self.check_specific_spacing("import ", group=True)
        self.check_specific_spacing("from ", group=True)

    def check_function_spacing(self):
        self.check_specific_spacing("def ", exception="__init__")

    def check_name_main_spacing(self):
        self.check_specific_spacing('if __name__ == "__main__"', 2)

    def check_specific_spacing(self, starts_with_keyword, line_break_quantity=1, group=False, exception=""):
        finished = False

        for _ in self.iter_limit_range:
            if finished:
                break

            self.starts_with_keyword = starts_with_keyword
            self.line_break_quantity = line_break_quantity
            self.group = group
            self.exception = exception

            finished = self.fix_spacing()

    def fix_spacing(self):
        last_index_before_line_breaks = 0
        altered = False
        occurrence = 0
        indented_keyword = ""

        for index, line in enumerate(self.source_code):
            if line.startswith(" ") and self.starts_with_keyword in line:
                indented_keyword = f"{self.get_indent_spaces(line) * ' '}{self.starts_with_keyword}"

            if line.startswith(self.starts_with_keyword) or (len(indented_keyword) and line.startswith(indented_keyword)):
                if len(self.exception) and self.exception in line:
                    continue

                line_break_count = index - (last_index_before_line_breaks + 1)
                occurrence += 1

                if occurrence > 1 and self.group:
                    self.line_break_quantity = 0

                if line_break_count == self.line_break_quantity:
                    last_index_before_line_breaks = index
                    continue

                for _ in self.iter_limit_range:
                    if line_break_count != self.line_break_quantity:
                        if line_break_count > self.line_break_quantity:
                            self.source_code.pop(index - 1)
                            index -= 1
                            line_break_count -= 1
                            altered = True

                        elif line_break_count < self.line_break_quantity:
                            self.source_code.insert(index, "")
                            index += 1
                            line_break_count += 1
                            altered = True
                    else:
                        if altered:
                            return False

                        break

            elif len(line):
                last_index_before_line_breaks = index

            if index == len(self.source_code) - 1:
                return True

    def remove_block_line(self, keyword):
        for _ in self.iter_limit_range:
            for index, line in enumerate(self.source_code):
                if keyword in line and line.rstrip().endswith(":"):
                    next_line = index + 1

                    if not len(self.source_code[next_line]):
                        self.source_code.pop(next_line)
                        return False

                if index == len(self.source_code) - 1:
                    return True

    def get_indent_spaces(self, line):
        spaces = 0

        for char in [c for c in line]:
            if char == " ":
                spaces += 1
            else:
                return spaces

    # TODO: Extra functions
    def conform_list_creation(self):
        # Should reformat lists that don't match the below format

        # test_list = []
        # test_list.append("item 1")
        # test_list.append("item 2")

        pass

    def conform_dict_creation(self):
        # Should reformat dicts that don't match the below format

        # test_dict = {}
        # test_dict["key 1"] = "value 1"
        # test_dict["key 2"] = "value 2"

        pass

    def drop_one_line_ifs(self):
        # (Only if Ryan is on board with this)
        # Should check if there's anything following the colon on a line that starts with 'if'
        pass

    def format_block_spacing_into_columns(self):
        # Should format certain blocks of code like below examples for readability

        # self.Add(self.create,         requires_authentication=True)
        # self.Add(self.get_all,        requires_authentication=True)
        # self.Add(self.close_out,      requires_authentication=True)
        # self.Add(self.update_details, requires_authentication=True)

        # from .js_lint    import JSLinter
        # from .py_lint    import PyLinter
        # from .lint_utils import LintUtils

        pass


if __name__ == "__main__":
    # Lint(sys.argv).Run()
    Lint("/Users/andrewstet/Downloads/lint_test.py").Run()
