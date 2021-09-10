function DashGuiLogin (on_login_binder, on_login_callback, color, optional_params={}) {
    this.html = $("<div></div>");
    this.login_box = $("<div></div>");
    this.header_label = $("<div>" + Dash.Context["display_name"] + "</div>");
    this.email_row = $("<div></div>");
    this.password_row = $("<div></div>");
    this.button_bar = $("<div></div>");
    this.color = color || Dash.Color.Dark;
    this.on_login_callback = null;
    this.optional_params = optional_params;

    if (on_login_binder && on_login_callback) {
        this.on_login_callback = on_login_callback.bind(on_login_binder);
    }

    this.setup_styles = function () {
        this.login_button = new Dash.Gui.Button("Login", this.Login, this, this.color);
        this.reset_button = new Dash.Gui.Button("Create / Reset Login", this.ResetLogin, this, this.color);
        this.email_input = new Dash.Gui.Input("email@" + Dash.Context["domain"], this.color);
        this.password_input = new Dash.Gui.Input("Password", this.color);

        this.email_input.html.css({
            "padding": Dash.Size.Padding * 0.5,
            "background": this.color.Background
        });

        this.password_input.html.css({
            "padding": Dash.Size.Padding * 0.5,
            "background": this.color.Background
        });

        this.email_input.OnSubmit(this.Submit, this);
        this.password_input.OnSubmit(this.Submit, this);

        this.email_input.OnChange(this.store_input, this);
        this.password_input.OnChange(this.store_input, this);

        this.email_row.append(this.email_input.html);
        this.password_row.append(this.password_input.html);

        this.html.append(this.login_box);

        this.login_box.append(this.header_label);
        this.login_box.append(this.email_row);
        this.login_box.append(this.password_row);
        this.login_box.append(this.button_bar);
        this.button_bar.append(this.reset_button.html);
        this.button_bar.append(this.login_button.html);

        if (Dash.IsMobile) {
            this.setup_mobile_sizing();
        } else {
            this.setup_desktop_sizing();
        };

        this.email_input.SetText(Dash.Local.Get("email") || "");
        this.show_login_box();

    };

    this.setup_desktop_sizing = function () {

        var login_box_width = window.outerWidth * 0.5;

        if (login_box_width > 350) {
            login_box_width = 350;
        };

        this.html.css({
            "inset": 0,
            "text-align": "center",
        });

        this.login_box.css({
            "width": login_box_width,
            "height": "auto",
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-top": Dash.Size.Padding * 2,
            "padding-bottom": Dash.Size.Padding * 2,
            "background": this.color.BackgroundRaised,
            "border-radius": 4,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "opacity": 0,
        });

        this.header_label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px",
            "padding": Dash.Size.Padding,
        });

        this.button_bar.css({
            "display": "flex",
            "height": Dash.Size.RowHeight,
        });

        this.email_row.css({
            "margin": Dash.Size.Padding,
            "margin-top": 0,
        });

        this.password_row.css({
            "margin": Dash.Size.Padding,
            "margin-top": 0,
        });

        this.login_button.html.css({
            "margin-left": Dash.Size.Padding,
            "width": (login_box_width * 0.5) - Dash.Size.Padding * 1.5,
        });

        this.reset_button.html.css({
            "margin-left": Dash.Size.Padding,
            "width": (login_box_width * 0.5) - Dash.Size.Padding * 1.5,
        });

    };

    this.setup_mobile_sizing = function () {

        var login_box_width = window.outerWidth - (Dash.Size.Padding*2);

        this.html.css({
            "inset": 0,
            "text-align": "center",
            "background": "none",
        });

        this.login_box.css({
            "width": login_box_width,
            "height": "auto",
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-top": Dash.Size.Padding,
            "padding-bottom": Dash.Size.Padding*2,
            "background": this.color.BackgroundRaised,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "opacity": 0,
        });

        this.header_label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px",
            "padding": Dash.Size.Padding,
        });

        this.button_bar.css({
            "display": "flex",
            "height": Dash.Size.RowHeight,
        });

        this.email_row.css({
            "margin": Dash.Size.Padding,
            "margin-top": 0,
        });

        this.password_row.css({
            "margin": Dash.Size.Padding,
            "margin-top": 0,
        });

        this.login_button.html.css({
            "margin-left": Dash.Size.Padding,
            "width": (login_box_width * 0.5) - Dash.Size.Padding * 1.5,
        });

        this.reset_button.html.css({
            "margin-left": Dash.Size.Padding,
            "width": (login_box_width * 0.5) - Dash.Size.Padding * 1.5,
        });

    };







    this.show_login_box = function () {
        this.login_box.css({"opacity": 1});
    };

    this.store_input = function () {
        Dash.Local.Set("email", this.email_input.Text());
    };

    this.Submit = function () {
        var email = this.email_input.Text();
        var pass = this.password_input.Text();

        if (email && pass) {
            this.Login();
        }

        // Disabling this to prevent accidental resets, better if they deliberately click the button
        // else {
        //     this.ResetLogin();
        // }
    };

    this.Login = function () {
        var email = this.email_input.Text();
        var pass = this.password_input.Text();

        if (!Dash.IsValidEmail(email)) {
            alert("Please enter a valid email");

            return;
        }

        if (!pass) {
            alert("Please enter a valid password");

            return;
        }

        var api = "https://" + Dash.Context["domain"] + "/Users";

        var server_data = {};
        server_data["f"] = "login";
        server_data["email"] = email;
        server_data["pass"] = pass;

        for (var key in this.optional_params) {
            server_data[key] = this.optional_params[key];
        };

        this.login_button.Request(api, server_data, this.on_login_response, this);
    };

    this.ResetLogin = function () {
        var email = this.email_input.Text();
        var api = "https://" + Dash.Context["domain"] + "/Users";

        if (!Dash.IsValidEmail(email)) {
            alert("Please enter a valid email");

            return;
        }

        var server_data = {};
        server_data["f"] = "reset";
        server_data["email"] = email;

        this.reset_button.Request(api, server_data, this.on_reset_response, this);
    };

    this.on_reset_response = function (response) {
        if (response["error"]) {
            alert(response["error"]);

            return;
        }

        if (response["success"]) {
            alert("Your password link has been sent to " + response["email"] + ". Click that link to receive a new temporary password and log in");
        }
    };

    this.on_login_response = function (response) {
        if (response["error"]) {
            alert(response["error"]);
            return;
        };

        console.log("******* LOG IN *******", response);
        Dash.User.SetUserAuthentication(this.email_input.Text(), response);

        (function (self) {
            self.html.animate({"opacity": 0}, 150, function () {
                self.html.remove();
                self.on_login_callback();
            });
        })(this);
    };

    this.setup_styles();
}
