#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

import os
import sys

from .utils import Utils
from .interface import Interface
from .properties import Properties
from .pipeline_3d import Pipeline3D


class VDB(Utils, Interface, Properties, Pipeline3D):
    def __init__(self, vdb_type="", obj_id="", dash_context={}, user={}):
        Utils.__init__(self)
        Interface.__init__(self)
        Properties.__init__(self)
        Pipeline3D.__init__(self)

        self.Type = vdb_type
        self.ObjID = obj_id
        self._dash_context = dash_context
        self._user = user


# TODO: shortcuts (wrappers)
