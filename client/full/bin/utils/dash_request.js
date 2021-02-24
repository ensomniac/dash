
function DashRequest(){

    this.requests = [];

    this.Request = function(binder, callback, endpoint, params){
        var url = "https://" + d.Context["domain"] + "/" + endpoint;
        this.requests.push(new DashRequestThread(this, url, params, binder, callback));
    };

    function DashRequestThread(dash_requests, url, params, binder, callback){

        this.dash_requests = dash_requests;
        this.url = url;
        this.params = params || {};
        this.params["token"] = d.Local.Get("token");

        this.id = parseInt(Math.random() * (999999 - 100000) + 100000);
        this.callback = callback;
        this.binder = binder;

        this.post = function(){

            (function(self){

                $.post(self.url, self.params, function(response_str) {
                    self.dash_requests.on_response(self, $.parseJSON(response_str));
                });

            })(this);

        };

        this.post();

    };

    this.on_no_further_requests_pending = function(){
        // Called when a request finishes, and there are no more requests queued
        //console.log(">> on_no_further_requests_pending <<");
    };

    this.on_response = function(request, response){

        callback = request.callback.bind(request.binder);

        var requests = [];
        for (var i in this.requests) {
            if (this.requests[i] == request) {continue};
            requests.push(this.requests[i]);
        };

        this.requests = requests;

        if (this.requests.length == 0) {
            this.on_no_further_requests_pending();
        };

        callback(response);

    };

};
