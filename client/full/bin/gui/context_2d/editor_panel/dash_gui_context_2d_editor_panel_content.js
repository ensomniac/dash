function DashGuiContext2DEditorPanelContent (panel) {
    this.panel = panel;

    this.html = $("<div></div>");
    this.color = this.panel.color;
    this.min_height = Dash.Size.ButtonHeight * 10;  // TODO?

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "box-sizing": "border-box",
            "border-top": "1px solid " + this.color.StrokeLight,
            "border-bottom": "1px solid " + this.color.StrokeLight
        });

        var header = new Dash.Gui.Header("Content");

        header.ReplaceBorderWithIcon("pencil_paintbrush");

        this.html.append(header.html);
    };

    this.setup_styles();
}
