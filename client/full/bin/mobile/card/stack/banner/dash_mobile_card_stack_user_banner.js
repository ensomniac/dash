function DashMobileCardStackUserBanner (stack) {
    this.user_modal = null;
    this.color = stack.color;
    this.context_logo_img_url = "";

    DashMobileCardStackBanner.call(this, this);

    this.setup_styles = function () {
        this.SetBackground(this.DefaultBackgroundGradient);
        this.SetLeftIcon("user", this.on_user_clicked);
    };

    this.SetContextLogoImg = function (url) {
        this.context_logo_img_url = url;
    };

    this.on_user_clicked = function () {
        this.user_modal = new Dash.Mobile.UserProfile(this, this.on_show_main, null, this.context_logo_img_url);

        stack.AddLeftContent(this.user_modal.html);
    };

    this.on_show_main = function () {
        stack.ShowCenterContent();
    };

    this.setup_styles();
}
