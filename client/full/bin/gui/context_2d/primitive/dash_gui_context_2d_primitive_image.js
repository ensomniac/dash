/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveImage () {
    this.image = null;

    this._setup_styles = function () {
        this.image = Dash.File.GetImagePreview(this.get_url(), "100%", "100%");

        this.html.append(this.image);

        this.update_filter();
    };

    this.get_url = function () {
        return (this.data["file_data"]["thumb_png_url"] || this.data["file_data"]["orig_url"] || "");
    };

    this.update_filter = function () {
        var contrast = "contrast" in this.data ? this.data["contrast"] : 1;
        var brightness = "brightness" in this.data ? this.data["brightness"] : 1;

        this.image.css({
            "filter": "brightness(" + brightness + ") contrast(" + contrast + ")"
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
