function DashGuiInput (placeholder_text, color) {
    this.placeholder = placeholder_text;
    this.color = color || Dash.Color.Light;

    this.autosave = false;
    this.blur_enabled = null;
    this.last_submit_ts = null;
    this.skip_next_blur = false;
    this.html = $("<div></div>");
    this.autosave_timeout = null;
    this.autosave_delay_ms = 1500;
    this.last_submitted_text = "";
    this.on_change_callback = null;
    this.on_submit_callback = null;
    this.skip_next_autosave = false;
    this.on_autosave_callback = null;
    this.previous_submitted_text = "";
    this.last_arrow_navigation_ts = null;
    this.submit_called_from_autosave = false;

    if (this.placeholder.toString().toLowerCase().includes("password")) {
        this.input = $("<input class='" + this.color.PlaceholderClass + "' type=password placeholder='" + this.placeholder + "'>");
    }

    else {
        this.input = $("<input class='" + this.color.PlaceholderClass + "' placeholder='" + this.placeholder + "'>");
    }

    this.setup_styles = function () {
        this.html.append(this.input);

        this.html.css({
            "height": Dash.Size.RowHeight,
            "background": this.color.Input.Background.Base,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "padding-right": Dash.Size.Padding,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "padding": 0,
            "margin": 0,
        });

        this.input.css({
            "background": "rgba(0, 0, 0, 0)",
            "line-height": Dash.Size.RowHeight + "px",
            "width": "100%",
            "height": "100%",
            "padding-left": Dash.Size.Padding,
            "color": this.color.Text,
        });
    };

    this.InFocus = function () {
        return $(this.input).is(":focus");
    };

    this.SetAutosaveDelayMs = function (ms) {
        this.autosave_delay_ms = parseInt(ms);
    };

    this.EnableAutosave = function () {
        this.autosave = true;
    };

    this.DisableAutosave = function () {
        this.autosave = false;
    };

    this.DisableBlurSubmit = function () {
        this.input.off("blur");

        this.blur_enabled = false;
    };

    // Enabled by default - this is to re-enable it if disabled
    this.EnableBlurSubmit = function () {
        (function (self) {
            self.input.on("blur", function () {
                if (self.skip_next_blur) {
                    self.skip_next_blur = false;

                    return;
                }

                if (self.Text().toString() !== self.last_submitted_text.toString()) {
                    self.on_submit();
                }
            });
        })(this);

        this.blur_enabled = true;
    };

    // This is primarily intended to be called on error by Dash.Validate.Response
    this.SkipNextBlur = function () {
        if (this.blur_enabled) {
            this.skip_next_blur = true;
        }
    };

    // This is primarily intended to be called on error by Dash.Validate.Response
    this.SkipNextAutosave = function () {
        if (this.autosave) {
            this.skip_next_autosave = true;
        }
    };

    this.SetLocked = function (is_locked) {
        if (is_locked) {
            this.input.prop("readOnly", true);

            // Prevent navigating to locked box via tab
            this.input[0].tabIndex = "-1";  // Shouldn't this be a number, not a string? (-1)
        }

        else {
            this.input.prop("readOnly", false);
        }
    };

    this.SetDarkMode = function (dark_mode_on) {
        if (dark_mode_on) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });

            this.input.css({
                "color": "rgba(255, 255, 255, 0.9)",
            });
        }
    };

    this.SetTransparent = function (is_transparent) {
        if (is_transparent) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });
        }

        return this;
    };

    this.Text = function () {
        return this.input.val();
    };

    this.SetText = function (text) {
        this.last_val = text;
        this.last_submitted_text = text;

        return this.input.val(text);
    };

    this.SetOnChange = function (callback, bind_to) {
        this.on_change_callback = callback.bind(bind_to);
    };

    this.SetOnAutosave = function (callback, bind_to) {
        this.on_autosave_callback = callback.bind(bind_to);
    };

    this.SetOnSubmit = function (callback, bind_to) {
        this.on_submit_callback = callback.bind(bind_to);
    };

    // DEPRECATED
    this.OnChange = function (callback, bind_to) {
        this.on_change_callback = callback.bind(bind_to);
    };

    // DEPRECATED
    this.OnAutosave = function (callback, bind_to) {
        this.on_autosave_callback = callback.bind(bind_to);
    };

    // DEPRECATED
    this.OnSubmit = function (callback, bind_to) {
        this.on_submit_callback = callback.bind(bind_to);
    };

    this.Focus = function () {
        this.input.trigger("focus");
    };

    // Fired if the box is clicked on or the user is typing
    this.on_change = function () {
        var changed = false;
        var text = this.Text().toString();

        if (this.last_val) {
            changed = text !== this.last_val.toString();
        }

        else {
            if (text) {
                changed = true;
            }
        }

        this.last_val = text;

        if (!changed) {
            return;
        }

        if (this.autosave) {
            this.last_change_ts = new Date();

            this.attempt_autosave();
        }

        else {
            if (!this.on_change_callback) {
                return;
            }

            this.on_change_callback();
        }
    };

    // Fired on 'enter' or 'paste'
    this.on_submit = function (from_autosave=false) {
        if (from_autosave) {
            if (!this.on_autosave_callback) {
                return;
            }
        }

        else {
            if (!this.on_submit_callback) {
                return;
            }
        }

        // Store the previous value, so we can reset the input value from
        // Dash.ValidateInput, in case the new value throws an error
        this.previous_submitted_text = this.last_submitted_text;

        // Also, important in case Dash.ValidateInput throws an error
        this.submit_called_from_autosave = from_autosave;

        Dash.Temp.SetLastInputSubmitted(this);

        if (from_autosave) {
            this.on_autosave_callback();
        }

        else {
            this.on_submit_callback();

            // Don't store this on autosave
            this.last_submit_ts = new Date();
        }

        this.last_submitted_text = this.Text();
    };

    this.attempt_autosave = function () {
        if (this.autosave_timeout) {
            clearTimeout(this.autosave_timeout);

            this.autosave_timeout = null;
        }

        (function (self) {
            self.autosave_timeout = setTimeout(
                function () {
                    self._attempt_autosave();
                },
                self.autosave_delay_ms
            );
        })(this);
    };

    this._attempt_autosave = function () {
        var now = new Date();

        // Don't fire if the user manually submitted a change in the autosave time window
        if (this.last_submit_ts !== null) {
            if (this.last_change_ts < this.last_submit_ts < now) {
                if (now - this.last_submit_ts < this.autosave_delay_ms) {
                    return;
                }
            }
        }

        // Reset autosave attempt if, after a change, the user navigated using the arrow keys during the autosave time window
        if (this.last_arrow_navigation_ts !== null) {
            if (this.last_change_ts < this.last_arrow_navigation_ts < now) {
                if (now - this.last_arrow_navigation_ts < this.autosave_delay_ms) {
                    this.attempt_autosave();

                    return;
                }
            }
        }

        // In case autosave is toggled while there are active timers
        if (!this.autosave) {
            return;
        }

        if (this.skip_next_autosave) {
            this.skip_next_autosave = false;

            return;
        }

        if (this.on_autosave_callback) {
            this.on_submit(true);
        }

        else {
            this.on_submit();
        }
    };

    this.setup_connections = function () {
        (function (self) {
            self.input.on("click", function (event) {
                event.preventDefault();

                return false;
            });

            self.input.on("keydown",function (e) {
                if (self.autosave && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                    self.last_arrow_navigation_ts = new Date();
                }

                else if (e.key === "Enter") {
                    self.on_submit();
                }
            });

            self.input.on("change", function () {
                self.on_change();
            });

            self.input.on("paste", function () {
                self.on_change();
            });

            self.input.on("keyup click", function () {
                self.on_change();
            });
        })(this);

        this.EnableBlurSubmit();
    };

    this.setup_styles();
    this.setup_connections();
}
