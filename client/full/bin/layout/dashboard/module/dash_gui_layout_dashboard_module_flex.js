/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleFlex () {
    this.styles = ["bar"];
    this.bar_data = {};

    this.setup_styles = function () {
        this.html.css({
            "flex-grow": 1
        });

        if (this.sub_style === "bar") {
            this.setup_bar_style();
        }
    };

    this.setup_bar_style = function () {
        if (!Dash.IsValidObject(this.bar_data)) {
            console.log("No list data for Flex Bar Module - use SetBarData()");

            return;
        }

        // TODO: Setup bar graph gui element using this.bar_data
    };

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

        this.setup_bar_style();
    };
}
