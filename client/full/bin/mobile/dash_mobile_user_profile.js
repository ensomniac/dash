function DashMobileUserProfile (binder, on_exit_callback, user_data=null, context_logo_img_url="", include_refresh_button=true) {
    this.binder = binder;
    this.on_exit_callback = on_exit_callback.bind(binder);
    this.user_data = user_data || Dash.User.Data;
    this.context_logo_img_url = context_logo_img_url;
    this.include_refresh_button = include_refresh_button;

    this.html = null;
    this.stack = null;
    this.profile_button = null;
    this.color = this.binder.color || Dash.Color.Dark;

    this.setup_styles = function () {
        this.stack = new Dash.Mobile.CardStack(this);
        this.html = this.stack.html;

        this.setup_banner();
        this.add_user_settings_card();

        if (this.user_data["img"] && this.user_data["img"]["thumb_url"]) {
            this.user_banner.SetBackground(this.user_data["img"]["thumb_url"]);
        }

        this.add_context_logo_img();
    };

    this.setup_banner = function () {
        this.user_banner = this.stack.AddBanner();

        this.user_banner.SetMarginMode(7);
        this.user_banner.SetRightIcon("close", this.exit_stack.bind(this));
        this.user_banner.AddFooterIcon("log_out", "Log Out", this.log_user_out.bind(this));

        if (this.include_refresh_button) {
            this.user_banner.AddFooterIcon(
                "refresh",
                "Refresh App",
                function () {
                    location.reload();
                }
            );
        }

        this.user_banner.header_row.right_icon.AddShadow("1px 1px 3px rgba(0, 0, 0, 1)");

        this.profile_button = this.user_banner.AddFooterIcon("image", "Change Profile", this.on_profile_changed.bind(this));

        this.profile_button.AddUploader(
            this,
            this.on_user_img_uploaded,
            "Users",
            {
                "f": "upload_image",
                "user_data": JSON.stringify(this.get_data())
            }
        );
    };

    this.add_context_logo_img = function () {
        if (!this.context_logo_img_url) {
            return;
        }

        var image = $("<div></div>");

        image.css({
            "height": Dash.Size.RowHeight * 2,
            "margin-top": Dash.Size.Padding,
            "background-image": "url(" + this.context_logo_img_url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center"
        });

        this.stack.AddHTML(image);
    };

    this.on_user_img_uploaded = function (response) {
        if (response.timeStamp) {
            return;
        }

        console.log("User image uploaded:", response);

        if (!response["img"]) {
            return;
        }

        this.user_data["img"] = response["img"];

        this.user_banner.SetBackground(this.user_data["img"]["thumb_url"]);
    };

    this.add_user_settings_card = function () {
        var card = this.stack.AddCard();

        card.AddLabel("User Settings");

        this.add_input(card, "first_name");
        this.add_input(card, "last_name");
        this.add_input(card, "email", false);
        this.add_input(card, "password");
    };

    this.add_input = function (card, key, can_edit=true) {
        var text_box = (function (self) {
            return new Dash.Mobile.TextBox(
                self.color,
                key === "password" ? "Update Password" : key.Title(),
                this,
                function (value, text_box) {
                    self.set_data(key, value, text_box);
                },
                true
            );
        })(this);

        text_box.SetText(this.get_data()[key]);
        text_box.StyleAsRow();

        if (key.includes("password")) {
            text_box.DisableAutoSubmit();
        }

        if (!can_edit) {
            text_box.Lock();
        }

        card.AddHTML(text_box.html);
    };

    this.log_user_out = function () {
        Dash.Logout();
    };

    this.exit_stack = function () {
        if (this.on_exit_callback) {
            this.on_exit_callback();
        }
    };

    this.get_data = function () {
        return this.user_data;
    };

    this.set_data = function (key, value, text_box) {
        var email = this.get_data()["email"];

        var params = {
            "f": "set_property",
            "key": key,
            "value": value,
            "obj_id": email
        };

        if (key.includes("password")) {
            params["f"] = "update_password";
            params["p"] = value;
            params["email"] = email;
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    Dash.Validate.Response(response);

                    console.log("User settings updated:", response);

                    if (params["f"] === "update_password") {
                        text_box.SetText("");
                    }
                },
                "Users",
                params
            );
        })(this);
    };

    this.on_profile_changed = function () {
        // Dummy/placeholder function
    };

    this.setup_styles();
}
