function DashGuiContext2DPrimitive (canvas, type, file_data=null) {
    this.canvas = canvas;
    this.type = type;
    this.file_data = file_data;

    this.html = $("<div></div>");
    this.color = this.canvas.color;
    this.editor = this.canvas.editor;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    // TODO: all primitives have a pre-defined set of starting data:
    //  - type: image, text, etc
    //  - anchor_norm_x: normalized x value for the center point of the element in relation to the canvas
    //  - anchor_norm_y: normalized y value for the center point of the element in relation to the canvas
    //  - width_norm: normalized width for the width of the element in relation to the width of the canvas
    //  - rot_deg: -180 to 180 (or is it -179 to 179?)

    this.setup_styles = function () {
        if (!this.call_style()) {
            return;
        }

        // TODO

        this.html.css({
            // Simulate a double border - one for dark backgrounds, one for light
            "border": "1px solid " + this.color.StrokeDark,
            "outline": "1px solid " + this.opposite_color.StrokeDark,
            "outline-offset": "1px",

            // TODO: TESTING
            "width": 500,
            "height": 500
        });
    };

    this.call_style = function () {
        // TODO: are these abstractions even necessary? likely not
        if (this.type === "text") {
            DashGuiContext2DPrimitiveText.call(this);
        }

        else if (this.type === "image") {
            DashGuiContext2DPrimitiveImage.call(this);
        }

        else {
            console.error("Error: Unhandled primitive type:", this.type);

            return false;
        }

        return true;
    };

    this.setup_styles();
}
