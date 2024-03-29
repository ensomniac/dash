/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveText () {
    this.text_area = null;
    this.last_text_value = null;
    this.text_border_thickness = 1;
    this.using_scroll_width = false;
    this.textarea_width_timer = null;

    this._setup_styles = function () {
        this.html.css({
            "display": "flex",
            "overflow": "visible"
        });

        this.text_area = new Dash.Gui.TextArea(this.color, "", this, this.on_text_change, true);

        this.text_area.html.css({
            "border-radius": Dash.Size.BorderRadius,
            "width": "fit-content",
            "height": "100%",
            "border": this.text_border_thickness + "px solid rgba(0, 0, 0, 0)",
            "overflow": "visible"
        });

        this.text_area.textarea.css({
            "border": "none",
            "width": "fit-content",
            "height": "fit-content",
            "white-space": "nowrap",
            "min-height": "",
            "max-height": "",
            "min-width": "",
            "max-width": "",
            "resize": "none",
            "padding": 0,
            "overflow": "visible"
        });

        // This essentially turns the TextArea into an Input, making it redundant,
        // but this is for a reason. Eventually, these text primitives should be able to
        // handle new lines. Right now, it's put on hold because it complicates the resizing
        // etc and it's not a priority. When ready to implement that, remove this line.
        this.text_area.DisableNewLines();

        this.text_area.DisableFlash();

        var text_value = this.get_value("text_value");

        if (text_value) {
            this.text_area.SetText(this.get_value("text_caps") ? text_value.toUpperCase() : text_value);
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
        this.update_text_alignment();

        if (this.get_value("placeholder")) {
            this.lock_text_area();
        }

        else if (!this.editor.can_edit) {
            this.lock_text_area();

            this.text_area.html.css({
                "user-select": "none",
                "pointer-events": "none"
            });
        }

        this.update_kerning();

        (function (self) {
            requestAnimationFrame(function () {
                self.update_stroke();
            });
        })(this);

        this.update_textarea_width();
    };

    this.update_textarea_width = function (skip_if_no_scroll_width=true, retry=0, stroke_px=null, slant_px=null) {
        if (stroke_px === null || slant_px === null) {
            var text_height = this.height_px;
            var font_option = this.get_font_option();

            if (font_option && font_option["override_scale_mult"] !== 1.0) {
                text_height *= font_option["override_scale_mult"];
            }

            stroke_px = text_height * (this.get_value("stroke_thickness") || 0);
            slant_px = font_option && font_option["slant_comp_mult"] ? (font_option["slant_comp_mult"] * text_height) : 0;
        }

        (function (self) {
            if (self.textarea_width_timer) {
                clearTimeout(self.textarea_width_timer);
            }

            self.textarea_width_timer = setTimeout(
                function () {
                    var html = self.text_area.textarea[0];
                    var scroll_width = html.scrollWidth + (stroke_px ? (stroke_px * 2) : 0) + (slant_px ? slant_px : 0);
                    var has_overflow = html.offsetWidth < scroll_width;

                    if (!has_overflow && retry < 4) {
                        self.update_textarea_width(skip_if_no_scroll_width, retry + 1, stroke_px);

                        return;
                    }

                    var true_width = has_overflow ? (scroll_width + 1) : 0;

                    if (true_width) {
                        self.using_scroll_width = true;
                    }

                    else {
                        if (skip_if_no_scroll_width && self.using_scroll_width) {
                            return;
                        }

                        self.using_scroll_width = false;
                    }

                    self.text_area.textarea.css({
                        "width": true_width ? (true_width + "px") : "fit-content"
                    });
                },
                300
            );
        })(this);
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

        var text_height = this.height_px;
        var font_option = this.get_font_option();

        if (font_option && font_option["override_scale_mult"] !== 1.0) {
            text_height *= font_option["override_scale_mult"];
        }

        // This makes sure we keep the text within the bounding box, as opposed to the stroke extending outside it
        var stroke_px = text_height * (this.get_value("stroke_thickness") || 0);

        this.text_area.textarea.css({
            "top": font_option && font_option["override_top_mult"] ? (font_option["override_top_mult"] * text_height) : 0,
            "left": font_option && font_option["override_left_mult"] ? (font_option["override_left_mult"] * text_height) : 0,
            "font-size": (text_height - stroke_px) + "px",
            "line-height": text_height + "px"
        });
    };

    this.on_text_change = function (value) {
        value = value.trim();

        if (this.last_text_value === value || this.get_value("text_value") === value) {
            return;
        }

        this.editor.SetEditorPanelLayerProperty("text_value", value, this.id);

        this.Update("text_value", value);

        this.last_text_value = value;

        this.update_textarea_width(false);
    };

    this.update_text_alignment = function () {
        var alignment = this.get_value("text_alignment") || "center";

        this.html.css({
            "justify-content": alignment
        });

        this.text_area.textarea.css({
            "text-align": alignment
        });

        this.update_textarea_width(false);
    };

    this.update_font = function () {
        var font_option = this.get_font_option();

        if (!font_option || !font_option["url"] || !font_option["filename"]) {
            this.text_area.textarea.css({
                "font-family": "sans_serif_normal"
            });

            return;
        }

        (function (self) {
            Dash.Utils.SetDynamicFont(
                self.text_area.textarea,
                font_option["url"],
                font_option["label_text"],
                font_option["filename"],
                function () {
                    self.update_textarea_width();
                }
            );
        })(this);
    };

    this.update_font_color = function () {
        this.text_area.textarea.css({
            "color": this.get_value("font_color") || this.color.Text
        });
    };

    this.update_stroke = function () {
        if (!this.height_px) {
            (function (self) {
                setTimeout(
                    function () {
                        self.update_stroke();
                    },
                    10
                );
            })(this);

            return;
        }

        var shadow = "";
        var text_height = this.height_px;
        var opacity = this.get_value("opacity");
        var font_option = this.get_font_option();
        var stroke_color = (this.get_value("stroke_color") || this.color.Text);

        if (font_option && font_option["override_scale_mult"] !== 1.0) {
            text_height *= font_option["override_scale_mult"];
        }

        // Cut in half to match PIL
        var stroke_px = (text_height * (this.get_value("stroke_thickness") || 0)) * 0.5;


        // text-stroke applies inwards, but PIL applies stroke outwards,
        // so this approach allows us to match the output from PIL
        if (opacity && stroke_px) {
            var iterations = parseInt(100 * opacity);

            for (var num of Dash.Math.Range(iterations)) {
                shadow += "0px 0px " + stroke_px + "px " + stroke_color;

                if (num !== iterations - 1) {
                    shadow += ", ";
                }
            }
        }

        this.text_area.textarea.css({
            "text-shadow": shadow
        });
    };

    this.update_kerning = function () {
        if (!this.height_px) {
            (function (self) {
                setTimeout(
                    function () {
                        self.update_kerning();
                    },
                    10
                );
            })(this);

            return;
        }

        var text_height = this.height_px;
        var font_option = this.get_font_option();

        if (font_option && font_option["override_scale_mult"] !== 1.0) {
            text_height *= font_option["override_scale_mult"];
        }

        // This makes sure we keep the text within the bounding box, as opposed to the stroke extending outside it
        var stroke_px = text_height * (this.get_value("stroke_thickness") || 0);
        var kerning_norm = this.get_value("kerning") || 0;

        this.text_area.textarea.css({
            "letter-spacing": kerning_norm ? (((this.height_px * kerning_norm) + stroke_px) + "px") : "normal"  // When 0, don't apply kerning
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
        if (this.get_value("placeholder")) {
            return;
        }

        this.text_area.Unlock(false);
    };

    this.focus_text_area = function () {
        if (this.get_value("placeholder")) {
            return;
        }

        this.text_area.Focus();
    };

    // Override
    this.on_update = function (key) {
        if (key === "font_id") {
            this.update_font();
        }

        else if (key === "text_alignment") {
            this.update_text_alignment();
        }

        else if (key === "text_caps") {
            var text_value = this.get_value("text_value");

            this.text_area.SetText(this.get_value("text_caps") ? text_value.toUpperCase() : text_value);

            this.update_textarea_width(false);
        }

        else if (key === "stroke_thickness") {
            this.resize_text();
        }

        this.update_kerning();
        this.update_textarea_width();
        this.update_stroke();
        this.update_font_color();
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

    // Override
    // this.on_hidden_change = function (hidden) {
    //     if (hidden) {
    //         this.text_area.html.hide();
    //     }
    //
    //     else {
    //         this.text_area.html.show();
    //     }
    // };

    this._setup_styles();
}
