/**@member DashGuiInputBase*/

function DashGuiInput (placeholder_text="", color=null) {
    this.placeholder = placeholder_text;

    DashGuiInputBase.call(this, color, true, true);

    this.vis_reset_ms = 60000;
    this.vis_reset_timer = null;
    this.visibility_toggle = null;
    this.require_auth_for_vis_toggle = false;
    this.input = $("<input>", {"class": this.color.PlaceholderClass});

    this.setup_styles = function () {
        // Have to do it here instead of inline to solve for any single quotations (escaping doesn't work inline)
        this.SetPlaceholder(this.placeholder);

        this.html.css({
            "height": this.height,
            "background": this.color.Input.Background.Base,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "padding": 0,
            "margin": 0,
            "text-align": "left",

            // DON'T REPLACE THIS WITH BORDER
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, " + (Dash.Color.IsDark(this.color) ? 0.1 : 0.2) + ")"
        });

        this.input.css({
            "background": "rgba(0, 0, 0, 0)",  // Why?
            "line-height": this.height + "px",
            "width": "100%",
            "height": "100%",
            "padding-left": Dash.Size.Padding,
            "color": this.color.Text,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "font-size": Dash.Size.DesktopToMobileMode ? "75%" : "100%",

            // These css properties should probably be the default, but I don't want to break anything
            // "padding-left": Dash.Size.Padding * 0.5,
            // "padding-right": Dash.Size.Padding * 0.5,
            // "width": "calc(100% - " + Dash.Size.Padding + "px)"
        });

        this.html.append(this.input);

        this.parse_input_type();
        this.setup_connections();
    };

    // This is mirrored in DashMobileTextBox
    this.SetInputMode = function (mode) {
        this.input.attr("inputmode", mode);

        if (mode === "email") {
            // This is supposed to happen when the mode is set to "email", but isn't happening automatically
            this.input.attr("autocapitalize", "off");
        }

        else if (mode === "numeric") {
            this.input.attr({
                "type": "number",
                "pattern": "[0-9]*",
                "step": "1",
                "min": "0"
            });
        }
    };

    this.SetPlaceholder = function (placeholder_text) {
        this.input.attr("placeholder", placeholder_text);
    };

    this.SetMaxCharacters = function (num) {
        this.input.attr("maxlength", num);
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

    // DEPRECATED - Use SetOnChange instead
    this.OnChange = function (callback, bind_to) {
        this.SetOnChange(callback, bind_to);
    };

    // DEPRECATED - Use SetOnAutosave instead
    this.OnAutosave = function (callback, bind_to) {
        this.SetOnAutosave(callback, bind_to);
    };

    // DEPRECATED - Use SetOnSubmit instead
    this.OnSubmit = function (callback, bind_to) {
        this.SetOnSubmit(callback, bind_to);
    };

    this.AddVisibilityToggle = function () {
        this._toggle_visibility(true);

        var comp = this.get_vis_toggle_pad();

        this.visibility_toggle = new Dash.Gui.Checkbox(
            "",
            true,
            this.color,
            "Toggle visibility",
            this,
            () => {
                if (this.require_auth_for_vis_toggle && !this.visibility_toggle.IsChecked() && this.Text()) {
                    this.auth_for_vis_toggle();
                }

                else {
                    this._toggle_visibility();
                }
            }
        );

        this.visibility_toggle.SetTrueIconName("hidden", "Show");
        this.visibility_toggle.SetFalseIconName("visible", "Hide");

        this.visibility_toggle.AddHighlight(
            0,
            false,
            {
                "left": comp,
                "right": comp
            }
        );

        this.visibility_toggle.html.css({
            "position": "absolute",
            "top": 0,
            "right": 0,
            "border-radius": Dash.Size.BorderRadius
        });

        this.html.append(this.visibility_toggle.html);

        requestAnimationFrame(() => {
            this.visibility_toggle.SetIconSize(Dash.IsMobile ? 140 : 110, this.html.height());

            this.input.css({
                "width": "calc(100% - " + (Dash.Size.RowHeight + (comp * (Dash.IsMobile ? 5 : 3))) + "px)"
            });
        });
    };

    this.EnableAuthForVisToggle = function () {
        this.require_auth_for_vis_toggle = true;

        this._toggle_visibility(true);
    };

    this.DisableAuthForVisToggle = function () {
        this.require_auth_for_vis_toggle = false;

        this.SetLocked(false);
    };

    this.SetVisResetMS = function (ms) {
        this.vis_reset_ms = ms;
    };

    // Override
    this.parse_value = function (value, data_key="") {
        if (value === null || value === undefined) {
            return "";
        }

        if (value === false) {
            return value.toString();  // Keep this value intact, protect against '!'
        }

        // Initial value is a dict or array
        if (Dash.Validate.Object(value)) {
            return JSON.stringify(value);
        }

        // Initial value is ISO datetime string
        if (Dash.DateTime.IsIsoFormat(value)) {
            return Dash.DateTime.Readable(value, false);
        }

        // Initial value is team member email
        if (data_key && !(data_key.includes("email")) && Dash.Validate.Email(value)) {
            if ("team" in Dash.User.Init && value in Dash.User.Init["team"]) {
                if ("display_name" in Dash.User.Init["team"][value]) {
                    return Dash.User.Init["team"][value]["display_name"];
                }
            }
        }

        return value;
    };

    this.parse_input_type = function () {
        var placeholder = this.placeholder.toString().toLowerCase();

        // Don't handle password type here, it gets handled further below
        var type = (
              placeholder.includes("email") ? "email"
            : ""
        );

        if (type === "numeric") {
            if (Dash.IsMobile) {
                this.input.attr({
                    "type": "number",
                    "pattern": "[0-9]*",
                    "step": "1",
                    "min": "0"
                });
            }
        }

        else if (type) {
            this.input.attr("type", type);
        }

        if (type === "email") {
            // This is supposed to happen when the mode is set to "email", but isn't happening automatically
            this.input.attr("autocapitalize", "off");
        }

        else if (placeholder.includes("password")) {
            this.EnableAuthForVisToggle();
            this.AddVisibilityToggle();
        }
    };

    this.get_vis_toggle_pad = function () {
        return Dash.Size.Padding * (Dash.IsMobile ? 0.25 : 0.5);
    };

    this.auth_for_vis_toggle = function () {
        // Declare these early to ref in cb
        var input;
        var prompt;

        prompt = new Dash.Gui.Prompt(
            (selected_index) => {
                if (selected_index === 0) {  // Cancel
                    this.visibility_toggle.Toggle(true);

                    prompt.Remove();
                }

                else if (selected_index === 1) {
                    var value = input.Text();

                    input.input.css({
                        "background": "rgba(0, 0, 0, 0)"
                    });

                    if (!value) {
                        var border_size = Dash.Size.Padding * 0.2;

                        input.html.css({
                            "border":  border_size + "px solid " + prompt.color.AccentBad,

                            // Do it this way instead of 'box-sizing: border' so we don't make the input smaller
                            "margin-top": -border_size * 0.5,
                            "margin-left": -border_size * 0.5
                        });

                        return;
                    }

                    input.html.css({
                        "border": "",
                        "margin": 0
                    });

                    this._auth_for_vis_toggle(value, input, prompt);
                }
            },
            Dash.Size.ColumnWidth * 3,
            Dash.Size.ColumnWidth * 1.05,
            "",
            "Please confirm your login password to reveal this"
        );

        prompt.DisableRemoveOnSelection();

        input = new Dash.Gui.Input("Password", prompt.color);

        input.DisableAuthForVisToggle();

        var comp = this.get_vis_toggle_pad();

        input.visibility_toggle.html.css({
            "right": comp
        });

        input.input.css({
            "border-top-left-radius": Dash.Size.BorderRadiusInteractive,
            "border-bottom-left-radius": Dash.Size.BorderRadiusInteractive
        });

        prompt.AddHTML(input.html);

        setTimeout(
            () => {
                input.visibility_toggle.SetIconSize(Dash.IsMobile ? 140 : 110, input.html.height());

                input.input.css({
                    "width": "calc(100% - " + (Dash.Size.RowHeight + (comp * (Dash.IsMobile ? 6 : 4))) + "px)"
                });

                input.Focus();
            },
            300
        );
    };

    this.set_vis_reset_timer = function () {
        if (this.vis_reset_timer) {
            clearTimeout(this.vis_reset_timer);
        }

        this.vis_reset_timer = setTimeout(
            () => {
                if (this.visibility_toggle.IsChecked()) {
                    return;
                }

                this.visibility_toggle.Toggle(true);

                this._toggle_visibility();
            },
            this.vis_reset_ms
        );
    };

    this._auth_for_vis_toggle = function (password, input, prompt) {
        prompt.cancel_button.Disable();

        prompt.continue_button.Disable();
        prompt.continue_button.SetLoading(true);

        Dash.Request(
            this,
            (response) => {
                prompt.cancel_button.Enable();

                prompt.continue_button.Enable();
                prompt.continue_button.SetLoading(false);

                if (!response?.["authenticated"]) {
                    input.input.css({
                        "background": prompt.color.AccentBad
                    });

                    return;
                }

                input.input.css({
                    "background": "rgba(0, 0, 0, 0)"
                });

                prompt.Remove();

                this._toggle_visibility();
                this.set_vis_reset_timer();
            },
            "Users",
            {
                "f": "validate_credentials",
                "email": Dash.User.Data["email"],
                "password": password
            }
        );
    };

    this._toggle_visibility = function (concealed=null) {
        if (typeof concealed !== "boolean") {
            concealed = this.visibility_toggle.IsChecked();
        }

        this.input.attr("type", concealed ? "password" : "text");

        if (concealed && this.vis_reset_timer) {
            clearTimeout(this.vis_reset_timer);
        }

        this.SetLocked(this.require_auth_for_vis_toggle ? concealed : false);
    };

    this.setup_styles();
}
