#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

ImageExtensions = ["png", "jpg", "jpeg", "gif", "tiff", "tga", "bmp"]


# The majority of the time, Upload should be used from file.py instead, and it will decide if this should be called
def Upload(dash_context, user, img_root, img_file, nested=False, original_filename=""):
    from io import BytesIO
    from .file import GetURL
    from datetime import datetime
    from .number import GetRandomID
    from Dash.LocalStorage import Write
    from PIL import Image

    Image.MAX_IMAGE_PIXELS = None  # Allow large uploads, no concern for DecompressionBombError

    original_extension = "png"
    img = Image.open(BytesIO(img_file))

    img_data = {
        "id": GetRandomID(),
        "exif": process_exif_image_data(img),
        "org_format": img.format.lower(),
        "orig_filename": original_filename,
        "orig_width": img.size[0],
        "orig_height": img.size[1],
        "orig_aspect": img.size[0] / float(img.size[1]),
        "uploaded_by": user["email"],
        "uploaded_on": datetime.now().isoformat()
    }

    if img_data["exif"] and "Orientation" in img_data["exif"]:
        img, rot_deg = rotate_image(img, img_data["exif"])

        img_data["rot_deg"] = rot_deg

    if "jpeg" in img_data["org_format"] or "jpg" in img_data["org_format"]:
        original_extension = "jpg"

    elif "gif" in img_data["org_format"]:
        original_extension = "gif"

    if nested:
        img_root = os.path.join(img_root, img_data["id"])

    os.makedirs(img_root, exist_ok=True)

    orig_path = os.path.join(img_root, f"{img_data['id']}_orig.{original_extension}")
    thumb_path = os.path.join(img_root, f"{img_data['id']}_thb.jpg")
    thumb_square_path = os.path.join(img_root, f"{img_data['id']}_sq_thb.jpg")
    data_path = os.path.join(img_root, f"{img_data['id']}.json")

    img = save_images(img, orig_path, thumb_path, thumb_square_path)

    img_data["thumb_url"] = GetURL(dash_context, thumb_path)
    img_data["thumb_sq_url"] = GetURL(dash_context, thumb_square_path)
    img_data["orig_url"] = GetURL(dash_context, orig_path)

    img_data["width"] = img.size[0]
    img_data["height"] = img.size[1]
    img_data["aspect"] = img.size[0] / float(img.size[1])

    Write(data_path, img_data)

    return img_data


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
