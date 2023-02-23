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

    def ToDict(self, save=False):
        """
        :param bool save: When True, the 'modified_by' and 'modified_on' keys are updated, and data is slightly different than a non-save (default=False)

        :return: Sanitized context2D data
        :rtype: dict
        """

        return {
            "aspect_ratio_h":                    self.AspectRatioH,
            "aspect_ratio_w":                    self.AspectRatioW,
            "created_by":                        self.CreatedBy,
            "created_on":                        self.CreatedOn,
            "display_name":                      self.DisplayName,
            "id":                                self.ID,

            # We don't want to save the "layers" key, since we store the layers separately, but we need to
            # save the "layer_order" to be able to populate the "layers" when serving this dict (not saving)
            "layer_order" if save else "layers": self.LayerOrder if save else self.Layers,

            "modified_by":                       self.User["email"] if save else self.ModifiedBy,
            "modified_on":                       self.Now.isoformat() if save else self.ModifiedOn
        } if self.Data else self.Data


def GetData(user_data, context_2d_root, obj_id):
    return Context2D(user_data, context_2d_root, obj_id).ToDict()


def Duplicate(user_data, context_2d_root, obj_id, dash_context):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).Duplicate()


def SetProperty(user_data, context_2d_root, obj_id, key, value):
    return Context2D(user_data, context_2d_root, obj_id).SetProperty(key, value)


def SetProperties(user_data, context_2d_root, obj_id, props):
    return Context2D(user_data, context_2d_root, obj_id).SetProperties(props)


def AddTextLayer(user_data, context_2d_root, obj_id):
    return Context2D(user_data, context_2d_root, obj_id).AddTextLayer()


def AddImageLayer(user_data, context_2d_root, obj_id, dash_context, file, filename):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).AddImageLayer(file, filename)


def AddVideoLayer(user_data, context_2d_root, obj_id, dash_context, file, filename):
    return Context2D(user_data, context_2d_root, obj_id, dash_context).AddVideoLayer(file, filename)
