function DashRequest () {
    this.requests = [];
    this.request_failures = {};

    this.Request = function (binder, callback, endpoint, params) {
        if (endpoint.includes("/")) {
            endpoint = endpoint.split("/").Last();
        }

        var url = "https://" + Dash.Context["domain"] + "/" + endpoint;

        this.requests.push(new DashRequestThread(this, url, params, binder, callback));
    };

    function DashRequestThread (dash_requests, url, params, binder, callback) {
        this.url = url;
        this.binder = binder;
        this.callback = callback;
        this.params = params || {};
        this.dash_requests = dash_requests;
        this.params["token"] = Dash.Local.Get("token");
        this.id = Math.random() * (999999 - 100000) + 100000;

        this.post = function () {
            (function (self) {
                $.post(
                    self.url,
                    self.params,
                    function (response) {
                        self.dash_requests.on_response(self, response);
                    }
                ).fail(function (request, status, error) {
                    var response = request.responseJSON || request.responseText;

                    if (response) {
                        self.dash_requests.on_response(self, response);

                        return;
                    }

                    console.warn(
                        "Dash Request Warning: A request failed (status ", status, "), but callback " +
                        "will be triggered regardless." + (error ? " Error:\n" + error.toString() : "")
                    );

                    self.dash_requests.on_response(self, response);
                });
            })(this);
        };

        this.post();
    }

    this.TrackRequestFailureForID = function (req_id, max_allowed) {
        /**
         * This system (not in use by default) is a basic tracker for interval request failures, but it doesn't fully solve
         * the problem of the portal knowing when updates have been pushed to the server and then needing to reload.
         *
         * Example usage:
         *     if (!Dash.Validate.Response(response, false)) {  // Second param is "show_alert" (setting to false is key to this system)
         *
         *        // In this example, the requests are made every 5 seconds, so reload if still not resolved after 20 seconds (4 failures)
         *        Dash.Requests.TrackRequestFailureForID(request_failure_id, 4)   // 'request_failure_id' is similar to a local storage key
         *
         *        return;
         *     }
         *
         *     // If the request was successful, reset the failure tally
         *     Dash.Requests.ResetRequestFailuresForID(request_failure_id);
         */

        if (!req_id in this.request_failures) {
            this.request_failures[req_id] = 0;
        }

        this.request_failures[req_id] += 1;

        if (this.request_failures[req_id] >= max_allowed) {
            alert("The page must reload, sorry for the inconvenience.");

            window.location.reload();
        }

        return this.request_failures[req_id];
    };

    // See docstring for TrackRequestFailureForID
    this.ResetRequestFailuresForID = function (req_id) {
        this.request_failures[req_id] = 0;
    };

    this.on_no_further_requests_pending = function () {
        // Called when a request finishes, and there are no more requests queued
        // console.log(">> on_no_further_requests_pending <<");
    };

    this.decompress_response = function (request, response) {
        // This is called immediately before returning a response that has been compressed with gzip

        var gzip_bytes = Buffer.from(response["gzip"], "base64");

        (function (self, gzip_bytes, request, response) {
            zlib.unzip(gzip_bytes, function (_, decompressed_data) {
                delete response["gzip"];

                response["dash_decompressed"] = true;

                if (decompressed_data) {
                    var gzip_str = new TextDecoder("utf-8").decode(decompressed_data);
                    var gzipped_data = JSON.parse(gzip_str);

                    for (var key in gzipped_data) {
                        response[key] = gzipped_data[key];
                    }
                }

                else {
                    console.log("Dash failed to decompress gzip content", response);

                    if (!response["error"]) {
                        response["error"] = "Failed to decompress gzip data from server!";
                    }

                    else {
                        response["error_gzip"] = "Failed to decompress gzip data from server!";
                    }
                }

                self.on_response(request, response);
            });
        })(this, gzip_bytes, request, response);
    };

    this.on_response = function (request, response) {
        if (response && response["gzip"]) {
            this.decompress_response(request, response);
            return;
        }

        var callback = request.callback.bind(request.binder);
        var requests = [];

        for (var i in this.requests) {
            if (this.requests[i] == request) {
                continue;
            }

            requests.push(this.requests[i]);
        }

        this.requests = requests;

        if (this.requests.length === 0) {
            this.on_no_further_requests_pending();
        }

        callback(response);
    };
}
