function DashAdminView (users_class_override=null) {
    this.users_class_override = users_class_override;

    this.layout = new Dash.Layout.Tabs.Top(this);
    this.html = this.layout.html;

    this.setup_styles = function () {
        this.layout.Append(
            "Users",
            this.users_class_override ? this.users_class_override : DashAdminSettings,
            [this],
            {"unpack_params": true}
        );

        // this.layout.Append("Color", DashAdminColor);

        for (var tab_settings of Dash.View.SiteSettingsTabs.user_tabs) {
            this.layout.Append(tab_settings["label_text"] || tab_settings["display_name"], tab_settings["html_obj"]);
        }
    };

    this.AddTab = function () {
        console.log("Adding tab");
    };

    this.setup_styles();
}
