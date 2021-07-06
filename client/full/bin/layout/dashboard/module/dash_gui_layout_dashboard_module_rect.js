/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleRect () {
    this.styles = ["list"];

    this.setup_styles = function () {
        this.html.css({
            "margin": this.padding,
            "aspect-ratio": "2 / 1"
        });
    };

    // Expects dict with key/value pairs (value should be a string), where the key
    // displays on the left side of the list, and value displays on the right side
    this.SetListData = function (data) {
        if (this.sub_style !== "list") {
            console.log("ERROR: SetListData() only applies to Rect-List Modules");

            return;
        }
    };
}
