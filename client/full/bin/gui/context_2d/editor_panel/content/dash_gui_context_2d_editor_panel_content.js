function DashGuiContext2DEditorPanelContent (panel) {
    this.panel = panel;

    this.html = $("<div></div>");
    this.color = this.panel.color;
    this.min_height = Dash.Size.ButtonHeight * 10;  // TODO?
    this.new_box = new DashGuiContext2DEditorPanelContentNew(this);
    this.edit_box = new DashGuiContext2DEditorPanelContentEdit(this);

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
        this.html.append(this.new_box.html);
        this.html.append(this.edit_box.html);
    };

    this.setup_styles();
}
