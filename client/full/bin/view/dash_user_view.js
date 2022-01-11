// Profile page layout for the currently logged-in user
function DashUserView (user_data=null, options={}, view_mode="settings") {
    this.html = Dash.Gui.GetHTMLContext("", {"margin": Dash.Size.Padding});
    this.user_profile = new Dash.Gui.Layout.UserProfile(user_data, options, view_mode);

    this.html.append(this.user_profile.html);
}
