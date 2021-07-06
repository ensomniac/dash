/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleFlex () {
    this.setup_styles = function () {
        this.html.css({
            "margin": this.padding,
            "flex-grow": 1
        });
    };
}
