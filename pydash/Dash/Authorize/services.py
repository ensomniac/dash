#!/usr/bin/python
#
# Copyright (c) 2024 Ensomniac Studios. All rights reserved. This material
# contains the confidential and proprietary information of Ensomniac Studios
# and may not be copied in whole or in part without the express written permission
# of Ensomniac Studios. This copyright notice does not imply publication.
#
# Ensomniac Studios 2024 Ryan Martin, ryan@ensomniac.com
#                        Andrew Stet, stetandrew@gmail.com

import os
import sys

from urllib.parse import urlencode
from Dash.LocalStorage import GetPrivKey

services = {}


class Service:
    def __init__(
            self, name, authorize_url, token_endpoint, token_refresh_endpoint,
            scope, success_token_exchange_key, access_token_key, token_valid_url
    ):
        self.name = name
        self.authorize_url = authorize_url
        self.token_endpoint = token_endpoint
        self.token_refresh_endpoint = token_refresh_endpoint
        self.scope = scope
        self.success_token_exchange_key = success_token_exchange_key
        self.access_token_key = access_token_key
        self.token_valid_url = token_valid_url

        self.redirect_uri = "https://authorize.oapi.co/r"
        self.priv_data = GetPrivKey(f"{self.name}.json")
        self.client_id = self.priv_data["client_id"]
        self.client_secret = self.priv_data["client_secret"]

        services[self.name] = self

    # Add the required params to the request URL
    def construct_authorize_url(self):
        authorization_data = {
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
            "scope": self.scope
        }

        # Open the authorization in the browser
        return f"{self.authorize_url}?{urlencode(authorization_data)}"


def get_by_name(name):
    return services.get(name)


GoogleDrive = Service(
    name="gdrive",
    authorize_url="",
    token_endpoint="google",
    token_refresh_endpoint="",
    scope=[
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/drive.metadata",
        "https://www.googleapis.com/auth/drive.photos.readonly",
        "https://www.googleapis.com/auth/userinfo.email"  # This is important so we know whose credentials we're getting
    ],
    success_token_exchange_key="access_token",  # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url=""
)

Gmail = Service(
    name="gmail",
    authorize_url="",
    token_endpoint="google",
    token_refresh_endpoint="",
    scope=[
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/userinfo.email"  # This is important so we know whose credentials we're getting
    ],
    success_token_exchange_key="access_token",  # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url=""
)

# TODO: Ryan, you need to login to the Google Cloud Console that provided this client_id and add 'https://authorize.oapi.co/r' as an "Authorized redirect URI"
#  Ref: https://stackoverflow.com/questions/68764885/google-oauth-2-0-api-authentication-error-error-400-redirect-uri-mismatch-do
#  ----------------------------------------------
#     Error 400: redirect_uri_mismatch
#     You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
#     If you're the app developer, register the redirect URI in the Google Cloud Console.
#     Learn more
#     Request Details
#     The content in this section has been provided by the app developer. This content has not been reviewed or verified by Google.
#     If you’re the app developer, make sure that these request details comply with Google policies.
#     redirect_uri: https://authorize.oapi.co/r
Photos = Service(
    name="photos",
    authorize_url="",
    token_endpoint="google",
    token_refresh_endpoint="",
    scope=[
        "https://www.googleapis.com/auth/photoslibrary.readonly",
        "https://www.googleapis.com/auth/userinfo.email"  # This is important so we know whose credentials we're getting
    ],
    success_token_exchange_key="access_token",  # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url=""
)

# TODO: Ryan, you can resolve this error by authorizing 'https://authorize.oapi.co/r' in whatever console/portal you got this client_id from
#  INVALID_CLIENT: Invalid redirect URI
# TODO: Since the above error prevents me from seeing the response structure, you'll have to update the code api.py > redirect()
#  that handles the getting of the email from the token response data. Based on your scope param including "user-read-email", it's
#  safe to assume that the email is already included in the response, just need to parse it in api.py > redirect() specifically for spotify redirects.
Spotify = Service(
    name="spotify",
    authorize_url="https://accounts.spotify.com/authorize",
    token_endpoint="https://accounts.spotify.com/api/token",
    token_refresh_endpoint="https://accounts.spotify.com/api/token",
    scope=" ".join([
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public",
        "playlist-modify-private",
        "streaming",
        "user-follow-modify",
        "user-follow-read",
        "user-library-read",
        "user-library-modify",
        "user-read-private",
        "user-read-birthdate",
        "user-read-email",
        "user-top-read",
        "user-read-recently-played"
    ]),
    success_token_exchange_key="access_token",  # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url="https://api.spotify.com/v1/me"
)
