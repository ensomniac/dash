/**@member DashGuiInputRow*/

function DashGuiInputRowInterface () {
    this.DisableAutosave = function () {
        this.input.DisableAutosave();
    };

    this.SetAutosaveDelayMs = function (ms) {
        this.input.SetAutosaveDelayMs(ms);
    };

    this.SetInputValidity = function (input_is_valid) {
        console.log("input_is_valid: " + input_is_valid, "\n", this.color);

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

            console.log("Cleared input autosave timeout");
        }

        var request = null;

        this.request_callback = callback;
        this.request_callback_binder = binder;

        (function (self, endpoint, params) {
            request = self.button.Request(
                endpoint,
                params,
                function (response) {
                    self.on_request_response(response);
                },
                self
            );
        })(this, endpoint, params);

        return request;
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
            "flex-grow": 1,
        });

        this.html.css({
            "padding-right": Dash.Size.Padding,
        });

        this.label.css({
            "width": "auto",
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
            "height": Dash.Size.RowHeight,
            "width": Dash.Size.RowHeight,
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
