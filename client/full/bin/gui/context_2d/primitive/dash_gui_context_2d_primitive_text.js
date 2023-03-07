/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveText () {
    this.text_area = null;
    this.last_text_value = null;
    this.text_border_thickness = 1;
    this.text_pad = Dash.Size.Padding;
    this.text_border_comp = this.text_border_thickness * 2;  // Compensation for border

    this._setup_styles = function () {
        this.text_area = new Dash.Gui.TextArea(this.color, "", this, this.on_text_change, true);

        var calc = "calc(100% - " + ((this.text_pad * 2) + this.text_border_comp) + "px)";

        this.text_area.html.css({
            "border-radius": Dash.Size.BorderRadius,
            "position": "absolute",
            "inset": this.text_pad,
            "width": calc,
            "height": calc,
            "border": this.text_border_thickness + "px solid rgba(0, 0, 0, 0)"
        });

        this.text_area.textarea.css({
            "border": "none",
            "height": "100%",
            "min-height": "100%",
            "max-height": "100%",
            "resize": "none",
            "text-align": "center"
        });

        // TODO: This essentially turns the TextArea into an Input, making it redundant,
        //  but this is for a reason. Eventually, these text primitives should be able to
        //  handle new lines. Right now, it's put on hold because it complicates the resizing
        //  etc and it's not a priority. When ready to implement that, remove this line.
        this.text_area.DisableNewLines();

        this.text_area.DisableFlash();

        var text_value = this.get_value("text_value");

        if (text_value) {
            this.text_area.SetText(text_value);
        }

        (function (self) {
            self.text_area.textarea.on("focus", function () {
                self.text_area.html.css({
                    "border": self.text_border_thickness + "px solid " + (self.get_value("locked") ? "rgba(0, 0, 0, 0)" : self.color.PinstripeDark)
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
        if (!this.height_px) {
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
              this.height_px
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

        if (this.last_text_value || this.get_value("text_value") === value) {
            return;
        }

        this.editor.SetEditorPanelLayerProperty("text_value", value, this.id);

        this.Update("text_value", value);

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
            "color": this.get_value("font_color") || this.color.Text
        });
    };

    this.get_font_option = function () {
        var font_id = this.get_value("font_id");

        if (!font_id || !this.editor.ComboOptions["fonts"]) {
            return null;
        }

        for (var option of this.editor.ComboOptions["fonts"]) {
            if (option["id"] === font_id) {
                return option;
            }
        }

        return null;
    };

    this.lock_text_area = function () {
        this.text_area.Lock(false);
    };

    this.unlock_text_area = function () {
        this.text_area.Unlock(false);
    };

    // Override
    this.on_update = function (key) {
        if (key === "font_id") {
            this.update_font();
        }

        else if (key === "font_color") {
            this.update_font_color();
        }
    };

    // Override
    this.on_opacity_change = function (value) {
        this.text_area.textarea.css({
            "opacity": value
        });
    };

    // Override
    this.on_locked_change = function (locked) {
        if (locked) {
            this.lock_text_area();
        }

        else {
            this.unlock_text_area();
        }
    };

    this._setup_styles();
}
