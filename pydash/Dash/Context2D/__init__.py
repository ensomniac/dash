#!/usr/bin/python
#
# Candy 2023, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys

from .utils import Utils
from .interface import Interface
from .properties import Properties


class Context2D(Utils, Interface, Properties):
    def __init__(self, user_data, context_2d_root, obj_id="", dash_context={}, static_data={}):
        """
        :param dict user_data: Request user's data
        :param str context_2d_root: Root folder where 2D context IDs are (or should be) stored
        :param str obj_id: Can be empty, but only if you're creating a new context (default="")
        :param dict dash_context: Only needed for certain functions (default={})
        :param dict static_data: Run this without the typical loading of data
                                 by providing existing data (default={})
        """

        Utils.__init__(self)
        Interface.__init__(self)
        Properties.__init__(self, user_data, context_2d_root, obj_id, dash_context)

        if static_data:
            self.Data = static_data
            self.ID = static_data.get("id") or ""
        else:
            self.load_data()


def GetData(user_data, context_2d_root, obj_id):
    return Context2D(user_data, context_2d_root, obj_id).ToDict()


def Duplicate(user_data, context_2d_root, obj_id, dash_context):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).Duplicate()


def SetProperty(user_data, context_2d_root, obj_id, key, value, moved_layer_id=""):
    return Context2D(user_data, context_2d_root, obj_id).SetProperty(key, value, moved_layer_id)


def SetProperties(user_data, context_2d_root, obj_id, props, moved_layer_id=""):
    return Context2D(user_data, context_2d_root, obj_id).SetProperties(props, moved_layer_id)


def SetPreCompProperty(user_data, context_2d_root, obj_id, key, value, letter):
    return Context2D(user_data, context_2d_root, obj_id).SetPreCompProperty(key, value, letter)


def SetLayerProperty(user_data, context_2d_root, obj_id, layer_id, key, value, imported_context_layer_id="", file_op_key=""):
    return Context2D(user_data, context_2d_root, obj_id).SetLayerProperty(layer_id, key, value, imported_context_layer_id, file_op_key)


def SetLayerProperties(user_data, context_2d_root, obj_id, layer_id, props, imported_context_layer_id=""):
    return Context2D(user_data, context_2d_root, obj_id).SetLayerProperties(layer_id, props, imported_context_layer_id)


def DuplicateLayer(user_data, context_2d_root, obj_id, dash_context, layer_id):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).DuplicateLayer(layer_id)


def AddTextLayer(user_data, context_2d_root, obj_id):
    return Context2D(user_data, context_2d_root, obj_id).AddTextLayer()


def AddColorLayer(user_data, context_2d_root, obj_id):
    return Context2D(user_data, context_2d_root, obj_id).AddColorLayer()


def AddImageLayer(user_data, context_2d_root, obj_id, dash_context, file, filename):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).AddImageLayer(file, filename)


def AddVideoLayer(user_data, context_2d_root, obj_id, dash_context, file, filename):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).AddVideoLayer(file, filename)


def ImportAnotherContext(user_data, context_2d_root, obj_id, obj_id_to_import):
    return Context2D(user_data, context_2d_root, obj_id).ImportAnotherContext(obj_id_to_import)


def CopyLayerToAnotherContext(user_data, context_2d_root, source_obj_id, dest_obj_id, source_layer_id):
    return Context2D(user_data, context_2d_root, source_obj_id).CopyLayerToAnotherContext(dest_obj_id, source_layer_id)


def UploadLayerMask(user_data, context_2d_root, obj_id, layer_id, file, filename):
    return Context2D(user_data, context_2d_root, obj_id).UploadLayerMask(layer_id, file, filename)
