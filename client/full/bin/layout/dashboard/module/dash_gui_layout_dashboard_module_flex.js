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

        // TODO: needs to redraw
        this.setup_bar_style();
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

        // TODO: Make sure we have data? Setup a default data set?
        // if (!Dash.IsValidObject(this.bar_data)) {
        //     console.log("No list data for Flex Bar Module - use SetBarData()");
        //
        //     return;
        // }

        // TODO: Create functionality to redraw when data is updated
        //  (might need to use (or may be as simple as using) update_canvas_containers()?)

        this.setup_bar_graph_gui();
    };

    this.setup_bar_graph_gui = function () {
        // Config Documentation: https://www.chartjs.org/docs/latest/charts/bar.html
        var config = {
            "type": "bar",
            "data": {
                "labels": ["C", "D", "H", "J", "K", "L", "M", "S", "T", "W", "Z"],  // TODO: This needs to come from data
                "datasets": [{
                    "label": "My First Dataset",
                    "data": [70, 15, 20, 45, 78, 30, 10, 37, 13, 60, 14],  // TODO: This needs to come from data
                    "backgroundColor": this.primary_color,
                    "barPercentage": 0.75
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

        // TODO: Replace units if absolutely necessary
        canvas_container.style.width = "37.75vw";  // TEMP
        canvas_container.style.height = "11.25vh";  // TEMP
        canvas_container.style.marginBottom = this.margin.toString() + "vh";  // TEMP
        canvas_container.style.marginTop = (this.margin * 2.2).toString() + "vh";  // TEMP
        canvas_container.style.marginLeft = this.margin.toString() + "vw";  // TEMP
        canvas_container.style.marginRight = (this.margin * 1.75).toString() + "vw";  // TEMP

        canvas_container.style.overflow = "hidden";

        canvas.id = canvas_id;

        script.type = "text/javascript";
        script.text = "window." + canvas_id + " = new Chart(document.getElementById('" + canvas_id + "').getContext('2d')," + JSON.stringify(config) + ");";

        canvas_container.appendChild(canvas);

        this.canvas = {"container": canvas_container, "script": script, "id": canvas_id};
    };
}
