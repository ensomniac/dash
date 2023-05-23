/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveMedia () {
    this.media = null;
    this.video_tint = null;

    this._setup_styles = function () {
        this.redraw_media();
    };

    this.redraw_media = function () {
        if (this.media) {
            this.media.remove();
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
            this.media = (
                this.type === "image" ? Dash.File.GetImagePreview(
                    this.get_url(),
                    "100%",
                    "100%"
                ) : this.type === "video" ? Dash.File.GetVideoPreview(
                    this.get_url(),
                    "100%",
                    true,
                    false,
                    !(this.get_value("locked") || this.editor.preview_mode)
                ) : $("<div></div>")
            );

            this.html.append(this.media);
        }

        this.update_filter();
        this.update_tint_color();

        if (this.type === "video") {
            this.media.off("click");

            // Restrict playback to the play button alone (disable playback from clicking
            // anywhere on the video, since that interferes with the other click/drag events)
            this.media.on("click", function (e) {
                e.preventDefault();
            });
        }
    };

    this.get_url = function () {
        return (
               this.file_data["url"]
            || this.file_data["orig_url"]
            || this.file_data["thumb_png_url"]
            || this.file_data["thumb_jpg_url"]
            || ""
        );
    };

    this.update_tint_color = function () {
        var multi_tone_colors = [];

        for (var num of Dash.Math.Range(3)) {
            var color = this.get_value("multi_tone_color_" + (num + 1));

            if (color) {
                multi_tone_colors.push(color);
            }
        }

        var tint_color = multi_tone_colors.length >= 2 ? multi_tone_colors[0] : this.get_value("tint_color");

        if (this.type === "image") {
            if (!tint_color) {
                this.media.css({
                    "mask": "",
                    "background-color": "",
                    "background-blend-mode": ""
                });

                return;
            }

            this.media.css({
                "mask-image": "url(" + this.get_url() + ")",
                "mask-mode": "alpha",
                "mask-size": "contain",
                "mask-repeat": "no-repeat",
                "mask-position": "center center",
                "background-color": tint_color,
                "background-blend-mode": "overlay"
            });
        }

        else if (this.type === "video") {
            if (!tint_color) {
                if (this.video_tint) {
                    this.video_tint.hide();
                }

                return;
            }

            if (this.video_tint) {
                this.video_tint.detach();
            }

            else {
                this.video_tint = $("<div></div>");

                this.video_tint.css({
                    "position": "absolute",
                    "inset": 0,
                    "pointer-events": "none",
                    "user-select": "none",
                    "mix-blend-mode": "overlay"
                });
            }

            this.html.append(this.video_tint);

            this.video_tint.css({
                "background-color": tint_color
            });
        }
    };

    this.update_filter = function (brightness=null, contrast=null) {
        if (!this.media) {
            (function (self) {
                setTimeout(
                    function () {
                        self.update_filter(brightness, contrast);
                    },
                    10
                );
            })(this);

            return;
        }

        this.media.css({
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

        this.media = canvas;

        this.html.append(this.media);
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
        if (!this.media) {
            (function (self) {
                setTimeout(
                    function () {
                        self.on_update(key);
                    },
                    10
                );
            })(this);

            return;
        }

        if (key === "contrast" || key === "brightness") {
            this.update_filter();
        }

        this.update_tint_color();
    };

    // Override
    this.on_opacity_change = function (value) {
        if (!this.media) {
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

        this.media.css({
            "opacity": value
        });
    };

    // Override
    // this.on_hidden_change = function (hidden) {
    //     if (!this.media) {
    //         (function (self) {
    //             setTimeout(
    //                 function () {
    //                     self.on_hidden_change(hidden);
    //                 },
    //                 10
    //             );
    //         })(this);
    //
    //         return;
    //     }
    //
    //     if (hidden) {
    //         this.media.hide();
    //     }
    //
    //     else {
    //         this.media.show();
    //     }
    // };

    // Override
    this.on_locked_change = function (locked) {
        if (this.type !== "video") {
            return;
        }

        if (!this.media) {
            (function (self) {
                setTimeout(
                    function () {
                        self.on_locked_change(locked);
                    },
                    10
                );
            })(this);

            return;
        }

        if (this.editor.preview_mode) {
            return;
        }

        try {
            this.media.attr("controls", locked);
        }

        catch {
            // Pass
        }
    };

    this._setup_styles();
}
