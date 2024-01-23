function DashMobileCombo (color=null, options={}, binder=null, on_change_cb=null) {
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.options = options;  // Format: {id: label}
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;

    this.label = null;
    this.html = $("<div></div>");
    this.select = $("<select></select>");

    this.setup_styles = function () {
        this.select.css({
            "color": this.color.Text,
            "height": Dash.Size.RowHeight,
            "box-sizing": "border-box",
            "width": "100%",
            "min-width": "100%",
            "max-width": "100%",
            "border-radius": Dash.Size.BorderRadius * 0.5,
            "border": "1px solid " + this.color.Stroke,
            "padding-left": Dash.Size.Padding * 0.25
        });

        this.html.append(this.select);

        this.add_options();
        this.setup_connections();
    };

    this.GetID = function (allow_none=true) {
        var id = this.select.val();

        if (id === "none" && !allow_none) {
            return null;
        }

        return id;
    };

    this.GetLabel = function () {
        return this.options[this.GetID()];
    };

    this.GetOptions = function () {
        return this.options;
    };

    this.SetOptions = function (options={}) {
        this.select.empty();

        this.options = options;

        this.add_options();
    };

    this.AddOption = function (id, label, _check=true) {
        if (_check && this.options[id]) {
            return;
        }

        this.options[id] = label;

        var row = $(
            "<option></option>",
            {
                "value": id,
                "text": label
            }
        );

        row.css({
            "height": Dash.Size.RowHeight
        });

        this.select.append(row);
    };

    this.SetSelection = function (option_id, trigger_cb=false) {
        if (!this.options[option_id]) {
            console.warn("Option ID (" + option_id + ") not in options:", this.options);

            return;
        }

        this.select.val(option_id);

        // The 'change' event of this element only gets triggered when an option is manually
        // selected, so when changing it this way, we need to manually trigger the callback
        if (trigger_cb && this.on_change_cb) {
            this.on_change_cb(this.GetID());
        }
    };

    this.Lock = function (restyle=true) {
        this.select.prop("disabled", true);

        if (restyle) {
            this.html.css({
                "opacity": 0.5,
                "pointer-events": "none",
                "user-select": "none"
            });
        }
    };

    this.Unlock = function () {
        this.select.prop("disabled", false);

        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
    };

    this.SetWidth = function (width, min=null, max=null) {
        if (min === null) {
            min = width;
        }

        if (max === null) {
            max = width;
        }

        this.select.css({
            "width": width,
            "min-width": min,
            "max-width": max
        });
    };

    this.AddLabel = function (text) {
        if (this.label) {
            return this.label;
        }

        this.label = $("<div>" + text + "</div>");

        this.label.css({
            "position": "absolute",
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "color": this.color.StrokeLight,
            "top": -Dash.Size.Padding * 0.8,
            "left": Dash.Size.Padding * 0.1
        });

        this.html.append(this.label);

        return this.label;
    };

    this.add_options = function () {
        for (var id in this.options) {
            this.AddOption(id, this.options[id], false);
        }
    };

    this.setup_connections = function () {
        (function (self) {
            // The 'change' event only triggers when a selection is
            // made, whether that's by clicking an option or typing an
            // option and selecting it using the arrow keys and enter key
            self.select.on("change", function () {
                if (self.on_change_cb) {
                    self.on_change_cb(self.GetID());
                }
            });
        })(this);
    };

    this.setup_styles();
}
