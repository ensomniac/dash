#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# TODO: Ideally, we should get rid of all old "orig_" key prefixes (from old image upload
#  system), but it will likely break things across some projects, so maybe at some point in the future

import os
import sys

from .model import ModelExtensions
from Dash.LocalStorage import Read, Write

ImageExtensions = ["png", "jpg", "jpeg", "gif", "tiff", "tga", "bmp"]


def Upload(
        dash_context, user, file_root, file_bytes, filename, nested=False, parent_folders=[],
        enforce_unique_filename_key=True, existing_data_for_update={}, enforce_single_period=True, allow_executables=False
):
    period_count = filename.count(".")

    if enforce_single_period:
        if period_count != 1:
            raise Exception(f"Filename is invalid, it must have a single period (for the extension): {filename}")
    else:
        if period_count < 1:
            raise Exception(f"Filename is invalid, there must be at least one period (for the extension): {filename}")

    file_ext = get_file_extension(filename)

    if not file_ext or not (2 <= len(file_ext) <= 4):
        raise Exception(f"Invalid file extension: {file_ext}")

    if not allow_executables and file_ext in executable_extensions:
        raise Exception(f"Executable files are not permitted ({file_ext}). If you believe this is in error, please let an admin know.")

    if period_count > 1:
        filename = replace_extra_periods(filename, file_ext)

    img = None
    is_image = file_ext in ImageExtensions

    if is_image:
        img, file_data = get_image_with_data(file_bytes, existing_data_for_update.get("orig_filename") or filename)
    else:
        file_data = {"filename": existing_data_for_update.get("filename") or filename}

    file_data = add_default_keys(file_data, user, existing_data=existing_data_for_update)
    file_root = get_root(file_root, file_data["id"], nested)

    if existing_data_for_update:
        file_data["parent_folders"] = existing_data_for_update.get("parent_folders")
    else:
        file_data["parent_folders"] = parse_parent_folders(file_root, file_data["id"], parent_folders)

    if is_image:
        file_data = update_data_with_saved_images(file_data, file_root, file_ext, img, dash_context, replace_existing=bool(existing_data_for_update))
    else:
        file_data = update_data_with_saved_file(file_data, file_root, file_ext, file_bytes, dash_context, replace_existing=bool(existing_data_for_update))

    if enforce_unique_filename_key and not existing_data_for_update:
        file_data = EnsureUniqueFilename(file_data, file_root, nested, is_image)

    Write(os.path.join(file_root, f"{file_data['id']}.json"), file_data)

    return file_data


def GetURL(dash_context, server_file_path):
    return f"https://{os.path.join(dash_context['domain'], server_file_path.replace(dash_context['srv_path_http_root'], ''))}"


def EnsureUniqueFilename(file_data, file_root, nested, is_image):
    if not file_data or not file_root:
        return file_data

    if is_image:
        key = "orig_filename"
    else:
        key = "filename"

    matches = []
    filename = file_data[key]
    parent_folders = file_data["parent_folders"]

    if nested:
        file_root = file_root.rstrip("/").rstrip(file_data["id"])

        for file_id in os.listdir(file_root):
            other_file_root = os.path.join(file_root, file_id)
            other_file_data_path = os.path.join(other_file_root, f"{file_id}.json")

            if not os.path.exists(other_file_data_path):
                continue

            tag_number = check_filename_key_match(filename, key, parent_folders, other_file_data_path)

            if tag_number is not None:
                matches.append(tag_number)
    else:
        for other_filename in os.listdir(file_root):
            if not other_filename.endswith(".json"):
                continue

            other_file_data_path = os.path.join(file_root, other_filename)

            if not os.path.exists(other_file_data_path):
                continue

            tag_number = check_filename_key_match(filename, key, parent_folders, other_file_data_path)

            if tag_number is not None:
                matches.append(tag_number)

    if 0 in matches:
        # We confirmed that the original filename exists, so we must add a numerical tag
        file_data[key] = update_filename_based_on_matches(filename, matches)

    return file_data


def CreateZIP(dir_path):
    from shutil import make_archive

    split = dir_path.strip("/").split("/")
    dir_to_zip = split.pop(-1)
    dir_path_root = f"/{os.path.join(*split)}/"

    # Returns newly created zip path
    return make_archive(
        base_name=dir_path,
        format="zip",
        root_dir=dir_path_root,
        base_dir=dir_to_zip
    )


def replace_extra_periods(filename, extension):
    split = filename.split(".")

    split.pop()

    return f"{'_'.join(split)}.{extension}"


