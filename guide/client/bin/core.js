function Authentic(){
    this.html = $("<div>Authentic Tools</div>");

    this.set_dash_colors = function(){
        d.Color.Background = "#ebeaf0";
        d.Color.Text = "#1a1a1a";
        d.Color.ButtonColor = "#4db1d5";
        d.Color.ButtonHoverColor = "#565e83";
        d.Color.Primary = "#291991";
        d.Color.Dark = "#202229";
    };

    this.setup_styles = function(){

        this.set_dash_colors();

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": d.Color.Background,
            "color": d.Color.Text,
            "overflow-y": "auto",
            // "font-family": "aa_headline",
            // "font-family": "aa_bold",
            // "font-family": "aa_normal",
            // "font-size": "300%",
            // "text-align": "center",
        });

    };

    this.on_user_authenticated = function(){
        this.view = new AuthenticMainView();
        this.html.append(this.view.html);
    };

    this.on_user_not_authenticated = function(){
        var login_flow = new Dash.Gui.Login(this, this.on_user_authenticated);
        this.html.append(login_flow.html);
    };

    this.setup_styles();
    Dash.User.Authenticate(this, this.on_user_authenticated, this.on_user_not_authenticated);

};

function RunDash(){
    window.Authentic = new Authentic();
    return window.Authentic.html;
};
