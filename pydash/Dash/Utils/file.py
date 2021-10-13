#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


def Upload(dash_context, user, file_root, file_bytes, filename, nested=False):
    from datetime import datetime
    from .number import GetRandomID
    from .image import ImageExtensions
    from Dash.LocalStorage import Write

    file_ext = filename.split(".")[-1].strip()

    if file_ext in ImageExtensions():
        from .image import Upload as UploadImage

        return UploadImage(dash_context, user, file_root, file_bytes, nested)

    file_data = {
        "id": GetRandomID(),
        "filename": filename,
        "uploaded_by": user["email"],
        "uploaded_on": datetime.now().isoformat()
    }

    if nested:
        file_root = os.path.join(file_root, file_data["id"])

    os.makedirs(file_root, exist_ok=True)

    file_path = os.path.join(file_root, f"{file_data['id']}.{file_ext}")
    data_path = os.path.join(file_root, f"{file_data['id']}.json")

    file_data["url"] = GetURL(dash_context, file_path)

    Write(file_path, file_bytes)
    Write(data_path, file_data)

    return file_data


def GetURL(dash_context, server_file_path):
    return "https://" + os.path.join(dash_context["domain"], server_file_path.replace(dash_context["srv_path_http_root"], ""))
