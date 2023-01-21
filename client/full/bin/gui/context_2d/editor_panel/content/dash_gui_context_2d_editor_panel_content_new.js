function DashGuiContext2DEditorPanelContentNew (content) {
    this.content = content;

    this.html = $("<div></div>");
    this.color = this.content.color;
    this.can_edit = this.content.can_edit;  // TODO: propagate

    this.setup_styles = function () {
        // TODO
    };

    this.setup_styles();
}
