
function DashUser(){

    this.__auth_authenticated_cb = null;
    this.__auth_not_authenticated_cb = null;

    this.Data = null;
    this.Init = null;

    this.Authenticate = function(bind, on_user_authenticated, on_user_not_authenticated){
        this.__auth_authenticated_cb = on_user_authenticated.bind(bind);
        this.__auth_not_authenticated_cb = on_user_not_authenticated.bind(bind);

        var token = d.Local.Get("token");
        var email = d.Local.Get("email");
        var user_json = d.Local.Get("user_json");

        if (token && email && user_json) {

            var params = {};
            params["f"] = "validate";
            params["token"] = token;
            params["init"] = true;

            d.Request(this, this.on_auth_response, "Users", params);

        }
        else {
            this.__auth_not_authenticated_cb();
        };

    };

    this.SetUserAuthentication = function(email, server_response){

        if (email && server_response["token"]) {
            this.Data = server_response["user"];
            this.Init = server_response["init"];
            d.Local.Set("email", email);
            d.Local.Set("token", server_response["token"]);
            d.Local.Set("user_json", JSON.stringify(server_response["user"]));
        }
        else {
            this.Data = null;
            this.Init = null;
            d.Local.Set("email", "");
            d.Local.Set("token", "");
            d.Local.Set("user_json", "");
        };

    };

    this.on_auth_response = function(response){

        response["token"] = response["token"] || d.Local.Get("token");

        if (response["valid_login"] && response["user"]["email"]) {
            this.SetUserAuthentication(response["user"]["email"], response);
            this.__auth_authenticated_cb();
        }
        else {

            console.log("** The user is no longer authenticated **");
            console.log(response);

            this.SetUserAuthentication();
            this.__auth_not_authenticated_cb();

        };

    };

};
