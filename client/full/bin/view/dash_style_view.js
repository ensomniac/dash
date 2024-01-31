// Profile page layout for the currently logged-in user
function DashStyleView () {
    this.html = Dash.Gui.GetHTMLContext("", {"margin": Dash.Size.Padding});

    this.html.append(new Dash.Layout.UserProfile().html);
}
