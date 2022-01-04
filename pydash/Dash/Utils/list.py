#!/usr/bin/python
#
# Ensomniac 2022 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def OSListDirCleaned(path):
    cleaned_list = []

    for file in os.listdir(path):
        if file.startswith(".") or file.endswith(".meta"):
            continue

        cleaned_list.append(file)

    return cleaned_list
