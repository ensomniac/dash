function DashGuiInput (placeholder_text, color) {
    this.placeholder = placeholder_text;
    this.color = color || Dash.Color.Light;

    this.autosave = false;
    this.last_submit_ts = null;
    this.autosave_delay_ms = 1500;
    this.html = $("<div></div>");
    this.autosave_timeout = null;
    this.last_submitted_text = "";
    this.on_change_callback = null;
    this.on_submit_callback = null;
    this.on_autosave_callback = null;
    this.being_navigated_by_arrow_keys = false;

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
    };

    this.SetLocked = function (is_locked) {
        if (is_locked) {
            this.input.css({"pointer-events": "none"});

            // Prevent navigating to locked box via tab
            this.input[0].tabIndex = "-1";
        }

        else {
            this.input.css({"pointer-events": "auto"});
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

    this.OnChange = function (callback, bind_to) {
        this.on_change_callback = callback.bind(bind_to);
    };

    this.OnAutosave = function (callback, bind_to) {
        this.on_autosave_callback = callback.bind(bind_to);
    };

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
            if (this.autosave_timeout) {
                clearTimeout(this.autosave_timeout);

                this.autosave_timeout = null;
            }

            // TODO: Return if now minus this.last_submit_ts is less than autosave_delay_ms
            // TODO: Return if this.being_navigated_by_arrow_keys

            (function (self) {
                // This timeout is intentionally pretty long since the field will auto save if the
                // box was changed when the user clicks out of it as well. This longer timeout
                // helps prevent the weird anxiety that comes with the field saving on a brief typing pause
                self.autosave_timeout = setTimeout(
                    function () {
                        if (self.on_autosave_callback) {
                            self.on_autosave_callback();
                        }

                        else {
                            self.on_submit();
                        }
                    },
                    self.autosave_delay_ms
                );
            })(this);
        }

        else {
            if (!this.on_change_callback) {
                return;
            }

            this.on_change_callback();
        }
    };

    // Fired on 'enter' or 'paste'
    this.on_submit = function () {
        if (!this.on_submit_callback) {
            return;
        }

        this.on_submit_callback();

        this.last_submit_ts = new Date();
        this.last_submitted_text = this.Text();
    };

    this.setup_connections = function () {
        (function (self) {
            self.input.on("click", function (event) {
                event.preventDefault();

                return false;
            });

            self.input.on("keydown",function (e) {
                console.log("TEST keydown", e.key, e);

                self.being_navigated_by_arrow_keys = e.key === "ArrowLeft" || e.key === "ArrowRight";

                if (e.key === "Enter") {
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

            self.input.on("blur", function () {
                if (self.input.val() !== self.last_submitted_text) {
                    self.on_submit();
                }
            });
        })(this);
    };

    this.setup_styles();
    this.setup_connections();
}
