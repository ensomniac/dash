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
        self.Type = vdb_type
        self.ObjID = obj_id
        self._dash_context = dash_context
        self._user = user

        Utils.__init__(self)
        Interface.__init__(self)
        Properties.__init__(self)
        Pipeline3D.__init__(self)


def Get(vdb_type, obj_id, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).Get()


def Delete(vdb_type, obj_id, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).Delete()


def GetAll(vdb_type, combo_types=[], include_combos=True, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        dash_context=dash_context,
        user=user
    ).GetAll(
        include_combos=include_combos,
        combo_types=combo_types
    )


def Duplicate(vdb_type, id_to_duplicate, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=id_to_duplicate,
        dash_context=dash_context,
        user=user
    ).Duplicate()


def CreateNew(vdb_type, additional_data={}, return_all=True, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        dash_context=dash_context,
        user=user
    ).CreateNew(
        additional_data=additional_data,
        return_all=return_all
    )


def SetProperty(vdb_type, obj_id, key, value="", dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).SetProperty(
        key=key,
        value=value
    )


def SetProperties(vdb_type, obj_id, props={}, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).SetProperties(properties=props)


def GetComboOptions(combo_types=[], dash_context={}, user={}):
    return VDB(
        dash_context=dash_context,
        user=user
    ).GetComboOptions(combo_types=combo_types)


def GetAssetPathMap(vdb_type, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        dash_context=dash_context,
        user=user
    ).GetAssetPathMap()


def GetDetails(vdb_type, obj_id, combo_options=[], dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).GetDetails(combo_options=combo_options)


def GetDetailsAll(vdb_type, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        dash_context=dash_context,
        user=user
    ).GetDetailsAll()


def GetCollection(vdb_type, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        dash_context=dash_context,
        user=user
    ).GetCollection()


# ------------------------ 3D PIPELINE ------------------------


def Get3DPipelineAssets(vdb_type, obj_id, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).Get3DPipelineAssets()


def Upload3DPipelineAsset(vdb_type, obj_id, file_bytes, filename, asset_type, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).Upload3DPipelineAsset(
        file_bytes=file_bytes,
        filename=filename,
        asset_type=asset_type
    )


def Rebuild3DPipelineAssetBundle(vdb_type, obj_id, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).Rebuild3DPipelineAssetBundle()


def Rebuild3DPipelineAssetBundles(dash_context={}, user={}):
    return VDB(
        dash_context=dash_context,
        user=user
    ).Rebuild3DPipelineAssetBundles()


def Validate3DPipelineAssetBundle(vdb_type, obj_id, dash_context={}, user={}):
    return VDB(
        vdb_type=vdb_type,
        obj_id=obj_id,
        dash_context=dash_context,
        user=user
    ).Validate3DPipelineAssetBundle()


def Validate3DPipelineAssetBundles(dash_context={}, user={}):
    return VDB(
        dash_context=dash_context,
        user=user
    ).Validate3DPipelineAssetBundles()


def Get3DPipelineAssetBundleQueue(dash_context={}, user={}):
    return VDB(
        dash_context=dash_context,
        user=user
    ).Get3DPipelineAssetBundleQueue()
