/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveColor () {
    this.color = $("<div></div>");

    this._setup_styles = function () {
        this.color.css({
            "pointer-events": "none",
            "user-select": "none"
        });

        this.update_colors();
    };

    this.update_colors = function () {
        var colors = [];

        for (var num of [1, 2, 3]) {
            var color = this.get_value("color_" + num);

            if (color) {
                colors.push(color);
            }
        }

        console.debug("TEST", colors);

        // TODO
    };

    // Override
    this.on_update = function (key) {
        if (key.startsWith("aspect")) {
            this.set_init();
        }

        if (key.startsWith("color_")) {
            this.update_colors();
        }

        if (key === "gradient_direction") {
            // TODO
        }
    };

    // Override
    this.on_opacity_change = function (value) {
        this.color.css({
            "opacity": value
        });
    };

    // Override
    this.on_hidden_change = function (hidden) {
        if (hidden) {
            this.color.hide();
        }

        else {
            this.color.show();
        }
    };

    this._setup_styles();
}
