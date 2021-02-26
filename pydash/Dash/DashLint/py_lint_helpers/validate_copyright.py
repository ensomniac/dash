# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

# def validate_copyright():
#     existing_copyright_indexes = []
#     new_copyright_full = ""
#     existing_copyright_full = ""
#
#     for index, line in enumerate(source_code):
#         if line.startswith(comment_token) and "20" in line and "@" in line and index < 10:
#             existing_copyright_indexes.append(index)
#             index_check = index
#
#             for _ in self.iter_limit_range:
#                 index_check += 1
#
#                 if source_code[index_check].startswith(comment_token):
#                     existing_copyright_indexes.append(index_check)
#                 else:
#                     break
#             break
#
#     copyright_lines_reversed = copyright_lines
#     copyright_lines_reversed.reverse()
#
#     if len(existing_copyright_indexes):
#         for index in existing_copyright_indexes:
#             existing_copyright_full += source_code[index]
#
#         for line in copyright_lines:
#             new_copyright_full += line
#
#         if not existing_copyright_full == new_copyright_full:
#             for _ in range(0, len(existing_copyright_indexes)):
#                 source_code.pop(existing_copyright_indexes[0])
#
#             for line in copyright_lines_reversed:
#                 source_code.insert(existing_copyright_indexes[0], line)
#     else:
#         if self.include_shebang:
#             if source_code[1].strip() == comment_token:
#                 for line in copyright_lines_reversed:
#                     source_code.insert(2, line)
#             else:
#                 copyright_lines_reversed.append(comment_token)
#
#                 for line in copyright_lines_reversed:
#                     source_code.insert(1, line)
#         else:
#             for line in copyright_lines_reversed:
#                 source_code.insert(0, line)
#
#     if source_code[0] == comment_token:
#         source_code.pop(0)
