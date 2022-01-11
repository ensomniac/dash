function DashMobileLayoutUserProfile (binder, on_exit_callback, user_data=null) {

    this.binder = binder;
    this.on_exit_callback = on_exit_callback.bind(this.binder);
    this.color = this.binder.color || Dash.Color.Dark;
    this.stack = new Dash.Gui.Layout.Mobile.CardStack(this);
    this.html = this.stack.html;
    this.user_data = user_data || Dash.User.Data;

    this.profile_button = null;
    this.user_image_upload_button = null;

    this.setup_styles = function () {

        var name = this.user_data["first_name"] + " " + this.user_data["last_name"];

        this.user_banner = this.stack.AddBanner();
        this.user_banner.SetHeadlineText("User Settings", name);
        this.user_banner.SetRightIcon("close", this.exit_stack.bind(this));

        this.user_banner.AddFooterIcon("log_out", "Log Out",        this.log_user_out.bind(this));
        this.user_banner.AddFooterIcon("refresh", "Update App",     this.reload.bind(this));
        this.profile_button = this.user_banner.AddFooterIcon("image",   "Change Profile", this.test_footer_callback.bind(this));

        this.setup_property_box();

        this.add_user_image_upload_button();

        if (this.user_data["img"] && this.user_data["img"]["thumb_url"]) {
            this.user_banner.SetBackground(this.user_data["img"]["thumb_url"]);
        }
        else {
            this.user_banner.SetBackground(this.user_banner.DefaultBackgroundGradient);
        }

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

        this.params = {};
        this.params["f"] = "upload_image";
        this.params["token"] = Dash.Local.Get("token");
        this.params["user_data"] = JSON.stringify(this.user_data);

        this.user_image_upload_button.SetFileUploader(
            "https://" + Dash.Context.domain + "/Users",
            this.params
        );

        this.user_image_upload_button.html.css({
            "position": "absolute",
            "inset": 0,
            "width": "auto",
            "height": "auto",
            "background": "rgba(0, 0, 0, 0)",
        });

        this.user_image_upload_button.highlight.css({
            "position": "absolute",
            "inset": 0,
            "width": "auto",
            "height": "auto",
        });

        this.user_image_upload_button.label.css({
            "opacity": 0,
        });

    };

    this.on_user_img_uploaded = function (response) {
        if (response.timeStamp) {
            return;
        }

        console.log("<< on_user_img_uploaded >>");
        console.log(response);

        if (response["img"]) {
            this.user_data["img"] = response["img"];
            this.user_banner.SetBackground(this.user_data["img"]["thumb_url"]);
        }

    };

    this.test_footer_callback = function () {
        // slug function
    };

    this.setup_property_box = function () {

        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            this.get_data,  // Function to return live data
            this.set_data,  // Function to set saved data locally
            "Users",        // Endpoint
            this.user_data["email"], // Dash obj_id (unique for users)
        );

        this.stack.AppendHTML(this.property_box.html);

        this.property_box.AddInput("email",       "E-mail Address",  "", null, false);
        this.property_box.AddInput("first_name",  "First Name",      "", null, true);
        this.property_box.AddInput("last_name",   "Last Name",       "", null, true);
        this.property_box.AddInput("password",    "Update Password", "", null, true);

    };

    this.get_data = function () {
        return this.user_data;
    };

    this.set_data = function () {
        console.log("set data");
    };

    this.log_user_out = function () {
        Dash.Logout();
    };

    this.setup_styles();

}
