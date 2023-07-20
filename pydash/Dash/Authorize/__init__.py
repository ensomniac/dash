#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

def GetTokenData(service_name, user_email):
    try:
        from .api import GetTokenData

    except ImportError:
        from api import GetTokenData

    return GetTokenData(service_name, user_email)
