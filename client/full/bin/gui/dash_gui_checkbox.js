function DashGuiCheckbox (
    local_storage_key="", default_state=true, color=null, hover_hint="Toggle", binder=null,
    callback=null, label_text="", label_first=true, include_border=false
) {
    this.local_storage_key = local_storage_key;
    this.default_state = default_state === "true" ? true : default_state === "false" ? false : default_state;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.hover_hint = hover_hint === "none" ? "" : hover_hint;  // Leave the default as "Toggle" with a way to still allow a "" value
    this.binder = binder;
    this.callback = callback && binder ? callback.bind(binder) : callback;
    this.label_text = label_text;
    this.label_first = label_first;
    this.include_border = include_border;

    this.html = null;
    this.label = null;
    this.can_click = true;
    this._hover_hint = "";
    this.icon_size = null;
    this.disabled = false;
    this.icon_color = null;
    this.true_color = null;
    this.false_color = null;
    this.icon_shadow = null;
    this.icon_button = null;
    this.extra_elements = [];
    this.is_read_only = false;
    this._true_hover_hint = "";
    this._false_hover_hint = "";
    this.static_icon_name = null;
    this.able_to_toggle_cb = null;
    this.include_highlight = false;
    this.checked = this.default_state;
    this.toggle_confirmation_msg = null;
    this.true_icon_name = "checked_box";
    this.false_icon_name = "unchecked_box";
    this.icon_button_redraw_styling = null;
    this.icon_container_size = Dash.Size.RowHeight;

    this.setup_styles = function () {
        this.checked = this.get_checked_state();
        this.html = $("<div></div>");

        this.html.css({
            "display": "flex",
            "height": this.icon_container_size
        });

        this.draw_label();
        this.redraw();
    };

    this.IsChecked = function () {
        return this.checked;
    };

    this.LocalStorageKey = function () {
        return this.local_storage_key;
    };

    this.SetIconColor = function (color) {
        this.icon_color = color;

        this.icon_button.SetIconColor(color);

        return this;
    };

    this.SetIconShadow = function (shadow) {
        this.icon_shadow = shadow;

        this.icon_button.AddIconShadow(shadow);

        return this;
    };

    this.SetIconSize = function (icon_size_percent_num, container_size=null) {
        this.icon_size = icon_size_percent_num;

        if (container_size) {
            this.icon_container_size = container_size;

            this.html.css({
                "height": this.icon_container_size
            });
        }

        this.icon_button.SetIconSize(this.icon_size, this.icon_container_size);

        return this;
    };

    this.SetAbleToToggleCallback = function (callback_with_bool_return, binder=null) {
        this.able_to_toggle_cb = binder || this.binder ?
            callback_with_bool_return.bind(binder ? binder : this.binder) :
            callback_with_bool_return;
    };

    this.SetChecked = function (is_checked=true, skip_callback=true, hover_hint="") {
        if (is_checked === this.checked) {
            return;
        }

        if (hover_hint) {
            this.hover_hint = hover_hint;
        }

        this.Toggle(skip_callback);
    };

    this.SetConfirmationMsg = function (msg) {
        this.toggle_confirmation_msg = msg;
    };

    // This turns this style into more a DashGuiIconToggle than a
    // DashGuiCheckbox, but no need to abstract it - at least, not yet
    this.SetTrueIconName = function (icon_name, hover_hint="") {
        this.true_icon_name = icon_name;
        this._true_hover_hint = hover_hint;

        if (this.checked) {
            this.redraw();
        }
    };

    // This turns this style into more a DashGuiIconToggle than a
    // DashGuiCheckbox, but no need to abstract it - at least, not yet
    this.SetFalseIconName = function (icon_name, hover_hint="") {
        this.false_icon_name = icon_name;
        this._false_hover_hint = hover_hint;

        if (!this.checked) {
            this.redraw();
        }
    };

    this.SetReadOnly = function (is_read_only=true, restyle=false) {
        var pointer_events;

        if (is_read_only) {
            this._hover_hint = this.hover_hint;
            this.hover_hint = "";

            pointer_events = "none";
        }

        else {
            this.hover_hint = this._hover_hint;
            this._hover_hint = "";

            pointer_events = "auto";
        }

        this.icon_button.SetHoverHint(this.hover_hint);

        this.icon_button.html.css({
            "pointer-events": pointer_events
        });

        if (is_read_only) {
            this.DisableClick();
        }

        else {
            this.EnableClick();
        }

        this.is_read_only = is_read_only;

        if (restyle) {
            this.html.css({
                "opacity": is_read_only ? 0.65 : 1
            });
        }
    };

    this.DisableClick = function () {
        this.can_click = false;

        this.icon_button.BreakConnections();
    };

    this.EnableClick = function () {
        this.can_click = true;

        this.icon_button.RefreshConnections();
    };

    // Wrapper
    this.RefreshConnections = function () {
        this.EnableClick();
    };

    this.Toggle = function (skip_callback=false, ignore_able_to_toggle_check=false) {
        if (this.toggle_confirmation_msg) {
            if (!window.confirm(this.toggle_confirmation_msg)) {
                return;
            }
        }

        if (!ignore_able_to_toggle_check && this.able_to_toggle_cb && !this.able_to_toggle_cb(this)) {
            return;
        }

        this.checked = !this.checked;

        if (this.local_storage_key) {
            if (this.checked) {
                Dash.Local.Set(this.local_storage_key, "true");
            }

            else {
                Dash.Local.Set(this.local_storage_key, "false");
            }
        }

        this.redraw();

        if (skip_callback || !this.callback) {
            return;
        }

        this.callback(this);
    };

    this.AddIconButtonRedrawStyling = function (button_container_css=null, icon_container_css=null, icon_css=null) {
        if (!this.icon_button_redraw_styling) {
            this.icon_button_redraw_styling = {};
        }

        if (Dash.Validate.Object(button_container_css)) {
            this.icon_button_redraw_styling["button_container_css"] = button_container_css;
        }

        if (Dash.Validate.Object(icon_container_css)) {
            this.icon_button_redraw_styling["icon_container_css"] = icon_container_css;
        }

        if (Dash.Validate.Object(icon_css)) {
            this.icon_button_redraw_styling["icon_css"] = icon_css;
        }

        this.restyle_icon_button();
    };

    this.AddKeyCopyButton = function (data_key) {
        if (!data_key) {
            Dash.Log.Warn("No data key provided, skipping key copy button...");

            return;
        }

        var size = this.icon_container_size * 0.5;
        var right_margin = Dash.Size.Padding * 0.3;

        var button = Dash.Gui.GetKeyCopyButton(size, data_key, this.color);

        button.html.css({
            "position": "absolute",
            "top": 0,
            "right": 0
        });

        if (this._property_box_highlight) {
            this._property_box_highlight.css({
                "right": size + right_margin
            });
        }

        this.html.append(button.html);

        return button;
    };

    // Should this just be the default?
    this.AddHighlight = function (bottom=null, force_in_container=false, redraw_css={}) {
        if (Dash.IsMobile) {
            return null;
        }

        if (
               !Dash.Validate.Object(redraw_css)
            && Dash.Validate.Object(this.icon_button_redraw_styling?.["highlight_css"])
        ) {
            redraw_css = this.icon_button_redraw_styling["highlight_css"];
        }

        if (bottom === null) {
            bottom = redraw_css?.["bottom"];

            if (!bottom && bottom !== 0) {
                bottom = -(Dash.Size.Padding * 0.5);
            }
        }

        this.include_highlight = true;

        this.icon_button.AddHighlight(force_in_container);

        if (bottom !== null && !("bottom" in redraw_css)) {
            redraw_css["bottom"] = bottom;
        }

        if (Dash.Validate.Object(redraw_css)) {
            if (!this.icon_button_redraw_styling) {
                this.icon_button_redraw_styling = {};
            }

            this.icon_button_redraw_styling["highlight_css"] = redraw_css;

            this.icon_button.highlight.css(redraw_css);
        }

        return this.icon_button.highlight;
    };

    this.ToggleColorNotIcon = function (static_icon_name, true_color, false_color) {
        this.static_icon_name = static_icon_name;
        this.true_color = true_color;
        this.false_color = false_color;

        this.redraw();
    };

    this.Disable = function (force=false, opacity=0.5) {
        if (!force && this.disabled) {
            return;
        }

        this.icon_button.Disable();

        if (this.label) {
            this.label.label.css({
                "opacity": opacity,
                "pointer-events": "none",
                "user-select": "none"
            });
        }

        this.disabled = true;
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.icon_button.Enable();

        if (this.label) {
            this.label.label.css({
                "opacity": 1,
                "pointer-events": "auto",
                "user-select": "auto"
            });
        }

        this.disabled = false;
    };

    this.SetLoading = function (loading) {
        this.icon_button.SetLoading(loading, 2, false);
    };

    this.RevertToDefaultState = function (skip_callback=false, ignore_able_to_toggle_check=false) {
        if (this.IsChecked() !== this.default_state) {
            this.Toggle(skip_callback, ignore_able_to_toggle_check);
        }
    };

    this.AddExtraElement = function (html) {
        this.extra_elements.push(html);

        this.html.append(html);
    };

    this.redraw = function () {
        this.html.empty();

        (function (self) {
            self.icon_button = new Dash.Gui.IconButton(
                self.static_icon_name ? self.static_icon_name : (
                    self.checked ? self.true_icon_name : self.false_icon_name
                ),
                function () {
                    // We don't want the args from IconButton's callback
                    self.Toggle();
                },
                self,
                self.color,
                {"container_size": self.icon_container_size}
            );
        })(this);

        this.hover_hint = (
              this._false_hover_hint && !this.checked ? this._false_hover_hint
            : this._true_hover_hint && this.checked ? this._true_hover_hint
            : this.hover_hint
        );

        this.icon_button.SetHoverHint(this.hover_hint);

        if (this.static_icon_name) {
            this.icon_button.SetIconColor(this.checked ? this.true_color : this.false_color);
        }

        else if (this.icon_color) {
            this.icon_button.SetIconColor(this.icon_color);
        }

        if (this.icon_shadow) {
            this.icon_button.SetIconShadow(this.icon_shadow);
        }

        if (this.icon_size) {
            this.icon_button.SetIconSize(this.icon_size);
        }

        if (this.include_highlight) {
            this.AddHighlight();
        }

        if (this.label_first) {
            if (this.label) {
                this.html.append(this.label.html);
            }

            this.html.append(this.icon_button.html);
        }

        else {
            this.html.append(this.icon_button.html);

            if (this.label) {
                this.html.append(this.label.html);
            }
        }

        for (var element of this.extra_elements) {
            this.html.append(element);
        }

        this.restyle_icon_button();

        if (this.is_read_only) {
            this.SetReadOnly();
        }

        else if (this.disabled) {
            this.Disable(true);
        }

        else if (!this.can_click) {
            this.DisableClick();
        }
    };

    this.restyle_icon_button = function () {
        if (!Dash.Validate.Object(this.icon_button_redraw_styling)) {
            return;
        }

        if (Dash.Validate.Object(this.icon_button_redraw_styling["button_container_css"])) {
            this.icon_button.html.css(this.icon_button_redraw_styling["button_container_css"]);
        }

        if (Dash.Validate.Object(this.icon_button_redraw_styling["icon_container_css"])) {
            this.icon_button.icon.html.css(this.icon_button_redraw_styling["icon_container_css"]);
        }

        if (Dash.Validate.Object(this.icon_button_redraw_styling["icon_css"])) {
            this.icon_button.icon.icon_html.css(this.icon_button_redraw_styling["icon_css"]);
        }

        if (this.include_highlight && Dash.Validate.Object(this.icon_button_redraw_styling["highlight_css"])) {
            this.icon_button.highlight.css(this.icon_button_redraw_styling["highlight_css"]);
        }
    };

    this.draw_label = function () {
        if (!this.label_text) {
            return;
        }

        this.label = new Dash.Gui.Header(this.label_text, this.color, this.include_border);

        this.label.label.css({
            "font-family": "sans_serif_normal",
            "padding-left": 0,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis"
        });

        var padding_to_icon = Dash.Size.Padding * 0.5;

        if (this.label_first) {
            this.label.label.css({
                "margin-right": padding_to_icon
            });

            if (this.include_border) {
                this.label.border.css({
                    "left": -Dash.Size.Padding * 0.75
                });
            }
        }

        else {
            this.label.label.css({
                "margin-left": padding_to_icon
            });

            if (this.include_border) {
                this.label.border.css({
                    "left": "",
                    "right": -Dash.Size.Padding * 0.75
                });
            }
        }
    };

    this.get_checked_state = function () {
        if (!this.local_storage_key) {
            return this.default_state;
        }

        return Dash.Local.Get(this.local_storage_key, this.default_state);
    };

    this.setup_styles();
}
