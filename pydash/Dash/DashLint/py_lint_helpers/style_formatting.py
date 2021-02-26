# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class FormatStyle:
    def __init__(self):
        super().__init__()

    def ConformListCreation(self):
        # TODO: Should reformat lists that don't match the below format

        # test_list = []
        # test_list.append("item 1")
        # test_list.append("item 2")

        pass

    def ConformDictCreation(self):
        # TODO: Should reformat dicts that don't match the below format

        # test_dict = {}
        # test_dict["key 1"] = "value 1"
        # test_dict["key 2"] = "value 2"

        pass

    def DropOneLineIfs(self):
        # TODO: Should check if there's anything following the colon on a line that starts with 'if'
        # (Only if Ryan is on board with this)

        pass

    def FormatBlockSpacingIntoColumns(self):
        # TODO: Should format certain blocks of code like below examples for readability

        # self.Add(self.create,         requires_authentication=True)
        # self.Add(self.get_all,        requires_authentication=True)
        # self.Add(self.close_out,      requires_authentication=True)
        # self.Add(self.update_details, requires_authentication=True)

        # from .js_lint    import JSLinter
        # from .py_lint    import PyLinter
        # from .lint_utils import LintUtils

        # Alternatively, we could cascade blocks like these

        pass

    def CheckForOsAndSys(self):
        # TODO: Should add import os and import sys if not present already

        pass
