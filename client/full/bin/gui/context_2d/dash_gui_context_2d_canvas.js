function DashGuiContext2DCanvas (editor) {
    this.editor = editor;

    this.html = $("<div>Canvas</div>");

    // TODO: flexible, unscaled canvas in the middle of the interface for all elements to be drawn on,
    //  with bounding box that represents working area based on selected aspect ratio, and canvas shouldn't
    //  flex smaller than the bounding box (or bounding box and contained elements should shrink when
    //  the canvas gets too small) - default behavior when an element is clicked should probably be to
    //  auto-select the layer and be able to manipulate it without having to select the desired layer first

    this.setup_styles = function () {
        this.html.css({
            "background": "orange",
            "position": "absolute",
            "inset": 0
        });
    };

    this.setup_styles();
}
