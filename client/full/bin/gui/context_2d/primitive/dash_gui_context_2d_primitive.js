function DashGuiContext2DPrimitive (editor, type) {
    this.editor = editor;
    this.type = type;

    this.html = $("<div></div>");

    // TODO: all primitives have a pre-defined set of starting data:
    //  - type: image, text, etc
    //  - anchor_norm_x: normalized x value for the center point of the element in relation to the canvas
    //  - anchor_norm_y: normalized y value for the center point of the element in relation to the canvas
    //  - width_norm: normalized width for the width of the element in relation to the width of the canvas
    //  - rot_deg: -180 to 180 (or is it -179 to 179?)

    this.setup_styles = function () {
        // TODO: are these abstractions even necessary? likely not
        if (this.type === "text") {
            DashGuiContext2DPrimitiveText.call(this);
        }

        else if (this.type === "image") {
            DashGuiContext2DPrimitiveImage.call(this);
        }

        else {
            console.error("Error: Unhandled primitive type:", this.type);

            return;
        }

        this.initialize();
    };

    this.initialize = function () {
        // TODO
    };

    this.setup_styles();
}
