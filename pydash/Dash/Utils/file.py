#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# TODO: Ideally, we should get rid of all old "orig_" key prefixes (from old image upload
#  system), but it will likely break things across some projects, so maybe at some point in the future

import os
import sys

from .errors import ClientAlert
from .model import ModelExtensions
from Dash.LocalStorage import Read, Write, ConformPermissions

VideoExtensions = ["mp4"]
AudioExtensions = ["mp3", "wav", "ogg"]
FontExtensions  = ["ttf", "otf", "woff", "woff2"]
ImageExtensions = ["png", "jpg", "jpeg", "gif", "tiff", "tga", "bmp", "heic"]


# Using an existing path instead of file bytes is a way to spoof a copied file as an upload
def Upload(
        dash_context, user, file_root, file_bytes_or_existing_path, filename, nested=False, parent_folders=[], enforce_unique_filename_key=True,
        existing_data_for_update={}, enforce_single_period=True, allowable_executable_exts=[], related_file_path="", target_aspect_ratio=None,
        additional_data={}, replace_extra_periods=True, include_jpg_thumb=True, include_png_thumb=True, include_square_thumb=False, include_orig_png=True
):
    if type(file_bytes_or_existing_path) is not bytes:
        if type(file_bytes_or_existing_path) is not str:
            raise Exception("Param 'file_bytes_or_existing_path' must be either bytes or string")

        if not os.path.exists(file_bytes_or_existing_path):
            raise Exception("When param 'file_bytes_or_existing_path' is a string, it must be an existing path")

    period_count = filename.count(".")

    if enforce_single_period:
        if period_count != 1:
            raise ClientAlert(f"Filename is invalid, it must have a single period (for the extension): {filename}")
    else:
        if period_count < 1:
            raise ClientAlert(f"Filename is invalid, there must be at least one period (for the extension): {filename}")

    file_ext = get_file_extension(filename)

    if not file_ext or not (2 <= len(file_ext) <= 6):
        raise ClientAlert(f"Invalid file extension: {file_ext}")

    if file_ext in executable_extensions and file_ext not in allowable_executable_exts:
        raise ClientAlert(f"Executable files are not permitted (.{file_ext}). If you believe this is in error, please let an admin know.")

    if file_ext == "gif":
        include_jpg_thumb = False
        include_png_thumb = False
        include_square_thumb = False

    if period_count > 1 and replace_extra_periods:
        filename = replace_extra_periods_in_filename(filename, file_ext)

    is_image = file_ext in ImageExtensions

    if is_image:
        img, file_data = get_image_with_data(
            file_bytes_or_existing_path,
            existing_data_for_update.get("orig_filename") or filename,
            target_aspect_ratio
        )
    else:
        img = None
        file_data = {"filename": existing_data_for_update.get("filename") or filename}

    if additional_data:
        file_data.update(additional_data)

    file_data = add_default_keys(file_data, user, existing_data=existing_data_for_update)
    file_root = get_root(file_root, file_data["id"], nested)

    if existing_data_for_update:
        file_data["parent_folders"] = existing_data_for_update.get("parent_folders")
    else:
        file_data["parent_folders"] = parse_parent_folders(file_root, file_data["id"], parent_folders)

    if is_image:
        file_data = update_data_with_saved_images(
            file_data,
            file_root,
            file_ext,
            img,
            dash_context,
            replace_existing=bool(existing_data_for_update),
            include_jpg_thumb=include_jpg_thumb,
            include_png_thumb=include_png_thumb,
            include_square_thumb=include_square_thumb,
            include_orig_png=include_orig_png
        )
    else:
        file_data = update_data_with_saved_file(
            file_data,
            file_root,
            file_ext,
            file_bytes_or_existing_path,
            dash_context,
            replace_existing=bool(existing_data_for_update),
            related_file_path=related_file_path
        )

    if enforce_unique_filename_key and not existing_data_for_update:
        file_data = EnsureUniqueFilename(file_data, file_root, nested, is_image)

    Write(os.path.join(file_root, f"{file_data['id']}.json"), file_data)

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


def ValidateImageAspectRatio(image_bytes, target_aspect_ratio, return_image_aspect_ratio=False):
    from PIL import Image
    from io import BytesIO

    return validate_image_aspect_ratio(
        Image.open(BytesIO(image_bytes)),
        target_aspect_ratio,
        return_image_aspect_ratio
    )


def GetURLFromPath(dash_context, server_file_path, add_anti_caching_id=False):
    url = f"https://{os.path.join(dash_context['domain'], server_file_path.replace(dash_context['srv_path_http_root'], ''))}"

    # Add a unique ID to the URL to forcibly bypass the client's cached version, forcing any preview to update
    if add_anti_caching_id:
        from .number import GetRandomID

        id_tag = "?id="

        if id_tag in url:
            url = url.split(id_tag)[0]

        # Mistakes we made
        elif "?=id=" in url:
            url = url.split("?=id=")[0]

        url += f"{id_tag}{GetRandomID()}"

    return url


