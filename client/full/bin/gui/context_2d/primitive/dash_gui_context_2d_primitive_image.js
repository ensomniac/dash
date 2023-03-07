/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveImage () {
    this.image = null;

    this._setup_styles = function () {
        if (this.file_data["placeholder"]) {
            this.image = $("<div>Placeholder Image</div>");

            this.image.css({
                "background": this.opposite_color.BackgroundRaised,
                "box-sizing": "border-box",
                "color": this.opposite_color.Text,
                "text-align": "center",
                "vertical-align": "middle",
                "font-family": "sans_serif_bold",
                "font-size": "125%",
                "width": "100%",
                "height": "100%",
                "display": "flex",
                "align-items": "center",
                "justify-content": "center",
                "text-shadow": "0px 0px 5px " + this.opposite_color.Background
            });
        }

        else {
            this.image = Dash.File.GetImagePreview(this.get_url(), "100%", "100%");
        }

        this.html.append(this.image);

        this.update_filter();
    };

    this.get_url = function () {
        return (this.file_data["thumb_png_url"] || this.file_data["orig_url"] || "");
    };

    this.update_filter = function () {
        this.image.css({
            "filter": "brightness(" + this.get_value("brightness") + ") contrast(" + this.get_value("contrast") + ")"
        });
    };

    // Override
    this.on_update = function (key) {
        if (key === "contrast" || key === "brightness") {
            this.update_filter();
        }
    };

    // Override
    this.on_opacity_change = function (value) {
        this.image.css({
            "opacity": value
        });
    };

    this._setup_styles();
}
