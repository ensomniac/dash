#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

import os
import sys


class Pipeline3D:
    User: dict
    DashContext: dict
    asset_bundle_queue_root: str
    irrelevant_3d_pipeline_vdb_kws: list

    def __init__(self):
        pass

    def get_3d_pipeline_root(self, vdb_type, obj_id):
        return os.path.join(self.DashContext["srv_path_local"], vdb_type, obj_id, "3d_pipeline")

    def get_3d_pipeline_vdb_obj_map(self):
        vdb_obj_map = {}

        for vdb_type in os.listdir(self.DashContext["srv_path_local"]):
            if not vdb_type.startswith("vdb_"):
                continue

            skip = False

            for kw in self.irrelevant_3d_pipeline_vdb_kws:
                if kw in vdb_type:
                    skip = True

                    break

            if skip:
                continue

            vdb_root = os.path.join(self.DashContext["srv_path_local"], vdb_type)

            for obj_id in os.listdir(vdb_root):
                if vdb_type not in vdb_obj_map:
                    vdb_obj_map[vdb_type] = []

                vdb_obj_map[vdb_type].append(obj_id)

        return vdb_obj_map

    # Using this obviously requires a cron to manage these queued files.
    # Reference Candy's AssetBundleGenerationManager cron for an example.
    def queue_3d_pipeline_asset_bundle(
        self, root, color_url="", model_url="", occl_url="", metal_gloss_url="",
        height_url="", normal_url="", ttf_url="", font_scale_mult="", font_top_mult="", font_left_mult=""
    ):
        from datetime import datetime
        from Dash.Utils import GetRandomID
        from Dash.LocalStorage import Write

        if os.path.exists(root):
            from shutil import rmtree

            rmtree(root)

        data = {
            "model_url": model_url,
            "color_url": color_url,
            "occl_url": occl_url,
            "metal_gloss_url": metal_gloss_url,
            "height_url": height_url,
            "normal_url": normal_url,
            "ttf_url": ttf_url,
            "font_scale_mult": str(font_scale_mult),
            "font_top_mult": str(font_top_mult),
            "font_left_mult": str(font_left_mult),
            "root": root,
            "created_by": self.User.get("email") if self.User else "",
            "created_on": datetime.now().isoformat()
        }

        Write(
            os.path.join(self.asset_bundle_queue_root, f"{GetRandomID()}.json"),
            data
        )

        return data

    def get_texture_path(self, texture_root):
        if not os.path.exists(texture_root):
            return ""

        for file in os.listdir(texture_root):
            if not file.endswith("_orig.png"):
                continue

            return os.path.join(texture_root, file)

        return ""

    # As of writing, this conversion only supports the one color texture
    def update_glb(self, model_root, texture_path):
        if not os.path.exists(model_root):
            return None

        fbx_path = ""
        glb_path = ""
        json_path = ""

        for file in os.listdir(model_root):
            if file.endswith(".fbx"):
                fbx_path = os.path.join(model_root, file)

            elif file.endswith(".glb"):
                glb_path = os.path.join(model_root, file)

            elif file.endswith(".json"):
                json_path = os.path.join(model_root, file)

        if not fbx_path or not glb_path or not json_path:
            return None

        from Dash.LocalStorage import Read, Write
        from Dash.Utils import ConvertFBXToGLB, GetRandomID

        os.remove(glb_path)

        ConvertFBXToGLB(
            existing_fbx_path=fbx_path,
            output_glb_path=glb_path,
            txt_path=texture_path
        )

        if not os.path.exists(glb_path):
            return None  # Throw error?

        id_tag = "?id="
        data = Read(json_path)
        glb_url = data.get("glb_url")

        if not glb_url:
            from Dash.Utils import GetFileURLFromPath

            glb_url = GetFileURLFromPath(
                dash_context=self.DashContext,
                server_file_path=glb_path
            )

        if id_tag in glb_url:
            glb_url = glb_url.split(id_tag)[0]

        # Mistakes we made
        elif "?=id=" in glb_url:
            glb_url = glb_url.split("?=id=")[0]

        # Add a nonce to the URL to forcibly bypass the client's
        # cached version, allowing the model viewer to update
        glb_url += f"{id_tag}{GetRandomID()}"

        data["glb_url"] = glb_url

        Write(json_path, data)

        return glb_url
