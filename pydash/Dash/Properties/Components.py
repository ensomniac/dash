#!/usr/bin/python
#
# 2024 Ensomniac Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from Dash.Properties.Configuration import Configuration


class Components(Configuration):
    def __init__(self, dash_context_asset_path):
        Configuration.__init__(self, dash_context_asset_path, "configuration")
