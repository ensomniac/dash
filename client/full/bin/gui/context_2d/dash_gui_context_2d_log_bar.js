function DashGuiContext2DLogBar (editor) {
    this.editor = editor;

    this.html = $("<div>Log Bar</div>");
    this.min_height = Dash.Size.RowHeight;

    // TODO: log bar located at the bottom (under canvas, but _between_ left and right
    //  panels, not under them) to display log-type messages to the user after each action
    //  ("new layer created", "element rotated", etc) - this won't be super useful at
    //  first, but lays the groundwork for a history/undo system that can come later

    this.setup_styles = function () {
        this.html.css({
            "background": "blue",
            "position": "absolute",
            "inset": 0
        });
    };

    this.setup_styles();
}
