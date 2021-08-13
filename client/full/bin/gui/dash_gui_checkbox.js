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
    this.checked = this.default_state;

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

    this.Toggle = function () {
        this.checked = !this.checked;

        if (this.checked) {
            Dash.Local.Set(this.local_storage_key, "true");
        }

        else {
            Dash.Local.Set(this.local_storage_key, "false");
        }

        this.html.empty();

        this.redraw();

        this.callback();
    };

    this.redraw = function () {
        this.icon_button = new Dash.Gui.IconButton(
            this.checked ? "checked_box" : "unchecked_box",
            this.Toggle,
            this,
            this.color
        );

        if (this.label_first) {
            this.html.append(this.label.html);
            this.html.append(this.icon_button.html);
        }

        else {
            this.html.append(this.icon_button.html);
            this.html.append(this.label.html);
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
