#!/usr/bin/python
#
# 2021 Ryan Martin, ryan@ensomniac.com
#      Andrew Stet, stetandrew@gmail.com

import os
import sys
import csv

from Dash.Utils import Utils
from Dash.Users import Users
from datetime import datetime
from collections import OrderedDict


class CSV:
    def __init__(self, csv_root, dash_context, all_data={}, exclude_keys=[], file=None):
        """
        Handle all non-gsheet CSV-related actions, such as exporting and importing.

        :param str csv_root: Root where csv file will be stored or retrieved from
        :param dict dash_context: Dash Context object
        :param dict all_data: (When exporting) Data object matching the structure of Collection.All["data"] (default={})
        :param list exclude_keys: Data keys to exclude when translating data to/from CSV (default=[])
        :param byte file: (When importing) File byte data from a file that was uploaded (default=None)
        """

        self.file = file
        self.csv_root = csv_root
        self.dash_context = dash_context
        self.exclude_keys = exclude_keys
        self.users_mod = Users(params={}, dash_context=self.dash_context)

        # Paths
        self.csv_export_root = os.path.join(self.csv_root, "export")
        self.csv_import_root = os.path.join(self.csv_root, "import")
        self.csv_export_filepath = os.path.join(self.csv_export_root, f"{Utils.GetRandomID()}.csv")
        self.csv_import_filepath = os.path.join(self.csv_import_root, f"{Utils.GetRandomID()}.csv")

        # Keys to move to the beginning and end, respectively, when sorting
        self.prioritized_keys = ["display_name"]
        self.unprioritized_keys = ["id", "created_by", "created_on", "modified_by", "modified_on"]

        if all_data:
            self.all_data = self.get_all_cleaned_data(all_data)
        else:
            self.all_data = all_data

        self.ensure_roots_exist()

    def Export(self):
        header = False
        csv_file = open(self.csv_export_filepath, "w")
        csv_writer = csv.writer(csv_file)

        for data in self.all_data:
            if not header:
                csv_writer.writerow(self.get_keys(data))
                header = True

            csv_writer.writerow(self.get_values(data))

        csv_file.close()

        return self.csv_export_filepath

    # TODO: What will this function need to do with the imported data?
    def Import(self):
        try:
            open(self.csv_import_filepath, "wb").write(self.file)

            return self.csv_import_filepath
        except:
            return ""

    # def upload_file(self, asset_path, file, filetype):
    #     stream_root = os.path.join(self.root, asset_path)
    #     full_path = os.path.join(stream_root, f"{asset_path}.{filetype}")
    #
    #     try:
    #         os.makedirs(stream_root, exist_ok=True)
    #         open(full_path, "wb").write(file)
    #
    #         if os.path.exists(full_path):
    #             return {"uploaded": True, "path": full_path}
    #     except:
    #         from traceback import format_exc
    #
    #         return {"uploaded": False, "error": format_exc()}

    def ensure_roots_exist(self):
        for root in [self.csv_root, self.csv_export_root, self.csv_import_root]:
            os.makedirs(root, exist_ok=True)

    def get_all_cleaned_data(self, all_data):
        """
        Generic cleaning of data for proper data distribution over the CSV,
        as well as for improving user readability, like formatting timestamps, etc

        :param dict all_data: all data objects to clean
        :rtype: list
        :return: all cleaned data objects
        """

        all_keys = []
        all_cleaned_data = []

        for item in all_data:
            data = all_data[item]

            data = self.replace_user_email_with_name(data)
            data = self.replace_timestamp_with_readable(data)

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

    def replace_user_email_with_name(self, data):
        for key in ["created_by", "modified_by"]:
            if not data.get(key):
                continue

            user_data = self.users_mod.GetUserData(data[key])

            if not user_data.get("first_name") and not user_data.get("last_name"):
                continue

            data[key] = f"{user_data['first_name']} {user_data['last_name']}"

        return data

    def replace_timestamp_with_readable(self, data):
        for key in ["created_on", "modified_on"]:
            if not data.get(key):
                continue

            data[key] = Utils.FormatTime(datetime.fromisoformat(data[key]))

        return data

    def sort_data_by_key(self, all_data, sort_key):
        """
        Sort data using designated key

        :param list all_data: json data dicts
        :param str sort_key: key to use when sorting
        :rtype: list
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
