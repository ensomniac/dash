#!/usr/bin/python
#
# Altona 2021 Ryan Martin, ryan@ensomniac.com

import os
import sys

from Dash import ApiCore


class Altona:
    def __init__(self, as_module=False):
        if not ApiCore.Init(self, as_module):
            return

        self.Add(self.validate, requires_authentication=False)

        self.Run()

    def validate(self):
        return_data = {"validate": True}
        return self.set_return_data(return_data)


if __name__ == "__main__":
    Altona()
