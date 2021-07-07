/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleSquare () {
    this.styles = ["tag", "radial"];
    this.label_text = $("<div>SetLabelText()</div>");
    this.main_text = $("<div>SetMainText()</div>");

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
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%",
            "margin-top": "18%",

            // TODO
            "font-size": "1.5vh",  // TEMP
            "height": "1.5vh",  // TEMP
        });

        this.main_text.css({
            ...this.centered_text_css,
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
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",
            "margin-top": "30%",

            // TODO
            "font-size": "1vh",  // TEMP
            "height": "1vh",  // TEMP
        });

        this.main_text.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",

            // TODO
            "font-size": "2.5vh",  // TEMP
            "height": "2.5vh",  // TEMP
            "line-height": "3vh",  // TEMP
        });

        var radial_value = this.get_radial_value();

        this.main_text.text(radial_value);

        // TODO: Setup radial gui element using radial value
    };

    this.get_radial_value = function () {
        // TODO: Need to do some sort of calculation here based on provided
        //  data that gets the percentage fill value of the radial gui

        return "62%";  // PLACEHOLDER
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelText = function (text) {
        this.label_text.text(text.toString().toUpperCase());
    };

    this.SetMainText = function (text) {
        if (this.sub_style !== "tag") {
            console.log("ERROR: SetMainText() can only be used for Square Tag Modules, not", this.sub_style.Title());

            return;
        }

        text = text.toString().toUpperCase();

        if (text.length > 4) {
            console.log("WARNING: Square Module SetMainText is intended to be four characters or less - any more may introduce cut-off.");
        }

        if (text.length <= 3) {
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
