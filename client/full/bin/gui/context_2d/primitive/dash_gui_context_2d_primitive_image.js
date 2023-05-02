/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveImage () {
    this.image = null;

    this._setup_styles = function () {
        this.redraw_image();
    };

    this.redraw_image = function () {
        if (this.image) {
            this.image.remove();
        }

        if (this.file_data["placeholder"]) {
            if (!this.height_px) {
                (function (self) {
                    setTimeout(
                        function () {
                            self._setup_styles();
                        },
                        10
                    );
                })(this);

                return;
            }

            this.redraw_canvas_placeholder();
        }

        else {
            this.image = Dash.File.GetImagePreview(this.get_url(), "100%", "100%");

            this.html.append(this.image);
        }

        this.update_filter();
        this.update_tint_color();
    };

    this.get_url = function () {
        return (this.file_data["orig_url"] || this.file_data["thumb_png_url"] || "");
    };

    this.update_tint_color = function () {
        var tint_color = this.get_value("tint_color");

        if (!tint_color) {
            this.image.css({
                "mask": "",
                "background-color": "",
                "background-blend-mode": ""
            });

            return;
        }

        this.image.css({
            "mask-image": "url(" + this.get_url() + ")",
            "mask-mode": "alpha",
            "mask-size": "contain",
            "background-color": tint_color,
            "background-blend-mode": "overlay"
        });
    };

    this.update_filter = function (brightness=null, contrast=null) {
        this.image.css({
            "filter": (
                "brightness(" + (
                    brightness === null ? this.get_value("brightness") : brightness
                ) + ") contrast(" + (
                    contrast === null ? this.get_value("contrast") : contrast
                ) + ")"
            )
        });
    };

    this.redraw_canvas_placeholder = function () {
        if (!this.file_data["placeholder"]) {
            return;
        }

        var canvas = $("<canvas></canvas>");

        canvas.css({
            "box-sizing": "border-box",
            "border": "1px solid " + this.color.StrokeDark,
            // "outline": "1px solid " + this.opposite_color.StrokeLight,
            // "outline-offset": "1px"
        });

        // Don't set these with .css(), it's different
        canvas.attr("width", this.width_px);
        canvas.attr("height", this.height_px);

        var ctx = canvas[0].getContext("2d");

        // Dark lines (for light backgrounds)
        ctx.lineWidth = Dash.Size.Padding * 0.3;
        ctx.strokeStyle = this.color.Text;

        this.draw_canvas_lines(ctx);

        // Light lines (for dark backgrounds)
        ctx.lineWidth = Dash.Size.Padding * 0.1;  // Resized to fit "inside" the dark lines
        ctx.strokeStyle = this.opposite_color.Text;

        this.draw_canvas_lines(ctx);
        this.add_text_to_center_of_canvas(ctx);

        this.image = canvas;

        this.html.append(this.image);
    };

    this.draw_canvas_lines = function (ctx) {
        // Bottom left corner to top right corner
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width_px, this.height_px);
        ctx.stroke();

        // Top left corner to bottom right corner
        ctx.beginPath();
        ctx.moveTo(this.width_px, 0);
        ctx.lineTo(0, this.height_px);
        ctx.stroke();
    };

    this.add_text_to_center_of_canvas = function (ctx) {
        var i;
        var text_width;
        var greatest_text_width = 0;
        var line_height = Dash.Size.RowHeight;
        var max_text_width = Math.round(this.width_px * 0.85);
        var text = "(Placeholder)\n" + (this.get_value("display_name") || "Image");
        var lines = text.split("\n");
        var text_height = line_height * lines.length;
        var start_y = (this.height_px - text_height) / 2 + (line_height / 2);

        ctx.fillStyle = this.color.Text;
        ctx.lineWidth = Dash.Size.Padding * 0.4;  // Resized for text stroke
        ctx.font = "bold " + line_height + "px sans-serif";

        for (i in lines) {
            text_width = ctx.measureText(lines[i]).width;

            if (text_width > greatest_text_width) {
                greatest_text_width = text_width;
            }
        }

        if (greatest_text_width > this.width_px) {
            ctx.font = "bold " + (Math.round(line_height * (max_text_width / greatest_text_width))) + "px sans-serif";
        }

        for (i in lines) {
            var line = lines[i];

            text_width = ctx.measureText(line).width;

            var x = (this.width_px - text_width) / 2;
            var y = start_y + (i * line_height);

            ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
        }
    };

    // Use this basic placeholder code instead of the canvas placeholder code
    // if we decide later to not use the canvas approach for some reason
    // this.get_placeholder = function () {
    //     var placeholder = $("<div>(Placeholder)\n" + this.get_value("display_name") + "</div>");
    //
    //     placeholder.css({
    //         "background": this.opposite_color.BackgroundRaised,
    //         "box-sizing": "border-box",
    //         "color": this.opposite_color.Text,
    //         "text-align": "center",
    //         "vertical-align": "middle",
    //         "font-family": "sans_serif_bold",
    //         "white-space": "pre",
    //         "overflow": "hidden",
    //         "text-overflow": "ellipsis",
    //         "font-size": "125%",
    //         "width": "100%",
    //         "height": "100%",
    //         "display": "flex",
    //         "align-items": "center",
    //         "justify-content": "center",
    //         "text-shadow": "0px 0px 5px " + this.opposite_color.Background
    //     });
    //
    //     return placeholder;
    // };

    // Override
    this.on_update = function (key) {
        if (key === "contrast" || key === "brightness") {
            this.update_filter();
        }

        this.update_tint_color();
    };

    // Override
    this.on_opacity_change = function (value) {
        if (!this.image) {
            (function (self) {
                setTimeout(
                    function () {
                        self.on_opacity_change(value);
                    },
                    10
                );
            })(this);

            return;
        }

        this.image.css({
            "opacity": value
        });
    };

    // Override
    this.on_hidden_change = function (hidden) {
        if (hidden) {
            this.image.hide();
        }

        else {
            this.image.show();
        }
    };

    this._setup_styles();
}
