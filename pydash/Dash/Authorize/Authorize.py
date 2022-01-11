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
import json
import traceback
import webbrowser
import urllib
import time
import requests
import time
import Services
import base64

class Authorize:
    def __init__(self, service_name):
        self.service = Services.get_by_name(service_name)
        self._service_data = None

        if not self.service:
            return {"error": "Unable to locate service by name '" + service_name + "'"}

        self.flow = self.get_flow()

    def exchange_code_for_token(self, code):
        if self.service.token_endpoint == "google":
            # Manage using Gooles oAuth 2 thing
            return self.exchange_code_for_token_google(code)
        else:
            # Normal oAuth
            return self.exchange_code_for_token_oauth(code)

    def exchange_code_for_token_google(self, code):
        import httplib2

        flow = self.get_flow()
        credentials = flow.step2_exchange(code)
        token_json = json.loads(credentials.to_json())

        # Then, use the Credentials object that the step2_exchange method returns to apply the access token to an Http object:
        http_auth = credentials.authorize(httplib2.Http())
        error = None

        return {"token_data": token_json, "error": error}

    def exchange_code_for_token_oauth(self, code):
        data = {}
        data["grant_type"] = "authorization_code"
        data["code"] = code
        data["redirect_uri"] = self.service.redirect_uri
        data["client_id"] = self.service.client_id
        data["client_secret"] = self.service.client_secret

        auth_str = self.service.client_id + ":" + self.service.client_secret
        auth_str = auth_str.replace("\n", "")

        auth_bytes = base64.encodestring(auth_str.encode())

        headers = {}
        headers["Accept"] = "*/*"
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        headers["User-Agent"] = "runscope/0.1"
        headers["Authorization"] = "Basic " + auth_str

        token_request_response = requests.post(self.service.token_endpoint, headers=headers, data=data)
        token_json = None
        error = None

        try:
            token_json = token_request_response.json()
        except:
            return {"token_data": None, "error": "Unable to read return data for token exchange from " + self.service.name.title() + ". Raw: " + str(token_request_response.text)}

        if self.service.success_token_exchange_key not in token_json:
            error = "Token exchange was not successful: " + str(token_json)
            token_json = None

        return {"token_data": token_json, "error": error}

    @property
    def service_data(self):
        # The data is stored on oapi - get it

        server_data = {}

        if not self._service_data:

            try:
                data_url = "http://authorize.oapi.co/" + self.service.name
                data_request = requests.post(data_url, data={"all": True}).json()

                if data_request.get("error"):
                    raise Exception("There was a server problem: " + str(data_request.get("error")))

                #data = cPickle.loads(str(data_request.get("data")))
                data = json.loads(str(data_request.get("data")))
                self._service_data = data

            except:
                pass

        return self._service_data

    def get_google_service(self, google_api, api_version):
        import httplib2
        import oauth2client.client
        from apiclient import discovery

        # Was initially stored as credentials.to_json()
        token_data = self.service_data.get("token_data")

        credentials = oauth2client.client.Credentials().new_from_json(json.dumps(token_data))

        http = httplib2.Http()
        http = credentials.authorize(http)

        service = discovery.build(google_api, api_version, http=http)

        return service


    def merge_service_data(self, data_dict):
        # When we have new information, like after a refresh token, merge that new info into our existing data dict
        for key in data_dict:
            self.service_data["token_data"][key] = data_dict[key]

        data_url = "http://authorize.oapi.co/" + self.service.name

        #data_request = requests.post(data_url, data={"service_data": cPickle.dumps(self.service_data)}).json()
        data_request = requests.post(data_url, data={
            "service_data": json.dumps(self.service_data)
        }).json()

        if data_request.get("error"):
            return {"error": "There was a server error: " + str(data_request.get("error"))}

        return {"error": None}

    def get_token(self, refresh_if_needed=False):
        # The assumption is that we're already authorized
        if self.service_data.get("token_data"):
            token = self.service_data["token_data"].get(self.service.access_token_key)

            if not refresh_if_needed:
                return {"error": None, "token": token, "msg": "Not Validated"}

            if self.token_valid():
                return {"error": None, "token": token, "msg": "Validated Existing Token"}
        else:
            if not refresh_if_needed:
                return {"error": "Token data not available and needs to be refreshed. Pass refresh_if_needed=True to resolve."}

        # The token isn't valid, so let's refresh it...
        refresh_result = self.refresh()

        if refresh_result.get("error"):
            return {"error": refresh_result.get("error"), "token": None, "msg": "Tried to refresh but failed"}
        else:
            return {"error": None, "token": self.service_data["token_data"].get(self.service.access_token_key), "msg": "Validated New Token"}

    def get_refresh_token(self):
        # The assumption is that we're already authorized
        found_token = None

        for key in self.service_data["token_data"]:
            if "refresh" in key.lower():
                found_token = self.service_data["token_data"][key]
                break

        return found_token

    def token_valid(self):
        # Check the server to see if we're authorized
        data = {}
        data["client_id"] = self.service.client_id
        data["client_secret"] = self.service.client_secret

        headers = {}
        headers["Accept"] = "*/*"
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        headers["User-Agent"] = "runscope/0.1"
        headers["Authorization"] = "Bearer " + self.get_token().get("token")

        is_valid = False

        response = requests.get(self.service.token_valid_url, headers=headers, data=data)

        if response.status_code in [200, 201] and "expired" not in response.text:
            is_valid = True

        return is_valid

    def refresh(self):
        refresh_token = self.get_refresh_token()

        if not refresh_token:
            return {"error": "Unable to locate refresh token"}

        data = {}
        data["grant_type"] = "refresh_token"
        data["refresh_token"] = refresh_token
        data["redirect_uri"] = self.service.redirect_uri
        data["client_id"] = self.service.client_id
        data["client_secret"] = self.service.client_secret

        headers = {}
        headers["Accept"] = "*/*"
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        headers["User-Agent"] = "runscope/0.1"
        headers["Authorization"] = "Basic " + base64.encodestring('%s:%s' % (self.service.client_id,self.service.client_secret)).replace('\n', '')

        token_request_response = requests.post(self.service.token_refresh_endpoint, headers=headers, data=data)

        if token_request_response.status_code != 200:
            return {"error": "There was a problem refreshing the token: " + str(token_request_response.text)}

        return self.merge_service_data(token_request_response.json())

    def get_step1_authorize_url(self):

        if self.service.authorize_url:
            # Add the required params
            return self.service.construct_authorize_url()
        else:
            # Likely a Google product...
            return self.flow.step1_get_authorize_url()

    def get_flow(self):
        from oauth2client import client
        from oauth2client.client import OAuth2WebServerFlow

        flow = OAuth2WebServerFlow(
            client_id=self.service.client_id,
            client_secret=self.service.client_secret,
            scope=self.service.scope,
            redirect_uri=self.service.redirect_uri
        )

        # flow.params['access_type'] = 'offline'         # offline access
        # flow.params['include_granted_scopes'] = "true"   # incremental auth

        # https://github.com/googleapis/google-api-python-client/issues/213
        flow.params['prompt'] = "consent"
        flow.params['access_type'] = 'offline'           # offline access
        flow.params['include_granted_scopes'] = "true"   # incremental auth

        return flow



