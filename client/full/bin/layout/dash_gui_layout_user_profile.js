// Profile page layout for the currently logged-in user
function DashGuiLayoutUserProfile (user_data=null, options={}, view_mode="settings") {
    this.user_data = user_data || Dash.User.Data || {};
    this.options = options;  // TODO: convert to proper interface
    this.view_mode = view_mode;

    this.modal_box = null;
    this.property_box = null;
    this.modal_background = null;
    this.img_box = $("<div></div>");
    this.modal_of = this.options["modal_of"] || null;

    // True by default, but ideally, options["is_admin"] should be provided for added
    // security between non-admins. This is referenced by this.has_privileges when this element
    // is pertaining to the current user, so that users (and admins) can only change their own data.
    this.is_admin = "is_admin" in this.options ? this.options["is_admin"] : true;

    // This manages whether:
    //     - rows are editable (excluding the ones that are hard-coded)
    //     - the "Update Password" field is visible
    //     - the user image can be updated
    this.has_privileges = (this.user_data["email"] === Dash.User.Data["email"] || this.is_admin);

    this.color = this.options["color"] || Dash.Color.Light;
    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);
    this.img_box_size = this.view_mode === "preview" ? Dash.Size.ColumnWidth * 1.2 : Dash.Size.ColumnWidth;
    this.height = this.img_box_size + Dash.Size.Padding + Dash.Size.RowHeight;

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

    this.HasPrivileges = function () {
        return this.has_privileges;
    };

    this.add_top_right_button = function () {
        var button = Dash.Gui.GetTopRightIconButton(
            this,
            this.modal_of ? this.close_modal :
                this.view_mode === "settings" ? this.log_out :
                this.view_mode === "preview" ? this.show_modal :
                function () {},
            this.modal_of ? "close" :
                this.view_mode === "settings" ? "log_out" :
                this.view_mode === "preview" ? "expand" :
                "alert_triangle"
        );

        button.SetHoverHint(
            this.modal_of ? "Close" :
                this.view_mode === "settings" ? "Log Out" :
                this.view_mode === "preview" ? "Expand" :
                ""
        );

        this.html.append(button.html);
    };

    this.show_modal = function () {
        if (!this.modal_background) {
            this.modal_background = Dash.Gui.GetModalBackground(this.color);

            this.modal_background.css({
                "display": "none"
            });

            this.html.parent().append(this.modal_background);
        }

        if (!this.modal_box) {
            this.modal_box = new Dash.Gui.Layout.UserProfile(
                this.user_data,
                {
                    ...this.options,
                    "modal_of": this
                },
                "settings"
            );

            this.modal_box.html.css({
                "z-index": this.modal_background.css("z-index") + 1,
                "display": "none",
                "position": "absolute",
                "top": "50%",
                "left": "50%",
                "transform": "translate(-50%, -50%)"
            });

            this.html.parent().append(this.modal_box.html);
        }

        this.modal_background.show();
        this.modal_box.html.show();
    };

    this.close_modal = function () {
        if (this.modal_of && this.modal_of.modal_box) {
            this.modal_of.modal_box.html.hide();
        }

        else {
            this.html.hide();
        }

        if (this.modal_of && this.modal_of.modal_background) {
            this.modal_of.modal_background.hide();
        }
    };

    this.add_header = function () {
        var label = "User";

        if (this.view_mode === "settings") {
            label = (this.user_data["first_name"] ? this.user_data["first_name"] + "'s " : "") + "User Settings";
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

        this.header = new Dash.Gui.Header(label, this.color);

        this.header.ReplaceBorderWithIcon("user");

        this.header.icon.AddShadow();

        this.header.label.css({
            "overflow": "hidden",
            "white-space": "nowrap",
            "text-overflow": "ellipsis"
        });

        this.html.append(this.header.html);
    };

    this.add_property_box = function () {
        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            this.get_data,  // Function to return live data
            this.set_data,  // Function to set saved data locally
            "Users",        // Endpoint
            this.user_data["email"], // Dash obj_id (unique for users)
            {"color": this.color}
        );

        this.html.append(this.property_box.html);

        this.property_box.html.css({
            "margin": 0,
            "padding": 0,
            "background": "none",
            "padding-left": this.img_box_size + Dash.Size.Padding,
            "box-shadow": "none",
            "border-radius": 0
        });

        // TODO: This should also be editable (with this.has_privileges), but I don't think
        //  the right things are in place on the back-end, like renaming the user's folder etc
        this.property_box.AddInput("email", "E-mail Address", "", null, false);
        
        this.property_box.AddInput("first_name", "First Name", "", null, this.modal_of ? false : this.has_privileges);
        this.property_box.AddInput("last_name", "Last Name", "", null, this.modal_of ? false : this.has_privileges);

        if (this.has_privileges) {
            this.property_box.AddInput("password",    "Update Password", "", null, !this.modal_of);
        }

        if (this.options["property_box"] && this.options["property_box"]["properties"]) {
            var additional_props = this.options["property_box"]["properties"];

            for (var property_details of additional_props) {
                this.property_box.AddInput(
                    property_details["key"],
                    property_details["label_text"],
                    "",
                    null,
                    this.modal_of ? false : "editable" in property_details ? property_details["editable"] : this.has_privileges
                );
            }
        }
    };

    this.add_user_image_box = function () {
        var img_url = "dash/fonts/user_default.jpg";

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
            "border-radius": 4,
            "background-image": "url(" + img_url + ")",
            "background-size": "cover",
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)",
        });

        this.add_user_image_upload_button();
    };

    this.on_user_img_uploaded = function (response) {
        if (response.timeStamp) {
            return;
        }

        console.log("on_user_img_uploaded:", response);

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

        this.user_image_upload_button.SetFileUploader(
            "Users",
            {
                "f": "upload_image",
                "user_data": JSON.stringify(this.user_data)
            }
        );

        var button_css = {
            "position": "absolute",
            "width": this.img_box_size,
            "height": this.img_box_size
        };

        var hidden_css = {...button_css, "opacity": 0};

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

        this.user_image_upload_button.file_uploader.html.css(hidden_css);

        this.user_image_upload_button.html.attr("title", label);

        (function (user_image_upload_button) {
            user_image_upload_button.html.on("mouseenter", function () {
                user_image_upload_button.highlight.stop().animate({"opacity": 0.3}, 50);
                user_image_upload_button.label.stop().animate({"opacity": 0.65}, 50);

                if (user_image_upload_button.is_selected) {
                    user_image_upload_button.label.css("color", user_image_upload_button.color_set.Text.SelectedHover);
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

    this.set_data = function () {
        // Setting data is taken care of in DashGuiPropertyBox
    };

    this.log_out = function () {
        Dash.Logout();
    };

    // this.set_group = function (button, group_name, group_option) {
    //     console.log("this.set_group");
    //
    //     var api = "https://altona.io/Users";
    //     var server_data = {};
    //     server_data["f"] = "update_group_information";
    //     server_data["token"] = localStorage.getItem("login_token");
    //     server_data["as_user"] = this.user_data["email"];
    //     server_data["group_name"] = group_name;
    //     server_data["group_option"] = group_option;
    //
    //     button.Request(api, server_data, this.on_info_saved, this);
    // };
    //
    // this.update_password = function () {
    //     if (!this.new_password_row.Text()) {
    //         return;
    //     }
    //
    //     (function (self) {
    //         Dash.Request(
    //             self,
    //             function (response) {
    //                 self.on_info_saved(response, self.new_password_row);
    //             },
    //             "Users",
    //             {
    //                 "f": "update_password",
    //                 "p": self.new_password_row.Text()
    //             }
    //         );
    //     })(this);
    // };
    //
    // this.update_first_name = function () {
    //     this.update_personal_information(this.first_name);
    // };
    //
    // this.update_last_name = function () {
    //     this.update_personal_information(this.last_name);
    // };
    //
    // this.update_personal_information = function (button) {
    //     console.log("this.update_personal_information");
    // };
    //
    // this.on_info_saved = function (response, input_row) {
    //     if (response["error"]) {
    //         console.log(response);
    //
    //         alert(response["error"]);
    //
    //         return;
    //     }
    //
    //     console.log("** Info saved successfully **");
    //
    //     input_row.FlashSave();
    // };

    this.setup_styles();
}
