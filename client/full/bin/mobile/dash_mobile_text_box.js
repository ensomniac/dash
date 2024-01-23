function DashMobileTextBox (
    color=null, placeholder_text="", binder=null, on_change_cb=null, delay_change_cb=false
) {
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.placeholder_text = placeholder_text;
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;
    this.delay_change_cb = delay_change_cb;

    this.label = null;
    this.border_size = 1;
    this.avg_char_width = 0;
    this.auto_height = false;
    this.flash_disabled = false;
    this.last_change_ts = null;
    this.change_timeout = null;
    this.flash_highlight = null;
    this.change_delay_ms = 1500;  // Same as DashGuiInput's autosave delay
    this.html = $("<div></div>");
    this.last_change_value = null;
    this.auto_height_buffer_px = 0;
    this.submit_override_only = false;
    this.line_break_replacement = null;
    this.last_arrow_navigation_ts = null;
    this.line_height = (Dash.Size.RowHeight * 0.5);
    this.border_radius = Dash.Size.BorderRadius * 0.5;
    this.min_height = Dash.Size.RowHeight * (Dash.IsMobile ? 1.1 : 1);

    this.textarea = $(
        "<textarea></textarea>",
        {
            "class": this.color.PlaceholderClass,
            "placeholder": this.placeholder_text
        }
    );

    this.setup_styles = function () {
        this.textarea.css({
            "color": this.color.Text,
            "font-family": "sans_serif_normal",
            "padding": Dash.Size.Padding * 0.5,
            "box-sizing": "border-box",
            "width": "100%",
            "min-width": "100%",
            "max-width": "100%",
            "height": Dash.Size.RowHeight * 4,
            "line-height": this.line_height + "px",
            "min-height": this.min_height,
            "border-radius": this.border_radius,
            "border": this.border_size + "px solid " + this.color.Stroke
        });

        this.html.append(this.textarea);

        this.setup_connections();
    };

    this.AutoFocus = function () {
        this.textarea.attr("autofocus", "autofocus");
    };

    // Deliberately setting null as the default so that an empty string can be supplied
    this.GetText = function (line_break_replacement=null) {
        if (line_break_replacement === null && this.line_break_replacement !== null) {
            line_break_replacement = this.line_break_replacement;
        }

        var val = this.textarea.val();

        if (typeof line_break_replacement === "string") {
            return val.replaceAll("\n", line_break_replacement);
        }

        return val;
    };

    this.SetText = function (text) {
        this.textarea.val(text);

        if (this.auto_height) {
            (function (self) {
                requestAnimationFrame(function () {
                    self.auto_adjust_height();
                });
            })(this);
        }

        return text;
    };

    this.SetLineBreakReplacement = function (value="") {
        this.line_break_replacement = value;
    };

    this.Lock = function (restyle=true, text_and_border_color=null) {
        if (restyle) {
            if (!text_and_border_color) {
                text_and_border_color = this.color.StrokeLight;
            }

            var css = {"color": text_and_border_color};

            if (this.textarea.css("border-top") !== "none") {
                css["border"] = this.border_size + "px solid " + text_and_border_color;
            }

            else {
                css["border-bottom"] = this.border_size + "px solid " + text_and_border_color;
            }

            this.textarea.css(css);
        }

        this.textarea.prop("readOnly", true);
    };

    this.Unlock = function (restore_style=true) {
        if (restore_style) {
            var css = {"color": this.color.Text};

            if (this.textarea.css("border-top") !== "none") {
                css["border"] = this.border_size + "px solid " + this.color.Stroke;
            }

            else {
                css["border-bottom"] = this.border_size + "px solid " + this.color.Stroke;
            }

            this.textarea.css(css);
        }

        this.textarea.prop("readOnly", false);
    };

    this.StyleAsRow = function (bottom_border_only=false, _backup_line_break_replacement=" ") {
        this.min_height = Dash.Size.RowHeight;

        var css = {
            "height": this.min_height,
            "min-height": this.min_height,
            "max-height": this.min_height,
            "overflow-y": "hidden",
            "white-space": "nowrap"
        };

        if (bottom_border_only) {
            this.line_height = this.min_height * 0.75;

            css["border-top"] = "none";
            css["border-left"] = "none";
            css["border-right"] = "none";
            css["line-height"] = this.line_height + "px";
        }

        this.textarea.css(css);

        this.DisableNewLines(_backup_line_break_replacement);
    };

    this.DisableNewLines = function (_backup_line_break_replacement=" ") {
        (function (self) {
            self.textarea.on("keydown",function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();

                    self.fire_change_cb(true);
                }
            });
        })(this);

        // This shouldn't be necessary since we reroute the enter key event above, but just in case
        this.SetLineBreakReplacement(_backup_line_break_replacement);

        this.HideResizeHandle();
    };

    this.HideResizeHandle = function () {
        this.textarea.css({
            "resize": "none"
        });
    };

    this.SetInputMode = function (mode) {
        this.textarea.attr("inputmode", mode);

        if (mode === "email") {
            // This is supposed to happen when the mode is set to "email", but isn't happening automatically
            this.textarea.attr("autocapitalize", "off");
        }

        else if (mode === "numeric") {
            this.textarea.attr({
                "type": "number",
                "pattern": "[0-9]*",
                "step": "1",
                "min": "0"
            });
        }
    };

    this.StyleAsPIN = function (length=4, disable_auto_submit=false) {
        this.StyleAsRow();
        this.SetWidth(Dash.Size.ColumnWidth * 0.7);
        this.SetMaxCharacters(length);
        this.SetInputMode("numeric");

        if (disable_auto_submit) {
            this.DisableAutoSubmit();
        }

        this.min_height = Dash.Size.RowHeight * 2.25;
        this.line_height = Dash.Size.RowHeight * 1.8;

        this.textarea.css({
            "text-align": "center",
            "font-size": "350%",
            "padding-left": Dash.Size.Padding,
            "letter-spacing": (Dash.Size.Padding * 0.5) + "px",
            "height": this.min_height,
            "min-height": this.min_height,
            "max-height": this.min_height,
            "line-height": this.line_height + "px"
        });
    };

    this.SetMaxCharacters = function (num) {
        this.textarea.attr("maxlength", num);
    };

    this.SetHeight = function (height, enforce=false) {
        var css = {"height": height};

        if (enforce) {
            this.min_height = height;

            css["min-height"] = this.min_height;
            css["max-height"] = this.min_height;
        }

        this.textarea.css(css);
    };

    this.SetWidth = function (width) {
        this.html.css({
            "width": width
        });
    };

    this.InFocus = function () {
        return $(this.textarea).is(":focus");
    };

    this.Focus = function () {
        this.textarea.trigger("focus");
    };

    this.DisableAutoSubmit = function () {
        this.submit_override_only = true;
    };

    this.Flash = function () {
        if (this.flash_disabled) {
            return;
        }

        if (!this.flash_highlight) {
            this.flash_highlight = $("<div></div>");

            this.flash_highlight.css({
                "border": (this.border_size * 2) + "px solid " + (
                    Dash.IsMobile ? Dash.Color.Mobile.AccentSecondary : this.color.AccentGood
                ),
                "position": "absolute",
                "inset": 0,
                "opacity": 0,
                "pointer-events": "none",
                "border-radius": this.border_radius
            });

            this.html.append(this.flash_highlight);
        }

        this.flash_highlight.css({
            "height": (
                this.textarea.outerHeight() || this.textarea.innerHeight() || this.textarea.height()
            ) - (this.border_size * 4)
        });

        (function (self) {
            self.flash_highlight.stop().animate(
                {"opacity": 1},
                100,
                function () {
                    self.flash_highlight.stop().animate(
                        {"opacity": 0},
                        1000
                    );
                }
            );
        })(this);
    };

    this.AddLabel = function (text) {
        if (this.label) {
            return this.label;
        }

        this.label = $("<div>" + text + "</div>");

        this.label.css({
            "position": "absolute",
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "color": this.color.StrokeLight,
            "top": -Dash.Size.Padding * 0.8,
            "left": Dash.Size.Padding * 0.1
        });

        this.html.append(this.label);

        return this.label;
    };

    this.DisableFlash = function () {
        this.flash_disabled = true;
    };

    this.EnableAutoHeight = function (starting_value="", min_height=0, line_height=0, buffer_px=2) {
        this.auto_height = true;

        // No matter how many rows, it always appears to need a min of
        // two extra px to avoid scroll bar when auto-scaling like this
        this.auto_height_buffer_px = buffer_px;

        this.html.css({
            "height": "fit-content"
        });

        var textarea_css = {
            "height": "auto",
            "vertical-align": "top",
            "padding": 0,  // Top/bottom padding will make auto-scaling less accurate
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5
        };

        if (min_height) {
            this.min_height = min_height;

            textarea_css["min-height"] = this.min_height;
        }

        if (line_height) {
            this.line_height = line_height;

            textarea_css["line-height"] = this.line_height + "px";
        }

        this.textarea.css(textarea_css);

        this.HideResizeHandle();

        if (starting_value) {
            this.textarea.SetText(starting_value);
        }
    };

    this.auto_adjust_height = function () {
        if (!this.auto_height) {
            return;
        }

        var value = this.GetText();

        if (value) {
            var height = this.textarea[0].scrollHeight || this.min_height;

            // For some reason, textareas' scroll height will never be less
            // than the height of two rows without manual intervention, so
            // if it's two (ish) lines, we need to check if it should actually be one
            if (this.line_height < height <= (this.line_height * 2)) {
                // This is only a rough estimate based on average char width, but it's the best option available
                var max_chars_in_one_line = Math.floor(this.textarea.width() / this.get_average_char_width());
                var lines = Math.ceil(value.length / max_chars_in_one_line);

                if (lines < 2) {
                    height = this.min_height;
                }
            }

            // Have to set it to auto first for this to work
            this.SetHeight("auto");
            this.SetHeight(height + this.auto_height_buffer_px);
        }

        else {
            // When empty, the above logic doesn't work and doubles the height by default
            this.SetHeight(this.min_height + this.auto_height_buffer_px);
        }
    };

    this.get_average_char_width = function () {
        if (this.avg_char_width) {
            return this.avg_char_width;
        }

        this.avg_char_width = Dash.Utils.GetAverageCharWidth(this.textarea);

        return this.avg_char_width;
    };

    this.setup_connections = function () {
        // Important note:
        // When testing on a desktop's mobile view, you can't select the text with the
        // mouse in the traditional way, since it's simulating a mobile device. To select
        // the text, click and hold to simulate a long press like you would on mobile.

        (function (self) {
            self.textarea.on("change", function () {
                self.fire_change_cb();
            });

            self.textarea.on("input", function () {
                self.fire_change_cb();
            });

            self.textarea.on("paste", function () {
                self.fire_change_cb();
            });

            self.textarea.on("blur", function () {
                self.fire_change_cb(true);
            });

            self.textarea.on("keydown",function (e) {
                if (self.on_change_cb && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                    self.last_arrow_navigation_ts = new Date();
                }
            });
        })(this);
    };

    this.fire_change_cb = function (submit_override=false) {
        this.auto_adjust_height();

        if (!this.on_change_cb || (this.submit_override_only && !submit_override)) {
            return;
        }

        var value = this.GetText();

        if (!submit_override && this.last_change_value === value) {
            return;
        }

        this.last_change_value = value;

        if (submit_override || !this.delay_change_cb) {
            if (submit_override) {
                this.clear_change_timeout();
            }

            this.fire_on_change_cb(submit_override, value);

            return;
        }

        this.last_change_ts = new Date();

        this.clear_change_timeout();

        (function (self) {
            self.change_timeout = setTimeout(
                function () {
                    self._fire_change_cb();
                },
                self.change_delay_ms
            );
        })(this);
    };

    this.clear_change_timeout = function () {
        if (this.change_timeout) {
            clearTimeout(this.change_timeout);

            this.change_timeout = null;
        }
    };

    this._fire_change_cb = function () {
        var now = new Date();

        // Reset attempt if, after a change, the user navigated using the arrow keys during the time window
        if (this.last_arrow_navigation_ts !== null) {
            if (this.last_change_ts < this.last_arrow_navigation_ts < now) {
                if (now - this.last_arrow_navigation_ts < this.change_delay_ms) {
                    this.fire_change_cb();

                    return;
                }
            }
        }

        this.fire_on_change_cb(true);
    };

    this.fire_on_change_cb = function (flash=false, text="") {
        if (!this.on_change_cb) {
            return;
        }

        if (!text) {
            text = this.GetText();
        }

        if (flash) {
            this.Flash();
        }

        this.on_change_cb(text, this);
    };

    this.setup_styles();
}