def add_default_keys(file_data, user, existing_data={}):
    from datetime import datetime
    from .number import GetRandomID

    default_data = {
        "id": GetRandomID(),
        "uploaded_by": user["email"],
        "uploaded_on": datetime.now().isoformat()
    }

    for key, default_value in default_data.items():
        if existing_data.get(key):
            file_data[key] = existing_data[key]

            if key != "id":
                file_data[key.replace("uploaded", "modified")] = default_value
        else:
            file_data[key] = default_value

    return file_data


def parse_parent_folders(file_root, file_id, parent_folders=[]):
    if type(parent_folders) is str and parent_folders.startswith("[") and parent_folders.endswith("]"):
        parent_folders = parent_folders.lstrip("[").rstrip("]")

        if ", " in parent_folders:
            parent_folders = parent_folders.split(", ")

        else:
            parent_folders = parent_folders.split(",")

    if type(parent_folders) is not list:
        return []

    cleaned_list = []
    root_name = file_root.split("/")[-1].strip()

    for folder in parent_folders:
        cleaned_list.append(str(folder).replace("/", "").strip())

    if cleaned_list and (cleaned_list[0] == root_name or cleaned_list[0] == file_id):
        cleaned_list.pop(0)

    return cleaned_list


def get_file_extension(filename):
    return filename.lower().split(".")[-1].strip()


def get_root(root_path, file_id, nested):
    if nested:
        root_path = os.path.join(root_path, file_id)

    os.makedirs(root_path, exist_ok=True)

    return root_path


def get_image_with_data(file_bytes, filename):
    from PIL import Image
    from io import BytesIO

    # Allow large uploads, no concern for DecompressionBombError
    Image.MAX_IMAGE_PIXELS = None

    img = Image.open(BytesIO(file_bytes))

    file_data = {
        "exif": process_exif_image_data(img),
        "org_format": img.format.lower(),
        "orig_filename": filename,
        "orig_width": img.size[0],
        "orig_height": img.size[1],
        "orig_aspect": img.size[0] / float(img.size[1]),
    }

    if file_data["exif"] and "Orientation" in file_data["exif"]:
        img, file_data["rot_deg"] = rotate_image(img, file_data["exif"])

    return img, file_data


def update_data_with_saved_images(file_data, file_root, file_ext, img, dash_context, replace_existing=False):
    file_path = os.path.join(file_root, f"{file_data['id']}_orig.{file_ext}")
    thumb_path = os.path.join(file_root, f"{file_data['id']}_thb.jpg")
    thumb_square_path = os.path.join(file_root, f"{file_data['id']}_sq_thb.jpg")

    if replace_existing:
        for path in [file_path, thumb_path, thumb_square_path]:
            if os.path.exists(path):
                os.remove(path)

    img = save_images(img, file_path, thumb_path, thumb_square_path)

    file_data.update({
        "orig_url": GetURL(dash_context, file_path),
        "thumb_url": GetURL(dash_context, thumb_path),
        "thumb_sq_url": GetURL(dash_context, thumb_square_path),
        "width": img.size[0],
        "height": img.size[1],
        "aspect": img.size[0] / float(img.size[1])
    })

    return file_data


def update_data_with_saved_file(file_data, file_root, file_ext, file_bytes, dash_context, replace_existing=False):
    file_path = os.path.join(file_root, f"{file_data['id']}.{file_ext}")

    if replace_existing and os.path.exists(file_path):
        os.remove(file_path)

    Write(file_path, file_bytes)

    file_data["url"] = GetURL(dash_context, file_path)

    if file_ext in ModelExtensions:
        glb_path = convert_model_to_glb(file_ext, file_path, replace_existing=replace_existing)

        if os.path.exists(glb_path):
            file_data["glb_url"] = GetURL(dash_context, glb_path)

    return file_data


def update_filename_based_on_matches(filename, matches=[]):
    if not matches:
        return filename

    matches.sort()

    num = None

    for n in range(1, 10000):
        if n not in matches:
            num = n

            break

    if num is None:
        num = len(matches)

    tag = f"({num})"

    if "." not in filename:
        return f"{filename} {tag}"

    ext_index = filename.rfind(".")

    return f"{filename[:ext_index]} {tag}{filename[ext_index:]}"


