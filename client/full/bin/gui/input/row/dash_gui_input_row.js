function DashGuiInputRow (
    label_text, initial_value, placeholder_text, button_text, on_click, on_click_bind, color=null, data_key=""
) {
    this.label_text = label_text;
    this.initial_value = initial_value;
    this.placeholder_text = placeholder_text;
    this.button_text = button_text || "Save";
    this.on_click = on_click;
    this.on_click_bind = on_click_bind;
    this.color = color || (on_click_bind && on_click_bind.color ? on_click_bind.color : Dash.Color.Light);
    this.data_key = data_key;

    this.end_tag                 = null;
    this.disabled                = false;
    this.icon_button_count       = 0;
    this.html                    = $("<div></div>");
    this.save_button_visible     = false;
    this.height                  = Dash.Size.RowHeight;
    this.highlight               = $("<div></div>");
    this.flash_save              = $("<div></div>");
    this.invalid_input_highlight = $("<div></div>");
    this.on_label_click_url      = null;

    // For lock toggle
    this.locked = false;
    this.lock_button = null;

    DashGuiInputRowInterface.call(this);

    this.setup_styles = function () {
        this.html.append(this.invalid_input_highlight);
        this.html.append(this.highlight);
        this.html.append(this.flash_save);

        this.label = $("<div>" + this.label_text + ": </div>");
        this.input = new Dash.Gui.Input(this.placeholder_text, this.color);

        this.input.EnableAutosave();
        this.input.SetTransparent(true);

        this.set_initial_text();

        this.input.input.css({
            "padding-left": Dash.Size.Padding * 0.5
        });

        this.input.SetOnChange(this.input_changed, this);
        this.input.SetOnAutosave(this.trigger_autosave, this);

        this.html.append(this.label);
        this.html.append(this.input.html);

        var highlight_color = this.color.AccentGood;

        if (this.on_click) {
            this.input.SetOnSubmit(this.on_submit, this);

            this.create_save_button();
        }

        else {
            this.input.SetLocked(true);

            highlight_color = this.color.AccentBad;
        }

        this.html.css({
            "cursor": "auto",
            "height": this.height,
            "display": "flex",
            "border-bottom": "1px dotted " + this.color.PinstripeDark
        });

        this.invalid_input_highlight.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding * 0.5,
            "background": this.color.AccentBad,
            "opacity": 0
        });

        this.highlight.css({
            "position": "absolute",
            "inset": 0,
            "background": highlight_color,
            "border-radius": Dash.Size.BorderRadius,
            "opacity": 0
        });

        this.flash_save.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": Dash.Color.SaveHighlight,
            "opacity": 0
        });

        this.input.html.css({
            "flex-grow": 2,
            "margin-right": Dash.Size.Padding
        });

        this.label.css({
            "height": this.height,
            "line-height": this.height + "px",
            "text-align": "left",
            "color": this.color.Text,
            "font-family": "sans_serif_bold",
            "font-size": Dash.Size.DesktopToMobileMode ? "60%" : "80%",
            "flex": "none"
        });

        if (Array.isArray(this.button_text)) {
            this.SetupCombo(this.button_text);
        }

        this.update_label_cursor();
    };

    this.SetLabelURL = function (url) {

        this.on_label_click_url = url;

        if (!this.label_url_hover) {
            this.setup_label_url_hover();
        };

    };

    this.setup_label_url_hover = function () {

        this.label.css({
            "cursor": "pointer",
        });

        this.label_url_hover = $("<div></div>");
        this.label_url_hover.css({
            "width":          this.height,
            "height":         this.height,
            "position":       "absolute",
            "left":           -(this.height + Dash.Size.Padding * 0.25),
            "top":            -1,
            "user-select":    "none",
            "pointer-events": "none",
            "opacity":        0,
        });

        this.html.append(this.label_url_hover);

        var icon = new Dash.Gui.Icon(this.color, "arrow_right_circled", this.height, 0.8);
        this.label_url_hover.append(icon.html);

    };

    this.set_initial_text = function () {
        this.input.SetText(this.initial_value, this.data_key);
    };

    this.create_save_button = function () {
        this.button = new Dash.Gui.Button(this.button_text, this.on_submit, this);

        this.html.append(this.button.html);

        if (Dash.IsMobile) {
            // No submit button on mobile - but it's used to process the result, so we'll hide it
            this.button.html.css({
                "pointer-events": "none",
                "opacity": 0
            });

            return;
        }

        this.button.html.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "margin": 0,
            "height": this.height,
            "width": Dash.Size.ColumnWidth,
            "background": "none",
            "opacity": 0,
            "cursor": "auto"  // While hidden
        });

        this.button.highlight.css({
            "background": "none",
        });

        this.button.label.css({
            "text-align": "right",
            "line-height": this.height + "px",
            "color": "rgba(0, 0, 0, 0.9)"
        });
    };

    this.on_combo_changed = function (option) {
        if (!this.combo) {
            return;
        }

        this.input.SetText(option["id"], this.data_key);

        if (this.on_click) {
            this.on_submit();
        }
    };

    this.on_label_clicked = function (check_validity=false) {
        var active_text = this.input.Text().toString();

        if (active_text.startsWith("https://")) {
            if (check_validity) {
                return true;
            }

            window.open(active_text, "_blank");
        }

        else if (this.on_label_click_url) {
            window.open(this.on_label_click_url, "_blank");
        }

        else if (Dash.Validate.Email(active_text)) {
            if (check_validity) {
                return true;
            }

            window.open("mailto:" + active_text, "_blank");
        }

        else if (
            [
                "track",
                "tracking",
                "track #",
                "tracking #",
                "track number",
                "tracking number"
            ].includes(this.label_text.toLowerCase())
        ) {
            if (check_validity) {
                return true;
            }

            window.open("https://www.google.com/search?q=track+" + active_text.toString(), "_blank");
        }

        else if (this.end_tag) {
            var end_tag_text = this.end_tag.text().toString();

            if (end_tag_text.startsWith("https://")) {
                if (check_validity) {
                    return true;
                }

                window.open(end_tag_text, "_blank");
            }
        }

        if (check_validity) {
            return false;
        }
    };

    this.on_label_hover_in = function () {

        if (this.label_url_hover) {
            this.label_url_hover.stop().animate({"opacity": 1}, 250);
        };

    };

    this.on_label_hover_out = function () {

        if (this.label_url_hover) {
            this.label_url_hover.stop().animate({"opacity": 0}, 1000);
        };

    };

    this.setup_connections = function () {
        (function (self) {
            self.label.on("click", function () {
                self.on_label_clicked();
            });

            self.label.on("mouseenter", function () {
                self.on_label_hover_in();
            });

            self.label.on("mouseleave", function () {
                self.on_label_hover_out();
            });

            self.html.on("mouseenter", function () {
                self.highlight.stop().animate({"opacity": 0.25}, 50);
            });

            self.html.on("mouseleave", function () {
                self.highlight.stop().animate({"opacity": 0}, 250);
            });
        })(this);
    };

    this.input_changed = function (ignore_save_button_show) {
        if (!this.button || ignore_save_button_show) {
            return;
        }

        this.show_save_button();
    };

    this.trigger_autosave = function () {
        if (!this.load_dots) {
            this.setup_load_dots();
        }

        if (this.load_dots.IsActive()) {
            this.input_changed();

            return;
        }

        this.on_submit();
    };

    this.setup_load_dots = function () {
        if (this.load_dots) {
            return;
        }

        this.load_dots = new Dash.Gui.LoadDots(this.height - Dash.Size.Padding);

        this.load_dots.SetOrientation("vertical");
        this.load_dots.SetColor("rgba(0, 0, 0, 0.8)");

        this.html.append(this.load_dots.html);

        this.load_dots.html.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "top": Dash.Size.Padding * 0.5
        });
    };

    this.show_save_button = function () {
        if (this.save_button_visible || !this.button) {
            return;
        }

        this.button.html.css({
            "cursor": "pointer"
        });

        this.button.html.stop().animate({"opacity": 1});

        this.save_button_visible = true;
    };

    this.hide_save_button = function () {
        if (!this.save_button_visible || !this.button) {
            return;
        }

        this.button.html.css({
            "cursor": "auto"
        });

        this.button.html.stop().animate({"opacity": 0});

        this.save_button_visible = false;
    };

    this.on_request_response = function (response_json) {
        this.hide_save_button();

        if (this.load_dots) {
            this.load_dots.Stop();
        }

        this.request_callback.bind(this.request_callback_binder)(response_json);
    };

    this.on_submit = function () {
        if (this.lock_button && this.locked) {
            // Initially thought to add this check in this.input_changed(), but it that would trigger even during any
            // initialization of values, or programmatic changes of values, where this only triggers if the user saves.
            alert("This row is locked. Please unlock it by clicking the lock icon at the end of the row, then try again.");

            return;
        }

        this.hide_save_button();

        if (this.highlight) {
            this.highlight.stop().animate({"opacity": 0}, 100);
        }

        this.invalid_input_highlight.stop().animate({"opacity": 0}, 100);

        var response_callback = this.on_click.bind(this.on_click_bind);

        // Leaving this disabled for now - enable this to lock the row as soon as it receives input
        // if (this.lock_button && this.Text() && !this.locked) {
        //     this.toggle_lock();
        // }

        this.update_label_cursor();

        response_callback(this);
    };

    this.update_label_cursor = function () {
        var cursor = "auto";

        if (this.on_label_clicked(true)) {
            cursor = "pointer";
        }

        this.label.css({
            "cursor": cursor
        });
    };

    this.toggle_lock = function (data_key) {
        this.locked = !this.locked;

        var icon_name = "lock";

        if (!this.locked) {
            icon_name = "unlock_alt";
        }

        this.lock_button.html.remove();

        this.icon_button_count -= 1;

        this.lock_button = this.AddIconButton(icon_name, this.toggle_lock, this, data_key);
    };

    this.setup_styles();
    this.setup_connections();
}
