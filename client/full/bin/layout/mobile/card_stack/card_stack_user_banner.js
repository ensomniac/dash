function DashCardStackUserBanner (stack) {

    DashCardStackBanner.call(this, this);

    this.setup_styles = function () {

        this.SetBackground(this.DefaultBackgroundGradient);

        this.SetLeftIcon("user", this.on_user_clicked);
        // this.SetRightIcon("list", this.on_right_clicked);
    };

    this.on_user_clicked = function () {
        var user_modal = new Dash.Gui.Layout.Mobile.UserProfile(this, this.on_show_main);
        stack.AddLeftContent(user_modal.html);
    };

    // this.on_right_clicked = function () {
    //     var html = $("<div>RIGHT</div>");
    //     stack.AddRightContent(html);
    // };

    this.on_show_main = function () {
        // var html = $("<div>MAIN</div>");
        stack.ShowCenterContent();
    };

    this.setup_styles();

};
