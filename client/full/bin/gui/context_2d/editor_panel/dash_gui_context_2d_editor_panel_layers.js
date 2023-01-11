function DashGuiContext2DEditorPanelLayers (panel) {
    this.panel = panel;

    this.html = $("<div>Layers</div>");

    this.setup_styles = function () {
        this.html.css({
            "background": "purple",
            "position": "absolute",
            "inset": 0
        });
    };

    this.setup_styles();
}
