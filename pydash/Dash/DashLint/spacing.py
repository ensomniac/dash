# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from typing import Callable


class GlobalSpacing:
    group: bool
    exception: str
    source_code: list
    iter_limit_range: range
    starts_with_keyword: str
    line_break_quantity: int
    GetIndentSpaces: Callable

    def __init__(self):
        super().__init__()

    def RemoveExtraLinesAtStartOfFile(self):
        for _ in self.iter_limit_range:
            if not len(self.source_code[0]):
                self.source_code.pop(0)
            else:
                break

    def RemoveExtraLinesAtEndOfFile(self):
        for _ in self.iter_limit_range:
            if not len(self.source_code[-1]) and not len(self.source_code[-2]):
                self.source_code.pop()
            else:
                break

    def CheckSpecificSpacing(self, starts_with_keyword, line_break_quantity=1, group=False, exception=""):
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
                indented_keyword = f"{self.GetIndentSpaces(line) * ' '}{self.starts_with_keyword}"

            if line.startswith(self.starts_with_keyword) or \
                    (len(indented_keyword) and line.startswith(indented_keyword)):

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
