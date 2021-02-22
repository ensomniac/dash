#!/usr/bin/python

import os

# A DashObject is a helper class for storing and recalling data

class DashObject:
    def __init__(self, asset_path, display_name=None, domain=None):
        self.__asset_path = asset_path

def Create():
    return DashContext(asset_path, display_name, domain)
