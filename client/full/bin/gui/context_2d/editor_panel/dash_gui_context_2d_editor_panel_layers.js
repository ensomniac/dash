function DashGuiContext2DEditorPanelLayers (panel) {
    this.panel = panel;

    this.html = $("<div></div>");
    this.color = this.panel.color;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "box-sizing": "border-box",
            "border-top": "1px solid " + this.color.StrokeLight
        });

        var header = new Dash.Gui.Header("Layers");

        header.ReplaceBorderWithIcon("layers");

        this.html.append(header.html);
    };

    // TODO
    this.InputInFocus = function () {
        return false;
    };

    this.setup_styles();
}
