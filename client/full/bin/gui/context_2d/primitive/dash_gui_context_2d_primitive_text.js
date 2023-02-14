/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveText () {
    this.text_area = null;
    this.last_text_value = null;
    this.text_border_thickness = 1;
    this.text_pad = Dash.Size.Padding;
    this.text_border_comp = this.text_border_thickness * 2;  // Compensation for border

    this._setup_styles = function () {
        var width_min = (this.canvas.GetWidth() * 0.9) + (this.text_pad * 2) + this.text_border_comp;
        var height_min = (Dash.Size.RowHeight * 1.3) + (this.text_pad * 2) + this.text_border_comp;

        if (this.data_is_default()) {
            this.starting_width_override = width_min;
            this.starting_height_override = height_min;
        }

        this.width_px_min = width_min;
        this.height_px_min = height_min;
        this.text_area = new Dash.Gui.TextArea(this.color, "", this, this.on_text_change, true);

        this.text_area.textarea.css({
            "border": "none",
            "height": "100%",
            "min-height": "100%",
            "max-height": "100%",
            "resize": "none",
            "text-align": "center"
        });

        var calc = "calc(100% - " + ((this.text_pad * 2) + this.text_border_comp) + "px)";

        this.text_area.html.css({
            "border-radius": Dash.Size.BorderRadius,
            "position": "absolute",
            "inset": this.text_pad,
            "width": calc,
            "height": calc
        });

        this.text_area.DisableFlash();

        if (this.data["text_value"]) {
            this.text_area.SetText(this.data["text_value"]);
        }

        (function (self) {
            self.text_area.textarea.on("focus", function () {
                self.text_area.html.css({
                    "border": self.text_border_thickness + "px solid " + self.color.PinstripeDark
                });
            });

            self.text_area.textarea.on("blur", function () {
                self.text_area.html.css({
                    // Retain the physical space of the border, just make it invisible
                    // (this prevents the box from appearing to "jitter" when the border is toggled)
                    "border": self.text_border_thickness + "px solid rgba(0, 0, 0, 0)"
                });
            });
        })(this);

        this.html.append(this.text_area.html);

        this.resize_text();
        this.update_font();
        this.update_font_color();
    };

    this.resize_text = function () {
        if (!this.height_px && !this.starting_height_override) {
            (function (self) {
                setTimeout(
                    function () {
                        self.resize_text();
                    },
                    10
                );
            })(this);

            return;
        }

        var size = (
              (this.height_px || this.starting_height_override)
            - (this.text_pad * 2)
            - this.text_border_comp
            - Dash.Size.Padding
        );

        this.text_area.textarea.css({
            "font-size": size + "px",
            "line-height": size + "px"
        });
    };

    this.on_text_change = function (value) {
        value = value.trim();

        this.editor.SetEditorPanelLayerProperty(
            "display_name",
            value,
            this.index,
            this.last_text_value || this.data["text_value"]
        );

        this.SetProperty("text_value", value);

        this.last_text_value = value;
    };

    this.update_font = function () {
        var font_option = this.get_font_option();

        if (!font_option || !font_option["url"] || !font_option["filename"]) {
            this.text_area.textarea.css({
                "font-family": "sans_serif_normal"
            });

            return;
        }

        Dash.Utils.SetDynamicFont(
            this.text_area.textarea,
            font_option["url"],
            font_option["label_text"],
            font_option["filename"]
        );
    };

    this.update_font_color = function () {
        this.text_area.textarea.css({
            "color": this.data["font_color"] || this.color.Text
        });
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
