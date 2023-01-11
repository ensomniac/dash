function DashGuiContext2DEditorPanelContent (panel) {
    this.panel = panel;

    this.html = $("<div>Content</div>");
    this.min_height = Dash.Size.ButtonHeight * 10;  // TODO

    this.setup_styles = function () {
        this.html.css({
            "background": "brown",
            "position": "absolute",
            "inset": 0
        });
    };

    this.setup_styles();
}
