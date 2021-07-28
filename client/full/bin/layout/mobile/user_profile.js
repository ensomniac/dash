function DashMobileLayoutUserProfile (binder, on_exit_callback) {

    this.binder = binder;
    this.on_exit_callback = on_exit_callback.bind(this.binder);
    this.color = Dash.Color.Dark;
    this.stack = new Dash.Gui.Layout.Mobile.CardStack(this);
    this.html = this.stack.html;

    this.setup_styles = function () { 

        this.user_banner = this.stack.AddBanner();
        this.user_banner.SetHeadlineText("User Settings", "Ryan Martin");
        this.user_banner.SetBackground(this.user_banner.DefaultBackgroundGradient);
        this.user_banner.SetRightIcon("close", this.exit_stack.bind(this));

        this.test_element = $("<div>Test Element</div>");
        this.test_element.css({
            "background": "rgba(0, 0, 0, 0.3)",
        });

        this.stack.AppendHTML(this.test_element);

    };

    this.exit_stack = function () {

        if (this.on_exit_callback) {
            this.on_exit_callback();
        };

    };

    this.setup_styles();

};
