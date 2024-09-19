function DashMobileCardStackUserBanner (stack, include_refresh_button=true) {
    this._stack = stack;  // The below .call() function includes a this.stack already
    this.include_refresh_button = include_refresh_button;

    this.user_modal = null;
    this.color = this._stack.color;
    this.context_logo_img_url = "";

    DashMobileCardStackBanner.call(this, this);

    this.setup_styles = function () {
        this.SetBackground(Dash.Color.Mobile.BackgroundGradient);
        this.SetLeftIcon("user_settings", this.on_user_clicked);

        window._DashMobileProfileSettingsIconButton = this.header_row.left_icon;

        this.header_row.left_icon._add_suggestion_badge = function () {
            if (window._DashMobileProfileSettingsIconButton._suggestion_badge) {
                return;
            }

            window._DashMobileProfileSettingsIconButton._suggestion_badge = Dash.Gui.GetMobileNotificationIcon(
                window._DashMobileProfileSettingsIconButton.size * 0.3,
                false
            );

            window._DashMobileProfileSettingsIconButton._suggestion_badge.css({
                "top": Dash.Size.Padding * 0.5,
                "right": -Dash.Size.Padding * 0.5
            });

            window._DashMobileProfileSettingsIconButton.html.append(
                window._DashMobileProfileSettingsIconButton._suggestion_badge
            );
        };

        if (Dash.User.Data && !Dash.User.Data["first_name"]) {
            this.header_row.left_icon._add_suggestion_badge();
        }
    };

    this.SetContextLogoImg = function (url) {
        this.context_logo_img_url = url;
    };

    this.on_user_clicked = function () {
        this.user_modal = new Dash.Mobile.UserProfile(
            this,
            this.on_show_main,
            null,
            this.context_logo_img_url,
            this.include_refresh_button
        );

        this._stack.AddLeftContent(this.user_modal.html);
    };

    this.on_show_main = function () {
        this._stack.ShowCenterContent();
    };

    this.setup_styles();
}
