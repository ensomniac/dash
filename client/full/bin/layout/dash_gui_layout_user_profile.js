// Profile page layout for the currently logged-in user
function DashGuiLayoutUserProfile (user_data=null, options={}, include_password_field=true) {
    this.user_data = user_data || Dash.User.Data;
    this.options = options;
    this.include_password_field = include_password_field;

    this.as_overview = false;
    this.property_box = null;
    this.color = this.options["color"] || Dash.Color.Light;

    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);
    this.img_box = $("<div></div>");
    this.img_box_size = Dash.Size.ColumnWidth;

    this.setup_styles = function () {
        this.add_header();
        this.setup_property_box();

        var button = Dash.Gui.GetTopRightIconButton(this, this.log_out, "log_out");

        button.SetHoverHint("Log Out");

        this.html.append(button.html);

        this.html.css({
            "min-height": this.img_box_size + Dash.Size.RowHeight + Dash.Size.Padding
        });
    };

    this.add_header = function () {
        var header_title = "User Settings";

        if (this.user_data["first_name"]) {
            header_title = this.user_data["first_name"] + "'s User Settings";
        }

        this.header = new Dash.Gui.Header(header_title, this.color);
        this.html.append(this.header.html);
    };

    this.setup_property_box = function () {
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
            "border-radius": 0,
        });

        this.property_box.AddInput("email",       "E-mail Address",  "", null, false);
        this.property_box.AddInput("first_name",  "First Name",      "", null, true);
        this.property_box.AddInput("last_name",   "Last Name",       "", null, true);

        if (this.include_password_field) {
            this.property_box.AddInput("password",    "Update Password", "", null, true);
        }

        if (this.options["property_box"] && this.options["property_box"]["properties"]) {
            var additional_props = this.options["property_box"]["properties"];

            for (var i in additional_props) {
                var property_details = additional_props[i];

                this.property_box.AddInput(
                    property_details["key"],
                    property_details["label_text"],
                    "",
                    null,
                    property_details["editable"]
                );
            }
        }

        this.add_user_image_box();
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

        console.log("<< on_user_img_uploaded >>");
        console.log(response);

        if (this.img_box && response["img"]) {
            this.user_data["img"] = response["img"];

            this.img_box.css({
                "background-image": "url(" + this.user_data["img"]["thumb_url"] + ")",
            });
        }
    };

    this.add_user_image_upload_button = function () {
        this.user_image_upload_button = new Dash.Gui.Button("Upload Image", this.on_user_img_uploaded, this, this.color);
        this.img_box.append(this.user_image_upload_button.html);

        this.params = {};
        this.params["f"] = "upload_image";
        this.params["token"] = Dash.Local.Get("token");
        this.params["user_data"] = JSON.stringify(this.user_data);

        this.user_image_upload_button.SetFileUploader(
            "https://" + Dash.Context.domain + "/Users",
            this.params
        );

        // this.user_image_upload_button.html.css({
        //     "position": "absolute",
        //     "bottom": Dash.Size.Padding,
        //     "right": Dash.Size.Padding,
        //     "left": Dash.Size.Padding,
        // });

        var button_css = {
            "position": "absolute",
            "width": this.img_box_size,
            "height": this.img_box_size,
            // "opacity": 0
        };

        var hidden_css = {...button_css, "opacity": 0};

        this.user_image_upload_button.html.css({...button_css, "background": "none"});
        this.user_image_upload_button.label.css(hidden_css);
        this.user_image_upload_button.file_uploader.html.css(hidden_css);

        this.user_image_upload_button.html.attr("title", "Upload Image");

        (function (user_image_upload_button) {
            user_image_upload_button.html.on("mouseenter", function () {
                user_image_upload_button.highlight.stop().animate({"opacity": 0.3}, 50);

                if (user_image_upload_button.is_selected) {
                    user_image_upload_button.label.css("color", user_image_upload_button.color_set.Text.SelectedHover);
                }

                else {
                    user_image_upload_button.label.css("color", user_image_upload_button.color_set.Text.BaseHover);
                }
            });
        })(this.user_image_upload_button);
    };

    this.get_data = function () {
        return this.user_data;
    };

    this.set_data = function () {
        // Setting data is taken care of in DashGuiPropertyBox
    };

    this.log_out = function (button) {
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