if __name__ == "__main__":
    auth = Authorize("spotify")

    # tmp_code = "AQDUIi0kTAg5P0oRGR6QE9dh33JcHixOSzzBQu8vxdjEQQJ9WJLNe7hsKSs9maUQ9pJdlSu3dzDmsxlZ_nqpx2FjugHWCgfRKtfwBOpIHbGlGy_PnKP40kxp-ETxTQTxsjAlxk8ZW6Gc-yjwU1txopjUcazSc4_d1xiKrcDFnquIwPvhghtDTrU1c1TmYDM0_YPc4pWrIlTPZJ8et-jdmmK6EkO-aW5_j3OKsnebVWQm0IYNt0cBO0WMnEsU-GDAFFcI3puiXZjKkLdKysmMRDoas4Yi110mthY0JlK_gS3oGwF0zl3Yx-WpXBsXWsd7AULYRriJ3xfikXHNFunn8gzKZyCwukOCB_I_Rl0KJ4M-skaSV-1x3R8JIqABxYfMmWJMJRnpIwJ-hLFGY-zcC-Icsj78Wa3GczF66ePvMzlSCsC3qS3Kr-Ecqf7OG_bqqhSthlRMAsV-fPTKtJYqDUA4v-vdhAturRawiljvnKvkTA_abb19pdH8qC07fXJoimdtpRHjvW1IC_HQD26Be7EKfr1q1g"

    # if auth.is_authorized():
    #     print "Authorized"
    # else:
    #     token = auth.get_token()
    #     print token












