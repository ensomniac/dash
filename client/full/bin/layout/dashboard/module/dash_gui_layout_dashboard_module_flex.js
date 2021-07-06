/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleFlex () {
    this.styles = ["bar"];

    this.setup_styles = function () {
        this.html.css({
            "margin": this.padding,
            "flex-grow": 1
        });
    };

    // Expects dict with key/value pairs (value should be a number), where the key
    // displays on the bottom of the bar graph, and value sets the height of the bar
    this.SetBarData = function (data) {
        if (this.sub_style !== "bar") {
            console.log("ERROR: SetBarData() only applies to Flex-Bar Modules");

            return;
        }
    };
}
