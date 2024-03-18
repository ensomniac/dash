function DashGuiLogin (on_login_binder=null, on_login_callback=null, color=null, optional_params={}) {
    this.on_login_callback = on_login_binder && on_login_callback ? on_login_callback.bind(on_login_binder) : null;
    this.color = color || (on_login_binder && on_login_binder.color ? on_login_binder.color : Dash.Color.Dark);
    this.optional_params = optional_params;

    this.email_input = null;
    this.reset_button = null;
    this.login_button = null;
    this.password_input = null;
    this.html = $("<div></div>");
    this.login_box = $("<div></div>");
    this.email_row = $("<div></div>");
    this.button_bar = $("<div></div>");
    this.password_row = $("<div></div>");
    this.header_label = $("<div>" + Dash.Context["display_name"] + "</div>");

    this.setup_styles = function () {
        var row_css = {
            "margin-bottom": Dash.Size.Padding,
            "margin-top": 0
        };

        var html_css = {
            "padding": Dash.Size.Padding,
            "inset": 0,
            "text-align": "center"
        };

        if (Dash.IsMobile) {
            html_css["background"] = "none";
        }

        this.html.css(html_css);

        this.email_row.css(row_css);

        this.password_row.css(row_css);

        this.header_label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "font-size": "125%",
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px",
            "margin-bottom": Dash.Size.Padding
        });

        this.add_inputs();
        this.add_buttons();
        this.add_login_box();
    };

    this.Submit = function () {
        var email = this.get_email();
        var pass = this.password_input.Text();

        if (email && pass) {
            this.Login();
        }
    };

    this.Login = function () {
        var email = this.get_email();
        var pass = this.password_input.Text();

        if (!Dash.Validate.Email(email)) {
            alert("Please enter a valid email");

            return;
        }

        if (!pass) {
            alert("Please enter a valid password");

            return;
        }

        var params = {
            "f": "login",
            "email": email,
            "pass": pass
        };

        for (var key in this.optional_params) {
            params[key] = this.optional_params[key];
        }

        this.login_button.Request(
            "Users",
            params,
            this.on_login_response,
            this
        );
    };

    this.ResetLogin = function () {
        var email = this.get_email();

        if (!Dash.Validate.Email(email)) {
            alert("Please enter a valid email");

            return;
        }

        this.reset_button.Request(
            "Users",
            {
                "f": "reset",
                "email": email
            },
            this.on_reset_response,
            this
        );
    };

    this.get_email = function () {
        return this.email_input.Text().trim().toLowerCase();
    };

    this.add_buttons = function () {
        var button_options = {"style": Dash.IsMobile ? "toolbar" : "default"};

        this.login_button = new Dash.Gui.Button("Log In", this.Login, this, this.color, button_options);
        this.reset_button = new Dash.Gui.Button("Create / Reset", this.ResetLogin, this, this.color, button_options);

        for (var button of [this.login_button, this.reset_button]) {
            button.html.css({
                "margin": 0,
                "flex": 2
            });

            if (Dash.IsMobile) {
                button.label.css({
                    "padding-left": Dash.Size.Padding * 0.5,
                    "padding-right": Dash.Size.Padding * 0.5
                });
            }
        }

        this.button_bar.append(this.reset_button.html);
        this.button_bar.append(this.login_button.html);

        this.button_bar.css({
            "display": "flex",
            "gap": Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1),
            "height": Dash.IsMobile ? Dash.Size.RowHeight : Dash.Size.ButtonHeight,
            "margin-top": Dash.Size.Padding * 2
        });
    };

    this.add_inputs = function () {
        this.password_input = new Dash.Gui.Input("Password", this.color);
        this.email_input = new Dash.Gui.Input("email@" + Dash.Context["domain"], this.color);

        for (var input of [this.email_input, this.password_input]) {
            input.html.css({
                "padding": Dash.Size.Padding * (Dash.IsMobile ? 0.25 : 0.5),
                "border-radius": Dash.Size.BorderRadiusInteractive * (Dash.IsMobile ? 0.5 : 1),
                "background": this.color.Background
            });

            input.input.css({
                "padding-left": Dash.Size.Padding * 0.5,
                "padding-right": Dash.Size.Padding * 0.5,
                "width": "calc(100% - " + Dash.Size.Padding + "px)",
                "border-radius": (
                    Dash.IsMobile ? (Dash.Size.BorderRadiusInteractive * 0.5) : Dash.Size.BorderRadius
                ) * 0.5
            });

            input.DisableAutosave();
            input.DisableBlurSubmit();
            input.SetOnSubmit(this.Submit, this);
            input.SetOnChange(this.store_input, this);
        }

        this.email_row.append(this.email_input.html);

        this.password_row.append(this.password_input.html);

        this.email_input.SetText(Dash.Local.Get("email") || "");

        var toggle = new Dash.Gui.Checkbox(
            "",
            true,
            this.color,
            "Toggle",
            this,
            (toggle) => {
                this.password_input.input.attr("type", toggle.IsChecked() ? "password" : "text");
            }
        );

        toggle.SetTrueIconName("hidden", "Show password");
        toggle.SetFalseIconName("visible", "Hide password");

        toggle.AddHighlight(
            0,
            false,
            {
                "left": Dash.Size.Padding * 0.5,
                "right": Dash.Size.Padding * 0.5
            }
        );

        toggle.html.css({
            "position": "absolute",
            "top": 0,
            "border-radius": Dash.Size.BorderRadius
        });

        this.password_row.append(toggle.html);

        requestAnimationFrame(() => {
            var comp = Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 0.5);

            toggle.SetIconSize(Dash.IsMobile ? 140 : 110, this.password_row.height());

            toggle.html.css({
                "right": -comp
            });

            this.password_row.css({
                "padding-right": Dash.Size.ButtonHeight - (comp * (Dash.IsMobile ? 2 : 1))
            });
        });
    };

    this.add_login_box = function () {
        var side_margin = Dash.IsMobile ? 0 : "auto";

        this.login_box.css({
            "width": (
                  Dash.IsMobile ? "calc(100% - " + (Dash.Size.Padding * 2) + "px)"
                : Math.min(350, (window.outerWidth * 0.5))
            ),
            "height": "auto",
            "margin-left": side_margin,
            "margin-right": side_margin,
            "padding": Dash.Size.Padding,
            "background": this.color.BackgroundRaised,
            // "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "border": "1px solid " + this.color.Pinstripe,
            "border-radius": Dash.Size.BorderRadius * (Dash.IsMobile ? 0.5 : 1)
        });

        this.login_box.append(this.header_label);
        this.login_box.append(this.email_row);
        this.login_box.append(this.password_row);
        this.login_box.append(this.button_bar);

        this.html.append(this.login_box);
    };

    this.store_input = function () {
        Dash.Local.Set("email", this.get_email());
    };

    this.on_reset_response = function (response) {
        if (!Dash.Validate.Response(response)) {
            return;
        }

        if (response["success"]) {
            alert(
                  "Your password link has been sent to "
                + response["email"]
                + ". Click that link to receive a new temporary password and log in"
            );
        }
    };

    this.on_login_response = function (response) {
        if (!Dash.Validate.Response(response)) {
            return;
        }

        Dash.Log.Log("******* LOG IN *******", response);

        Dash.User.SetUserAuthentication(this.get_email(), response);

        (function (self) {
            self.html.animate({"opacity": 0}, 150, function () {
                self.html.remove();

                self.on_login_callback();
            });
        })(this);
    };

    this.setup_styles();
}
