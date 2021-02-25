
function DashAdminView(){

    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});
    this.property_box = null;

    this.setup_styles = function(){
        this.add_site_settings_box();
        this.add_user_groups_box();
    };

    this.add_site_settings_box = function(){

        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            null,  // Function to return live data
            null,  // Function to set saved data locally
            "Properties",   // Endpoint
            "site_settings" // Dash object ID
        );

        this.html.append(this.property_box.html);

        this.property_box.AddHeader("Site Settings");
        this.property_box.AddInput("created_by", "Created By", "", null, false);
        this.property_box.AddInput("open_account_creation_bool", "Open Account Creation", "", null, true);

        this.property_box.Load();

    };

    this.add_user_groups_box = function(){

        this.user_groups_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            null,           // Function to return live data
            null,           // Function to set saved data locally
            "Properties",   // Endpoint
            "user_groups"    // Dash object ID
        );

        this.html.append(this.user_groups_box.html);

        this.user_groups_box.AddHeader("User Groups");
        this.user_groups_box.AddInput("admin", "Admin", "", null, false);

        this.user_groups_box.AddButton("Create Group", this.create_group);

        this.user_groups_box.Load();

    };

    this.create_group = function(){
        console.log("Create Group");
    };

    this.setup_styles();

};
