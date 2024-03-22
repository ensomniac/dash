#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# TODO: Ideally, we should get rid of all old "orig_" key prefixes (from old image upload
#  system), but it will likely break things across some projects, so maybe at some point in the future

import os
import sys

from .errors import ClientAlert
from .model import ModelExtensions
from Dash.LocalStorage import Read, Write, ConformPermissions

ThumbSize = 512
VideoExtensions = ["mp4"]
AudioExtensions = ["mp3", "wav", "ogg"]
FontExtensions = ["ttf", "otf", "woff", "woff2"]
DraftingExtensions = ["cad", "pdg", "dxf", "dwg", "job", "3d"]
ImageExtensions = ["png", "jpg", "jpeg", "gif", "tiff", "tga", "bmp", "heic"]


# Using an existing path instead of file bytes is a way to spoof a copied file as an upload
def Upload(
    dash_context, user, file_root, file_bytes_or_existing_path, filename, nested=False, parent_folders=[],
    enforce_unique_filename_key=True, existing_data_for_update={}, enforce_single_period=True,
    allowable_executable_exts=[], related_file_path="", target_aspect_ratio=0, additional_data={},
    replace_extra_periods=True, include_jpg_thumb=True, include_png_thumb=True, include_square_thumb=False,
    include_orig_png=True, min_size=0, is_mask=False
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

    if not file_ext or not (2 <= len(file_ext) <= 8):
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
            target_aspect_ratio,
            min_size,
            is_mask
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
            include_orig_png=include_orig_png,
            is_mask=is_mask
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


def ValidateImageAspectRatio(
    target_aspect_ratio, file_bytes_or_existing_path="",
    filename="", pil_image_object=None, return_image_aspect_ratio=False
):
    if not pil_image_object and not file_bytes_or_existing_path:
        raise ValueError("Must provide either 'pil_image_object' or 'file_bytes_or_existing_path'")

    return validate_image_aspect_ratio(
        (pil_image_object or get_pil_image_object(file_bytes_or_existing_path, filename)),
        target_aspect_ratio,
        return_image_aspect_ratio
    )


def ValidateVideoAspectRatio(video_bytes_or_existing_path, target_aspect_ratio, return_video_details=False):
    error = ""
    temp = False
    valid = True
    video_details = {}

    if type(video_bytes_or_existing_path) is not bytes:
        if type(video_bytes_or_existing_path) is not str:
            raise Exception("Param 'video_bytes_or_existing_path' must be either bytes or string")

        if not os.path.exists(video_bytes_or_existing_path):
            raise Exception("When param 'video_bytes_or_existing_path' is a string, it must be an existing path")

        path = video_bytes_or_existing_path
    else:
        from .number import GetRandomID
        from Dash.LocalStorage import Write

        temp = True
        path = f"/var/tmp/dash_video_aspect_validation_{GetRandomID()}"

        Write(path, video_bytes_or_existing_path)

    try:
        video_details = get_video_details(path)

        if abs(video_details["aspect"] - target_aspect_ratio) > 0.01:
            valid = False

    except Exception as e:
        error = str(e)

    if temp and os.path.exists(path):
        os.remove(path)

    if error:
        raise Exception(error)

    if return_video_details:
        return valid, video_details

    return valid


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


def ImageIsGrayscale(pil_image_object=None, file_bytes_or_existing_path="", filename=""):
    if not pil_image_object and not file_bytes_or_existing_path:
        raise ValueError("Must provide either 'pil_image_object' or 'file_bytes_or_existing_path'")

    if not pil_image_object:
        pil_image_object = get_pil_image_object(file_bytes_or_existing_path, filename)

    # If 'getcolors()' exceeds 256 (default max value), this method returns None,
    # meaning that you had more than 256 color options in your pixel list, hence
    # it is a colored image (grayscale can only have 256 colors (0,0,0) to (255,255,255))
    return bool(pil_image_object.getcolors())


def ValidateMaskImage(
    file_bytes_or_existing_path="", filename="", pil_image_object=None, target_aspect_ratio=0, raise_reason=True
):
    if not pil_image_object and not file_bytes_or_existing_path:
        raise ValueError("Must provide either 'pil_image_object' or 'file_bytes_or_existing_path'")

    valid = True
    reason = "Invalid mask"

    if not pil_image_object:
        pil_image_object = get_pil_image_object(file_bytes_or_existing_path, filename)

    if target_aspect_ratio:  # Optional check if mask aspect must match aspect of image to be masked
        valid, image_aspect_ratio = ValidateImageAspectRatio(
            target_aspect_ratio,
            pil_image_object=pil_image_object,
            return_image_aspect_ratio=True
        )

        if not valid:
            reason = f"Mask is not the correct aspect ratio ({image_aspect_ratio}), expected: {target_aspect_ratio}"

    if valid and ImageHasTransparency(pil_image_object):
        valid = False
        reason = "Masks cannot have transparency"

    if valid and not ImageIsGrayscale(pil_image_object):
        valid = False
        reason = "Masks must be grayscale"

    if not valid and raise_reason:
        from Dash.Utils import ClientAlert

        raise ClientAlert(reason)

    return valid


def CombinePDFs(pdf_paths, output_path):
    from PyPDF2 import PdfMerger

    pdf_merger = PdfMerger()

    for pdf in pdf_paths:
        with open(pdf, "rb") as file:
            pdf_merger.append(file)

    with open(output_path, "wb") as output:
        pdf_merger.write(output)

    return output_path


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


def get_image_with_data(file_bytes_or_existing_path, filename, target_aspect_ratio=0, min_size=0, is_mask=False):
    img = get_pil_image_object(file_bytes_or_existing_path, filename)

    if min_size and img.size[0] < min_size and img.size[1] < min_size:
        from Dash.Utils import ClientAlert

        raise ClientAlert(f"Image is too small. Make sure either the width or height is at least {min_size}.")

    if is_mask:
        ValidateMaskImage(
            file_bytes_or_existing_path=file_bytes_or_existing_path,
            filename=filename,
            pil_image_object=img,
            target_aspect_ratio=target_aspect_ratio
        )

    elif target_aspect_ratio and not validate_image_aspect_ratio(img, target_aspect_ratio):
        from Dash.Utils import ClientAlert

        raise ClientAlert(f"Invalid image aspect ratio, expected: {target_aspect_ratio}")

    img_format = img.format.lower()

    if is_mask:
        if len(img.getbands()) > 1:  # More than one channel
            img = img.convert("L")

    elif img.mode == "RGBA" and (img_format in ["jpg", "jpeg"] or filename.endswith("jpg") or filename.endswith("jpeg")):
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


def validate_image_aspect_ratio(pil_image_object, target_aspect_ratio, return_image_aspect_ratio=False):
    valid = True
    image_aspect_ratio = pil_image_object.size[0] / pil_image_object.size[1]

    if abs(image_aspect_ratio - target_aspect_ratio) > 0.01:
        valid = False

    if return_image_aspect_ratio:
        return valid, image_aspect_ratio

    return valid


def update_data_with_saved_images(
    file_data, file_root, file_ext, img, dash_context, replace_existing=False, include_jpg_thumb=True,
    include_png_thumb=True, include_square_thumb=False, include_orig_png=True, is_mask=False
):
    is_jpg = file_ext == "jpg" or file_ext == "jpeg"
    bigger_than_thumb = img.size[0] > ThumbSize or img.size[1] > ThumbSize
    orig_path = os.path.join(file_root, f"{file_data['id']}{'' if file_ext == 'gif' else '_orig'}.{file_ext}") if include_orig_png else ""

    # If saving the orig, and the orig image is a jpg, or is already smaller than
    # ThumbSize, don't save the png thumb, otherwise this ends up wasting space on the server
    thumb_png_path = os.path.join(file_root, f"{file_data['id']}_thb.png") if (
        include_png_thumb and ((bigger_than_thumb and not is_jpg) if include_orig_png else True)
    ) else ""

    # If saving the orig, and the orig image is already smaller than
    # ThumbSize and is a jpg/jpeg, don't save the jpg thumb, otherwise
    # this ends up just being a duplicate and wastes space on the server
    thumb_path = os.path.join(file_root, f"{file_data['id']}_thb.jpg") if (
        include_jpg_thumb and ((bigger_than_thumb if is_jpg else True) if include_orig_png else True)
    ) else ""

    # If saving the orig, and the orig image is already smaller than
    # ThumbSize or is not square, and is a jpg/jpeg, don't save the jpg thumb,
    # otherwise this ends up just being a duplicate and wastes space on the server
    thumb_square_path = os.path.join(file_root, f"{file_data['id']}_sq_thb.jpg") if (
        include_square_thumb and ((bigger_than_thumb and img.size[0] != img.size[1] if is_jpg else True) if include_orig_png else True)
    ) else ""

    # CSS accepts SVG and PNG for the mask-image property, but CSS doesn't handle masks the same
    # as Photoshop. They both use white for the visible part of the mask, but while Photoshop
    # uses black for the hidden part, CSS uses transparency for the hidden part. So any non-white
    # values in the grayscale mask need to be converted to white values with transparency based
    # on their darkness. Without this version, the frontend won't be able to use the mask.
    transparent_mask_path = os.path.join(file_root, f"{file_data['id']}_tmask.png") if is_mask else ""

    if replace_existing:
        for path in [orig_path, thumb_path, thumb_square_path, thumb_png_path, transparent_mask_path]:
            if path and os.path.exists(path):
                os.remove(path)

    img = save_images(img, orig_path, thumb_path, thumb_square_path, thumb_png_path, transparent_mask_path)

    url_data = {
        "orig_url": GetURLFromPath(dash_context, orig_path) if orig_path else "",
        "thumb_url": GetURLFromPath(dash_context, thumb_path) if thumb_path else "",
        "thumb_sq_url": GetURLFromPath(dash_context, thumb_square_path) if thumb_square_path else "",
        "thumb_png_url": GetURLFromPath(dash_context, thumb_png_path) if thumb_png_path else "",
        "tmask_url": GetURLFromPath(dash_context, transparent_mask_path) if transparent_mask_path else "",
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
        # Always create a ttf version (Unity supports either ttf or otf, PIL requires ttf)
        if file_ext != "ttf":
            ttf_path = os.path.join(file_root, f"{file_data['id']}.ttf")

            if file_ext.startswith("woff"):
                from fontTools.ttLib.woff2 import decompress

                decompress(file_path, ttf_path)

            elif file_ext == "otf":
                from fontTools.ttLib import TTFont

                font = TTFont(file_path)

                font.save(ttf_path)

            else:
                raise ValueError("Unhandled font extension for ttf conversion!")

            file_data["ttf_url"] = GetURLFromPath(dash_context, ttf_path)

        # Always create a woff version for web
        if not file_ext.startswith("woff"):
            from fontTools.ttLib.woff2 import compress

            woff2_path = os.path.join(file_root, f"{file_data['id']}.woff2")

            compress(file_path, woff2_path)

            file_data["woff2_url"] = GetURLFromPath(dash_context, woff2_path)

    elif file_ext in AudioExtensions:
        pass  # TODO: convert to mp3 if not already, or something along those lines

    elif file_ext in VideoExtensions:
        try:
            file_data.update(get_video_details(file_path))

        except Exception as e:
            from Dash.Utils import SendDebugEmail

            SendDebugEmail(f"Failed to get video details for file: {file_path}\nException: {e}")

        # TODO: create some sort of compressed version or something?

    return file_data


def get_video_details(path):
    from videoprops import get_video_properties

    props = get_video_properties(path)

    # The props object above has way more stuff than we need, but
    # we can update this down the line with more fields as needed
    return {
        "width": props["width"],
        "height": props["height"],
        "aspect": props["width"] / props["height"]
    }


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


def save_images(img, orig_path="", thumb_path="", thumb_square_path="", thumb_png_path="", transparent_mask_path=""):
    from PIL.Image import ANTIALIAS

    if orig_path:
        img.save(orig_path)

        ConformPermissions(orig_path)

    # PIL will throw a warning on RGB conversion if img has 'palette' transparency, though it's safe to ignore:
    # "UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images"

    if thumb_png_path:
        png_thumb = img.copy()

        png_thumb.thumbnail((ThumbSize, ThumbSize), ANTIALIAS)

        # If a file is uploaded as CMYK, it can't be saved as a PNG
        if png_thumb.mode == "CMYK":
            try:
                # Try to preserve transparency if present and if possible
                if ImageHasTransparency(png_thumb):
                    png_thumb = png_thumb.convert("RGBA")
                else:
                    png_thumb = png_thumb.convert("RGB")
            except:
                png_thumb = png_thumb.convert("RGB")

        png_thumb.save(thumb_png_path, quality=40)

        ConformPermissions(thumb_png_path)

    if transparent_mask_path:
        data = []
        tmask = img.copy()

        if tmask.mode != "la":
            tmask = tmask.convert("LA")

        # All pixels become white with their transparency determined by their darkness
        for item in tmask.getdata():
            data.append((255, item[0]))

        tmask.putdata(data)
        tmask.save(transparent_mask_path)

    if thumb_path or thumb_square_path:
        if img.mode != "L":
            # Convert to RGB AFTER saving the original and PNG thumb, otherwise we lose alpha channel if present
            img = img.convert("RGB")

        if img.size[0] > ThumbSize or img.size[1] > ThumbSize:
            img.thumbnail((ThumbSize, ThumbSize), ANTIALIAS)

        if thumb_path:
            img.save(thumb_path, quality=40)

            ConformPermissions(thumb_path)

        if thumb_square_path:
            img_square = get_square_image_copy(img)

            if img_square.size[0] > ThumbSize or img_square.size[1] > ThumbSize:
                img_square = img_square.resize((ThumbSize, ThumbSize), ANTIALIAS)

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
