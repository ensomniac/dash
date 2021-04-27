# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from typing import Callable


class GlobalSpacing:
    group: bool
    ignore: str
    source_code: list
    iter_limit_range: range
    starts_with_keyword: str
    line_break_quantity: int
    GetIndentSpaceCount: Callable
    line_end_keyword_strings: list

    def __init__(self):
        super().__init__()

    def RemoveExtraLinesAtStartOfFile(self):
        for _ in self.iter_limit_range:
            try:
                if not len(self.source_code[0]):
                    self.source_code.pop(0)
                else:
                    break
            except IndexError:
                break

    def RemoveExtraLinesAtEndOfFile(self):
        for _ in self.iter_limit_range:
            try:
                if not len(self.source_code[-1]) and not len(self.source_code[-2]):
                    self.source_code.pop()
                else:
                    break
            except IndexError:
                break

    def CheckSpecificSpacing(self, starts_with_keyword, line_break_quantity=1, group=False, ignore=""):
        finished = False

        for _ in self.iter_limit_range:
            if finished:
                break

            self.starts_with_keyword = starts_with_keyword
            self.line_break_quantity = line_break_quantity
            self.group = group
            self.ignore = ignore

            finished = self.fix_specific_spacing()

        self.fix_comments_separated_from_top_of_blocks()

    def AddNeededLineBreaks(self):
        finished = False

        for keyword in self.line_end_keyword_strings:
            for _ in self.iter_limit_range:
                if finished:
                    break

                for index, line in enumerate(self.source_code):
                    if index == len(self.source_code) - 1:
                        finished = True
                        break

                    if not line.strip().endswith(keyword) or not len(self.source_code[index + 1]):
                        continue

                    if self.GetIndentSpaceCount(line) != self.GetIndentSpaceCount(self.source_code[index - 1]):
                        continue

                    self.source_code.insert(index + 1, "")

    def RemoveExtraLinesBetweenStatements(self, exception_strings=[]):
        finished = False

        for _ in self.iter_limit_range:
            if finished:
                break

            for index, line in enumerate(self.source_code):
                altered = False
                stripped = line.strip()
                next_statement_index = None

                for exception in exception_strings:
                    if stripped.startswith(exception):
                        continue

                if not len(stripped):
                    continue

                for num in self.iter_limit_range:
                    if num < 1:
                        continue

                    try:
                        if len(self.source_code[index + num].strip()):
                            next_statement_index = index + num
                            break
                    except:
                        break

                if not type(next_statement_index) == int:
                    continue

                spaces = (next_statement_index - 1) - index

                for _ in self.iter_limit_range:
                    if spaces > 1:
                        try:
                            self.source_code.pop(index + 1)
                            altered = True
                            spaces -= 1
                        except:
                            break
                    else:
                        break

                if altered:
                    break

                if index == len(self.source_code) - 1:
                    finished = True

    def fix_comments_separated_from_top_of_blocks(self):
        finished = False

        for _ in self.iter_limit_range:
            if finished:
                break

            for index, line in enumerate(self.source_code):
                if index == len(self.source_code) - 1:
                    finished = True
                    break

                try:
                    two_strip = self.source_code[index + 2].strip()
                except:
                    finished = True
                    break

                if line.strip().startswith("#") \
                        and not self.source_code[index - 1].strip().startswith("#") \
                        and not self.source_code[index + 1].strip().startswith("#"):
                    if two_strip.startswith("def ") or two_strip.startswith("class "):
                        self.source_code.pop(index + 1)
                        break

                    elif not len(two_strip):
                        for num in self.iter_limit_range:
                            if num <= 2:
                                continue

                            try:
                                next_strip = self.source_code[index + num].strip()
                            except:
                                break

                            if not len(next_strip):
                                continue
                            elif next_strip.startswith("def ") or next_strip.startswith("class "):
                                for n in range(0, num - 1):
                                    self.source_code.pop(index + 1)

                                break
                            else:
                                break

                if line.strip().startswith("#"):
                    next_line_strip = self.source_code[index + 1].strip()
                    prev1_line_strip = self.source_code[index - 1].strip()
                    prev2_line_strip = self.source_code[index - 2].strip()

                    if (next_line_strip.startswith("class ") or (next_line_strip.startswith("def ") and self.GetIndentSpaceCount(line) == 0)) and (len(prev1_line_strip) or len(prev2_line_strip)):
                        self.source_code.insert(index, "")
                        break

    def fix_specific_spacing(self):
        last_index_before_line_breaks = 0
        altered = False
        occurrence = 0
        indented_keyword = ""

        for index, line in enumerate(self.source_code):
            indent = self.GetIndentSpaceCount(line)

            if self.starts_with_keyword == "def ":
                if indent == 0:
                    self.line_break_quantity = 2
                else:
                    self.line_break_quantity = 1

            if line.startswith(" ") and self.starts_with_keyword in line:
                indented_keyword = f"{indent * ' '}{self.starts_with_keyword}"

            if line.startswith(self.starts_with_keyword) or \
                    (len(indented_keyword) and line.startswith(indented_keyword)):

                if len(self.ignore) and self.ignore in line:
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
