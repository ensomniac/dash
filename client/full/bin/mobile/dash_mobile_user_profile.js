function DashMobileUserProfile (
    binder, on_exit_callback, user_data=null, context_logo_img_url="", include_refresh_button=true
) {
    this.binder = binder;
    this.on_exit_callback = on_exit_callback.bind(binder);
    this.user_data = user_data || Dash.User.Data;
    this.context_logo_img_url = context_logo_img_url;
    this.include_refresh_button = include_refresh_button;

    this.html = null;
    this.stack = null;
    this.profile_button = null;
    this.first_name_field = null;
    this.suggestion_highlight = false;
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

    this.show_name_suggestion = function () {
        if (this.first_name_field.GetText() || this.suggestion_highlight) {
            return;
        }

        this.suggestion_highlight = $("<div></div>");

        this.suggestion_highlight.css({
            "position": "absolute",
            "background": this.color.AccentBad,
            "inset": 0,
            "bottom": Dash.Size.Padding * 0.25,
            "border-radius": this.first_name_field.border_radius,
            "pointer-events": "none",
            "opacity": 0
        });

        this.first_name_field.html.prepend(this.suggestion_highlight);

        if (window._DashMobileProfileSettingsIconButton) {
            window._DashMobileProfileSettingsIconButton._add_suggestion_badge();
        }

        this.pulse_name_label();
    };

    this.hide_name_suggestion = function () {
        if (!this.suggestion_highlight || !this.first_name_field.GetText()) {
            return;
        }

        this.suggestion_highlight.stop().animate(
            {"opacity": 0},
            () => {
                this.suggestion_highlight.remove();

                this.suggestion_highlight = null;
            }
        );

        if (window._DashMobileProfileSettingsIconButton?._suggestion_badge) {
            window._DashMobileProfileSettingsIconButton._suggestion_badge.remove();

            window._DashMobileProfileSettingsIconButton._suggestion_badge = null;
        }
    };

    this.pulse_name_label = function () {
        if (!this.suggestion_highlight) {
            return;
        }

        this.suggestion_highlight.animate(
            {
                "opacity": parseFloat(this.suggestion_highlight.css("opacity")) > 0.5 ? 0.1 : 1.0
            },
            1000,
            () => {
                this.pulse_name_label();
            }
        );
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

        // Use this to test if a user has anything that will block popups like window.confirm or window.alert
        this.user_banner.AddFooterIcon(
            "alert_bulb",
            "Test Popups",
            () => {
                window.confirm("This is a confirmation prompt");
                window.alert("This is an alert");
            }
        );

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

        Dash.Log.Log("User image uploaded:", response);

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
        var text_box = new Dash.Mobile.TextBox(
            this.color,
            key === "password" ? "Update Password" : key.Title(),
            this,
            (value, text_box) => {
                this.set_data(key, value, text_box);
            },
            true
        );

        if (key === "first_name") {
            this.first_name_field = text_box;

            if (!this.get_data()["first_name"]) {
                this.show_name_suggestion();
            }
        }

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

        Dash.Request(
            this,
            (response) => {
                if (!Dash.Validate.Response(response)) {
                    return;
                }

                Dash.Log.Log("User settings updated:", response);

                this.user_data = response["updated_data"];

                if (params["f"] === "update_password") {
                    text_box.SetText("");
                }

                if (key === "first_name") {
                    if (this.get_data()["first_name"]) {
                        this.hide_name_suggestion();
                    }

                    else {
                        this.show_name_suggestion();
                    }
                }
            },
            "Users",
            params
        );
    };

    this.on_profile_changed = function () {
        // Dummy/placeholder function
    };

    this.setup_styles();
}
