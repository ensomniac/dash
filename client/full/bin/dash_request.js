function DashRequest () {
    this.requests = [];
    this.request_failures = {};

    this.Request = function (binder, callback, endpoint, params, domain="") {
        if (endpoint.includes("/")) {
            endpoint = endpoint.split("/").Last();
        }

        var url = "https://" + (domain || Dash.Context["domain"]) + "/" + endpoint;

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

                    Dash.Log.Warn(
                        "Dash Request Warning: A request failed (status ", status, "), but callback " +
                        "will be triggered regardless." + (error ? " Error:\n" + error.toString() : "")
                    );

                    self.dash_requests.on_response(self, response);
                });
            })(this);
        };

        this.post();
    }

    // This sends to Andrew/Ryan by default
    this.SendEmail = function (message, subject="", endpoint="Api", f="send_email", binder=null, callback=null) {
        if (!message) {
            return;
        }

        var tag = Dash.Context["display_name"] + " Front-End Alert";

        if (subject) {
            subject = "(" + tag + ") " + subject;
        }

        else {
            subject = tag;
        }

        this.Request(
            binder || this,
            callback || function () {},
            endpoint,
            {
                "f": f,
                "message": message,
                "subject": subject
            }
        );
    };

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

            // Dash.Log.Warn(
            //     "(Dash Interval Request Failure Manager) Max failures reached for '" + req_id +
            //     "', reloading:", this.request_failures[req_id] + "/" + max_allowed
            // );

            window.location.reload();
        }

        Dash.Log.Log(
            "(Dash Interval Request Failure Manager) Request failure for '" + req_id +
            "' has been tracked:", this.request_failures[req_id] + "/" + max_allowed
        );

        return this.request_failures[req_id];
    };

    // See docstring for TrackRequestFailureForID
    this.ResetRequestFailuresForID = function (req_id) {
        this.request_failures[req_id] = 0;
    };

    // Called when a request finishes, and there are no more requests queued
    this.on_no_further_requests_pending = function () {
        // Dash.Log.Log(">> on_no_further_requests_pending <<");
    };

    // This is called immediately before returning a response that has been compressed with gzip
    this.decompress_response = function (request, response) {
        var gzip_bytes = Buffer.from(response["gzip"], "base64");

        (function (self) {
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
                    Dash.Log.Warn("Dash failed to decompress gzip content", response);

                    if (!response["error"]) {
                        response["error"] = "Failed to decompress gzip data from server!";
                    }

                    else {
                        response["error_gzip"] = "Failed to decompress gzip data from server!";
                    }
                }

                self.on_response(request, response);
            });
        })(this);
    };

    this.on_response = function (request, response) {
        if (response && response["gzip"]) {
            this.decompress_response(request, response);

            return;
        }

        var requests = [];
        var callback = request.binder ? request.callback.bind(request.binder) : request.callback;

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

        // ------------------------------------

        response = response || {};

        var key = "__dash_force_front_end_refresh__";

        // This allows us to force a refresh for clients that are left open,
        // never refreshed, etc, by simply adding this param to the response of
        // an interval request that is known to be running, via dashsync, then
        // removing the param shortly thereafter
        if (!response["error"] && response[key]) {
            alert("There are updates that require a refresh, sorry for any inconvenience.");

            try {
                this.SendEmail(
                    (
                          Dash.User.Init["email"]
                        + " has had their client forcibly refreshed via: "
                        + key
                        + "\n\nDon't forget to disable this flag from the "
                        + "backend as soon as all desired clients have been refreshed!"
                    ),
                    "Forced Refresh"
                );
            }

            catch {
                // pass
            }

            location.reload();
        }
    };
}
