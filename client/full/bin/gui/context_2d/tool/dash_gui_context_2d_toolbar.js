function DashGuiContext2DToolbar (editor) {
    this.editor = editor;

    this.tools = [];
    this.html = $("<div></div>");
    this.color = this.editor.color;
    this.padding = Dash.Size.Padding * 0.5;
    this.min_width = Dash.Size.ColumnWidth * 0.3;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "box-sizing": "border-box",
            "border-right": "1px solid " + this.color.StrokeLight,
            "padding": this.padding
        });

        this.add_header();
        this.add_tools();
    };

    this.DeselectTools = function () {
        for (var tool of this.tools) {
            tool.Deselect();
        }
    };

    this.add_header = function () {
        var icon = new Dash.Gui.Icon(this.color, "tools", Dash.Size.ButtonHeight, 0.75, this.color.AccentGood);

        icon.html.css({
            "margin-top": 0,
            "margin-bottom": 0,
            "margin-left": "auto",
            "margin-right": "auto",
            "pointer-events": "none",
            "user-select": "none"
        });

        var label = $("<div>Tools</div>");

        label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "font-size": "90%",
            "color": this.color.Stroke,
            "padding-bottom": Dash.Size.Padding * 0.1,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "pointer-events": "none",
            "user-select": "none",
            "cursor": "default"
        });

        this.html.append(icon.html);
        this.html.append(label);
    };

    this.add_tools = function () {
        for (var icon_name of ["move", "rotate", "expand_square_arrows"]) {
            var tool = new DashGuiContext2DTool(this, icon_name);

            this.html.append(tool.html);

            this.tools.push(tool);
        }

        // First tool is selected by default
        this.tools[0].Select();
    };

    this.setup_styles();
}
