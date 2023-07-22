/**@member DashGuiInputBase*/

// Abstract from this for input elements with specific "types", such as "date", "time", etc
function DashGuiInputType (
    input, label_text="", binder=null, on_submit_cb=null, on_autosave_cb=null,
    on_change_cb=null, color=null, include_paste_connection=true
) {
    this.input = input;
    this.label_text = label_text;
    this.on_submit_cb = on_submit_cb && binder ? on_submit_cb.bind(binder) : on_submit_cb;
    this.on_autosave_cb = on_autosave_cb && binder ? on_autosave_cb.bind(binder) : on_autosave_cb;
    this.on_change_cb = on_change_cb && binder ? on_change_cb.bind(binder) : on_change_cb;

    DashGuiInputBase.call(
        this,
        color || (binder ? binder.color : color),
        include_paste_connection,
        false,
        false
    );

    this.label = null;

    this.setup_styles = function () {
        this.html.css({
            "height": this.height,
            "line-height": this.height + "px",
            "display": "flex"
        });

        if (this.label_text) {
            this.setup_label();
        }

        this.input.css({
            "color": this.color.Text,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "background": "none"
        });

        this.html.append(this.input);

        this.set_cbs();
        this.setup_connections();
    };

    // Intended to be overridden
    this.SetValue = function (value) {
        // Override this, using it as a wrapper for this.SetText(), if the input type
        // has a specific format that is required in order for the value to be set, rather
        // than expecting the user to know the right format when calling this.SetText()
        this.SetText(value);
    };

    this.GetValue = function () {
        return this.parse_value(this.Text());
    };

    this.set_cbs = function () {
        (function (self) {
            if (self.on_submit_cb) {
                self.SetOnSubmit(
                    function () {
                        self.on_submit_cb(self.GetValue());
                    },
                    self
                );
            }

            if (self.on_autosave_cb) {
                self.EnableAutosave();

                self.SetOnAutosave(
                    function () {
                        self.on_autosave_cb(self.GetValue());
                    },
                    self
                );
            }

            if (self.on_change_cb) {
                self.SetOnChange(
                    function () {
                        self.on_change_cb(self.GetValue());
                    },
                    self
                );
            }
        })(this);
    };

    this.setup_label = function () {
        if (!(this.label_text.endsWith(":"))) {
            this.label_text += ":";
        }

        this.label = $("<div>" + this.label_text + "</div>");

        this.label.css({
            "color": this.color.Text,
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "flex": "none",
            "margin-right": Dash.Size.Padding * 0.5
        });

        this.html.append(this.label);
    };

    this.setup_styles();
}
