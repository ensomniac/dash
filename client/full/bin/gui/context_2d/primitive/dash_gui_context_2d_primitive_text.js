/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveText () {
    this.text_area = null;

    this._setup_styles = function () {
        var pad = Dash.Size.Padding;
        var width_min = Dash.Size.ColumnWidth + (pad * 2);
        var height_min = Dash.Size.RowHeight + (pad * 2);

        if (this.data_is_default()) {
            this.starting_width_override = width_min;
            this.starting_height_override = height_min;
        }

        this.width_px_min = width_min;
        this.height_px_min = height_min;
        this.text_area = new Dash.Gui.TextArea(this.color, "", this, this.on_text_change, true);

        // TODO:
        //  - possible to get rid of resize gui and stop it from being able to be resized? maybe an attribute? otherwise prevent default on resize event
        //  - figure out what size it should be by default (small) and make sure it will resize automatically as text is typed into it
        //  - handle font size
        this.text_area.textarea.css({
            "color": this.data["font_color"] || this.color.Text,
            "border": "none",
            "height": "100%",
            "background": "teal"
        });

        this.text_area.html.css({
            "position": "absolute",
            "inset": pad,
            "width": "calc(100% - " + (pad * 2) + "px)",
            "height": "calc(100% - " + (pad * 2) + "px)",
            "background": "pink"
        });

        this.text_area.DisableFlash();

        this.html.append(this.text_area.html);

        this.update_font();
    };

    this.on_text_change = function (value) {
        console.debug("TEST on text change", value);

        // TODO: update the layer name to match the value (anything else?)
    };

    this.update_font = function () {
        var font_option = this.get_font_option();

        if (!font_option || !font_option["url"] || !font_option["filename"]) {
            return;
        }

        Dash.Utils.SetDynamicFont(
            this.textarea.textarea,
            font_option["url"],
            font_option["label_text"],
            font_option["filename"]
        );
    };

    this.get_font_option = function () {
        if (!this.data["font_id"] || !this.editor.ComboOptions["fonts"]) {
            return null;
        }

        for (var option of this.editor.ComboOptions["fonts"]) {
            if (option["id"] === this.data["font_id"]) {
                return option;
            }
        }

        return null;
    };

    this._setup_styles();
}
