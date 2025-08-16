// Profile page layout for the currently logged-in user
function DashLayoutUserProfile (user_data=null, options={}, view_mode="settings") {
    this.user_data = user_data || Dash.User.Data || {};
    this.options = options;  // TODO: convert to proper interface
    this.view_mode = view_mode;

    this.modal = null;
    this.callbacks = {};
    this.property_box = null;
    this.modal_profile = null;
    this.top_right_button = null;
    this.first_name_field = null;
    this.edit_email_modal = null;
    this.pwa_reload_button = null;
    this.suggestion_badge = false;
    this.img_box = $("<div></div>");
    this.suggestion_highlight = false;
    this.modal_of = this.options["modal_of"] || null;
    this.color = this.options["color"] || Dash.Color.Light;
    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);

    this.img_box_size = (this.options["img_box_size"] || (
        this.view_mode === "preview" ? Dash.Size.ColumnWidth * 1.2 : Dash.Size.ColumnWidth
    )) * (Dash.Size.DesktopToMobileMode ? 0.8 : 1);

    this.height = this.img_box_size + Dash.Size.Padding + Dash.Size.RowHeight;

    // True by default, but ideally, options["is_admin"] should be provided for added
    // security between non-admins. This is referenced by this.has_privileges when this element
    // is pertaining to the current user, so that users (and admins) can only change their own data.
    this.is_admin = "is_admin" in this.options ? this.options["is_admin"] : true;

    // This manages whether:
    //   - rows are editable (excluding the ones that are hard-coded)
    //   - the "Update Password" field is visible
    //   - the user image can be updated
    this.has_privileges = (this.user_data["email"] === Dash.User.Data["email"] || this.is_admin);

    this.setup_styles = function () {
        if (!["settings", "preview"].includes(this.view_mode)) {
            console.error("Error: View mode is invalid");

            return;
        }

        this.add_header();

        if (this.view_mode === "settings") {
            this.add_property_box();
        }

        this.add_user_image_box();
        this.add_top_right_button();

        this.html.css({
            "min-height": this.height
        });

        if (this.view_mode === "preview") {
            this.html.css({
                "max-height": this.height,
                "width": this.img_box_size,
                "min-width": this.img_box_size,
                "max-width": this.img_box_size
            });
        }
    };

    // This is a very specific function that is only intended to be called for new
    // users that have not filled in their name yet. When this function is called,
    // the username isn't set, but the user settings tab is loaded. Find the First Name
    // field and highlight it so it's clear what the user is supposed to do
    this.ShowNameSuggestion = function () {
        if (this.first_name_field.Text() || this.suggestion_highlight) {
            return;
        }

        this.suggestion_highlight = $("<div></div>");

        this.suggestion_highlight.css({
            "position": "absolute",
            "background": this.color.AccentBad,
            "inset": 0,
            "pointer-events": "none",
            "opacity": 0
        });

        this.first_name_field.FlashSave();

        this.first_name_field.html.prepend(this.suggestion_highlight);

        if (window._DashProfileSettingsTabButton) {
            this.suggestion_badge = window._DashProfileSettingsTabButton.AddIcon(
                "alert_square_solid",
                0.75,
                window._DashProfileSettingsTabButton.color.AccentBad
            );
        }

        this.pulse_name_label();
    };

    this.HideNameSuggestion = function () {
        if (!this.suggestion_highlight || !this.first_name_field.Text()) {
            return;
        }

        this.suggestion_highlight.stop().animate(
            {"opacity": 0},
            () => {
                this.suggestion_highlight.remove();

                this.suggestion_highlight = null;
            }
        );

        if (this.suggestion_badge) {
            this.suggestion_badge.html.hide(() => {
                this.suggestion_badge.html.remove();

                this.suggestion_badge = null;
            });
        }
    };

    this.HasPrivileges = function () {
        return this.has_privileges;
    };

    this.add_top_right_button = function () {
        if (this.modal_of) {
            return;
        }

        this.top_right_button = Dash.Gui.GetTopRightIconButton(
            this,
            this.view_mode === "settings" ? this.log_out :
                this.view_mode === "preview" ? this.show_modal :
                function () {},
            this.modal_of ? "close" :
                this.view_mode === "settings" ? "log_out" :
                this.view_mode === "preview" ? "expand" :
                "alert_triangle"
        );

        this.top_right_button.html.css({
            "margin-top": Dash.Size.Padding * 0.25,
            "margin-right": Dash.Size.Padding * 0.8
        });

        this.top_right_button.SetIconSize(180).AddHighlight().SetHoverHint(
            this.view_mode === "settings" ? "Log Out" :
            this.view_mode === "preview" ? "Expand" :
            ""
        );

        this.html.append(this.top_right_button.html);

        if (this.view_mode !== "settings" || !Dash.IsMobileFromHomeScreen) {
            return;
        }

        this.pwa_reload_button = Dash.Gui.GetTopRightIconButton(
            this,
            () => {
                location.reload();
            },
            "refresh"
        );

        this.pwa_reload_button.html.css({
            "margin-top": Dash.Size.Padding * 0.3,
            "margin-right": Dash.Size.Padding * 5
        });

        this.pwa_reload_button.SetIconSize(160).AddHighlight().SetHoverHint("Refresh app");

        this.html.append(this.pwa_reload_button.html);
    };

    this.show_modal = function () {
        if (this.modal) {
            this.modal.Show();

            return;
        }

        // This isn't technically correct, but it's working - moving on
        var height = this.img_box_size + Dash.Size.Padding;

        if (
               this.view_mode === "preview"
            && this.options["property_box"]
            && Dash.Validate.Object(this.options["property_box"]["properties"])
        ) {
            height += (
                  Dash.Size.RowHeight
                * (this.options["property_box"]["properties"].length - (this.has_privileges ? 2 : 4))
            );
        }

        this.modal = new Dash.Gui.Modal(
            this.color,
            this.html.parent(),
            Dash.Size.ColumnWidth * 3.25,
            height
        );

        if (this.modal_profile) {
            return;
        }

        this.add_modal_profile();
    };

    this.add_modal_profile = function () {
        this.modal_profile = new Dash.Layout.UserProfile(
            this.user_data,
            {
                ...this.options,
                "modal_of": this
            },
            "settings"
        );

        this.modal_profile.html.css({
            "padding": 0,
            "background": "",
            "box-shadow": "",
            "border": ""
        });

        this.modal_profile.img_box.css({
            "left": 0,
            "top": Dash.Size.Padding + Dash.Size.RowHeight
        });

        this.modal.AddHTML(this.modal_profile.html);
    };

    this.get_header_label_text = function () {
        var label = "";

        if (this.view_mode === "settings") {
            if (this.user_data["first_name"]) {
                label = this.user_data["first_name"] + "'";

                if (!this.user_data["first_name"].endsWith("s")) {
                    label += "s";
                }
            }

            if (label) {
                label += " ";
            }

            label += "User Settings";
        }

        else if (this.view_mode === "preview") {
            if (this.user_data["display_name"]) {
                label = this.user_data["display_name"];
            }

            else {
                label = "";

                if (this.user_data["first_name"]) {
                    label += this.user_data["first_name"];

                    if (this.user_data["last_name"]) {
                        label += " ";
                        label += this.user_data["last_name"];
                    }
                }
            }
        }

        return label || "User";
    };

    this.add_header = function () {
        this.header = new Dash.Gui.Header(this.get_header_label_text(), this.color);

        this.header.ReplaceBorderWithIcon("user").AddShadow();

        this.header.label.css({
            "flex": 1,
            "overflow": "hidden",
            "white-space": "nowrap",
            "text-overflow": "ellipsis",
            "margin-right": Dash.Size.Padding * 3
        });

        this.html.append(this.header.html);
    };

    this.add_property_box = function () {
        this.property_box = new Dash.Gui.PropertyBox(
            this,
            this.get_data,
            this.set_data,
            "Users",
            this.user_data["email"],
            {"color": this.color}
        );

        this.html.append(this.property_box.html);

        this.property_box.Flatten();

        this.property_box.html.css({
            "margin": 0,
            "padding": 0,
            "padding-left": this.img_box_size + Dash.Size.Padding,
            "border-radius": 0
        });

        if (!this.options["property_box"] || !this.options["property_box"]["replace"]) {
            this.setup_default_property_box();
        }

        if (this.options["property_box"] && this.options["property_box"]["properties"]) {
            this.setup_custom_property_box();
        }

        if (!this.options["property_box"] || !this.options["property_box"]["replace"]) {
            this.add_password_update_field();
        }
    };

    this.add_password_update_field = function () {
        if (this.modal_of || !this.has_privileges) {
            return;
        }

        this.property_box.AddLineBreak();

        var row = this.property_box.AddInput(
            "password", "Update Password", "", null, !this.modal_of, {"placeholder_text": "New Password"}
        );

        row.html.css({
            "background": Dash.Color.GetTransparent(this.color.AccentBad, 0.1)
        });

        row.DisableAutosave();

        row.input.DisableAuthForVisToggle();

        row.input.visibility_toggle.Toggle();

        // In this context, we don't want password managers to autofill the user's existing password,
        // but some of them, like Chrome's password manager, ignore "autocomplete: off", so setting
        // it to a non-standard/invalid value solves the problem, counteracting those bypasses
        row.input.input.attr("autocomplete", "new-password");
    };

    this.setup_custom_property_box = function () {
        var custom_props = Dash.GetDeepCopy(this.options["property_box"]["properties"]);

        for (var property_details of custom_props) {
            if (!property_details["key"]) {
                continue;
            }

            var element;
            var can_edit = (this.modal_of || property_details["editable"] === false) ? false : this.has_privileges;

            if (property_details["func"] && property_details["params"]) {
                // This is hacky, but not sure how else to handle this right now...
                // Besides, you'd only be using this func/params flow if you
                // know what you're doing, so is it really even an issue?
                if (property_details["params"].includes("can_edit")) {
                    property_details["params"][property_details["params"].indexOf("can_edit")] = can_edit;
                }

                // This isn't great either, but doing the best I can with
                // this class' pre-existing, non-ideal property box data handling
                if (property_details["params"].includes("callback")) {
                    (function (self, property_details) {
                        property_details["params"][
                            property_details["params"].indexOf("callback")
                            ] = function (value) {
                            self.set_data(property_details["key"]);

                            self.property_box.set_property(property_details["key"], value);
                        };
                    })(this, property_details);
                }

                element = this.property_box[property_details["func"]](...property_details["params"]);
            }

            else {
                element = this.property_box.AddInput(
                    property_details["key"],
                    property_details["label_text"] || property_details["display_name"],
                    "",
                    null,
                    can_edit,
                    property_details["options"] || {}
                );
            }

            if (property_details["end_tag"]) {
                element.AddEndTag(property_details["end_tag"]);
            }

            // Extra callback if something else needs to happen
            // in addition to the standard/basic set_data behavior
            if (property_details["callback"]) {
                this.callbacks[property_details["key"]] = property_details["callback"];
            }
        }
    };

    this.setup_default_property_box = function () {
        this.add_email_field();

        this.first_name_field = this.property_box.AddInput(
            "first_name",
            "First Name",
            "",
            null,
            this.modal_of ? false : this.has_privileges,
            {"placeholder_text": "Please enter a name"}
        );

        this.property_box.AddInput(
            "last_name",
            "Last Name",
            "",
            null,
            this.modal_of ? false : this.has_privileges,
            {"placeholder_text": "Please enter a name"}
        );

        if (!this.get_data()["first_name"]) {
            this.ShowNameSuggestion();
        }
    };

    this.add_email_field = function () {
        var email_row = this.property_box.AddInput("email", "Email Address", "", null, false);

        if (this.modal_of || !this.has_privileges) {
            return;
        }

        var email_edit_button = new Dash.Gui.IconButton(
            "edit",
            () => {
                this.show_email_modal();
            },
            this,
            this.color,
            {
                "container_size": Dash.Size.RowHeight,
                "size_mult": 0.8
            }
        );

        email_row.html.append(email_edit_button.html);
    };

    this.show_email_modal = function () {
        if (this.edit_email_modal) {
            this.edit_email_modal.Show();

            return;
        }

        this.edit_email_modal = new Dash.Gui.Modal(
            this.color,
            this.html.parent().parent(),
            Dash.Size.ColumnWidth * 2.5,
            Dash.Size.ColumnWidth * 1.15
        );

        var property_box = new Dash.Gui.PropertyBox(this);

        property_box.html.css({
            "padding-top": Dash.Size.Padding * 0.5
        });

        property_box.Flatten();
        property_box.AddHeader("Change Email Address").ReplaceBorderWithIcon("email");

        var hint = $(
            "<div>",
            {
                "text": (
                      "Once submitted, all existing records that reference\n"
                    + "the old email will be updated to reflect the new email."
                )
            }
        );

        hint.css({
            "color": this.color.Stroke,
            "font-family": "sans_serif_normal",
            "font-size": "95%",
            "white-space": "pre-wrap",
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding * 2
        });

        property_box.AddHTML(hint);

        var input = property_box.AddInput(
            "new_email",
            "",
            "",
            null,
            true,
            {"placeholder_text": this.user_data["email"]}
        );

        input.html.css({
            "margin-left": 0,
            "margin-bottom": Dash.Size.Padding * 2
        });

        property_box.AddButton(
            "Update",
            () => {
                var new_email = input.Text();

                if (!new_email || new_email === this.user_data["email"]) {
                    alert("Must enter a new email address");

                    return;
                }

                Dash.Request(
                    this,
                    (response) => {
                        if (!Dash.Validate.Response(response)) {
                            return;
                        }

                        this.edit_email_modal.Hide();
                    },
                    "Users",
                    {
                        "f": "update_email",
                        "new_email": new_email,
                        "email": this.user_data["email"]
                    }
                );
            }
        );

        this.edit_email_modal.AddHTML(property_box.html);
    };

    this.add_user_image_box = function () {
        var img_url = "https://dash.guide/github/dash/client/full/bin/img/user_default.jpg";

        if (this.user_data["img"]) {
            img_url = this.user_data["img"]["thumb_url"];
        }

        this.html.append(this.img_box);

        this.img_box.css({
            "position": "absolute",
            "left": Dash.Size.Padding,
            "top": (Dash.Size.Padding * 2) + Dash.Size.RowHeight,
            "width": this.img_box_size,
            "height": this.img_box_size,
            "background": "#222",
            "background-image": "url(" + img_url + ")",
            "background-size": "cover",
            // "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)",
            "outline": "1px solid " + this.color.Pinstripe,
            "border-radius": 4
        });

        this.add_user_image_upload_button();
    };

    this.on_user_img_uploaded = function (response) {
        if (response.timeStamp) {
            return;
        }

        Dash.Log.Log("on_user_img_uploaded:", response);

        if (this.img_box && response["img"]) {
            this.user_data["img"] = response["img"];

            this.img_box.css({
                "background-image": "url(" + this.user_data["img"]["thumb_url"] + ")",
            });
        }
    };

    this.add_user_image_upload_button = function () {
        if (!this.has_privileges) {
            return;
        }

        var label = "Update Image";

        this.user_image_upload_button = new Dash.Gui.Button(label, this.on_user_img_uploaded, this, this.color);

        this.img_box.append(this.user_image_upload_button.html);

        var button_css = {
            "position": "absolute",
            "width": this.img_box_size,
            "height": this.img_box_size
        };

        var hidden_css = {...button_css, "opacity": 0};

        this.user_image_upload_button.SetFileUploader(
            "Users",
            {
                "f": "upload_image",
                "user_data": JSON.stringify(this.user_data)
            },
            null,
            hidden_css
        );

        this.user_image_upload_button.html.css({
            ...button_css,
            "background": "none",
            "overflow": "hidden"
        });

        this.user_image_upload_button.label.css({
            ...hidden_css,
            "font-family": "sans_serif_bold",
            "line-height": this.img_box_size + "px",
            "text-shadow": "1px 1px 1px rgba(0, 0, 0, 1)"
        });

        // this.user_image_upload_button.file_uploader.html.css(hidden_css);

        this.user_image_upload_button.html.attr("title", label);

        (function (user_image_upload_button) {
            user_image_upload_button.html.on("mouseenter", function () {
                user_image_upload_button.highlight.stop().animate({"opacity": 0.25}, 50);

                user_image_upload_button.label.stop().animate({"opacity": 0.65}, 50);

                if (user_image_upload_button.is_selected) {
                    user_image_upload_button.label.css(
                        "color", user_image_upload_button.color_set.Text.SelectedHover
                    );
                }

                else {
                    user_image_upload_button.label.css("color", user_image_upload_button.color_set.Text.BaseHover);
                }
            });

            user_image_upload_button.html.on("mouseleave", function () {
                user_image_upload_button.label.stop().animate({"opacity": 0}, 50);
            });
        })(this.user_image_upload_button);
    };

    this.get_data = function () {
        return this.user_data;
    };

    // Basic/standard setting of data is taken care of in DashGuiPropertyBox
    this.set_data = function (updated_data_or_key) {
        var key = typeof updated_data_or_key === "string" ? updated_data_or_key : updated_data_or_key["key"];

        if (key === "first_name") {
            this.user_data["first_name"] = this.first_name_field.Text();

            if (this.user_data["first_name"]) {
                this.HideNameSuggestion();
            }

            else {
                this.ShowNameSuggestion();
            }

            this.header.SetText(this.get_header_label_text());
        }

        if (  // Cover possible img update on name changes
               typeof updated_data_or_key === "object"
            && updated_data_or_key["updated_data"]?.["img"]?.["id"]
            && ["first_name", "last_name"].includes(key)
        ) {
            this.on_user_img_uploaded(updated_data_or_key["updated_data"]);
        }

        // This is an extra, optional follow-up to that
        if (key in this.callbacks) {
            this.callbacks[key](updated_data_or_key);
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

    this.log_out = function () {
        Dash.Logout();
    };

    this.setup_styles();
}
