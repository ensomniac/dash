#!/usr/bin/python
#
# Copyright (c) 2017 Ensomniac Studios. All rights reserved. This material
# contains the confidential and proprietary information of Ensomniac Studios
# and may not be copied in whole or in part without the express written permission
# of Ensomniac Studios. This copyright notice does not imply publication.
#
# Author:  Ryan Martin ryan@ensomniac.com
#

import os
import urllib

services = {}

class Service:
    def __init__(self, name, client_id, client_secret, authorize_url, token_endpoint, token_refresh_endpoint, scope, success_token_exchange_key, access_token_key, token_valid_url):
        self.name = name
        self.client_id = client_id
        self.client_secret = client_secret
        self.authorize_url = authorize_url
        self.token_endpoint = token_endpoint
        self.token_refresh_endpoint = token_refresh_endpoint
        self.scope = scope
        self.success_token_exchange_key = success_token_exchange_key
        self.access_token_key = access_token_key
        self.token_valid_url = token_valid_url

        self.redirect_uri = "https://authorize.oapi.co/r"

        services[self.name] = self

    def construct_authorize_url(self):
        # Add the required params to the reqest URL

        authorization_data = {
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
            "scope": self.scope
            }

        # Open the authorization in the browser...
        return self.authorize_url + "?" + urllib.urlencode(authorization_data)




# client_id
# Required. The client ID provided to you by Spotify when you register your application.
# response_type
# Required. Set it to code.
# redirect_uri
# Required. The URI to redirect to after the user grants/denies permission. This URI needs to have been entered in the Redirect URI whitelist that you specified when you registered your application. The value of redirect_uri here must exactly match one of the values you entered when you registered your application, including upper/lowercase, terminating slashes, etc.
# state
# Optional, but strongly recommended. The state can be useful for correlating requests and responses. Because your redirect_uri can be guessed, using a state value can increase your assurance that an incoming connection is the result of an authentication request. If you generate a random string or encode the hash of some client state (e.g., a cookie) in this state variable, you can validate the response to additionally ensure that the request and response originated in the same browser. This provides protection against attacks such as cross-site request forgery. See RFC-6749.
# scope
# Optional. A space-separated list of scopes: see Using Scopes. If no scopes are specified, authorization will be granted only to access publicly available information: that is, only information normally visible in the Spotify desktop, web and mobile players.





def get_by_name(name):
    return services.get(name)

def get_spotify_scope():
    scopes = []
    scopes.append("playlist-read-private")
    scopes.append("playlist-read-collaborative")
    scopes.append("playlist-modify-public")
    scopes.append("playlist-modify-private")
    scopes.append("streaming")
    scopes.append("user-follow-modify")
    scopes.append("user-follow-read")
    scopes.append("user-library-read")
    scopes.append("user-library-modify")
    scopes.append("user-read-private")
    scopes.append("user-read-birthdate")
    scopes.append("user-read-email")
    scopes.append("user-top-read")
    scopes.append("user-read-recently-played")
    return " ".join(scopes)

Spotify = Service(
    name="spotify",
    client_id="ae4837343ed54a3c82cc2ab7f8f8d2e1",
    client_secret="96c9ecb0aa3b47e2a4b12f99865fe877",
    authorize_url="https://accounts.spotify.com/authorize",
    token_endpoint="https://accounts.spotify.com/api/token",
    token_refresh_endpoint="https://accounts.spotify.com/api/token",
    scope=get_spotify_scope(),
    success_token_exchange_key="access_token", # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url="https://api.spotify.com/v1/me",
)

Gmail = Service(
    name="gmail",
    client_id="947806183438-e1hirfb16k1h1d4jnc7u05u1vu3n2pnh.apps.googleusercontent.com",
    client_secret="EjgANOKgqRT2FViDD7nyjj58",
    authorize_url="",
    token_endpoint="",
    token_refresh_endpoint="",
    scope="https://mail.google.com/",
    success_token_exchange_key="access_token", # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url="",
)

GoogleDrive = Service(
    name="gdrive",
    client_id="70801449898-hs1k8e0hcn5sfs84oslqr97hpekcjtve.apps.googleusercontent.com",
    client_secret="MT2PJEwUmuHTnNx5REEGWFDv",
    authorize_url="",
    token_endpoint="google",
    token_refresh_endpoint="",
    scope=["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.metadata.readonly", "https://www.googleapis.com/auth/drive.metadata", "https://www.googleapis.com/auth/drive.photos.readonly"],
    success_token_exchange_key="access_token", # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url="",
)

Photos = Service(
    name="photos",
    # client_id="208470372375-4qsgihu8d8fpbla1mo7m9cb5ujlh9s03.apps.googleusercontent.com",
    # client_secret="s5L4Z-I4f3qVlWK75tcZqONL",
    client_id="70801449898-n4ofpd1536a9ia4hag1ii7b7gc8lvrlf.apps.googleusercontent.com",
    client_secret="5Vvx9sXdNtggDl3NVbptcs7I",
    authorize_url="",
    token_endpoint="google",
    token_refresh_endpoint="",
    scope="https://www.googleapis.com/auth/photoslibrary.readonly",
    success_token_exchange_key="access_token", # This key should be included in the return data when the code is exchanged for a token
    access_token_key="access_token",
    token_valid_url="",
)
