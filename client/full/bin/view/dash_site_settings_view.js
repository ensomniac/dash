
function DashSiteSettingsView(){

    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});
    this.property_box = null;

    this.setup_styles = function(){

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

    // this.get_data = function(){
    //     var fake_data = {};
    //     fake_data["created_by"] = "Ryan";
    //     return fake_data;

    //     return {};
    // };

    // this.set_data = function(data){
    //     // return {};
    // };

    this.setup_styles();

};
