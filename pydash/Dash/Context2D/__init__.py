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
    def __init__(self, user_data, context_2d_root, obj_id="", dash_context={}):
        """
        :param dict user_data: Request user's data
        :param str context_2d_root: Root folder where 2D context IDs are (or should be) stored
        :param str obj_id: Can be empty, but only if you're creating a new context (default="")
        :param dict dash_context: Only needed for certain functions (default={})
        """

        Utils.__init__(self)
        Interface.__init__(self)
        Properties.__init__(self, user_data, context_2d_root, obj_id, dash_context)

        self.load_data()


def GetData(user_data, context_2d_root, obj_id):
    return Context2D(user_data, context_2d_root, obj_id).ToDict()


def Duplicate(user_data, context_2d_root, obj_id, dash_context):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).Duplicate()


def SetProperty(user_data, context_2d_root, obj_id, key, value):
    return Context2D(user_data, context_2d_root, obj_id).SetProperty(key, value)


def SetProperties(user_data, context_2d_root, obj_id, props):
    return Context2D(user_data, context_2d_root, obj_id).SetProperties(props)


def SetLayerProperty(user_data, context_2d_root, obj_id, layer_id, key, value, imported_context_layer_id=""):
    return Context2D(user_data, context_2d_root, obj_id).SetLayerProperty(layer_id, key, value, imported_context_layer_id)


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
