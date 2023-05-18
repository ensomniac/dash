/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveColor () {
    this.color = $("<div></div>");

    this._setup_styles = function () {
        this.color.css({
            "pointer-events": "none",
            "user-select": "none",
            "position": "absolute",
            "inset": 0
        });

        this.html.append(this.color);

        this.update_colors();
    };

    this.update_colors = function () {
        var colors = [];

        for (var num of [1, 2, 3]) {
            var key = "color_" + num;
            var color = this.get_value(key);

            if (!color) {
                continue;
            }

            var opacity = this.get_value(key + "_opacity");

            if (opacity && (opacity === 0 || opacity < 1)) {
                color = Dash.Color.GetTransparent(color, opacity);
            }

            colors.push(color);
        }

        if (!colors.length) {
            this.color.css({
                "background": ""
            });

            return;
        }

        if (colors.length === 1) {
            this.color.css({
                "background": colors[0]
            });

            return;
        }

        this.color.css({
            // https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
            "background": (
                  "linear-gradient("
                + this.get_value("gradient_direction").replaceAll("_", " ")
                + ", "
                + colors.join(", ")
                + ")"
            )
        });
    };

    // Override
    this.on_update = function (key) {
        if (key.startsWith("aspect")) {
            this.set_init();
        }

        if (key.startsWith("color_") || key === "gradient_direction") {
            this.update_colors();
        }
    };

    // Override
    this.on_opacity_change = function (value) {
        this.color.css({
            "opacity": value
        });
    };

    // Override
    // this.on_hidden_change = function (hidden) {
    //     if (hidden) {
    //         this.color.hide();
    //     }
    //
    //     else {
    //         this.color.show();
    //     }
    // };

    this._setup_styles();
}
