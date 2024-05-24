#!/usr/bin/python
#
# Ensomniac 2024, Ryan Martin ryan@ensomniac.com
#                 Andrew Stet stetandrew@gmail.com

import os
import sys


class Utils:
    Type: str
    ObjID: str
    sort_by_key: str
    collections: dict
    DashContext: dict
    unofficial_types: list
    pipeline_3d_types: list
    type_combo_options_rename_map: dict

    def __init__(self):
        pass

    # Intended to be extended (see Candy's VDB module for example)
    def validate_properties(self, properties, collection, validated_properties={}):  # noqa
        # Update display name and asset path (regardless of type)
        if validated_properties.get("first_name") or validated_properties.get("last_name"):
            obj_data = collection.Get(obj_id=self.ObjID)
            first_name = validated_properties.get("first_name") or obj_data.get("first_name") or ""
            last_name = validated_properties.get("last_name") or obj_data.get("last_name") or ""

            validated_properties["display_name"] = f"{first_name.strip()} {last_name.strip()}"

            validated_properties["asset_path"] = self.get_asset_path(
                validated_properties["display_name"],
                collection
            )

        return validated_properties or properties

    # Intended to be extended (see Candy's VDB module for example)
    def add_details(self, collection, obj_data):
        if not obj_data.get("id"):
            raise Exception(f"ID missing from obj - this is uncommon. Data: {obj_data}")

        # VDB types that use 3D assets
        if self.Type in self.pipeline_3d_types:
            obj_data["3d_pipeline_assets"] = self.get_visual_assets(
                collection,
                obj_data["id"],
                "3d_pipeline"
            )

        return obj_data

    # Intended to be overridden (see Candy's VDB module for example)
    def get_visual_assets_root(self, vdb_type, obj_id, folder_name):  # noqa
        return ""

    # Intended to be overridden (see Candy's VDB module for example)
    def get_details__combos_kwargs(self, data):  # noqa
        return {}

    # Intended to be overridden (see Candy's VDB module for example)
    def filter_get_details_all_data(self, data):
        return data

    # Intended to be overridden (see Candy's VDB module for example)
    def modify_get_data(self, data):
        return data

    # Intended to be overridden (see Candy's VDB module for example)
    def modify_get_all_data(self, data):
        return data

    # Intended to be overridden (see Candy's VDB module for example)
    def get_set_properties_response(self, validated_properties, collection):  # noqa
        return {}

    # Intended to be overridden (see Candy's VDB module for example)
    def skip_asset_map(self, obj_data):  # noqa
        return False

    # Intended to be overridden (see Candy's VDB module for example)
    def _get_combo_options(self, vdb_type):  # noqa
        return {}

    # Intended to be overridden (see Candy's VDB module for example)
    def _get_combos_entries(self, vdb_type):  # noqa
        return {}

    # Intended to be overridden (see Candy's VDB module for example)
    def _get_combos_obj_list(self, vdb_type):  # noqa
        return None

    # Intended to be overridden (see Candy's VDB module for example)
    def _filter_combos_entries(self, vdb_type, entries):  # noqa
        return entries

    # Intended to be overridden (see Candy's VDB module for example)
    def _get_collection(self, vdb_type, vdb_type_provided):  # noqa
        return None

    # Intended to be overridden (see Candy's VDB module for example)
    def _get_sort_by_key(self, vdb_type):  # noqa
        return ""

    # --------------------------------------------------------------

    def get_collection(self, vdb_type=""):
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

    def get_sort_by_key(self, vdb_type=""):
        if not vdb_type:
            vdb_type = self.Type

        if vdb_type:
            key = self._get_sort_by_key(vdb_type)

            if key:
                return key

            if vdb_type == "users":
                return "first_name"

        return "display_name"

    def conform_new_data(self, new_data, collection, additional_data={}, return_all=True):
        # We won't have the ID until after it's created, so this can't be done during the creation.
        # Choosing to add an asset path regardless of type, since it's just good to have available.
        if "asset_path" not in additional_data:
            response = collection.SetProperty(
                obj_id=new_data["id"],
                key="asset_path",
                value=new_data["id"],
                return_all_data=return_all
            )
        else:
            if return_all:
                response = collection.GetAll()
            else:
                response = new_data

        if return_all:
            response["vdb_type"] = self.Type

            # Match previous response structure (before SetProperty was introduced here)
            response["new_object"] = new_data["id"]

        # When duplicating, remove sku/deployment data
        obj_root = os.path.join(collection.Root, new_data["id"])
        skus_path = os.path.join(obj_root, "skus.json")
        deployment_root = os.path.join(obj_root, "deployment")

        if os.path.exists(skus_path):
            os.remove(skus_path)

        if os.path.exists(deployment_root):
            from shutil import rmtree

            rmtree(deployment_root)

        return response

    def get_asset_path(self, display_name, collection):
        from Dash.Utils import GetAssetPath

        matches = 0
        asset_path = GetAssetPath(display_name)

        for obj_id in collection.All["data"]:
            if obj_id == self.ObjID:
                continue

            other_asset_path = collection.All["data"][obj_id].get("asset_path")

            if not other_asset_path:
                continue

            if (
                other_asset_path == asset_path
                or (other_asset_path.startswith(f"{asset_path}_") and other_asset_path.split("_")[-1].isdigit())
            ):
                matches += 1

        if matches:
            # Don't need to add 1 because the original is included in the total,
            # but adding one so that the original can technically be considered #1.
            # Also, not worrying about z-filling because it seems unnecessary.
            asset_path += f"_{matches + 1}"

        return asset_path

    def validate_int_prop(self, value, raise_if_none=False):
        try:
            return int(str(value))
        except:
            if raise_if_none:
                from Dash.Utils import ClientAlert

                raise ClientAlert("This must be an integer/number")

            return None

    def validate_bool_prop(self, value, default=None):
        if type(value) is bool:
            return value

        if type(value) is not str:
            return None

        return self.parse_bool(value.lower(), default)

    def parse_bool(self, value, default=None):
        if value == "true":
            return True

        if value == "false":
            return False

        return default if default is not None else value

    def validate_date_prop(self, date_str):
        try:
            from dateparser import parse as parse_dt

            return parse_dt(date_str).isoformat()
        except:
            return None

    def validate_dict_prop(self, value):
        if type(value) is not dict:
            from json import loads

            return loads(value)

        return value

    def get_combos(self, vdb_type="", return_type=False, option_kwargs={}):
        if not vdb_type:
            vdb_type = self.Type

        if vdb_type == "vdb_types":
            return self.get_vdb_type_combo_options()

        combo_options = [{
            "id": "",
            "label_text": "Not Selected"
        }]

        obj_list = self._get_combos_obj_list(vdb_type)  # noqa
        entries = self._get_combos_entries(vdb_type)

        if not entries:
            entries = self.get_collection(vdb_type).All

        entries = self._filter_combos_entries(vdb_type, entries)

        for obj_id in entries["order"]:
            if obj_list is not None and obj_id not in obj_list:
                continue

            option = self.get_combo_option(entries["data"][obj_id], **option_kwargs)

            if option is not None:
                combo_options.append(option)

        if return_type:
            return combo_options, vdb_type

        return combo_options

    def get_combo_option(self, obj_data, display_name=""):
        if not display_name:
            display_name = obj_data.get("display_name") or ""

        if obj_data.get("nickname"):
            if display_name:
                display_name += f" ({obj_data['nickname']})"
            else:
                display_name = obj_data["nickname"]

        obj_id = obj_data["id"]

        if not display_name:
            display_name = obj_id

        option = {
            "label_text": display_name,
            "asset_path": obj_data.get("asset_path") or obj_id,
            "id": obj_id,

            # Keeping this to not break anything, but typically,
            # combos should use "label_text", not "display_name"
            "display_name": display_name
        }

        return option

    def get_vdb_type_combo_options(self):
        to_sort = []
        options = [{"id": "", "label_text": "Not Selected"}]

        for vdb_type in self.get_vdb_types():
            label = self.type_combo_options_rename_map.get(vdb_type) or vdb_type.title().replace(
                "_", " "
            ).replace(
                "Mlb", "MLB"
            ).replace(
                "Nascar", "Candy Racing"
            )

            to_sort.append([
                label,
                {
                    "id": vdb_type,
                    "label_text": label
                }
            ])

        to_sort.sort()

        for pair in to_sort:
            options.append(pair[1])

        return options

    def get_vdb_types(self):
        types = []

        for file in os.listdir(self.DashContext["srv_path_local"]):
            if not file.startswith("vdb"):
                continue

            if not os.path.isdir(os.path.join(self.DashContext["srv_path_local"], file)):
                continue

            types.append(file.replace("vdb_", ""))

        for vdb_type in self.unofficial_types:
            if vdb_type not in types:
                types.append(vdb_type)

        types.sort()

        return types

    def get_visual_assets(self, collection, obj_id, folder_name, vdb_type=""):
        data = {}

        if not vdb_type:
            vdb_type = self.Type

        root = self.get_visual_assets_root(vdb_type, obj_id, folder_name)

        if root is None:
            return data

        if not root:
            root = os.path.join(collection.Root, obj_id, folder_name)

        if not os.path.exists(root):
            return data

        from Dash.LocalStorage import Read

        for asset_type in os.listdir(root):
            asset_type_root = os.path.join(root, asset_type)

            for file in os.listdir(asset_type_root):
                if not file.endswith(".json"):
                    continue

                data[asset_type] = Read(os.path.join(asset_type_root, file))

        return data
