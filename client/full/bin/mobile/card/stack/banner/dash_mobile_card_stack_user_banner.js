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
