function DashGuiContext2DLogBar (editor) {
    this.editor = editor;

    this.html = $("<div></div>");
    this.color = this.editor.color;
    this.min_height = Dash.Size.RowHeight * 1.5;

    // TODO: log bar located at the bottom (under canvas, but between left and right
    //  panels, not under them) to display log-type messages to the user after each action
    //  ("new layer created", "element rotated", etc) - this won't be super useful at
    //  first, but lays the groundwork for a history/undo system that can come later
    //  - this should use a revolving list element, and each new log item is just a new row

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "box-sizing": "border-box",
            "background": this.color.Stroke,
            "border-top": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 0.5
        });
    };

    this.Add = function (msg) {
        console.debug("TEST new log:", msg);

        // TODO: add new row to bottom with message and make sure list is scrolled to bottom
    };

    this.setup_styles();
}
