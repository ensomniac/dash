#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

import os
import sys


class Interface:
    Type: str
    ObjID: str
    User: dict
    sort_by_key: str
    collections: dict
    DashContext: dict
    get_combos: callable
    update_glb: callable
    add_details: callable
    set_temp_attrs: callable
    skip_asset_map: callable
    modify_get_data: callable
    get_sort_by_key: callable
    unset_temp_attrs: callable
    conform_new_data: callable
    get_texture_path: callable
    asset_bundle_queue_root: str
    _get_combo_options: callable
    validate_properties: callable
    get_3d_pipeline_root: callable
    get_details_combos_kwargs: callable
    filter_get_details_all_data: callable
    get_set_properties_response: callable
    get_3d_pipeline_vdb_obj_map: callable
    queue_3d_pipeline_asset_bundle: callable

    def __init__(self):
        pass

    def Get(self, _vdb_type="", _obj_id="", temp_kwargs={}, unset_temp=True):
        self.set_temp_attrs(_vdb_type, _obj_id, **temp_kwargs)

        collection = self.GetCollection()
        data = self.modify_get_data(collection.Get(self.ObjID))

        if unset_temp:
            self.unset_temp_attrs()

        return data

    def Delete(self):
        response = self.GetCollection().Delete(obj_id=self.ObjID)

        response["vdb_type"] = self.Type

        return response

    def GetAll(self, combo_types=[], include_combos=True, _vdb_type="", temp_kwargs={}, unset_temp=True):
        self.set_temp_attrs(_vdb_type, **temp_kwargs)

        response = self.GetCollection().GetAll()

        if include_combos:
            response["combo_options"] = self.GetComboOptions(combo_types=combo_types)

        if unset_temp:
            self.unset_temp_attrs()

        return response

    def Duplicate(self, id_to_duplicate=""):
        collection = self.GetCollection()

        return self.conform_new_data(
            collection.Duplicate(
                id_to_duplicate=id_to_duplicate or self.ObjID,
                return_all_data=False  # Let SetProperty return all after updating
            ),
            collection
        )

    def CreateNew(self, additional_data={}, return_all=True, _vdb_type="", unset_temp=True):
        self.set_temp_attrs(_vdb_type)

        collection = self.GetCollection()

        data = self.conform_new_data(
            new_data=collection.New(
                additional_data=additional_data,
                return_all_data=False  # Let SetProperty in conform_new_data return all after updating
            ),
            collection=collection,
            additional_data=additional_data,
            return_all=return_all
        )

        if unset_temp:
            self.unset_temp_attrs()

        return data

    def SetProperty(
        self, key="", value="", _vdb_type="", _obj_id="", temp_kwargs={}, unset_temp=True, return_all=True
    ):
        return self.SetProperties(
            properties={key: value},
            _vdb_type=_vdb_type,
            _obj_id=_obj_id,
            temp_kwargs=temp_kwargs,
            unset_temp=unset_temp,
            return_all=return_all
        )

    def SetProperties(
        self, properties={}, return_response_only=True, _vdb_type="",
        _obj_id="", temp_kwargs={}, unset_temp=True, return_all=True
    ):
        self.set_temp_attrs(_vdb_type, _obj_id, **temp_kwargs)

        orig_data = {}
        collection = self.GetCollection()
        validated_properties = self.validate_properties(properties, collection)
        response = self.get_set_properties_response(validated_properties, collection)

        if not response:
            orig_data = collection.Get(self.ObjID)

            response = collection.SetProperties(
                obj_id=self.ObjID,
                properties=validated_properties,
                return_all_data=return_all
            )

        if unset_temp:
            self.unset_temp_attrs()

        if not return_response_only:
            return response, validated_properties, orig_data

        return response

    def GetComboOptions(self, combo_types=[], combos_kwargs={}):
        combo_options = {}

        for vdb_type in combo_types:
            combo_options[vdb_type] = self._get_combo_options(vdb_type)

            if not combo_options[vdb_type]:
                combo_options[vdb_type] = self.get_combos(
                    vdb_type=vdb_type,
                    **combos_kwargs
                )

        return combo_options

    def GetAssetPathMap(self):
        response = {}
        collection = self.GetCollection()

        for obj_id in collection.All["order"]:
            obj_data = collection.All["data"][obj_id]

            if not obj_data or self.skip_asset_map(obj_data):
                continue

            response[obj_data.get("asset_path") or obj_id] = obj_id

        return response

    def GetDetails(
        self, combo_options=[], add_details_kwargs={}, _vdb_type="", _obj_id="", temp_kwargs={}, unset_temp=True
    ):
        self.set_temp_attrs(_vdb_type, _obj_id, **temp_kwargs)

        collection = self.GetCollection()
        obj_data = collection.Get(self.ObjID)

        if not obj_data or not obj_data.get("id"):
            raise ValueError(f"No data available for vdb_type: {self.Type} and obj_id {self.ObjID}")

        response = self.add_details(
            collection=collection,
            obj_data=obj_data,
            **add_details_kwargs
        )

        if combo_options:
            response["combo_options"] = self.GetComboOptions(
                combo_types=combo_options,
                combos_kwargs=self.get_details_combos_kwargs(response)
            )

        if unset_temp:
            self.unset_temp_attrs()

        return response

    def GetDetailsAll(self, add_details_kwargs={}, _vdb_type="", temp_kwargs={}, unset_temp=True, obj_id_filter=[]):
        self.set_temp_attrs(_vdb_type, **temp_kwargs)

        collection = self.GetCollection()

        if obj_id_filter:
            all_data = {
                "data": {},
                "order": obj_id_filter
            }

            for obj_id in obj_id_filter:
                all_data["data"][obj_id] = collection.Get(obj_id)
        else:
            all_data = collection.GetAll()

            if not all_data.get("order"):
                return all_data

        all_data = self.filter_get_details_all_data(all_data)

        for obj_id in all_data["order"]:
            self.ObjID = obj_id

            all_data["data"][obj_id] = self.add_details(
                collection=collection,
                obj_data=all_data["data"][obj_id],
                **add_details_kwargs
            )

        if unset_temp:
            self.unset_temp_attrs()

        return all_data

    def GetCollection(self, vdb_type=""):
        if vdb_type:
            vdb_type_provided = True
        else:
            vdb_type = self.Type
            vdb_type_provided = False

        if not vdb_type.startswith("vdb_"):
            vdb_type = f"vdb_{vdb_type}"

        if not self.collections.get(vdb_type):
            collection = self._get_collection(vdb_type, vdb_type_provided)  # noqa

            if collection:
                self.collections[vdb_type] = collection
            else:
                from Dash.Collection import Collection

                self.collections[vdb_type] = Collection(
                    store_path=vdb_type,
                    nested=True,
                    dash_context=self.DashContext,
                    sort_by_key=self.get_sort_by_key(vdb_type) if vdb_type_provided else self.sort_by_key
                )

        return self.collections[vdb_type]

    # ------------------------ 3D PIPELINE ------------------------

    def Get3DPipelineAssets(self, vdb_type="", obj_id=""):
        if not vdb_type:
            vdb_type = self.Type

        if not obj_id:
            obj_id = self.ObjID

        data = {}

        pipeline_root = os.path.join(
            self.GetCollection(vdb_type).Root,
            obj_id,
            "3d_pipeline"
        )

        if not os.path.exists(pipeline_root):
            return data

        from Dash.LocalStorage import Read

        for asset_type in os.listdir(pipeline_root):
            root = os.path.join(pipeline_root, asset_type)

            for file in os.listdir(root):
                if not file.endswith(".json"):
                    continue

                data[asset_type] = Read(os.path.join(root, file))

                break

        return data

    def Upload3DPipelineAsset(self, file_bytes, filename, asset_type):
        if asset_type not in ["graphic", "texture", "model"]:
            raise ValueError(f"Unhandled asset type: {asset_type}")

        if asset_type in ["graphic", "texture"] and not filename.lower().endswith(".png"):
            from Dash.Utils import ClientAlert

            raise ClientAlert(f"Image uploads for 3D assets must be PNG format: {filename}")

        if asset_type == "model" and not filename.lower().endswith(".fbx"):
            from Dash.Utils import ClientAlert

            raise ClientAlert(f"Model uploads for 3D assets must be FBX format: {filename}")

        from Dash.Utils import UploadFile

        texture_url = ""
        texture_path = ""
        updated_glb_url = ""
        pipeline_root = os.path.join(self.GetCollection().Root, self.ObjID, "3d_pipeline")
        root = os.path.join(pipeline_root, asset_type)

        if os.path.exists(root):
            from shutil import rmtree

            rmtree(root, ignore_errors=True)

        os.makedirs(pipeline_root, exist_ok=True)

        # Include existing texture to bake it into the GLB
        if asset_type == "model":
            from Dash.Utils import GetFileURLFromPath

            texture_path = self.get_texture_path(os.path.join(pipeline_root, "texture"))

            texture_url = GetFileURLFromPath(
                dash_context=self.DashContext,
                server_file_path=texture_path
            )

        uploaded_file = UploadFile(
            dash_context=self.DashContext,
            user=self.User,
            file_root=root,
            file_bytes_or_existing_path=file_bytes,
            filename=filename,
            enforce_single_period=False,
            enforce_unique_filename_key=False,
            related_file_path=texture_path,
            include_jpg_thumb=False
        )

        # Re-convert existing FBX to GLB with the newly uploaded texture
        if asset_type == "texture":
            updated_glb_url = self.update_glb(
                os.path.join(pipeline_root, "model"),
                os.path.join(root, f"{uploaded_file['id']}_orig.png")
            )

        if asset_type == "model" or asset_type == "texture":
            model_url = updated_glb_url.replace(
                ".glb", ".fbx"
            ) if updated_glb_url else uploaded_file.get("url")

            texture_url = texture_url if texture_url else uploaded_file.get("orig_url")

            if model_url and texture_url:
                self.queue_3d_pipeline_asset_bundle(
                    color_url=texture_url,
                    model_url=model_url,
                    root=os.path.join(pipeline_root, "asset_bundle")
                )

        return {
            "uploaded_file": uploaded_file,
            "updated_glb_url": updated_glb_url
        }

    def Rebuild3DPipelineAssetBundle(self, vdb_type="", obj_id=""):
        if not vdb_type:
            vdb_type = self.Type

        if not obj_id:
            obj_id = self.ObjID

        if not vdb_type.startswith("vdb_"):
            vdb_type = f"vdb_{vdb_type}"

        assets = self.Get3DPipelineAssets(vdb_type, obj_id)

        if (
            not assets
            or not assets.get("model")
            or not assets.get("texture")
            or not assets["texture"].get("orig_url")
            or not assets["model"].get("url")
        ):
            from Dash.Utils import ClientAlert

            raise ClientAlert("Model and/or texture are missing")

        pipeline_root = self.get_3d_pipeline_root(vdb_type, obj_id)
        asset_bundle_root = os.path.join(pipeline_root, "asset_bundle")

        os.makedirs(pipeline_root, exist_ok=True)

        self.queue_3d_pipeline_asset_bundle(
            color_url=assets["texture"]["orig_url"],
            model_url=assets["model"]["url"],
            root=asset_bundle_root
        )

        return {vdb_type: [obj_id]}

    def Rebuild3DPipelineAssetBundles(self):
        queued = {}
        vdb_obj_map = self.get_3d_pipeline_vdb_obj_map()

        for vdb_type in vdb_obj_map:
            for obj_id in vdb_obj_map[vdb_type]:
                try:
                    response = self.Rebuild3DPipelineAssetBundle(vdb_type, obj_id)
                except:
                    continue

                if response.get("error"):
                    continue

                if vdb_type not in queued:
                    queued[vdb_type] = []

                queued[vdb_type].append(obj_id)

        return queued

    def Validate3DPipelineAssetBundle(self, vdb_type="", obj_id=""):
        if not vdb_type:
            vdb_type = self.Type

        if not obj_id:
            obj_id = self.ObjID

        if not vdb_type.startswith("vdb_"):
            vdb_type = f"vdb_{vdb_type}"

        if not os.path.exists(self.get_3d_pipeline_root(vdb_type, obj_id)):
            from Dash.Utils import ClientAlert

            raise ClientAlert("3D Pipeline folder missing")

        exists = bool(self.Get3DPipelineAssets(vdb_type, obj_id).get("asset_bundle"))

        if exists:  # It won't exist if queued, so no need to check queue
            return {
                "exists": exists,
                "queued": False
            }

        from Dash.LocalStorage import Read

        queued = False

        for filename in os.listdir(self.asset_bundle_queue_root):
            data = Read(os.path.join(self.asset_bundle_queue_root, filename))

            if f"{vdb_type}/{obj_id}/" in data["root"]:
                queued = True

                break

        return {
            "exists": exists,
            "queued": queued
        }

    def Validate3DPipelineAssetBundles(self):
        exists = {}
        queued = {}
        missing = {}
        vdb_obj_map = self.get_3d_pipeline_vdb_obj_map()

        for vdb_type in vdb_obj_map:
            for obj_id in vdb_obj_map[vdb_type]:
                try:
                    response = self.Validate3DPipelineAssetBundle(vdb_type, obj_id)
                except:
                    continue

                if response.get("error"):
                    continue

                if response["exists"]:
                    if vdb_type not in exists:
                        exists[vdb_type] = []

                    exists[vdb_type].append(obj_id)
                else:
                    if vdb_type not in missing:
                        missing[vdb_type] = []

                    missing[vdb_type].append(obj_id)

                if response["queued"]:
                    if vdb_type not in queued:
                        queued[vdb_type] = []

                    queued[vdb_type].append(obj_id)

        return {
            "missing": missing,
            "queued": queued,
            "exists": exists
        }

    def Get3DPipelineAssetBundleQueue(self):
        from Dash.LocalStorage import Read

        queued = {}
        queue_root = os.path.join(self.DashContext["srv_path_local"], "asset_bundle_queue")
        files = os.listdir(queue_root)

        files.sort()

        for filename in files:
            data = Read(os.path.join(queue_root, filename))
            split = data["root"].replace(self.DashContext["srv_path_local"], "").lstrip("/").split("/")
            vdb_type = split[0]
            obj_id = split[1]

            if vdb_type not in queued:
                queued[vdb_type] = []

            queued[vdb_type].append(obj_id)

        return queued
