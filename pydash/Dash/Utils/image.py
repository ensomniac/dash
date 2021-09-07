#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def Upload(dash_context, user, img_root, img_file, nested=False):
    from PIL import Image
    from io import BytesIO
    from datetime import datetime
    from .number import GetRandomID
    from Dash.LocalStorage import Write

    org_ext = "png"
    img = Image.open(BytesIO(img_file))
    img_data = {"id": GetRandomID()}
    img_data = process_exif_image_data(img_data, img)
    img_data["org_format"] = img.format.lower()

    if img_data["exif"] and "Orientation" in img_data["exif"]:
        img, rot_deg = rotate_image(img, img_data["exif"])
        img_data["rot_deg"] = rot_deg

    img_data["orig_width"] = img.size[0]
    img_data["orig_height"] = img.size[1]
    img_data["orig_aspect"] = img.size[0] / float(img.size[1])
    img_data["uploaded_by"] = user["email"]
    img_data["uploaded_on"] = datetime.now().isoformat()

    if "jpeg" in img_data["org_format"] or "jpg" in img_data["org_format"]:
        org_ext = "jpg"
    elif "gif" in img_data["org_format"]:
        org_ext = "gif"

    if nested:
        img_root = os.path.join(img_root, img_data["id"])

    os.makedirs(img_root, exist_ok=True)

    orig_path = os.path.join(img_root, f"{img_data['id']}_orig." + org_ext)
    thumb_path = os.path.join(img_root, f"{img_data['id']}_thb.jpg")
    thumb_square_path = os.path.join(img_root, f"{img_data['id']}_sq_thb.jpg")
    data_path = os.path.join(img_root, f"{img_data['id']}.json")

    img.save(orig_path)

    # Convert to RGB AFTER saving the original, otherwise we lose alpha channel if present
    img = img.convert("RGB")
    img_square = img.copy()
    thumb_size = 512

    if img.size[0] != img.size[1]:
        if img.size[0] > img.size[1]:  # Wider
            size = img.size[1]
            x = int((img.size[0]*0.5) - (size*0.5))

            img_square = img.crop((
                x,         # x start
                0,         # y start
                x + size,  # x + width
                size       # y + height
            ))
        else:  # Taller
            size = img.size[0]
            y = int((img.size[1]*0.5) - (size*0.5))

            img_square = img.crop((
                0,        # x start
                y,        # y start
                size,     # x + width
                y + size  # y + height
            ))
    else:
        # This image is already square
        pass

    if img_square.size[0] > thumb_size or img_square.size[1] > thumb_size:
        img_square = img_square.resize((thumb_size, thumb_size), Image.ANTIALIAS)

    if img.size[0] > thumb_size or img.size[1] > thumb_size:
        img.thumbnail((thumb_size, thumb_size), Image.ANTIALIAS)

    img.save(thumb_path, quality=40)
    img_square.save(thumb_square_path, quality=40)

    url_root = f"{dash_context['domain']}/local/"
    url_root += img_root.split(f"/{dash_context['asset_path']}/local/")[-1]

    thumb_url = f"{url_root}/{img_data['id']}_thb.jpg"
    thumb_sq_url = f"{url_root}/{img_data['id']}_sq_thb.jpg"
    orig_url = f"{url_root}/{img_data['id']}_orig." + org_ext

    img_data["thumb_url"] = "https://" + thumb_url.replace("//", "/")
    img_data["thumb_sq_url"] = "https://" + thumb_sq_url.replace("//", "/")
    img_data["orig_url"] = "https://" + orig_url.replace("//", "/")

    img_data["width"] = img.size[0]
    img_data["height"] = img.size[1]
    img_data["aspect"] = img.size[0] / float(img.size[1])

    Write(data_path, img_data)

    return img_data


def process_exif_image_data(img_data, img):
    from PIL import ExifTags

    img_exif = img.getexif()
    img_data["exif"] = None

    if img_exif is None:
        return img_data["exif"]

    img_data["exif"] = {}
    for key, val in img_exif.items():
        if key in ExifTags.TAGS:

            processed = False

            if "." in str(val):
                try:
                    img_data["exif"][str(ExifTags.TAGS[key])] = float(val)
                    processed = True
                except:
                    pass

            if not processed:
                try:
                    img_data["exif"][str(ExifTags.TAGS[key])] = int(val)
                    processed = True
                except:
                    pass

            if not processed:
                try:
                    img_data["exif"][str(ExifTags.TAGS[key])] = float(val)
                    processed = True
                except:
                    pass

            if not processed:
                img_data["exif"][str(ExifTags.TAGS[key])] = str(val)

        else:
            # [Ryan] I'm not really sure what this case looks like:
            img_data["exif"]["__" + str(key)] = str(val)

    return img_data


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
