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


def GetListPortion(list_obj, center_anchor_value, size=3):
    if type(list_obj) is not list:
        raise Exception("GetPortion only accepts lists")

    if size >= len(list_obj):
        raise Exception("Size must be less than the length of the list")

    from math import floor

    index_dif = floor(size / 2)
    center_anchor_index = list_obj.index(center_anchor_value)
    start_index = center_anchor_index - index_dif
    end_index = center_anchor_index + (index_dif + 1)

    if start_index < 0:
        start_index = 0

    if end_index > len(list_obj):
        end_index = len(list_obj)

    portion = list_obj[start_index:end_index]

    for _ in range(0, size):
        dif = size - len(portion)

        if dif == 0:
            break

        target_index = portion.index(center_anchor_value)

        if target_index < index_dif:
            for _ in range(0, dif):
                if (start_index - 1) >= 0:
                    start_index -= 1

                elif (end_index + 1) <= len(list_obj):
                    end_index += 1
        else:
            for _ in range(0, dif):
                if (end_index + 1) <= len(list_obj):
                    end_index += 1

                elif (start_index - 1) >= 0:
                    start_index -= 1

        portion = list_obj[start_index:end_index]

    return portion
