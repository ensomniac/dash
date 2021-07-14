/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleFlex () {
    this.styles = ["bar"];
    this.bar_data = {};

    // TODO: Update all uses of VH/VW

    // Expects dict with key/value pairs (value should be a number), where the key
    // displays on the bottom of the bar graph, and value sets the height of the bar
    this.SetBarData = function (data) {
        if (this.sub_style !== "bar") {
            console.log("ERROR: SetBarData() only applies to Flex-Bar Modules");

            return;
        }

        if (!Dash.IsValidObject(data)) {
            console.log("ERROR: SetBarData() requires a dictionary to be passed in");

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
                    if (!Dash.IsValidObject(self.bar_data)) {
                        self.update_bar_data({"-": 1, "--": 2, "---": 3});
                    }
                },
                1000
            );
        })(this);
    };

    this.setup_bar_gui = function () {
        var [labels, values] = this.get_bar_data_sets();

        // Config Documentation: https://www.chartjs.org/docs/latest/charts/bar.html

        var config = {
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

        // TODO: Flex responsiveness is not working properly because the percentage of the screen that
        //  the flex module box takes up changes when the screen size changes, and then the gui container
        //  doesn't reflect that percentage change, still thinking the width/height vw/vh values are the same.
        //  Need a way to maybe calculate the screen percentage of the flex box before setting the initial
        //  vw/vh width/height values. It wouldn't be able to accurately adapt in real time, but each time
        //  the page is reloaded, it will be the correct width/height. Shouldn't need to be able to adjust for
        //  realtime window changes anyway, as long as it's accurate on load for any size.

        var canvas = document.createElement("canvas");
        var script = document.createElement("script");
        var canvas_container = document.createElement("div");
        var canvas_id = "bar_canvas_" + Dash.Math.RandomNumber();

        // TODO: Replace units if necessary
        canvas_container.style.height = "11.25vh";  // TEMP
        canvas_container.style.marginBottom = this.margin.toString() + "vh";  // TEMP
        canvas_container.style.marginTop = (this.margin * 2.2).toString() + "vh";  // TEMP
        canvas_container.style.marginLeft = (this.margin * 0.3).toString() + "vw";  // TEMP
        canvas_container.style.marginRight = (this.margin * 1.25).toString() + "vw";  // TEMP

        canvas_container.style.width = "inherit";  // MUST remain inherited to flex properly
        canvas_container.style.overflow = "hidden";
        canvas_container.style.opacity = "0";

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
        if (!Dash.IsValidObject(data)) {
            data = this.bar_data;
        }

        var labels = [];
        var values = [];

        for (var key in data) {
            labels.push(key.toString());

            var value = parseInt(data[key]);

            if (isNaN(value)) {
                console.log("ERROR: Bar data object values must be numbers");

                return [["ERROR", "SEE", "CONSOLE"], [1, 2, 3]];
            }

            values.push(data[key]);
        }

        return [labels, values];
    };
}
