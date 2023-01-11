function DashGuiContext2DToolbar (editor) {
    this.editor = editor;

    this.html = $("<div>Toolbar</div>");
    this.min_width = Dash.Size.ColumnWidth * 0.3;

    // TODO:
    //  - vertical toolbar, in the middle area (on left side of canvas, in between the list of contexts and canvas)
    //  - add hotkeys for each tool and show that hotkey on hover, and/or next to the icon if feasible

    this.setup_styles = function () {
        this.html.css({
            "background": "green",
            "position": "absolute",
            "inset": 0
        });
    };

    this.setup_styles();
}
