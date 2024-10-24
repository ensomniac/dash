function DashAdminSettings (admin_view=null) {
    this.admin_view = admin_view;

    this.data = null;
    this.property_box = null;
    this.color = this.admin_view.color || Dash.Color.Light;

    this.html = Dash.Gui.GetHTMLContext(
        "Loading Admin View...",
        {"margin": Dash.Size.Padding},
        this.color
    );

    this.setup_styles = function () {
        this.reload_data();
    };

    this.SetData = function (response) {
        if (!Dash.Validate.Response(response)) {
            return;
        }

        this.html.empty();

        this.data = response;

        // this.add_site_settings_box();
        // this.add_user_groups_box();
        this.add_users_box();

        // Dash.Log.Log(response);
    };

    this.add_users_box = function () {
        // this.users_box = Dash.Gui.GetHTMLBoxContext({});
        this.users_box = Dash.Gui.GetHTMLContext();

        this.html.append(this.users_box);

        // var users_header = new Dash.Gui.Header("Users").html;

        // this.users_box.append(users_header);

        for (var i in this.data["users"]["order"]) {
            var email = this.data["users"]["order"][i];
            var user_data = this.data["users"]["data"][email];
            var user_box = new Dash.Layout.UserProfile(user_data);

            this.users_box.append(user_box.html);

            // user_box.html.css({
            //     "margin": Dash.Size.Padding * 2,
            // });
        }
    };

    this.reload_data = function () {
        Dash.Request(this, this.SetData, "Admin", {"f": "get"});
    };

    // this.create_group = function () {
    //     Dash.Log.Log("Create Group");
    // };

    // this.add_site_settings_box = function () {
    //     this.property_box = new Dash.Gui.PropertyBox(
    //         this,           // For binding
    //         null,  // Function to return live data
    //         null,  // Function to set saved data locally
    //         "Properties",   // Endpoint
    //         "site_settings" // Dash object ID
    //     );
    //
    //     this.html.append(this.property_box.html);
    //
    //     this.property_box.AddHeader("Admin Settings");
    //     this.property_box.AddInput("created_by", "Created By", "", null, false);
    //     this.property_box.AddInput("open_account_creation_bool", "Open Account Creation", "", null, true);
    //
    //     // this.property_box.Load();
    // };

    // this.add_user_groups_box = function () {
    //     this.user_groups_box = new Dash.Gui.PropertyBox(
    //         this,           // For binding
    //         null,           // Function to return live data
    //         null,           // Function to set saved data locally
    //         "Properties",   // Endpoint
    //         "user_groups"    // Dash object ID
    //     );
    //
    //     this.html.append(this.user_groups_box.html);
    //
    //     this.user_groups_box.AddHeader("User Groups");
    //     this.user_groups_box.AddInput("admin", "Admin", "", null, false);
    //
    //     this.user_groups_box.AddButton("Create Group", this.create_group);
    //
    //     // this.user_groups_box.Load();
    // };

    this.setup_styles();
}
