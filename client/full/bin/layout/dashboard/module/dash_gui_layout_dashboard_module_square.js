/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleSquare () {
    this.styles = ["tag", "radial"];
    this.label_text = "";
    this.label_header_text = "";
    this.label = $("<div></div>");
    this.label_header = $("<div></div>");
    this.radial_fill_percent = 0;

    // TODO: Update all uses of VH

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelHeaderText = function (text) {
        (function (self, text) {
            self.label_header.fadeOut(500);

            self.label_header_text = text.toString().toUpperCase();
            self.label_header.text(self.label_header_text);

            self.label_header.fadeIn(500);
        })(this, text);
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelText = function (text) {
        (function (self, text) {
            self.label.fadeOut(500);

            self.label_text = text.toString().toUpperCase();

            if (self.label_text.length > 4) {
                console.log("WARNING: Square Module SetLabelText is intended to be four characters or less - any more may introduce cut-off.");
            }

            if (self.sub_style === "tag" && self.label_text.length <= 3) {
                self.label.css({
                    // TODO: Replace units if necessary
                    "font-size": "5.5vh",  // TEMP
                    "height": "5.5vh",  // TEMP
                    "line-height": "6vh",  // TEMP
                });
            }

            self.label.text(self.label_text);

            self.label.fadeIn(500);
        })(this, text);
    };

    this.SetRadialFillPercent = function (percent) {
        if (this.sub_style !== "radial") {
            console.log("ERROR: SetRadialFillPercent() only works for Square Radial Modules");

            return;
        }

        percent = parseInt(percent);

        if (isNaN(percent)) {
            console.log("ERROR: SetRadialFillPercent requires a number!");
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

    this.setup_styles = function () {
        this.html.css({
            "aspect-ratio": this.square_aspect_ratio
        });

        if (this.sub_style === "tag") {
            this.setup_tag_style();
        }

        else if (this.sub_style === "radial") {
            this.setup_radial_style();
        }

        this.html.append(this.label_header);
        this.html.append(this.label);
    };

    this.setup_tag_style = function () {
        this.label_header.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%",
            "margin-top": "18%",

            // TODO: Replace units if necessary
            "font-size": "1.5vh",  // TEMP
            "height": "1.5vh",  // TEMP
        });

        this.label.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%",

            // TODO: Replace units if necessary
            "font-size": "4.5vh",  // TEMP
            "height": "4.5vh",  // TEMP
            "line-height": "5vh",  // TEMP
        });

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

    this.setup_radial_style = function () {
        this.label_header.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",
            "margin-top": "32%",

            // TODO: Replace units if necessary
            "font-size": "1vh",  // TEMP
            "height": "1vh",  // TEMP
        });

        this.label.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",

            // TODO: Replace units if necessary
            "font-size": "2.75vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "line-height": "3.25vh",  // TEMP
        });

        this.setup_radial_gui();
    };

    this.setup_radial_gui = function () {
        var config = this.get_radial_config();
        var canvas = document.createElement("canvas");
        var script = document.createElement("script");
        var canvas_container = document.createElement("div");
        var canvas_id = "radial_canvas_" + Dash.Math.RandomNumber();

        canvas_container.style.overflow = "hidden";

        // TODO: Replace units if necessary
        canvas_container.style.width = "10.5vh";  // TEMP
        canvas_container.style.height = "10.5vh";  // TEMP
        canvas_container.style.marginBottom = this.margin.toString() + "vh";  // TEMP
        canvas_container.style.marginTop = (this.margin * 3).toString() + "vh";// TEMP
        canvas_container.style.marginLeft = (this.margin * 1.25).toString() + "vh";// TEMP
        canvas_container.style.marginRight = (this.margin * 2.45).toString() + "vh";// TEMP

        canvas.id = canvas_id;

        script.type = "text/javascript";
        script.text = "window." + canvas_id + " = new Chart(document.getElementById('" + canvas_id + "').getContext('2d')," + JSON.stringify(config) + ");";

        canvas_container.appendChild(canvas);

        this.canvas = {"container": canvas_container, "script": script, "id": canvas_id};
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
