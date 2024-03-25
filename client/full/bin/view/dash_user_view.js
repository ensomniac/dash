// Profile page layout for the currently logged-in user
function DashUserView (user_data=null, options={}, view_mode="settings") {
    this.html = Dash.Gui.GetHTMLContext("", {"margin": Dash.Size.Padding});
    this.user_profile = new Dash.Layout.UserProfile(user_data, options, view_mode);
    this.property_box = this.user_profile.property_box;

    this.html.append(this.user_profile.html);

    // TODO: TEST -------------
    // var box = Dash.Gui.GetHTMLBoxContext();
    // var ph = new Dash.Gui.PhoneNumber();
    //
    // box.append(ph.html);
    //
    // this.html.append(box);
}
