function DashMobileUserProfile (binder, on_exit_callback, user_data=null, context_logo_img_url="") {
    this.binder = binder;
    this.on_exit_callback = on_exit_callback.bind(binder);
    this.user_data = user_data || Dash.User.Data;
    this.context_logo_img_url = context_logo_img_url;

    this.html = null;
    this.stack = null;
    this.profile_button = null;
    this.user_image_upload_button = null;
    this.color = this.binder.color || Dash.Color.Dark;

    this.setup_styles = function () {
        this.stack = new Dash.Mobile.CardStack(this);
        this.html = this.stack.html;

        this.setup_banner();
        this.setup_property_box();
        this.add_user_image_upload_button();

        if (this.user_data["img"] && this.user_data["img"]["thumb_url"]) {
            this.user_banner.SetBackground(this.user_data["img"]["thumb_url"]);
        }

        else {
            this.user_banner.SetBackground(Dash.Color.Mobile.BackgroundGradient);
        }

        this.add_context_logo_img();
    };

    this.setup_banner = function () {
        this.user_banner = this.stack.AddBanner();

        this.user_banner.SetHeadlineText(Dash.User.GetDisplayName(), "User Settings");

        this.user_banner.headline.label_top.css({
            "text-shadow": "1px 1px 2px rgba(0, 0, 0, 1)"
        });

        this.user_banner.headline.label_bottom.css({
            "text-shadow": "1px 1px 2px rgba(0, 0, 0, 1)"
        });

        this.user_banner.SetRightIcon("close", this.exit_stack.bind(this));
        this.user_banner.AddFooterIcon("log_out", "Log Out", this.log_user_out.bind(this));
        this.user_banner.AddFooterIcon("refresh", "Refresh App", this.reload.bind(this));

        this.profile_button = this.user_banner.AddFooterIcon("image", "Change Profile", this.on_profile_changed.bind(this));
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

        this.stack.AppendHTML(image);
    };

    this.reload = function () {
        location.reload();
    };

    this.exit_stack = function () {
        if (this.on_exit_callback) {
            this.on_exit_callback();
        }
    };

    this.add_user_image_upload_button = function () {
        this.user_image_upload_button = new Dash.Gui.Button(
            "Upload Image",
            this.on_user_img_uploaded,
            this,
            this.color
        );

        this.profile_button.icon_circle.append(this.user_image_upload_button.html);

        this.user_image_upload_button.SetFileUploader(
            "Users",
            {
                "f": "upload_image",
                "user_data": JSON.stringify(this.user_data)
            }
        );

        this.user_image_upload_button.html.css({
            "position": "absolute",
            "inset": 0,
            "width": "auto",
            "height": "auto",
            "background": "rgba(0, 0, 0, 0)"
        });

        this.user_image_upload_button.highlight.css({
            "position": "absolute",
            "inset": 0,
            "width": "auto",
            "height": "auto"
        });

        this.user_image_upload_button.label.css({
            "opacity": 0
        });
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

    this.setup_property_box = function () {
        this.property_box = new Dash.Gui.PropertyBox(
            this,
            this.get_data,
            this.set_data,
            "Users",
            this.user_data["email"]
        );

        this.property_box.AddInput("first_name", "First Name", "", null, true);
        this.property_box.AddInput("last_name", "Last Name", "", null, true);
        this.property_box.AddInput("email", "E-mail Address", "", null, false);
        this.property_box.AddInput("password", "Update Password", "", null, true);

        this.stack.AppendHTML(this.property_box.html);
    };

    this.log_user_out = function () {
        Dash.Logout();
    };

    this.get_data = function () {
        return this.user_data;
    };

    this.set_data = function () {
        console.log("(set data)");
    };

    this.on_profile_changed = function () {
        // Dummy/placeholder function
    };

    this.setup_styles();
}
