#!/usr/bin/python

import cgi
import json


class StandaloneTestbed:
    def __init__(self):
        self.return_data = {"error": "Unauthorized"}
        self.data = self.get_data()
        self.return_data = self.get_test_response()

        print("Content-type: text/plain")
        print("")
        print(str(json.dumps(self.return_data)))

    def get_data(self):
        data = {}
        s = cgi.FieldStorage()
        for key in s.keys():
            data[key] = s[key].value
        return data

    def get_test_response(self):
        response = {"hello": "world", "key": self.data.get("key")}
        return response


if __name__ == "__main__":
    StandaloneTestbed()
