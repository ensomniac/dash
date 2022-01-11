# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class Flags:
    source_code: list
    comment_token: str
    comment_prefix: str
    RemoveEmptyComments: callable
    AddDocstringsAndFlags: callable
    GetFormattedCommentedLine: callable
    RemoveExtraLinesAtEndOfFile: callable

    def __init__(self):
        self.line_length_flag_suffix = "(excluding comments)"

        # These are a bit arbitrary/undecided for now
        self.total_line_length_max = 1000
        self.individual_line_length_max = 120

        # Any comment string variable names like these MUST end in '_comment'
        self.super_comment = "TODO: Convert to super()"
        self.path_comment = "This may include a hard-coded path - if so, use 'os.path.join()' instead"
        self.individual_line_length_comment = f"Line length exceeds {self.individual_line_length_max}"
        self.total_line_length_comment = f"File's total line count exceeds {self.total_line_length_max}"

        super().__init__()

    def AddFlagComments(self):
        for index, line in enumerate(self.source_code):
            # if line.strip().startswith(self.comment_token):
            #     continue

            # This works for many cases when wanting to add a trailing comment based on a keyword
            # While this example is no longer valid, it shows how this can function should be used
            if not line.strip().startswith(self.comment_token):
                line = self.add_flags_by_keyword(index, line, self.GetFormattedCommentedLine(line),
                                                 self.super_comment, "ApiCore.Init(")

                # This list of comment flag functions is flexible and should be added to as we go along
                line = self.add_path_flags(index, line, self.GetFormattedCommentedLine(line))
                line = self.add_individual_line_length_flags(index, line, self.GetFormattedCommentedLine(line))

            # This should always be the last line in this loop
            # line = self.AddDocstringsAndFlags(index, line)
            self.AddDocstringsAndFlags(index, line)

        self.add_total_line_length_flag()

    def FlagUnusedImports(self):
        # TODO: Search entire script for each import to make sure it's used, flag unused
        #  Ignore 'os' and 'sys'
        #  This may or may not make sense to be called as part of the 'AddFlagComments' section above

        pass

    def add_flags_by_keyword(self, index, line, formatted_line, comment, keyword):
        if keyword in line and comment not in line:
            line = f"{formatted_line} {comment}"
            self.source_code[index] = line

        return line

    def add_path_flags(self, index, line, formatted_line):
        if (line.count("'") >= 2 or line.count('"') >= 2) and line.count("/") >= 2 \
                and ".join" not in line and self.path_comment not in line \
                and (os.path.isabs(line.strip()) or os.path.exists(line.strip())):

            line = f"{formatted_line} {self.path_comment}"
            self.source_code[index] = line

        return line
    
    def add_individual_line_length_flags(self, index, line, formatted_line):
        comment = self.individual_line_length_comment

        if len(line) > self.individual_line_length_max and comment not in line:
            if self.comment_token in formatted_line:
                if len(line.split(self.comment_token)[0].rstrip()) < self.individual_line_length_max:
                    return line
                else:
                    comment += f" {self.line_length_flag_suffix}"

            line = f"{formatted_line} {comment}"
            self.source_code[index] = line

        return line

    def add_total_line_length_flag(self):
        self.update_line_total_comment()

        full_comment = f"{self.comment_token} {self.comment_prefix} {self.total_line_length_comment}"

        if len(self.source_code) > self.total_line_length_max and full_comment not in self.source_code:
            self.source_code.insert(-1, "")
            self.source_code.insert(-1, full_comment)

    def update_line_total_comment(self):
        index = -2

        try:
            line = self.source_code[index]
            total_line_length_comment_base = self.total_line_length_comment.split(
                                             str(self.total_line_length_max))[0].strip()

            if total_line_length_comment_base in line:
                existing_line_total_max = line.split(total_line_length_comment_base)[1]\
                                              .strip().split(" ")[0].strip()

                if not existing_line_total_max.startswith(str(self.total_line_length_max)) \
                        or len(self.source_code) < self.total_line_length_max:

                    line = line.replace(total_line_length_comment_base, "")\
                               .replace(existing_line_total_max, "")\
                               .replace(self.line_length_flag_suffix, "")

                    self.source_code[index] = line

            self.RemoveEmptyComments(index, line)

        except IndexError:
            pass

        self.RemoveExtraLinesAtEndOfFile()
