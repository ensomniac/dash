#!/usr/bin/python
#
# Copyright (c) 2025 Ensomniac Studios. All rights reserved. This material
# contains the confidential and proprietary information of Ensomniac Studios
# and may not be copied in whole or in part without the express written permission
# of Ensomniac Studios. This copyright notice does not imply publication.
#
# Ensomniac Studios 2025 Ryan Martin, ryan@ensomniac.com
#                        Andrew Stet, stetandrew@gmail.com

import os
import sys

from urllib.parse import urlencode
from Dash.LocalStorage import GetPrivKey


class Service:
    def __init__(
        self, name, token_endpoint, scope, success_token_exchange_key="access_token", display_name="",
        access_token_key="access_token", authorize_url="", token_refresh_endpoint="", token_valid_url=""
    ):
        self.name = name
        self.authorize_url = authorize_url
        self.token_endpoint = token_endpoint
        self.scope = scope

        # This key should be included in the return data when the code is exchanged for a token
        self.success_token_exchange_key = success_token_exchange_key

        self.display_name = display_name or self.name.title()
        self.access_token_key = access_token_key
        self.token_refresh_endpoint = token_refresh_endpoint
        self.token_valid_url = token_valid_url

        self.redirect_uri = "https://authorize.oapi.co/r"
        self.__priv_data = GetPrivKey(f"{'youtube' if 'youtube' in self.name else self.name}.json")
        self._client_id = self.__priv_data["client_id"]
        self._client_secret = self.__priv_data["client_secret"]

    # Add the required params to the request URL
    def construct_authorize_url(self):
        authorization_data = {
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "client_id": self._client_id,
            "scope": self.scope
        }

        # Open the authorization in the browser
        return f"{self.authorize_url}?{urlencode(authorization_data)}"


class __Services:
    __gmail: Service
    __photos: Service
    __spotify: Service
    __youtube: Service
    __google_drive: Service
    __youtube_brand_account: Service

    def __init__(self):
        self.google_api_scope_prefix = "https://www.googleapis.com/auth"

        self.youtube_scopes = [
            f"{self.google_api_scope_prefix}/youtube",
            f"{self.google_api_scope_prefix}/youtube.channel-memberships.creator",
            f"{self.google_api_scope_prefix}/youtube.force-ssl",
            f"{self.google_api_scope_prefix}/youtube.readonly",
            f"{self.google_api_scope_prefix}/youtube.upload",
            f"{self.google_api_scope_prefix}/youtubepartner",
            f"{self.google_api_scope_prefix}/youtubepartner-channel-audit"
        ]

        # This is important so we know whose credentials we're getting
        self.google_user_email_scope = f"{self.google_api_scope_prefix}/userinfo.email"

    @property
    def YouTube(self):
        return self._youtube

    @property
    def YouTubeBrandAccount(self):
        return self._youtube_brand_account

    @property
    def GoogleDrive(self):
        return self._google_drive

    @property
    def Gmail(self):
        return self._gmail

    @property
    def Photos(self):
        return self._photos

    @property
    def Spotify(self):
        return self._spotify

    @property  # I added this and related '/var/priv/youtube.json' for Fantom - Andrew, 6/17/24
    def _youtube(self):
        if not hasattr(self, "__youtube"):
            self.__youtube = Service(
                name="youtube",
                token_endpoint="google",
                scope=[
                    *self.youtube_scopes,
                    self.google_user_email_scope
                ],
                display_name="YouTube"
            )

        return self.__youtube

    @property  # A brand account is any channel added under a single email that is not the main channel
    def _youtube_brand_account(self):
        if not hasattr(self, "__youtube_brand_account"):
            self.__youtube_brand_account = Service(
                name="youtube_brand_account",
                token_endpoint="google",
                scope=[
                    *self.youtube_scopes
                    # (self.google_user_email_scope IS NOT VALID WHEN AUTHORIZING
                    # A BRAND ACCOUNT, RESULTS IN A GENERIC 401 ERROR)
                ],
                display_name="YouTube (Brand Account)"
            )

        return self.__youtube_brand_account

    @property
    def _google_drive(self):
        if not hasattr(self, "__google_drive"):
            self.__google_drive = Service(
                name="gdrive",
                token_endpoint="google",
                scope=[
                    f"{self.google_api_scope_prefix}/drive",
                    f"{self.google_api_scope_prefix}/drive.file",
                    f"{self.google_api_scope_prefix}/drive.readonly",
                    f"{self.google_api_scope_prefix}/drive.metadata.readonly",
                    f"{self.google_api_scope_prefix}/drive.metadata",
                    f"{self.google_api_scope_prefix}/drive.photos.readonly",
                    self.google_user_email_scope
                ]
            )

        return self.__google_drive

    @property
    def _gmail(self):
        if not hasattr(self, "__gmail"):
            self.__gmail = Service(
                name="gmail",
                token_endpoint="google",
                scope=[
                    "https://mail.google.com/",
                    self.google_user_email_scope
                ]
            )

        return self.__gmail

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
    @property
    def _photos(self):
        if not hasattr(self, "__photos"):
            self.__photos = Service(
                name="photos",
                token_endpoint="google",
                scope=[
                    f"{self.google_api_scope_prefix}/photoslibrary.readonly",
                    self.google_user_email_scope
                ],
                display_name="Google Photos"
            )

        return self.__photos

    # TODO: Ryan, you can resolve this error by authorizing 'https://authorize.oapi.co/r' in whatever console/portal you got this client_id from
    #  INVALID_CLIENT: Invalid redirect URI
    # TODO: Since the above error prevents me from seeing the response structure, you'll have to update the code api.py > redirect()
    #  that handles the getting of the email from the token response data. Based on your scope param including "user-read-email", it's
    #  safe to assume that the email is already included in the response, just need to parse it in api.py > redirect() specifically for spotify redirects.
    @property
    def _spotify(self):
        if not hasattr(self, "__spotify"):
            self.__spotify = Service(
                name="spotify",
                token_endpoint="https://accounts.spotify.com/api/token",
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
                authorize_url="https://accounts.spotify.com/authorize",
                token_refresh_endpoint="https://accounts.spotify.com/api/token",
                token_valid_url="https://api.spotify.com/v1/me"
            )

        return self.__spotify

    def GetByName(self, name):
        return getattr(self, f"_{name}")


Services = __Services()


def get_by_name(name):
    return Services.GetByName(name)
