function DashMobileCombo (color=null, options={}, binder=null, on_change_cb=null) {
    this.color = color || Dash.Color.Light;
    this.options = options;
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;

    this.html = $("<select></select>");

    this.setup_styles = function () {
        this.html.css({
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

        this.add_options();
        this.setup_connections();
    };

    this.GetID = function (allow_none=true) {
        var id = this.html.val();

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
        this.html.empty();

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

        this.html.append(row);
    };

    this.add_options = function () {
        for (var id in this.options) {
            this.AddOption(id, this.options[id], false);
        }
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("change", function () {
                if (self.on_change_cb) {
                    self.on_change_cb(self.GetID());
                }
            });
        })(this);
    };

    this.setup_styles();
}
