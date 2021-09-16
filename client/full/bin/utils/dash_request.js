function DashRequest () {
    this.requests = [];

    this.Request = function (binder, callback, endpoint, params) {
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
                ).fail(
                    function (request) {
                        var response = request.responseJSON || request.responseText;

                        if (response) {
                            self.dash_requests.on_response(self, response);
                        }

                        else {
                            alert("Request to " + self.url + "failed:\n" + self.params);
                        }
                    }
                );
            })(this);
        };

        this.post();
    }

    this.on_no_further_requests_pending = function () {
        // Called when a request finishes, and there are no more requests queued
        //console.log(">> on_no_further_requests_pending <<");
    };

    this.decompress_response = function (request, response) {
        // This is called immediately before returning a
        // response that has been compressed with gzip

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
        if (response["gzip"]) {
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
