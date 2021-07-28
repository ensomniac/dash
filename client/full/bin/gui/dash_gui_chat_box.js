function DashGuiChatBox (color=Dash.Color.Light) {
    this.color = color;

    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);

    this.setup_styles = function () {
        this.html.css({
            "background": "red"
        });
    };

    this.setup_styles();
}
