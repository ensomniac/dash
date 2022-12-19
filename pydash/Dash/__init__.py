#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# SETUP_PYDASH

__version__ = "1.4"
__copyright__ = "Copyright (c) 2023 Ensomniac"

AdminEmails = [
    "ryan@ensomniac.com",
    "stetandrew@gmail.com"
]


def Sync():
    try:
        from DashSync import DashSync
    except:
        from.DashSync import DashSync

    DashSync()
