function AuthenticMainView(){

    this.layout = new Dash.Gui.Layout.SideTabs(this);
    this.html = this.layout.html;

    this.tmp = $("<div>Authentic Organization Settings</div>");

    this.setup_styles = function(){

        this.tmp.css({
            "color": "rgba(0, 0, 0, 0.9)",
            "padding": d.Size.Padding,
        });

        this.layout.Add("Authentic", this.tmp);
        this.layout.Add("Employees", EmployeesView);
        this.layout.Add("Warpstreamer", WarpstreamerView);

        this.layout.Add("Dash", DashAdminView);
        this.layout.Add("Admin", AdminView);

        this.layout.Add(Dash.User.Data["email"], Dash.Gui.Layout.UserProfile);

    };

    this.setup_styles();

};