def GetPathFromURL(dash_context, server_file_url):
    # For some weird reason, join() wasn't working properly without splitting both elements first

    if "?" in server_file_url:
        server_file_url = server_file_url.split("?")[0].strip()

    return "/" + os.path.join(
        *dash_context["srv_path_http_root"].split("/"),
        *server_file_url.replace(f"https://{dash_context['domain']}", "").split("/")
    )


def EnsureUniqueFilename(file_data, file_root, nested, is_image):
    if not file_data or not file_root:
        return file_data

    if is_image:
        key = "orig_filename"
    else:
        key = "filename"

    matches = []
    filename = get_tagless_filename(file_data[key])
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


def ImageHasTransparency(pil_image_object=None, file_bytes_or_existing_path="", filename=""):
    if not pil_image_object and not file_bytes_or_existing_path:
        raise ValueError("Must provide either 'pil_image_object' or 'file_bytes_or_existing_path'")

    if not pil_image_object:
        pil_image_object = get_pil_image_object(file_bytes_or_existing_path, filename)

    try:
        # So far, this one-liner has proven more than sufficient, but if
        # there are fringe cases that don't get caught by this, we may need
        # to incorporate the other two checks from this SO post:
        # https://stackoverflow.com/a/58567453/14804363
        return pil_image_object.info.get("transparency", None) is not None
    except:
        return False


def get_tagless_filename(filename):
    if ")." not in filename:
        return filename

    split = filename.split(").")
    sub_split = split[0].split("(")

    if not sub_split[-1].isdigit():
        return filename

    sub_split.pop()

    return get_tagless_filename(f"{'('.join(sub_split).strip()}.{split[-1]}")


def replace_extra_periods_in_filename(filename, extension):
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


def get_image_with_data(file_bytes_or_existing_path, filename, target_aspect_ratio=None):
    img = get_pil_image_object(file_bytes_or_existing_path, filename)

    if target_aspect_ratio and not validate_image_aspect_ratio(img, target_aspect_ratio):
        raise Exception(f"Invalid image aspect ratio, expected: {target_aspect_ratio}")

    img_format = img.format.lower()

    if (img_format in ["jpg", "jpeg"] or filename.endswith("jpg") or filename.endswith("jpeg")) and img.mode == "RGBA":
        img = img.convert("RGB")

    file_data = {
        "exif": process_exif_image_data(img),
        "org_format": img_format,
        "orig_filename": filename,
        "orig_width": img.size[0],
        "orig_height": img.size[1],
        "orig_aspect": img.size[0] / float(img.size[1]),
    }

    if file_data["exif"] and "Orientation" in file_data["exif"]:
        img, file_data["rot_deg"] = rotate_image(img, file_data["exif"])

    return img, file_data


def get_pil_image_object(file_bytes_or_existing_path, filename=""):
    from PIL import Image

    # This is required for PIL to be able to load HEIC images
    if filename and filename.lower().endswith(".heic"):
        from pillow_heif import register_heif_opener

        register_heif_opener()

    # Allow large uploads, no concern for DecompressionBombError
    Image.MAX_IMAGE_PIXELS = None

    if type(file_bytes_or_existing_path) is bytes:
        from io import BytesIO

        return Image.open(BytesIO(file_bytes_or_existing_path))

    if type(file_bytes_or_existing_path) is str:
        return Image.open(file_bytes_or_existing_path)

    return None


def validate_image_aspect_ratio(image, target_aspect_ratio, return_image_aspect_ratio=False):
    valid = True
    image_aspect_ratio = image.size[0] / image.size[1]

    if abs(image_aspect_ratio - target_aspect_ratio) > 0.01:
        valid = False

    if return_image_aspect_ratio:
        return valid, image_aspect_ratio

    return valid


def update_data_with_saved_images(
        file_data, file_root, file_ext, img, dash_context, replace_existing=False,
        include_jpg_thumb=True, include_png_thumb=True, include_square_thumb=False, include_orig_png=True
):
    orig_path = os.path.join(file_root, f"{file_data['id']}{'' if file_ext == 'gif' else '_orig'}.{file_ext}") if include_orig_png else ""
    thumb_path = os.path.join(file_root, f"{file_data['id']}_thb.jpg") if include_jpg_thumb else ""
    thumb_png_path = os.path.join(file_root, f"{file_data['id']}_thb.png") if include_png_thumb else ""
    thumb_square_path = os.path.join(file_root, f"{file_data['id']}_sq_thb.jpg") if include_square_thumb else ""

    if replace_existing:
        for path in [orig_path, thumb_path, thumb_square_path, thumb_png_path]:
            if os.path.exists(path):
                os.remove(path)

    img = save_images(img, orig_path, thumb_path, thumb_square_path, thumb_png_path)

    url_data = {
        "orig_url": GetURLFromPath(dash_context, orig_path) if orig_path else "",
        "thumb_url": GetURLFromPath(dash_context, thumb_path) if thumb_path else "",
        "thumb_sq_url": GetURLFromPath(dash_context, thumb_square_path) if thumb_square_path else "",
        "thumb_png_url": GetURLFromPath(dash_context, thumb_png_path) if thumb_png_path else "",
        "width": img.size[0],
        "height": img.size[1],
        "aspect": img.size[0] / float(img.size[1])
    }

    if thumb_path and os.path.exists(thumb_path):
        url_data["thumb_url"] = GetURLFromPath(dash_context, thumb_path)

    if thumb_square_path and os.path.exists(thumb_square_path):
        url_data["thumb_sq_url"] = GetURLFromPath(dash_context, thumb_square_path)

    if thumb_png_path and os.path.exists(thumb_png_path):
        url_data["thumb_png_url"] = GetURLFromPath(dash_context, thumb_png_path)

    file_data.update(url_data)

    return file_data


