# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class Cleanup:
    source_code: list
    comment_token: str
    comment_prefix: str
    all_comment_options: list
    line_length_flag_suffix: str
    individual_line_length_max: int
    individual_line_length_comment: str

    def __init__(self):
        super().__init__()

    def CleanupCommentsBeforeEval(self):
        for index, line in enumerate(self.source_code):

            # This will preemptively remove existing comments that we currently check for
            line = self.remove_known_comments(index, line)

            if line.strip().startswith(self.comment_token):
                continue

            # This section of comment update functions is flexible and should be added to as we go along
            line = self.update_line_length_comments(index, line)

            # This should always be the last line in this for loop
            self.RemoveEmptyComments(index, line)

    def RemoveEmptyComments(self, index, line):
        if self.comment_token in line and not len(line.split(self.comment_token)[1].replace(self.comment_prefix, "").replace(",", "").strip()):
            line = line.split(self.comment_token)[0].rstrip()
            self.source_code[index] = line

        return line

    def remove_known_comments(self, index, line):
        if self.comment_token in line:
            line_comments = line.split(self.comment_token)[1].strip()

            for comment in self.all_comment_options:
                if comment in line_comments:
                    line = line.split(self.comment_token)[0].rstrip()
                    self.source_code[index] = line

        return line

    def update_line_length_comments(self, index, line):
        individual_line_length_comment_base = self.individual_line_length_comment.split(
                                              str(self.individual_line_length_max))[0].strip()

        if individual_line_length_comment_base in line:
            existing_line_length_max = line.split(individual_line_length_comment_base)[1]\
                                           .strip().split(" ")[0].strip()

            if not existing_line_length_max.startswith(str(self.individual_line_length_max)) \
                    or (self.comment_token in line and len(line.split(self.comment_token)[0].rstrip()) < self.individual_line_length_max):

                line = line.replace(individual_line_length_comment_base, "")\
                           .replace(existing_line_length_max, "")\
                           .replace(self.line_length_flag_suffix, "")

                self.source_code[index] = line

        return line
