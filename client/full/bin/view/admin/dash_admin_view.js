
function DashAdminView(){

    this.layout = new Dash.Gui.Layout.Tabs.Top(this);
    this.html = this.layout.html;

    this.setup_styles = function(){
        this.layout.Append("Settings", DashAdminSettings);
        // this.layout.Append("Color", DashAdminColor);

        for (var i in Dash.View.SiteSettingsTabs.user_tabs) {
            var tab_settings = Dash.View.SiteSettingsTabs.user_tabs[i];
            this.layout.Append(tab_settings["label_text"], tab_settings["html_obj"]);
        };

    };

    this.AddTab = function(){
        console.log("Adding tab");
    };

    this.setup_styles();

};
