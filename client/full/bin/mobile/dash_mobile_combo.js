function DashMobileCombo (color=null, options={}, binder=null, on_change_cb=null) {
    this.color = color || Dash.Color.Light;
    this.options = options;
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;

    this.html = $("<select></select>");

    this.setup_styles = function () {
        this.html.css({
            "color": this.color.Text
        });

        this.add_options();
        this.setup_connections();
    };

    this.GetID = function () {
        return this.html.val();
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

    this.AddOption = function (id, label) {
        this.options[id] = label;

        this.html.append($(
            "<option></option>",
            {
                "value": id,
                "text": label
            }
        ));
    };

    this.add_options = function () {
        for (var id in this.options) {
            this.AddOption(id, this.options[id]);
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
