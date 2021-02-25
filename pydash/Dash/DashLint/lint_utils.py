# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class LintUtils:
    def __init__(self):
        pass

    # def GetCodeHeader(self, comment_token, dash_context, code_path):
    #     from datetime import datetime
    #
    #     lines = []
    #     lines.append(f"{comment_token} {datetime.today().year} {dash_context['code_copyright_text']}")
    #     lines.append(f"{comment_token} Author(s): {', '.join(self.GetFileAuthors(code_path))}")
    #     lines.append(f"{comment_token} {datetime.now()}")  # This may need to be a different type of timestamp
    #     lines.append("")
    #
    #     return "\n".join(lines)

    def GetCodeLineListFromFile(self, code_path):
        return open(code_path).read().split("\n")

    def WriteCodeListToFile(self, code_path, code_lines_list):
        file = open(code_path, "w")
        file.write("\n".join(code_lines_list))
        file.close()

    def GetFileAuthors(self, code_path, uploader_email):
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


LintUtils = LintUtils()
