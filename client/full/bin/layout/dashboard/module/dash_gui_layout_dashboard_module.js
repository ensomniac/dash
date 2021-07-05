function DashGuiLayoutDashboardModule (binder, style="flex") {
    this.binder = binder;
    this.style = style;

    this.color = this.binder.color || Dash.Color.Dark;
    this.padding = Dash.Size.Padding;
    this.html = Dash.Gui.GetHTMLBoxContext();

    this.initialize_style = function () {
        if (this.style === "flex") {
            DashGuiLayoutDashboardModuleFlex.call(this);
        }

        else if (this.style === "square") {
            DashGuiLayoutDashboardModuleSingle.call(this);
        }

        else if (this.style === "rectangle") {
            DashGuiLayoutDashboardModuleDouble.call(this);
        }

        else {
            console.log("ERROR: Invalid Module Style:", this.style);

            return;
        }

        this.setup_styles();

        this.html.css({
            "background": this.color.BackgroundRaised
        });

        // When called from DashGuiLayoutDashboard
        if (this.binder.modules && this.binder.modules.length > 0) {
            this.html.css({
                "margin-left": 0
            });
        }
    };

    this.initialize_style();
}
