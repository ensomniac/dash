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

        this.html.append(this.label_text);
        this.html.append(this.main_text);
    };

    this.setup_tag_style = function () {
        this.label_text.css({
            ...this.text_css,
            "color": this.primary_color,
            "width": "95%",
            "margin-top": "18%",

            // TODO
            "font-size": "1.5vh",  // TEMP
            "height": "1.5vh",  // TEMP
        });

        this.main_text.css({
            ...this.text_css,
            "color": this.primary_color,
            "width": "95%",

            // TODO
            "font-size": "4.5vh",  // TEMP
            "height": "4.5vh",  // TEMP
            "line-height": "5vh",  // TEMP
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
        this.label_text.text(text.toString().toUpperCase());
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetMainText = function (text) {
        text = text.toString().toUpperCase();

        if (text.length > 4) {
            console.log("WARNING: Square Module SetMainText is intended to be four characters or less - any more may introduce cut-off.");
        }

        if (text.length <= 3 && this.sub_style === "tag") {
            this.main_text.css({
                // TODO
                "font-size": "5.5vh",  // TEMP
                "height": "5.5vh",  // TEMP
                "line-height": "6vh",  // TEMP
            });
        }

        this.main_text.text(text);
    };
}
