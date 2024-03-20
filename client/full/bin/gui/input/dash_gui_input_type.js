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
        var html_css = {
            "height": this.height,
            "line-height": this.height + "px",
            "display": "flex"
        };

        var input_css = {
            "flex": 2,
            "color": this.color.Text,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "background": "none"
        };

        if (Dash.IsMobile) {
            html_css["border"] = "1px solid " + this.color.Stroke;
            html_css["border-radius"] = Dash.Size.BorderRadius * 0.5;

            input_css["padding-left"] = Dash.Size.Padding * 0.5;
            input_css["padding-right"] = Dash.Size.Padding * 0.25;
        }

        if (this.label_text) {
            this.setup_label();
        }

        this.input.css(input_css);

        this.html.css(html_css);
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
        if (!Dash.IsMobile && !(this.label_text.endsWith(":"))) {
            this.label_text += ":";
        }

        this.label = $("<div>" + this.label_text + "</div>");

        var css = {
            "font-family": "sans_serif_bold",
            "font-size": "80%"
        };

        if (Dash.IsMobile) {
            css["position"] = "absolute";
            css["top"] = -Dash.Size.Padding * 1.4;
            css["left"] = Dash.Size.Padding * 0.1;
            css["color"] = this.color.StrokeLight;
        }

        else {
            css["flex"] = "none";
            css["color"] = this.color.Text;
            css["margin-right"] = Dash.Size.Padding * 0.5;
        }

        this.label.css(css);

        this.html.append(this.label);
    };

    this.setup_styles();
}
