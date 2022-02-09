function DashUser () {
    this.__auth_authenticated_cb = null;
    this.__auth_not_authenticated_cb = null;

    this.Data = null;
    this.Init = null;

    this.GetDisplayName = function (user_data=null) {
        if (!user_data) {
            user_data = this.Data;
        }

        return user_data["display_name"] ? user_data["display_name"] :
            user_data["first_name"] ? user_data["first_name"] +
            (user_data["last_name"] ? " " + user_data["last_name"] : "") :
            user_data["email"];
    };

    this.GetByEmail = function (user_email) {
        return Dash.User.Init["team"] ? Dash.User.Init["team"][user_email] : {};
    };

    this.GetImageByEmail = function (user_email) {
        if (!user_email) {
            return this.get_default_image_data();
        }

        if (user_email === Dash.User.Data["email"] && Dash.User.Data["img"]) {
            return Dash.User.Data["img"];
        }

        if (Dash.User.Init["team"][user_email] && Dash.User.Init["team"][user_email]["img"]) {
            return Dash.User.Init["team"][user_email]["img"];
        }

        // TODO: Allow dash to always return a stub for a user
        //  image along with the init data on the auth call

        return this.get_default_image_data();
    };

    this.Authenticate = function (bind, on_user_authenticated, on_user_not_authenticated, optional_params={}) {
        this.__auth_authenticated_cb = on_user_authenticated.bind(bind);
        this.__auth_not_authenticated_cb = on_user_not_authenticated.bind(bind);

        var token = Dash.Local.Get("token");
        var email = Dash.Local.Get("email");
        var user_json = Dash.Local.Get("user_json");

        if (token && email && user_json) {
            var params = {
                "f": "validate",
                "token": token,
                "init": true,
                "gzip": true
            };

            for (var key in optional_params) {
                params[key] = optional_params[key];
            }

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

    this.get_default_image_data = function () {
        return {
            "default": true,
            "aspect": 1,
            "height": 512,
            "width": 512,
            "thumb_url": "https://dash.guide/github/dash/client/full/bin/img/user_default.jpg"
        };
    };

    this.build_init_team_combo = function () {
        this.Init["team_combo"] = [];

        if (!this.Init["team"]) {
            return;
        }

        for (var i in this.Init["team_sort"]) {
            var email = this.Init["team_sort"][i];

            this.Init["team_combo"].push({
                ...Dash.GetDeepCopy(this.Init["team"][email]),  // Deep copy required here
                "label_text": this.Init["team"][email]["display_name"]  // Added for cohesiveness
            });
        }
    };

    this.on_auth_response = function (response) {

        response["token"] = response["token"] || Dash.Local.Get("token");

        if (response["valid_login"] && response["user"]["email"]) {
            this.SetUserAuthentication(response["user"]["email"], response);
            this.__auth_authenticated_cb();
        }

        else {
            console.log("** The user is no longer authenticated **\n", response);

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
}
