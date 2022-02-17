function DashMobileTextBox (color=null, placeholder_text="", binder=null, on_change_cb=null, delay_change_cb=false) {
    this.color = color || Dash.Color.Light;
    this.placeholder_text = placeholder_text;
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;
    this.delay_change_cb = delay_change_cb;

    this.border_size = 1;
    this.last_change_ts = null;
    this.change_timeout = null;
    this.flash_highlight = null;
    this.change_delay_ms = 1500;  // Same as DashGuiInput's autosave delay
    this.html = $("<div></div>");
    this.last_change_value = null;
    this.line_break_replacement = null;
    this.last_arrow_navigation_ts = null;
    this.border_radius = Dash.Size.BorderRadius * 0.5;

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
            "padding": Dash.Size.Padding * 0.5,
            "box-sizing": "border-box",
            "width": "100%",
            "min-width": "100%",
            "max-width": "100%",
            "height": Dash.Size.RowHeight * 4,
            "min-height": Dash.Size.RowHeight * 1.6,  // Just before a scrollbar appears when it's empty
            "border-radius": this.border_radius,
            "border": this.border_size.toString() + "px solid " + this.color.Stroke
        });

        this.html.append(this.textarea);

        this.setup_connections();
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
        return this.textarea.val(text);
    };

    this.SetLineBreakReplacement = function (value="") {
        this.line_break_replacement = value;
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

            self.textarea.on("keydown",function (e) {
                if (self.on_change_cb && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                    self.last_arrow_navigation_ts = new Date();
                }
            });
        })(this);
    };

    this.fire_change_cb = function () {
        if (!this.on_change_cb) {
            return;
        }

        var value = this.GetText();

        if (this.last_change_value === value) {
            return;
        }

        this.last_change_value = value;

        if (!this.delay_change_cb) {
            // This won't be null at this point, but just in case
            if (this.on_change_cb) {
                this.on_change_cb(value);
            }

            return;
        }

        this.last_change_ts = new Date();

        if (this.change_timeout) {
            clearTimeout(this.change_timeout);

            this.change_timeout = null;
        }

        (function (self) {
            self.change_timeout = setTimeout(
                function () {
                    self._fire_change_cb();
                },
                self.change_delay_ms
            );
        })(this);
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

        // This won't be null at this point, but just in case
        if (this.on_change_cb) {
            this.flash();
            this.on_change_cb(this.GetText());
        }
    };

    this.flash = function () {
        if (!this.flash_highlight) {
            this.flash_highlight = $("<div></div>");

            this.flash_highlight.css({
                "border": (this.border_size * 2).toString() + "px solid " + Dash.Color.Mobile.AccentSecondary,
                "position": "absolute",
                "inset": 0,
                "opacity": 0,
                "pointer-events": "none",
                "border-radius": this.border_radius
            });

            this.html.append(this.flash_highlight);
        }

        this.flash_highlight.css({
            "height": (this.textarea.outerHeight() || this.textarea.innerHeight() || this.textarea.height()) - (this.border_size * 4)
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

    this.setup_styles();
}
