function DashAdminTabs () {
    // This tiny class allows us to add overrides to the tabs in the Dash Admin page

    this.user_tabs = [];

    this.Add = function (label_text, html_obj, optional_args=null, additional_content_data={}) {
        this.user_tabs.push({
            "label_text": label_text,
            "html_obj": html_obj,
            "optional_args": optional_args,
            "additional_content_data": additional_content_data
        });
    };
}
