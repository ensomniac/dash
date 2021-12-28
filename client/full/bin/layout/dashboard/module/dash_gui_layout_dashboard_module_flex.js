/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleFlex () {
    this.styles = ["bar"];
    this.bar_data = {};

    this.SetBarData = function (data) {
        if (this.sub_style !== "bar") {
            console.error("Error: SetBarData() only applies to Flex-Bar Modules");

            return;
        }

        if (!Dash.Validate.Object(data)) {
            console.error("Error: SetBarData() requires a dictionary to be passed in");

            return;
        }

        if (!data["data"] || !data["order"]) {
            console.error("Error: SetBarData() expects a dict that contains 'data' and 'order' keys");

            return;
        }

        this.bar_data = data;

        this.update_bar_data(data);
    };

    this.setup_styles = function () {
        this.html.css({
            "flex": 1
        });

        if (this.sub_style === "bar") {
            this.setup_bar_style();
        }
    };

    this.setup_bar_style = function () {
        this.setup_bar_gui();

        // Only draw the default placeholder view if it hasn't been set after the first second
        (function (self) {
            setTimeout(
                function () {
                    if (!Dash.Validate.Object(self.bar_data)) {
                        self.update_bar_data({"-": 1, "--": 2, "---": 3});
                    }
                },
                1000
            );
        })(this);
    };

    this.setup_bar_gui = function () {
        var config = this.get_bar_config();

        var canvas = document.createElement("canvas");
        var script = document.createElement("script");
        var canvas_container = document.createElement("div");
        var canvas_id = "bar_canvas_" + Dash.Math.RandomNumber();

        var prev_mod_is_flex = this.modules.Last()["style"] === "flex";
        var l_margin_mult = prev_mod_is_flex ? 0.9 : 0.3;
        var r_margin_mult = prev_mod_is_flex ? 1 : 1.25;

        canvas_container.style.height = "11.25vh";  // TEMP
        canvas_container.style.marginBottom = this.margin.toString() + "vh";  // TEMP
        canvas_container.style.marginTop = (this.margin * 2.2).toString() + "vh";  // TEMP
        canvas_container.style.marginLeft = (this.margin * l_margin_mult).toString() + "vw";  // TEMP
        canvas_container.style.marginRight = (this.margin * r_margin_mult).toString() + "vw";  // TEMP

        canvas_container.style.overflow = "hidden";
        canvas_container.style.opacity = "0";
        canvas_container.style.flex = "1";

        canvas.id = canvas_id;

        script.type = "text/javascript";
        script.text = "window." + canvas_id + " = new Chart(document.getElementById('" + canvas_id + "').getContext('2d')," + JSON.stringify(config) + ");";

        canvas_container.appendChild(canvas);

        this.canvas = {"container": canvas_container, "script": script, "id": canvas_id};
    };

    this.update_bar_data = function (data) {
        if (!this.canvas) {
            return;
        }

        var bar_gui = this.canvas["gui"] || window[this.canvas["id"]];

        // Try again if gui hasn't loaded yet (should only happen when initializing)
        if (!bar_gui.data) {
            (function (self, data) {
                setTimeout(
                    function () {
                        self.SetBarData(data);
                    },
                    250
                );
            })(this, data);

            return;
        }

        if (!this.canvas["gui"]) {
            this.canvas["gui"] = bar_gui;
        }

        if (this.canvas["container"].style.opacity !== "1") {
            this.canvas["container"].animate({"opacity": 1}, 1000);

            this.canvas["container"].style.opacity = "1";
        }

        [bar_gui.data.labels, bar_gui.data.datasets[0].data] = this.get_bar_data_sets(data);

        bar_gui.update();
    };

    this.get_bar_data_sets = function (data) {
        if (!Dash.Validate.Object(data)) {
            data = this.bar_data;
        }

        var labels = data["order"];
        var values = [];

        for (var i in data["order"]) {
            var key = data["order"][i];
            var value = parseInt(data["data"][key]);

            if (isNaN(value)) {
                console.error("Error: Bar data object values must be numbers");

                return [["ERROR", "SEE", "CONSOLE"], [1, 2, 3]];
            }

            values.push(value);
        }

        return [labels, values];
    };

    // Config Documentation: https://www.chartjs.org/docs/latest/charts/bar.html
    this.get_bar_config = function () {
        var [labels, values] = this.get_bar_data_sets();

        return {
            "type": "bar",
            "data": {
                "labels": labels,
                "datasets": [{
                    "label": "My First Dataset",
                    "data": values,
                    "backgroundColor": this.primary_color,
                    "barPercentage": 1.15
                }]
            },
            "options": {
                "responsive": true,
                "maintainAspectRatio": false,
                "scales": {
                    "y": {
                        "beginAtZero": true,
                        "grid": {
                            "color": this.secondary_color,
                            "borderColor": this.secondary_color,
                            "tickLength": 4
                        },
                        "ticks": {
                            "color": this.secondary_color,
                            "padding": 4,
                            "font": {
                                "family": this.bold_font
                            }
                        }
                    },
                    "x": {
                        "grid": {
                            "display": false
                        },
                        "ticks": {
                            "color": this.secondary_color,
                            "padding": -5,
                            "font": {
                                "family": this.bold_font,
                                "size": 16
                            }
                        }
                    },
                },
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
