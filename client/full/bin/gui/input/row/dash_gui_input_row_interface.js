/**@member DashGuiInputRow*/

function DashGuiInputRowInterface () {
    this.AddKeyCopyButton = function (data_key="") {
        if (!data_key) {
            data_key = this.data_key;
        }

        if (!data_key) {
            Dash.Log.Warn("No data key assigned to this input, skipping key copy button...");

            return;
        }

        var size = this.height * 0.5;
        var right_margin = Dash.Size.Padding * 0.3;
        var button = Dash.Gui.GetKeyCopyButton(size, data_key, this.color);

        this.highlight.css({
            "right": size + right_margin
        });

        this.flash_save.css({
            "right": size + right_margin
        });

        this.html.append(button.html);

        return button;
    };

    this.InFocus = function () {
        return (this.input && this.input.InFocus());
    };

    this.Focus = function () {
        this.input.Focus();
    };

    this.DisableAutosave = function () {
        this.input.DisableAutosave();
    };

    this.SetAutosaveDelayMs = function (ms) {
        this.input.SetAutosaveDelayMs(ms);
    };

    this.Disable = function (opacity=0.5) {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "opacity": opacity,
            "pointer-events": "none",
            "user-select": "none"
        });
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
    };

    this.DisableHighlight = function () {
        this.html.off("mouseenter");
        this.html.off("mouseleave");

        this.highlight.remove();

        this.highlight = null;

        return this;
    };

    this.SetInputValidity = function (input_is_valid) {
        // Dash.Log.Log("input_is_valid: " + input_is_valid, "\n", this.color);

        if (input_is_valid) {
            this.invalid_input_highlight.stop().animate({"opacity": 0}, 100);
        }

        else {
            this.invalid_input_highlight.stop().animate({"opacity": 1}, 100);
        }
    };

    this.FlashSave = function () {
        (function (self) {
            self.flash_save.stop().animate({"opacity": 1}, 100, function () {
                self.flash_save.stop().animate({"opacity": 0}, 1000);
            });
        })(this);
    };

    this.AddEndTag = function (text, css={}) {
        this.end_tag = $("<div>" + text + "</div>");

        this.end_tag.css({
            "color": this.color.Stroke,
            "font-family": "sans_serif_italic",
            "height": this.height,
            "line-height": this.height + "px",
            "user-select": "none",
            "pointer-events": "none",
            "flex": "none",
            ...css
        });

        this.html.append(this.end_tag);

        (function (self) {
            setTimeout(
                function () {
                    var right = self.end_tag.width() + Dash.Size.Padding;

                    self.highlight.css({
                        "right": right
                    });

                    self.flash_save.css({
                        "right": right
                    });
                },
                250
            );
        })(this);
    };

    this.SetupCombo = function (combo_options) {
        this.initial_value = this.initial_value || combo_options[0]["id"];

        this.input.html.css({
            "opacity": 0,
            "user-select": "none",
            "pointer-events": "none",
            "position": "absolute",
            "left": 0,
            "top": 0,

        });

        var options = {};
        options["list"] = combo_options;
        // options["selected"] = ComboUtils.GetDataFromID(combo_options, this.initial_value);
        options["thin_style"] = true;
        options["text_alignment"] = "left";
        options["label_style"] = "light";
        options["label_transparent"] = true;

        this.combo = new Combo(this, "", options, this.on_combo_changed, this);

        this.html.append(this.combo.html);
    };

    this.CanAutoUpdate = function () {
        var highlight_opacity = parseFloat("" + this.highlight.css("opacity"));

        if (highlight_opacity > 0.2) {
            return false;
        }

        return !this.save_button_visible;
    };

    this.SetText = function (text) {
        this.input.SetText(text, this.data_key);

        this.input_changed(true);

        if (this.input.autosave_timeout) {
            clearTimeout(this.input.autosave_timeout);

            this.input.autosave_timeout = null;
        }

        if (this.load_dots) {
            this.load_dots.Stop();
        }

        this.hide_save_button();
    };

    this.Text = function () {
        return this.input.Text();
    };

    this.Request = function (endpoint, params, callback, binder) {
        if (this.input.autosave_timeout) {
            clearTimeout(this.input.autosave_timeout);

            this.input.autosave_timeout = null;

            Dash.Log.Log("Cleared input autosave timeout");
        }

        this.request_callback = callback;
        this.request_callback_binder = binder;

        return (function (self, endpoint, params) {
            if (self.button) {
                return self.button.Request(
                    endpoint,
                    params,
                    function (response) {
                        self.on_request_response(response);
                    },
                    self
                );
            }

            return Dash.Request(
                self,
                function (response) {
                    self.on_request_response(response);
                },
                endpoint,
                params
            );
        })(this, endpoint, params);
    };

    this.SetLocked = function (is_locked) {
        if (is_locked) {
            this.DisableSaveButton();
        }

        else {
            this.EnableSaveButton();
        }
    };

    this.EnableSaveButton = function () {
        if (this.button) {
            this.button.SetButtonVisibility(true);
        }

        this.input.SetLocked(false);
        this.input.SetTransparent(true);
    };

    this.DisableSaveButton = function () {
        if (this.button) {
            this.button.SetButtonVisibility(false);
        }

        this.input.SetLocked(true);
    };

    this.RemoveSaveButton = function () {
        if (!this.button) {
            return;
        }

        this.button.html.remove();

        this.button = null;

        return this;
    };

    this.IsLoading = function () {
        if (this.button) {
            return this.button.IsLoading();
        }

        else {
            return false;
        }
    };

    this.SetAlignRight = function () {
        var spacer = $("<div></div>");

        this.html.prepend(spacer);

        spacer.css({
            "flex-grow": 1
        });

        this.html.css({
            "padding-right": Dash.Size.Padding
        });

        this.label.css({
            "width": "auto"
        });
    };

    this.AddIconButton = function (icon_name, callback, binder, data_key=null) {
        callback = callback.bind(binder);

        var button = new Dash.Gui.IconButton(
            icon_name,
            function () {
                callback(data_key);
            },
            this,
            this.color,
            {"size_mult": 0.9}
        );

        button.html.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "height": this.height,
            "width": this.height
        });

        this.html.append(button.html);

        this.icon_button_count += 1;

        // We need to leave space for the save button to coexist with this new button
        if (this.button) {
            this.button.html.css("margin-right", Dash.Size.Padding * (3 * this.icon_button_count));
        }

        return button;
    };

    this.AddLockToggle = function (data_key) {
        var icon_name = "unlock_alt";

        // Only start locked if text exists already
        if (this.Text()) {
            this.locked = true;

            icon_name = "lock";
        }

        this.lock_button = this.AddIconButton(icon_name, this.toggle_lock, this, data_key);
    };
}
