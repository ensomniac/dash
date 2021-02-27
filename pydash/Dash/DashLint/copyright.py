# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class Copyright:
    code_path: str
    source_code: list
    comment_token: str
    dash_context: dict
    include_shebang: bool
    copyright_lines: list
    iter_limit_range: range

    def __init__(self):
        self.shebang = "#!/usr/bin/python"

        super().__init__()

    def GetCopyright(self):
        from datetime import datetime

        code_authors = self.get_file_authors(self.code_path, self.dash_context['modified_by'])
        company_name = self.dash_context['code_copyright_text']
        copyright_lines = [f"{self.comment_token} {company_name} {datetime.now().year} {code_authors[0]}"]

        for person in code_authors[1:]:
            copyright_lines.append(f"{self.comment_token} {' ' * (len(company_name) + 5)} {person}")

        return copyright_lines

    def ValidateCopyright(self):
        existing_copyright_indexes = []
        new_copyright_full = ""
        existing_copyright_full = ""
    
        for index, line in enumerate(self.source_code):
            if line.startswith(self.comment_token) and "20" in line and "@" in line and index < 10:
                existing_copyright_indexes.append(index)
                index_check = index
    
                for _ in self.iter_limit_range:
                    index_check += 1
    
                    if self.source_code[index_check].startswith(self.comment_token):
                        existing_copyright_indexes.append(index_check)
                    else:
                        break
                break
    
        copyright_lines_reversed = self.copyright_lines
        copyright_lines_reversed.reverse()
    
        if len(existing_copyright_indexes):
            for index in existing_copyright_indexes:
                existing_copyright_full += self.source_code[index]
    
            for line in self.copyright_lines:
                new_copyright_full += line
    
            if not existing_copyright_full == new_copyright_full:
                for _ in range(0, len(existing_copyright_indexes)):
                    self.source_code.pop(existing_copyright_indexes[0])
    
                for line in copyright_lines_reversed:
                    self.source_code.insert(existing_copyright_indexes[0], line)
        else:
            if self.include_shebang:
                if self.source_code[1].strip() == self.comment_token:
                    for line in copyright_lines_reversed:
                        self.source_code.insert(2, line)
                else:
                    copyright_lines_reversed.append(self.comment_token)
    
                    for line in copyright_lines_reversed:
                        self.source_code.insert(1, line)
            else:
                for line in copyright_lines_reversed:
                    self.source_code.insert(0, line)
    
        if self.source_code[0] == self.comment_token:
            self.source_code.pop(0)

    def ValidateShebang(self):
        shebang_index = None
        current_shebang = ""

        for index, line in enumerate(self.source_code):
            stripped = line.strip()

            if stripped == self.shebang or stripped.startswith(f"{self.comment_token}!/"):
                current_shebang = stripped
                shebang_index = index
                break

        if self.include_shebang:
            if shebang_index is None:
                self.source_code.insert(0, self.shebang)
            elif current_shebang != self.shebang:
                self.source_code[shebang_index] = self.shebang

        elif not self.include_shebang and type(shebang_index) == int:
            next_index = shebang_index + 1

            if self.source_code[next_index].strip() == self.comment_token:
                self.source_code.pop(next_index)

            self.source_code.pop(shebang_index)

    def get_file_authors(self, code_path, uploader_email):
        from subprocess import check_output

        add_uploader_email = True
        authors = []
        orig_dir = os.getcwd()

        if not os.path.isdir(code_path):
            code_path = f"/{'/'.join([f for f in code_path.split('/')[:-1] if len(f)])}/"

        os.chdir(code_path)

        for author in check_output("git log --all --format='%aN <%cE>' | sort -u", shell=True).decode().split("\n"):
            if len(author) and "aifoundation" not in author and "noreply@github" not in author and author not in authors:
                authors.append(author.replace("<", "(").replace(">", ")"))

        os.chdir(orig_dir)

        if "Ryan" not in authors[0]:
            for author in authors:
                if "Ryan" in author:
                    authors.insert(0, authors.pop(authors.index(author)))
                    break

        for author in authors:
            if uploader_email in author:
                add_uploader_email = False
                break

        if add_uploader_email:
            authors.append(uploader_email)

        return authors
