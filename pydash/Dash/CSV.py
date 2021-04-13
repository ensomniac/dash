#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys
import csv

from Dash.Utils import Utils
from collections import OrderedDict


class CSV:
    def __init__(self, all_data, csv_root, exclude_keys=[]):
        """
        Handle all non-gsheet CSV-related actions, such as exporting and importing.

        :param dict all_data: Data object matching the structure of Collection.All["data"]
        :param str csv_root: Root where csv file will be stored or retrieved from
        :param list exclude_keys: Data keys to exclude when translating data to/from CSV (default=[])
        """

        # Keys to move to the beginning and end, respectively, when sorting
        self.prioritized_keys = ["display_name"]
        self.unprioritized_keys = ["id", "created_by", "created_on", "modified_by", "modified_on"]

        self.exclude_keys = exclude_keys
        self.all_data = self.get_all_cleaned_data(all_data)
        self.csv_filepath = os.path.join(csv_root, f"{Utils.GetRandomID()}.csv")

    def Export(self):
        header = False
        csv_file = open(self.csv_filepath, "w")
        csv_writer = csv.writer(csv_file)

        for data in self.all_data:
            if not header:
                csv_writer.writerow(self.get_keys(data))
                header = True

            csv_writer.writerow(self.get_values(data))

        csv_file.close()

        return self.csv_filepath

    def Import(self):
        pass  # TODO: What will this function need to do with the imported data?

    def get_all_cleaned_data(self, all_data):
        all_keys = []
        all_cleaned_data = []

        for item in all_data:
            data = all_data[item]

            for exclude_key in self.exclude_keys:
                del data[exclude_key]

            for key in data:
                if key not in all_keys:
                    all_keys.append(key)

            all_cleaned_data.append(data)

        for index, data in enumerate(all_cleaned_data):
            for key in all_keys:
                if key not in data:
                    data[key] = None

            all_cleaned_data[index] = self.reorder_data(data)

        for sort_key in ["display_name", "asset_path"]:
            if sort_key in all_keys:
                return self.sort_data_by_key(all_cleaned_data, sort_key)

        return all_cleaned_data

    def sort_data_by_key(self, all_data, sort_key):
        """
        :param list all_data: json data dicts
        :param str sort_key: key to use when sorting
        :return: sorted list of json data dicts
        """
        sorted_data = []
        cleaned_data = {}

        for data in all_data:
            cleaned_data[data[sort_key]] = data

        cleaned_data = OrderedDict(sorted(cleaned_data.items()))

        for key in cleaned_data:
            sorted_data.append(cleaned_data[key])

        return sorted_data

    def reorder_data(self, data):
        ordered_data = OrderedDict(sorted(data.items()))
        order = [item for item in ordered_data]

        for key in self.prioritized_keys:
            if key in order:
                order.remove(key)
                order.insert(0, key)

        for key in self.unprioritized_keys:
            if key in order:
                order.remove(key)
                order.append(key)

        for key in order:
            value = ordered_data[key]
            del ordered_data[key]
            ordered_data[key] = value

        return ordered_data

    def get_values(self, data):
        values = list(data.values())

        for index, value in enumerate(values):
            if type(value) == list:
                values[index] = "\n".join(value)

        return values

    def get_keys(self, data):
        keys = list(data.keys())

        for index, key in enumerate(keys):
            if key == "id":
                keys[index] = "ID"

            elif key == "display_name":
                keys[index] = "Name"

            elif key == "phones":
                keys[index] = "Phone Numbers"

            elif key == "emails":
                keys[index] = "Email Addresses"

            elif key == "associated_orgs":
                keys[index] = "Associated Organizations"

            else:
                keys[index] = key.replace("_", " ").title()

        return keys
