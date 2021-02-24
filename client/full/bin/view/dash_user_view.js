// Profile page layout for the currently logged in user

function DashUserView(){
    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});
    this.html.append(new Dash.Gui.Layout.UserProfile().html);
};