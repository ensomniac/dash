function DashMobileLayoutCard (stack) {

    this.stack = stack;
    this.color = this.stack.color;

    this.html = Dash.Gui.GetHTMLContext();
    this.content = Dash.Gui.GetHTMLContext();

    this.setup_styles = function () {

        this.html.css({
            "background": "white",
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "padding": Dash.Size.Padding,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 6px 10px 1px rgba(0, 0, 0, 0.1), inset 0px 2px 2px 0px rgba(255, 255, 255, 1)",
        });

        this.content.css({
            "background": "none",
            "color": this.color.Text,
        });

        this.html.append(this.content);

    };

    this.SetText = function(text) {

        this.content.text(text);

    };

    this.setup_styles();

};
