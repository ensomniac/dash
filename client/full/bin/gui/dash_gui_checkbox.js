function DashGuiCheckbox (label_text, binder, callback, local_storage_key, default_state=true, label_first=true, include_border=false, color=null) {
    this.label_text = label_text;
    this.binder = binder;
    this.callback = callback.bind(this.binder);
    this.local_storage_key = local_storage_key;
    this.default_state = default_state;
    this.label_first = label_first;
    this.include_border = include_border;
    this.color = color || Dash.Color.Light;

    this.html = null;
    this.label = null;
    this.icon_button = null;
    this.able_to_toggle_cb = null;
    this.checked = this.default_state;
    this.toggle_confirmation_msg = null;
    this.icon_button_redraw_styling = null;

    // This is a quick, simple abstraction of something I've been recreating often - will expand/improve as needed

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

    this.SetConfirmationMsg = function (msg) {
        this.toggle_confirmation_msg = msg;
    };

    this.SetAbleToToggleCallback = function (callback_with_bool_return) {
        this.able_to_toggle_cb = callback_with_bool_return.bind(this.binder);
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

        this.html.empty();

        this.redraw();

        if (skip_callback) {
            return;
        }

        this.callback(this);
    };

    this.AddIconButtonRedrawStyling = function (button_container_css=null, icon_container_css=null, icon_css=null) {
        this.icon_button_redraw_styling = {};

        if (Dash.IsValidObject(button_container_css)) {
            this.icon_button_redraw_styling["button_container_css"] = button_container_css;
        }

        if (Dash.IsValidObject(icon_container_css)) {
            this.icon_button_redraw_styling["icon_container_css"] = icon_container_css;
        }

        if (Dash.IsValidObject(icon_css)) {
            this.icon_button_redraw_styling["icon_css"] = icon_css;
        }

        this.restyle_icon_button();
    };

    this.redraw = function () {
        (function (self) {
            self.icon_button = new Dash.Gui.IconButton(
                self.checked ? "checked_box" : "unchecked_box",
                function () {
                    self.Toggle();
                },
                self,
                self.color
            );
        })(this);

        if (this.label_first) {
            this.html.append(this.label.html);
            this.html.append(this.icon_button.html);
        }

        else {
            this.html.append(this.icon_button.html);
            this.html.append(this.label.html);
        }

        this.restyle_icon_button();
    };

    this.restyle_icon_button = function () {
        if (!Dash.IsValidObject(this.icon_button_redraw_styling)) {
            return;
        }

        if (Dash.IsValidObject(this.icon_button_redraw_styling["button_container_css"])) {
            this.icon_button.html.css(this.icon_button_redraw_styling["button_container_css"]);
        }

        if (Dash.IsValidObject(this.icon_button_redraw_styling["icon_container_css"])) {
            this.icon_button.icon.html.css(this.icon_button_redraw_styling["icon_container_css"]);
        }

        if (Dash.IsValidObject(this.icon_button_redraw_styling["icon_css"])) {
            this.icon_button.icon.icon_html.css(this.icon_button_redraw_styling["icon_css"]);
        }
    };

    this.draw_label = function () {
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
        var local = Dash.Local.Get(this.local_storage_key);

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
