function DashUser () {

    this.__auth_authenticated_cb = null;
    this.__auth_not_authenticated_cb = null;

    this.Data = null;
    this.Init = null;

    this.Authenticate = function (bind, on_user_authenticated, on_user_not_authenticated) {
        this.__auth_authenticated_cb = on_user_authenticated.bind(bind);
        this.__auth_not_authenticated_cb = on_user_not_authenticated.bind(bind);

        var token = Dash.Local.Get("token");
        var email = Dash.Local.Get("email");
        var user_json = Dash.Local.Get("user_json");

        if (token && email && user_json) {

            var params = {};
            params["f"] = "validate";
            params["token"] = token;
            params["init"] = true;
            params["gzip"] = true;

            Dash.Request(this, this.on_auth_response, "Users", params);

        }
        else {
            this.__auth_not_authenticated_cb();
        }

    };

    this.SetUserAuthentication = function (email, server_response) {

        if (email && server_response["token"]) {
            this.Data = server_response["user"];
            this.Init = server_response["init"];
            Dash.Local.Set("email", email);
            Dash.Local.Set("token", server_response["token"]);
            Dash.Local.Set("user_json", JSON.stringify(server_response["user"]));
        }
        else {
            this.Data = null;
            this.Init = null;
            Dash.Local.Set("email", "");
            Dash.Local.Set("token", "");
            Dash.Local.Set("user_json", "");
        }

        this.build_init_team_combo();

    };

    this.GetImage = function (user_email) {
        var img = null;

        if (Dash.User.Init["team"][user_email]) {
            if (Dash.User.Init["team"][user_email]["img"]) {
                img = Dash.User.Init["team"][user_email]["img"];
            }
        }

        if (!img) {
            // TODO: Allow dash to always return a stub for a user
            //  image along with the init data on the auth call

            img = {
                "default": true,
                "aspect": 1,
                "height": 512,
                "width": 512,
                "thumb_url": "dash/fonts/user_default.jpg",
            };
        }

        return img;
    };

    this.build_init_team_combo = function () {
        this.Init["team_combo"] = [];

        if (!this.Init["team"]) {
            return;
        }

        for (var i in this.Init["team_sort"]) {
            var email = this.Init["team_sort"][i];
            // var data = this.Init["team"][email];
            this.Init["team_combo"].push(this.Init["team"][email]);
        }

    };

    this.on_auth_response = function (response) {

        response["token"] = response["token"] || Dash.Local.Get("token");

        if (response["valid_login"] && response["user"]["email"]) {
            this.SetUserAuthentication(response["user"]["email"], response);
            this.__auth_authenticated_cb();
        }
        else {

            console.log("** The user is no longer authenticated **");
            console.log(response);

            this.SetUserAuthentication();
            this.__auth_not_authenticated_cb();

        }

    };

    this.Logout = function () {

        if (!window.confirm("Log out?")) {
            return;
        }

        Dash.Local.Set("email", "");
        Dash.Local.Set("token", "");
        Dash.Local.Set("user_json", "");

        location.reload();

    };

};
