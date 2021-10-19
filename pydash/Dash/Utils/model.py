#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys
import fbx

from random import randint
from shutil import move, copyfile
from Dash.LocalStorage import Write, Read


def ConvertFBXToGLB(existing_fbx_path, output_glb_path, txt_path=None, compress_txt=False):
    if sys.version_info[0] >= 3:
        # As of July 2020, Autodesk's FBX's python bindings only exist for python2

        from json import loads
        from . import OapiRoot
        from subprocess import check_output

        py_root = "/usr/bin/python2"
        module = os.path.join(OapiRoot, "dash", "github", "dash", "pydash", "Dash", "Utils", "model.py")
        response = check_output(" ".join([py_root, module, existing_fbx_path, output_glb_path, txt_path]), shell=True).strip()

        return loads(response)
    else:
        return _FBXConverter(existing_fbx_path, output_glb_path, txt_path, compress_txt).ToGLB()


class _FBXConverter:
    def __init__(self, existing_fbx_path, output_glb_path, txt_path=None, compress_txt=False, can_print=False):
        self.fbx_path = existing_fbx_path
        self.output_glb_path = output_glb_path
        self.txt_path = txt_path
        self.compress_txt = compress_txt
        self.can_print = can_print

        if self.fbx_path.split(".")[-1].strip().lower() != "fbx":
            raise Exception(f"{self.__class__.__name__} only handles fbx files: {self.fbx_path}")

        if sys.version_info[0] >= 3:
            raise Exception(f"{self.__class__.__name__} must be executed in Python 2 (as of July 2020)")

        self.log = []
        self.output_log_path = self.output_glb_path.replace(".glb", ".glblog")
        self.conversion_path = os.path.join("/var", "tmp", str(randint(10000, 99999)), "_fbx_validator")
        self.local_fbx_path = os.path.join(self.conversion_path, self.fbx_path.split("/")[-1].strip())
        self.local_fbx_converted_path = self.local_fbx_path.replace(".fbx", "_converted.fbx")

        self.manager = fbx.FbxManager.create()
        self.importer = fbx.FbxImporter.create(self.manager, "dash_importer")
        self.status = self.importer.Initialize(self.local_fbx_path)

        if not self.status:
            raise Exception(f"Failed to import fbx from {self.local_fbx_path}")

        self.exporter = fbx.FbxExporter.create(self.manager, "")
        self.scene = fbx.FbxScene.create(self.manager, "fbx_scene")
        self.asciiFormatIndex = self.get_ascii_format_index(self.manager)

    @property
    def LogPath(self):
        return self.output_log_path

    def ToGLB(self):
        error = None

        try:
            local_txt_path = self.setup_files()

            self.importer.Import(self.scene)
            self.importer.Destroy()

            if self.txt_path:
                nodes_with_materials = self.get_all_nodes(self.scene.GetRootNode())

                if not nodes_with_materials:
                    raise Exception("No nodes containing materials were found!")

                if not self.set_materials(local_txt_path, nodes_with_materials):
                    raise Exception("Failed to set materials!")

            self.save()

            if not os.path.exists(self.local_fbx_converted_path):
                raise Exception("Failed to save processed file")

            self.create_glb()
        except:
            from traceback import format_exc

            error = format_exc()

        return self.write_log(error)

    def write_log(self, error=None):
        log_content_text = "not produced"

        if os.path.exists(self.output_log_path):
            log_content_text = Read(self.output_log_path)

        log_content = {
            "glb_path": self.output_glb_path,
            "fbx_2_gltf_log": log_content_text,
            "process_log": self.log,
            "error": error,
        }

        Write(self.output_log_path, log_content)

        return log_content

    def add_to_log(self, msg):
        if self.can_print:
            print(msg)

        self.log.append(msg)

    def create_glb(self):
        self.add_to_log("Creating glb")

        found_glb = None
        cmd = f"cd {self.conversion_path}; FBX2glTF {self.local_fbx_converted_path} --embed --binary --khr-materials-unlit"

        if not self.can_print:
            cmd += f"  > {self.output_log_path} 2>&1"

        os.system(cmd)

        for filename in os.listdir(self.conversion_path):
            if filename.startswith(".") or filename.endswith(".meta"):
                continue

            if filename.endswith(".glb"):
                found_glb = os.path.join(self.conversion_path, filename)

                break

        if not found_glb:
            raise Exception("Failed to produce .glb")

        move(found_glb, self.output_glb_path)

        # Shouldn't need this
        # os.system(f"chmod 755 {self.output_glb_path}")
        # os.system(f"chown ensomniac {self.output_glb_path}")
        # os.system(f"chgrp psacln {self.output_glb_path}")

        self.add_to_log(f"Wrote {self.output_glb_path}")

    def setup_files(self):
        os.makedirs(self.conversion_path)

        self.add_to_log("Creating temp files")

        copyfile(self.fbx_path, self.local_fbx_path)

        if not self.txt_path:
            return None

        if self.compress_txt:
            from PIL.Image import open as OpenImage

            local_txt_path = os.path.join(
                self.conversion_path,
                f"{self.txt_path.split('/')[-1].strip().split('.')[0]}.jpg"
            )

            img = OpenImage(self.txt_path)

            img.thumbnail([512, 512])
            img.save(local_txt_path, quality=50)
        else:
            local_txt_path = os.path.join(
                self.conversion_path,
                self.txt_path.split("/")[-1].strip()
            )

            copyfile(self.txt_path, local_txt_path)

        return local_txt_path

    def set_materials(self, local_txt_path, nodes_with_materials):
        material_set = False

        for node_with_material in nodes_with_materials:
            self.add_to_log("Removing all materials...")

            node_with_material.RemoveAllMaterials()

            new_material = fbx.FbxSurfaceLambert.create(self.scene, "Automatically Generated Material")

            self.add_to_log(f"\tAdding texture to new material {new_material.GetName()}")

            texture = fbx.FbxFileTexture.create(self.scene, "Automatically Generated Texture")

            texture.SetFileName(local_txt_path)

            set_successfully = new_material.TransparentColor.ConnectSrcObject(texture)

            node_with_material.AddMaterial(new_material)

            if not set_successfully:
                raise Exception("Failed to assign material correctly")

            material_set = True

        return material_set

    def save(self):
        if not self.exporter.Initialize(self.local_fbx_converted_path, self.asciiFormatIndex):
            raise Exception("Failed to initialize save")

        self.exporter.Export(self.scene)
        self.exporter.Destroy()

        self.add_to_log(f"Saved {self.local_fbx_converted_path}")

    def get_ascii_format_index(self, p_manager):
        """
        Obtain the index of the ASCII export format.
        """

        # Count the number of formats we can write to
        num_formats = p_manager.GetIOPluginRegistry().GetWriterFormatCount()

        # Set the default format to the native binary format
        format_index = p_manager.GetIOPluginRegistry().GetNativeWriterFormat()

        # Get the FBX format index whose corresponding description contains "ascii"
        for i in range(0, num_formats):

            # First check if the writer is an FBX writer
            if p_manager.GetIOPluginRegistry().WriterIsFBX(i):

                # Obtain the description of the FBX writer
                description = p_manager.GetIOPluginRegistry().GetWriterFormatDescription(i)

                # Check if the description contains 'ascii'
                if "ascii" in description:
                    format_index = i

                    break

        # Return the file format
        return format_index

    def get_all_nodes(self, node, nodes_with_materials=[]):
        if node.GetMaterialCount():
            nodes_with_materials.append(node)

        for i in range(0, node.GetChildCount()):
            nodes_with_materials = self.get_all_nodes(node.GetChild(i), nodes_with_materials)

        return nodes_with_materials
