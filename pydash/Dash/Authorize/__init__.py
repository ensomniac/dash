#!/usr/bin/python
#
# Altona 2022 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

def GetTokenData(service_name, user_email):
    # Assurance, since this can be called not only as a module from Dash, but also externally
    try:
        from .api import GetTokenData
    except:
        from api import GetTokenData

    return GetTokenData(service_name, user_email)
