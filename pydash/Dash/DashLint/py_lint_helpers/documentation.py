# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com 

import os
import sys


class PyDoc:
    def __init__(self):
        super().__init__()

    def SynthesizeDocstrings(self):
        # TODO: Read each class/func and/or DashLint-generated docstring tags
        #  This is already being done in docstring.py, loop this in to the existing process?

        pass

    def interpret_description(self):
        # TODO: Attempt to interpret a description, or build generic one off of the class+func name combo?

        pass

    def interpret_params(self):
        # TODO: Add each incoming param to docstring and attempt to interpret type and description

        pass

    def evaluate_return(self):
        # TODO: Check for `return` at the end of block and add as :return: key

        pass
