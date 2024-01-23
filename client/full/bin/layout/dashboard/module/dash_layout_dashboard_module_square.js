/**@member DashLayoutDashboardModule*/

function DashLayoutDashboardModuleSquare () {
    this.styles = ["tag", "radial"];
    this.label_text = "";
    this.label_header_text = "";
    this.label = $("<div></div>");
    this.label_header = $("<div></div>");
    this.radial_fill_percent = 0;

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelHeaderText = function (text) {
        text = text.toString().toUpperCase();

        if (text === this.label_header_text) {
            return;
        }

        if (!this.label_header_text) {
            this.label_header_text = text;

            this.label_header.text(this.label_header_text);

            return;  // No need to animate
        }

        this.label_header_text = text;

        (function (self) {
            self.label_header.fadeOut(
                500,
                function () {
                    self.label_header.text(self.label_header_text);
                    self.label_header.fadeIn(500);
                }
            );
        })(this);
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelText = function (text) {
        text = text.toString().toUpperCase();

        if (text === this.label_text) {
            return;
        }

        if (!this.label_text) {
            this.label_text = text;

            this.label.text(this.label_text);

            this.set_tag_label_font_size();

            return;  // No need to animate
        }

        this.label_text = text;

        (function (self) {
            self.label.fadeOut(
                500,
                function () {
                    self.set_tag_label_font_size();

                    self.label.text(self.label_text);

                    self.label.fadeIn(500);
                }
            );
        })(this);
    };

    this.SetRadialFillPercent = function (percent) {
        if (this.sub_style !== "radial") {
            console.error("Error: SetRadialFillPercent() only works for Square Radial Modules");

            return;
        }

        percent = parseInt(percent);

        if (isNaN(percent)) {
            console.error("Error: SetRadialFillPercent requires a number!");
        }

        if (percent > 100) {
            percent = 100;
        }

        if (percent < 0) {
            percent = 0;
        }

        this.radial_fill_percent = percent;

        this.SetLabelText(this.radial_fill_percent.toString() + "%");
        this.update_radial_fill_percent(percent);
    };

    this.setup_styles = function (css_only=false) {
        this.html.css({
            "aspect-ratio": this.square_aspect_ratio
        });

        if (this.sub_style === "tag") {
            this.setup_tag_style(css_only);
        }

        else if (this.sub_style === "radial") {
            this.setup_radial_style();
        }

        if (css_only) {
            return;
        }

        this.html.append(this.label_header);
        this.html.append(this.label);
    };

    this.setup_tag_style = function (css_only=false) {
        this.label_header.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%",
            "margin-top": "18%",
            "font-size": this.dashboard.get_text_vsize(0.1) + "vh",  // TEMP
            "height": this.dashboard.get_text_vsize(0.1) + "vh",  // TEMP
        });

        this.label.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%"
        });

        this.set_tag_label_font_size();

        if (css_only) {
            return;
        }

        // Only draw the default placeholder view if it hasn't been set after the first second
        (function (self) {
            setTimeout(
                function () {
                    if (self.label_text.length < 1) {
                        self.SetLabelText("--");
                    }
                },
                1000
            );
        })(this);
    };

    this.set_tag_label_font_size = function () {
        if (this.sub_style !== "tag") {
            return;
        }

        var size = 0.39;

        if (this.label_text.length > 1) {
            size = Math.max(0.1, size - (0.03 * (this.label_text.length - 1)));
        }

        this.label.css({
            "font-size": this.dashboard.get_text_vsize(size) + "vh",  // TEMP
            "height": this.dashboard.get_text_vsize(size) + "vh",  // TEMP
            "line-height": this.dashboard.get_text_vsize(size * 1.11) + "vh"  // TEMP
        });
    };

    this.setup_radial_style = function () {
        this.label_header.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",
            "margin-top": "32%",
            "font-size": this.dashboard.get_text_vsize(0.06) + "vh",  // TEMP
            "height": this.dashboard.get_text_vsize(0.06) + "vh",  // TEMP
        });

        this.label.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",
            "font-size": this.dashboard.get_text_vsize(0.18) + "vh",  // TEMP
            "height": this.dashboard.get_text_vsize(0.18) + "vh",  // TEMP
            "line-height": this.dashboard.get_text_vsize(0.21) + "vh",  // TEMP
        });

        this.setup_radial_gui();
    };

    this.setup_radial_gui = function () {
        if (!this.canvas) {
            var config = this.get_radial_config();
            var canvas = document.createElement("canvas");
            var script = document.createElement("script");
            var canvas_container = document.createElement("div");
            var canvas_id = "radial_canvas_" + Dash.Math.RandomNumber();

            canvas.id = canvas_id;

            script.type = "text/javascript";
            script.text = "window." + canvas_id + " = new Chart(document.getElementById('" + canvas_id + "').getContext('2d')," + JSON.stringify(config) + ");";

            canvas_container.appendChild(canvas);

            this.canvas = {"container": canvas_container, "script": script, "id": canvas_id};
        }

        this.canvas["container"].style.overflow = "hidden";
        this.canvas["container"].style.width = this.dashboard.get_text_vsize(0.7) + "vh";  // TEMP
        this.canvas["container"].style.height = this.dashboard.get_text_vsize(0.7) + "vh";  // TEMP
        this.canvas["container"].style.marginBottom = this.dashboard.get_vmargin() + "vh";  // TEMP
        this.canvas["container"].style.marginTop = this.dashboard.get_vmargin(3) + "vh";// TEMP
        this.canvas["container"].style.marginLeft = this.dashboard.get_vmargin(1.25) + "vh";// TEMP
        this.canvas["container"].style.marginRight = this.dashboard.get_vmargin(2.45) + "vh";// TEMP
    };

    this.get_radial_fill_data = function () {
        return [this.radial_fill_percent, 100 - this.radial_fill_percent];
    };

    this.update_radial_fill_percent = function (percent) {
        if (!this.canvas) {
            return;
        }

        var radial_gui = this.canvas["gui"] || window[this.canvas["id"]];

        // Try again if gui hasn't loaded yet (should only happen when initializing)
        if (!radial_gui.data) {
            (function (self, percent) {
                setTimeout(
                    function () {
                        self.SetRadialFillPercent(percent);
                    },
                    250
                );
            })(this, percent);

            return;
        }

        if (!this.canvas["gui"]) {
            this.canvas["gui"] = radial_gui;
        }

        radial_gui.data.datasets[0].data = this.get_radial_fill_data();

        radial_gui.update();
    };

    // Config Documentation: https://www.chartjs.org/docs/latest/charts/doughnut.html
    this.get_radial_config = function () {
        return {
            "type": "doughnut",
            "data": {
                "datasets": [{
                    "data": this.get_radial_fill_data(),
                    "backgroundColor": [
                        this.primary_color,  // Filled
                        this.secondary_color  // Unfilled
                    ],
                    "borderWidth": [
                        5,  // Filled
                        0,  // Unfilled
                    ],
                    "borderColor": [
                        this.primary_color  // Filled
                    ]
                }]
            },
            "options": {
                "cutout": "80%",
                "responsive": true,
                "aspectRatio": 1,
                "maintainAspectRatio": true,
                "plugins": {
                    "legend": {
                        "display": false
                    },
                    "tooltip": {
                        "enabled": false
                    },
                    "title": {
                        "display": false
                    }
                }
            }
        };
    };
}