def update_data_with_saved_file(file_data, file_root, file_ext, file_bytes_or_existing_path, dash_context, replace_existing=False, related_file_path=""):
    file_path = os.path.join(file_root, f"{file_data['id']}.{file_ext}")

    if replace_existing and os.path.exists(file_path):
        os.remove(file_path)

    if type(file_bytes_or_existing_path) is bytes:
        Write(file_path, file_bytes_or_existing_path)

    elif type(file_bytes_or_existing_path) is str:
        from shutil import copyfile

        copyfile(file_bytes_or_existing_path, file_path)

    file_data["url"] = GetURLFromPath(dash_context, file_path)

    if file_ext in ModelExtensions:
        glb_path = convert_model_to_glb(
            file_ext,
            file_path,
            replace_existing=replace_existing,
            related_file_path=related_file_path
        )

        if os.path.exists(glb_path):
            file_data["glb_url"] = GetURLFromPath(dash_context, glb_path)

    elif file_ext in FontExtensions:
        if file_ext.startswith("woff"):
            from fontTools.ttLib.woff2 import decompress

            ttf_path = os.path.join(file_root, f"{file_data['id']}.ttf")

            decompress(file_path, ttf_path)

            file_data["ttf_url"] = GetURLFromPath(dash_context, ttf_path)
        else:
            from fontTools.ttLib.woff2 import compress

            woff2_path = os.path.join(file_root, f"{file_data['id']}.woff2")

            compress(file_path, woff2_path)

            file_data["woff2_url"] = GetURLFromPath(dash_context, woff2_path)

    elif file_ext in AudioExtensions:
        pass  # TODO: convert to mp3 if not already, or something along those lines

    elif file_ext in VideoExtensions:
        pass  # TODO: create some sort of compressed version or something?

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

            try:
                tag_number = int(sub_split[0].strip())
                other_filename_value = f"{split[0]}.{sub_split[-1]}"
            except:
                pass

    if other_filename_value != filename:
        return None

    if parent_folders and parent_folders == other_file_parents:
        return tag_number

    if not parent_folders and not other_file_parents:
        return tag_number

    return None


def convert_model_to_glb(source_model_file_ext, source_model_file_path, replace_existing=False, related_file_path=""):
    glb_path = f"{source_model_file_path.strip().rstrip(source_model_file_ext)}glb"

    if replace_existing and os.path.exists(glb_path):
        os.remove(glb_path)

    if source_model_file_ext == "fbx":
        from .model import ConvertFBXToGLB

        # ConvertFBXToGLB supports the inclusion of a texture file during the conversion, but we won't use that in this context
        ConvertFBXToGLB(source_model_file_path, glb_path, related_file_path)

    elif source_model_file_ext == "obj":
        from .model import ConvertOBJToGLB

        ConvertOBJToGLB(source_model_file_path, glb_path)

    return glb_path


def save_images(img, orig_path="", thumb_path="", thumb_square_path="", thumb_png_path=""):
    from PIL.Image import ANTIALIAS

    thumb_size = 512

    if orig_path:
        img.save(orig_path)

        ConformPermissions(orig_path)

    # PIL will throw a warning on RGB conversion if img has 'palette' transparency, though it's safe to ignore:
    # "UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images"

    if thumb_png_path:
        png_thumb = img.copy()

        png_thumb.thumbnail((thumb_size, thumb_size), ANTIALIAS)

        # If a file is uploaded as CMYK, it can't be saved as a PNG
        if png_thumb.mode == "CMYK":
            try:
                # Try to preserve transparency is present and if possible
                if ImageHasTransparency(png_thumb):
                    png_thumb = png_thumb.convert("RGBA")
                else:
                    png_thumb = png_thumb.convert("RGB")
            except:
                png_thumb = png_thumb.convert("RGB")

        png_thumb.save(thumb_png_path, quality=40)

    if thumb_path or thumb_square_path:
        # Convert to RGB AFTER saving the original and PNG thumb, otherwise we lose alpha channel if present
        img = img.convert("RGB")

        if img.size[0] > thumb_size or img.size[1] > thumb_size:
            img.thumbnail((thumb_size, thumb_size), ANTIALIAS)

        if thumb_path:
            img.save(thumb_path, quality=40)

            ConformPermissions(thumb_path)

        if thumb_square_path:
            img_square = get_square_image_copy(img)

            if img_square.size[0] > thumb_size or img_square.size[1] > thumb_size:
                img_square = img_square.resize((thumb_size, thumb_size), ANTIALIAS)

            img_square.save(thumb_square_path, quality=40)

            ConformPermissions(thumb_square_path)

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
