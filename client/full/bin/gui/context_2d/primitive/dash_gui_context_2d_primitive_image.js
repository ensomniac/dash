/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveImage () {
    this.image = null;

    this._setup_styles = function () {
        this.image = Dash.File.GetImagePreview(this.get_url(), "100%", "100%");

        this.html.append(this.image);

        this.update_filter();
    };

    this.get_url = function () {
        return (this.file_data["thumb_png_url"] || this.file_data["orig_url"] || "");
    };

    this.update_filter = function () {
        this.image.css({
            "filter": "brightness(" + this.data["brightness"] + ") contrast(" + this.data["contrast"] + ")"
        });
    };

    // Override
    this.on_set_property = function (key) {
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