def check_filename_key_match(filename, key, parent_folders, other_file_data_path):
    tag_number = 1
    other_file_data = Read(other_file_data_path)
    other_file_parents = other_file_data.get("parent_folders")
    other_filename_value = other_file_data.get(key)

    if filename == other_filename_value and parent_folders == other_file_parents:  # Perfect match
        return 0

    if other_filename_value and " (" in other_filename_value:
        split = other_filename_value.split(" (")

        if other_filename_value.endswith(")"):
            other_filename_value = split[0]
            tag_number = int(split[-1].replace(")", "").strip())

        elif ")." in other_filename_value:
            sub_split = split[-1].split(").")
            tag_number = int(sub_split[0].strip())
            other_filename_value = f"{split[0]}.{sub_split[-1]}"

    if other_filename_value != filename:
        return None

    if parent_folders and parent_folders == other_file_parents:
        return tag_number

    if not parent_folders and not other_file_parents:
        return tag_number

    return None


def convert_model_to_glb(source_model_file_ext, source_model_file_path, replace_existing=False):
    glb_path = f"{source_model_file_path.strip().rstrip(source_model_file_ext)}glb"

    if replace_existing and os.path.exists(glb_path):
        os.remove(glb_path)

    if source_model_file_ext == "fbx":
        from .model import ConvertFBXToGLB

        # ConvertFBXToGLB supports the inclusion of a texture file during the conversion, but we won't use that in this context
        ConvertFBXToGLB(source_model_file_path, glb_path)

    elif source_model_file_ext == "obj":
        from .model import ConvertOBJToGLB

        ConvertOBJToGLB(source_model_file_path, glb_path)

    return glb_path


def save_images(img, orig_path, thumb_path, thumb_square_path):
    from PIL.Image import ANTIALIAS

    thumb_size = 512

    img.save(orig_path)

    # PIL will throw a warning on RGB conversion if img has 'palette' transparency, though it's safe to ignore:
    # "UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images"

    # Convert to RGB AFTER saving the original, otherwise we lose alpha channel if present
    img = img.convert("RGB")
    img_square = get_square_image_copy(img)

    if img_square.size[0] > thumb_size or img_square.size[1] > thumb_size:
        img_square = img_square.resize((thumb_size, thumb_size), ANTIALIAS)

    if img.size[0] > thumb_size or img.size[1] > thumb_size:
        img.thumbnail((thumb_size, thumb_size), ANTIALIAS)

    img.save(thumb_path, quality=40)

    img_square.save(thumb_square_path, quality=40)

    return img


def get_square_image_copy(img):
    img_square = img.copy()

    if img.size[0] == img.size[1]:
        return img_square

    if img.size[0] > img.size[1]:  # Wider
        size = img.size[1]
        x = int((img.size[0] * 0.5) - (size * 0.5))

        img_square = img.crop((
            x,         # x start
            0,         # y start
            x + size,  # x + width
            size       # y + height
        ))

    else:  # Taller
        size = img.size[0]
        y = int((img.size[1] * 0.5) - (size * 0.5))

        img_square = img.crop((
            0,        # x start
            y,        # y start
            size,     # x + width
            y + size  # y + height
        ))

    return img_square


def process_exif_image_data(img):
    img_exif = img.getexif()

    if img_exif is None:
        return img_exif

    from PIL import ExifTags

    exif_data = {}

    for key, val in img_exif.items():
        if key in ExifTags.TAGS:
            if "." not in str(val):
                continue

            try:
                exif_data[str(ExifTags.TAGS[key])] = float(val)
            except:
                try:
                    exif_data[str(ExifTags.TAGS[key])] = int(val)
                except:
                    exif_data[str(ExifTags.TAGS[key])] = str(val)
        else:
            # [Ryan] I'm not really sure what this case looks like:
            exif_data["__" + str(key)] = str(val)

    return exif_data


def rotate_image(img, exif):
    rot_deg = 0

    if exif.get("Orientation") == 6:
        rot_deg = -90

    elif exif.get("Orientation") == 8:
        rot_deg = 90

    elif exif.get("Orientation") == 3:
        rot_deg = 180

    if rot_deg != 0:
        img = img.rotate(rot_deg, expand=True)

    return img, rot_deg


# Checking against these for security purposes - can re-evaluate if this causes issues
executable_extensions = [
    "bat", "bin", "cmd", "com", "cpl", "exe", "gadget", "inf1", "ins", "inx", "isu", "job", "jse", "lnk", "msc", "msi", "msp",
    "mst", "paf", "pif", "ps1", "reg", "rgs", "scr", "sct", "shb", "shs", "u3p", "vb", "vbe", "vbs", "vbscript", "ws", "wsf", "wsh"
]
