function DashMobileSearchableCombo (color=null, options={}, placeholder_text="", binder=null, on_submit_cb=null, on_change_cb=null) {
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.options = options;  // Format: {id: label}
    this.placeholder_text = placeholder_text;
    this.binder = binder;
    this.on_submit_cb = binder && on_submit_cb ? on_submit_cb.bind(binder) : on_submit_cb;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;

    this.label = null;
    this.clear_button = null;
    this.id = "DashMobileSearchableCombo_" + Dash.Math.RandomID();
    this.html = $("<div></div>");
    this.datalist = $("<datalist></datalist", {"id": this.id});

    this.input = $(
        "<input/>",
        {
            "list": this.id,
            "class": this.color.PlaceholderClass,
            "placeholder": this.placeholder_text,
            "inputmode": "search"
        }
    );

    this.setup_styles = function () {
        var shared_css = {
            "box-sizing": "border-box",
            "color": this.color.Text,
            "border-radius": Dash.Size.BorderRadius * 0.5
        };

        this.html.css({
            "height": Dash.Size.RowHeight,
            "border": "1px solid " + this.color.Stroke,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            ...shared_css
        });

        this.input.css({
            "height": Dash.Size.RowHeight - 2,  // Account for border
            ...shared_css
        });

        (function (self) {
            self.input.on("focus", function () {
                requestAnimationFrame(function () {
                    // The list will cover the on-screen keyboard unless re-focusing after it's drawn
                    self.input.trigger("focus");
                });
            });
        })(this);

        this.set_width("100%", true);
        this.add_options();

        this.html.append(this.datalist);
        this.html.append(this.input);

        this.setup_connections();
    };

    this.GetID = function (allow_none=true) {
        var label = this.GetLabel();

        for (var id in this.options) {
            if (this.options[id].toString().toLowerCase() === label.toString().toLowerCase()) {
                if (id === "none" && !allow_none) {
                    return null;
                }

                return id;
            }
        }

        return null;
    };

    this.GetLabel = function () {
        return this.input.val();
    };

    this.SetLabel = function (text) {
        this.input.val(text);
    };

    this.SetLabelByID = function (id) {
        if (!(id in this.options)) {
            console.warn("ID not in options:", id);

            return;
        }

        this.SetLabel(this.options[id]);
    };

    this.GetOptions = function () {
        return this.options;
    };

    this.SetOptions = function (options={}) {
        this.datalist.empty();

        this.options = options;

        this.add_options();
    };

    this.AddOption = function (id, label, _check=true) {
        if (_check && this.options[id]) {
            return;
        }

        this.options[id] = label;

        // Unlike the select element, the datalist does not allow option elements
        // to contain both a value and a label, so for us to get the ID after a
        // selection is made, we loop through the options and match the current value (label)
        var row = $("<option></option>",{"value": label});

        row.css({
            "height": Dash.Size.RowHeight
        });

        // this.html.append(row);
        this.datalist.append(row);
    };

    this.EnableResetInvalidOnBlur = function () {
        (function (self) {
            self.input.on("blur", function () {
                if (!self.GetID()) {
                    self.input.val("");
                }
            });
        })(this);
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

    this.AddClearButton = function () {
        if (this.clear_button) {
            return this.clear_button;
        }

        (function (self) {
            self.clear_button = new Dash.Gui.IconButton(
                "close_circle",
                function () {
                    self.SetLabel("");
                },
                self,
                self.color,
                {
                    "container_size": Dash.Size.RowHeight,
                    "size_mult": 0.6
                }
            );
        })(this);

        this.clear_button.SetIconColor(Dash.Color.Mobile.AccentPrimary);

        this.clear_button.html.css({
            "position": "absolute",
            "top": 0,
            "right": -(Dash.Size.Padding * 1.9)
        });

        this.set_width("calc(100% - " + (Dash.Size.Padding * 1.4) + "px)");

        this.html.append(this.clear_button.html);

        return this.clear_button;
    };

    this.set_width = function (width, set_input=false, min_width=null, max_width=null) {
        var css = {
            "width": width,
            "min-width": min_width || width,
            "max-width": max_width || width
        };

        this.html.css(css);

        if (set_input) {
            this.input.css(css);
        }
    };

    this.add_options = function () {
        for (var id in this.options) {
            this.AddOption(id, this.options[id], false);
        }
    };

    this.setup_connections = function () {
        (function (self) {
            self.input.on("change", function () {
                // Since this is linked to the datalist, the change event only triggers
                // when a selection is made, whether that's by clicking an option or
                // typing an option and selecting it using the arrow keys and enter key
                if (self.on_submit_cb) {
                    var id = self.GetID();

                    if (id) {
                        self.on_submit_cb(id);
                    }
                }
            });

            self.input.on("input", function () {
                if (self.on_change_cb) {
                    self.on_change_cb(self.GetLabel());
                }
            });
        })(this);
    };

    this.setup_styles();
}
