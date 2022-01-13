#!/usr/bin/python
#
# Copyright (c) 2022 Ensomniac Studios. All rights reserved. This material
# contains the confidential and proprietary information of Ensomniac Studios
# and may not be copied in whole or in part without the express written permission
# of Ensomniac Studios. This copyright notice does not imply publication.
#
# Ensomniac Studios 2022 Ryan Martin, ryan@ensomniac.com
#                        Andrew Stet, stetandrew@gmail.com

import os
import sys
import json
import requests

from httplib2 import Http
from base64 import encodestring

# Assurance, since this can be called not only as a module from Dash, but also externally
try:
    from .Services import get_by_name
except:
    from Services import get_by_name


class Auth:
    def __init__(self, service_name):
        self.service = get_by_name(service_name)

        if not self.service:
            raise Exception(f"Unable to locate service by name: {service_name}")

        self._service_data = None
        self.flow = self.get_flow()
        self.service_url = f"http://authorize.oapi.co/{self.service.name}"

    @property
    def service_data(self):  # The data is stored on oapi - get it
        if not self._service_data:
            try:
                data_request = requests.post(self.service_url, data={"all": True}).json()

                if data_request.get("error"):
                    raise Exception(f"There was a server problem: {data_request['error']}")

                self._service_data = json.loads(str(data_request.get("data")))

            except:
                pass

        return self._service_data

    def exchange_code_for_token(self, code):
        if self.service.token_endpoint == "google":
            return self.exchange_code_for_token_google(code)  # Manage using Google's OAuth2
        else:
            return self.exchange_code_for_token_oauth(code)  # Normal OAuth

    def exchange_code_for_token_google(self, code):
        flow = self.get_flow()
        credentials = flow.step2_exchange(code)
        token_json = json.loads(credentials.to_json())

        # Use the Credentials object that the step2_exchange method returns to apply the access token to an Http object
        credentials.authorize(Http())

        return {"token_data": token_json, "error": None}

    def exchange_code_for_token_oauth(self, code):
        error = None
        auth_str = f"{self.service.client_id}:{self.service.client_secret}".replace("\n", "")

        # TODO: This doesn't appear to be used
        auth_bytes = encodestring(auth_str.encode())

        token_request_response = requests.post(
            self.service.token_endpoint,
            headers={
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "runscope/0.1",
                "Authorization": f"Basic {auth_str}"
            },
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.service.redirect_uri,
                "client_id": self.service.client_id,
                "client_secret": self.service.client_secret
            }
        )

        try:
            token_json = token_request_response.json()
        except:
            return {
                "token_data": None,
                "error": f"Unable to read return data for token exchange from {self.service.name.title()}. Raw: {token_request_response.text}"
            }

        if self.service.success_token_exchange_key not in token_json:
            error = f"Token exchange was not successful: {token_json}"
            token_json = None

        return {"token_data": token_json, "error": error}

    def get_google_service(self, google_api, api_version):
        from apiclient import discovery
        from oauth2client.client import Credentials

        # Was initially stored as credentials.to_json()
        token_data = self.service_data.get("token_data")

        credentials = Credentials().new_from_json(json.dumps(token_data))

        return discovery.build(google_api, api_version, http=credentials.authorize(Http()))

    # When we have new information, like after a refresh token, merge that new info into our existing data dict
    def merge_service_data(self, data_dict):
        for key in data_dict:
            self.service_data["token_data"][key] = data_dict[key]

        data_request = requests.post(
            self.service_url,
            data={"service_data": json.dumps(self.service_data)}
        ).json()

        if data_request.get("error"):
            return {"error": f"There was a server error: {data_request['error']}"}

        return {"error": None}

    # The assumption is that we're already authorized
    def get_token(self, refresh_if_needed=False):
        if self.service_data.get("token_data"):
            token = self.service_data["token_data"].get(self.service.access_token_key)

            if not refresh_if_needed:
                return {"error": None, "token": token, "msg": "Not Validated"}

            if self.token_valid():
                return {"error": None, "token": token, "msg": "Validated Existing Token"}
        else:
            if not refresh_if_needed:
                return {"error": "Token data not available and needs to be refreshed. Pass 'refresh_if_needed=True' to resolve."}

        # The token isn't valid, so let's refresh it
        refresh_result = self.refresh()

        if refresh_result.get("error"):
            return {"error": refresh_result.get("error"), "token": None, "msg": "Tried to refresh but failed"}
        else:
            return {"error": None, "token": self.service_data["token_data"].get(self.service.access_token_key), "msg": "Validated New Token"}

    # The assumption is that we're already authorized
    def get_refresh_token(self):
        found_token = None

        for key in self.service_data["token_data"]:
            if "refresh" in key.lower():
                found_token = self.service_data["token_data"][key]

                break

        return found_token

    # Check the server to see if we're authorized
    def token_valid(self):
        is_valid = False

        response = requests.get(
            self.service.token_valid_url,
            headers={
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "runscope/0.1",
                "Authorization": f"Bearer {self.get_token().get('token')}"
            },
            data={
                "client_id": self.service.client_id,
                "client_secret": self.service.client_secret
            }
        )

        if response.status_code in [200, 201] and "expired" not in response.text:
            is_valid = True

        return is_valid

    def refresh(self):
        refresh_token = self.get_refresh_token()

        if not refresh_token:
            return {"error": "Unable to locate refresh token"}

        token_request_response = requests.post(
            self.service.token_refresh_endpoint,
            headers={
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "runscope/0.1",
                "Authorization": "Basic " + encodestring("%s:%s" % (self.service.client_id, self.service.client_secret)).replace("\n", "")
            },
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "redirect_uri": self.service.redirect_uri,
                "client_id": self.service.client_id,
                "client_secret": self.service.client_secret
            }
        )

        if token_request_response.status_code != 200:
            return {"error": f"There was a problem refreshing the token: {token_request_response.text}"}

        return self.merge_service_data(token_request_response.json())

    def get_step1_authorize_url(self):
        if self.service.authorize_url:
            return self.service.construct_authorize_url()  # Add the required params
        else:
            return self.flow.step1_get_authorize_url()  # Likely a Google product

    def get_flow(self):
        from oauth2client.client import OAuth2WebServerFlow

        flow = OAuth2WebServerFlow(
            client_id=self.service.client_id,
            client_secret=self.service.client_secret,
            scope=self.service.scope,
            redirect_uri=self.service.redirect_uri,
            **{
                "prompt": "consent",  # Ref: https://github.com/googleapis/google-api-python-client/issues/213
                "access_type": "offline",
                "include_granted_scopes": "true"
            }
        )

        return flow


if __name__ == "__main__":
    auth = Auth("spotify")
