# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class PySpacing:
    source_code: list
    iter_limit_range: range
    CheckSpecificSpacing: callable

    def __init__(self):
        super().__init__()

    def RemoveBlankLinesAtStartOfBlocks(self):
        for keyword in ["def ", "class ", '__name__ == "__main__"']:
            finished = False

            for _ in self.iter_limit_range:
                if finished:
                    break

                finished = self.remove_block_line(keyword)

    def CheckClassSpacing(self):
        self.CheckSpecificSpacing("class ", 2)

    def CheckImportSpacing(self):
        self.CheckSpecificSpacing("import ", group=True)
        self.CheckSpecificSpacing("from ", group=True)

    def CheckFunctionSpacing(self):
        self.CheckSpecificSpacing("def ", ignore="__init__")

    def CheckNameMainSpacing(self):
        self.CheckSpecificSpacing('if __name__ == "__main__"', 2)

    def remove_block_line(self, keyword):
        for _ in self.iter_limit_range:
            for index, line in enumerate(self.source_code):
                if keyword in line and line.rstrip().endswith(":"):
                    next_line = index + 1

                    try:
                        if not len(self.source_code[next_line]):
                            self.source_code.pop(next_line)
                            return False
                    except IndexError:
                        pass

                if index == len(self.source_code) - 1:
                    return True
