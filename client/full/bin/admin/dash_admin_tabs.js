function DashAdminTabs () {
    // This tiny class allows us to add overrides to the tabs in the Dash Admin page

    this.user_tabs = [];

    this.Add = function (label_text, html_obj) {
        this.user_tabs.push({
            "label_text": label_text,
            "html_obj": html_obj
        });
    };
}
