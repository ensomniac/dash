function DashGuiContext2DToolbar (editor) {
    this.editor = editor;

    this.html = $("<div></div>");
    this.color = this.editor.color;
    this.min_width = Dash.Size.ColumnWidth * 0.3;

    // TODO: add hotkeys for each tool and show that hotkey on hover, and/or next to the icon if feasible

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "box-sizing": "border-box",
            "border-right": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 0.5
        });

        var icon = new Dash.Gui.Icon(this.color, "tools", Dash.Size.ButtonHeight, 0.75, this.color.AccentGood);

        icon.html.css({
            "margin-top": 0,
            "margin-bottom": 0,
            "margin-left": "auto",
            "margin-right": "auto"
        });

        var label = $("<div>Tools</div>");

        label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "font-size": "90%",
            "color": this.color.Stroke,
            "padding-bottom": Dash.Size.Padding * 0.1,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

        this.html.append(icon.html);
        this.html.append(label);
    };

    this.setup_styles();
}
