function DashGuiCheckbox (local_storage_key, default_state=true, color=null, hover_hint="Toggle", binder=null, callback=null, label_text="", label_first=true, include_border=false) {
    this.local_storage_key = local_storage_key;
    this.default_state = default_state;
    this.color = color || Dash.Color.Light;
    this.hover_hint = hover_hint === "none" ? "" : hover_hint;  // Leave the default as "Toggle" with a way to still allow a "" value
    this.binder = binder;
    this.callback = callback && binder ? callback.bind(binder) : callback;
    this.label_text = label_text;
    this.label_first = label_first;
    this.include_border = include_border;

    this.html = null;
    this.label = null;
    this._hover_hint = "";
    this.icon_button = null;
    this.is_read_only = false;
    this.able_to_toggle_cb = null;
    this.checked = this.default_state;
    this.toggle_confirmation_msg = null;
    this.icon_button_redraw_styling = null;

    this.setup_styles = function () {
        this.checked = this.get_checked_state();
        this.html = $("<div></div>");

        this.html.css({
            "display": "flex",
            "height": Dash.Size.RowHeight
        });

        this.draw_label();

        this.redraw();
    };

    this.IsChecked = function () {
        return this.checked;
    };

    this.SetChecked = function (is_checked=true, skip_callback=true) {
        if ((is_checked && !this.checked) || (!is_checked && this.checked)) {
            this.Toggle(skip_callback);
        }
    };

    this.LocalStorageKey = function () {
        return this.local_storage_key;
    };

    this.SetConfirmationMsg = function (msg) {
        this.toggle_confirmation_msg = msg;
    };

    this.SetAbleToToggleCallback = function (callback_with_bool_return, binder=null) {
        this.able_to_toggle_cb = binder || this.binder ? callback_with_bool_return.bind(binder ? binder : this.binder) : callback_with_bool_return;
    };

    this.SetReadOnly = function (is_read_only=true) {
        var pointer_events;

        if (is_read_only) {
            this._hover_hint = this.hover_hint;
            this.hover_hint = "";

            pointer_events = "none";
        }

        else {
            this.hover_hint = this._hover_hint;
            this._hover_hint = "";

            pointer_events = "pointer";
        }

        this.icon_button.SetHoverHint(this.hover_hint);

        this.html.css({
            "pointer-events": pointer_events
        });

        this.is_read_only = is_read_only;
    };

    this.Toggle = function (skip_callback=false) {
        if (this.toggle_confirmation_msg) {
            if (!window.confirm(this.toggle_confirmation_msg)) {
                return;
            }
        }

        if (this.able_to_toggle_cb && !this.able_to_toggle_cb(this)) {
            return;
        }

        this.checked = !this.checked;

        if (this.checked) {
            Dash.Local.Set(this.local_storage_key, "true");
        }

        else {
            Dash.Local.Set(this.local_storage_key, "false");
        }

        this.redraw();

        if (skip_callback || !this.callback) {
            return;
        }

        this.callback(this);
    };

    this.AddIconButtonRedrawStyling = function (button_container_css=null, icon_container_css=null, icon_css=null) {
        this.icon_button_redraw_styling = {};

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

    this.redraw = function () {
        this.html.empty();

        (function (self) {
            self.icon_button = new Dash.Gui.IconButton(
                self.checked ? "checked_box" : "unchecked_box",
                function () {
                    // We don't want the args from IconButton's callback
                    self.Toggle();
                },
                self,
                self.color
            );
        })(this);

        this.icon_button.SetHoverHint(this.hover_hint);

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

        this.restyle_icon_button();
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
        }

        else {
            this.label.label.css({
                "margin-left": padding_to_icon
            });
        }
    };

    this.get_checked_state = function () {
        if (!this.local_storage_key) {
            return false;
        }

        else {
            var local = Dash.Local.Get(this.local_storage_key);
        }

        if (local === "true") {
            return true;
        }

        if (local === "false") {
            return false;
        }

        return this.default_state;
    };

    this.setup_styles();
}
