
function DashAdminColorDoc(color){

    this.html = Dash.Gui.GetHTMLContext("--");
    this.color = color || Dash.Color.Light;

    this.setup_styles = function(){

        this.html.css({
            "background": this.color.BackgroundRaised,
            "color": this.color.Text,
            "margin-bottom": Dash.Size.Padding,
            "padding": Dash.Size.Padding,
            "border": "2px solid " + this.color.AccentGood,
            "border-radius": 5,
        });

    };

    this.setup_styles();

};
