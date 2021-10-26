#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# TODO: Ideally, we should get rid of all old "orig" key tags (from old image upload
#  system), but it will likely break things on the front end, so maybe in the future

import os
import sys

from .model import ModelExtensions
from Dash.LocalStorage import Read, Write

ImageExtensions = ["png", "jpg", "jpeg", "gif", "tiff", "tga", "bmp"]


def Upload(dash_context, user, file_root, file_bytes, filename, nested_on_server=False, parent_folders=[], enforce_unique_filename_key=True):
    if filename.count(".") != 1:
        raise Exception(f"Invalid filename, or no file extension: {filename}")

    file_ext = get_file_extension(filename)

    if not file_ext or not (2 <= len(file_ext) <= 4):
        raise Exception(f"Invalid file extension: {file_ext}")

    if file_ext in executable_extensions:
        raise Exception(f"Executable files are not permitted ({file_ext}). If you believe this is in error, please let an admin know.")

    img = None
    is_image = file_ext in ImageExtensions

    if is_image:
        img, file_data = get_image_with_data(file_bytes, filename, user)
    else:
        file_data = {"filename": filename}

    file_data = add_default_keys(file_data, user)
    file_root = get_root(file_root, file_data["id"], nested_on_server)

    file_data["parent_folders"] = parse_parent_folders(file_root, file_data["id"], parent_folders)

    if is_image:
        file_data = update_data_with_saved_images(file_data, file_root, file_ext, img, dash_context)
    else:
        file_data = update_data_with_saved_file(file_data, file_root, file_ext, file_bytes, dash_context)

    if enforce_unique_filename_key:
        file_data = ensure_filename_key_is_unique(file_data, file_root, nested_on_server, is_image)

    Write(os.path.join(file_root, f"{file_data['id']}.json"), file_data)

    return file_data


def GetURL(dash_context, server_file_path):
    return f"https://{os.path.join(dash_context['domain'], server_file_path.replace(dash_context['srv_path_http_root'], ''))}"


def add_default_keys(file_data, user):
    from datetime import datetime
    from .number import GetRandomID

    file_data.update({
        "id": GetRandomID(),
        "uploaded_by": user["email"],
        "uploaded_on": datetime.now().isoformat()
    })

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


def get_image_with_data(file_bytes, filename, user):
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


def update_data_with_saved_images(file_data, file_root, file_ext, img, dash_context):
    file_path = os.path.join(file_root, f"{file_data['id']}_orig.{file_ext}")
    thumb_path = os.path.join(file_root, f"{file_data['id']}_thb.jpg")
    thumb_square_path = os.path.join(file_root, f"{file_data['id']}_sq_thb.jpg")

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


def update_data_with_saved_file(file_data, file_root, file_ext, file_bytes, dash_context):
    file_path = os.path.join(file_root, f"{file_data['id']}.{file_ext}")

    file_data["url"] = GetURL(dash_context, file_path)

    Write(file_path, file_bytes)

    if file_ext in ModelExtensions:
        glb_path = convert_model_to_glb(file_ext, file_path)

        if os.path.exists(glb_path):
            file_data["glb_url"] = GetURL(dash_context, glb_path)

    return file_data


def ensure_filename_key_is_unique(file_data, file_root, nested, is_image):
    if is_image:
        key = "orig_filename"
    else:
        key = "filename"

    matches = 0
    filename = file_data[key]
    parent_folders = file_data["parent_folders"]

    if nested:
        file_root = file_root.rstrip("/").rstrip(file_data["id"])

        for file_id in os.listdir(file_root):
            other_file_root = os.path.join(file_root, file_id)

            for other_filename in os.listdir(other_file_root):
                if not other_filename.endswith(".json"):
                    continue

                if check_filename_key_match(filename, key, parent_folders, other_filename, other_file_root):
                    matches += 1

                break
    else:
        for other_filename in os.listdir(file_root):
            if not other_filename.endswith(".json"):
                continue

            if check_filename_key_match(filename, key, parent_folders, other_filename, file_root):
                matches += 1

    file_data[key] = update_filename_based_on_matches(filename, matches)

    return file_data


def update_filename_based_on_matches(filename, matches=0):
    if not matches:
        return filename

    # Using the default Mac convention here, may want to change this at some point. It doesn't
    # adhere to our typical naming conventions on the server, but this 'filename' is only for
    # client display purposes anyway, so it's not a big deal unless it isn't optimal for Windows.
    tag = f"({matches + 1})"

    if "." in filename:
        split = filename.split(".")
        extension = split.pop(-1)

        return f"{''.join(split)} {tag}.{extension}"

    return f"{filename} {tag}"


def check_filename_key_match(filename, key, parent_folders, other_filename, other_file_root):
    other_file_data = Read(os.path.join(other_file_root, other_filename))
    other_file_parents = other_file_data.get("parent_folders")

    if other_file_data.get(key) != filename:
        return False

    if parent_folders and parent_folders == other_file_parents:
        return True

    if not parent_folders and not other_file_parents:
        return True

    return False


def convert_model_to_glb(source_model_file_ext, source_model_file_path):
    glb_path = f"{source_model_file_path.strip().rstrip(source_model_file_ext)}glb"

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
