/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleSquare () {
    this.styles = ["tag", "radial"];
    this.label_text = $("<div>-label-</div>");
    this.main_text = $("<div>-main-</div>");

    this.setup_styles = function () {
        this.html.css({
            "margin": this.padding,
            "aspect-ratio": "1 / 1"
        });

        if (this.sub_style === "tag") {
            this.setup_tag_style();
        }

        else if (this.sub_style === "radial") {
            this.setup_radial_style();
        }

        // this.html.append(this.label_text);
        // this.html.append(this.main_text);
    };

    this.setup_tag_style = function () {
        this.label_text.css({
            "color": this.primary_color,
            "font-family": this.bold_font,
        });

        this.main_text.css({
            "color": this.primary_color,
            "font-family": this.bold_font,
        });
    };

    this.setup_radial_style = function () {
        this.label_text.css({
            "color": this.primary_color,
            "font-family": this.bold_font,
        });

        this.main_text.css({
            "color": this.primary_color,
            "font-family": this.bold_font,
        });
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelText = function (text) {
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetMainText = function (text) {
    };
}
