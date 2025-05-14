class DashGuiColorPicker {
    constructor (
        binder=null, callback=null, label_text="Color:", initial_hex_color="",
        include_clear_button=false, clear_cb=null, height=null, default_hex_color=""
    ) {
        this.binder = binder;
        this.callback = this.binder && callback ? callback.bind(this.binder) : callback;
        this.label_text = label_text;
        this.initial_hex_color = initial_hex_color;
        this.include_clear_button = include_clear_button;
        this.clear_cb = this.binder && clear_cb ? clear_cb.bind(this.binder) : clear_cb;
        this.height = height || Dash.Size.ButtonHeight;
        this.default_hex_color = default_hex_color || Dash.Color.PickerDefault;  // Picker must have a value

        this.label = null;
        this.html = $("<div>");
        this.clear_button = null;
        this.color = this.binder?.color || Dash.Color.Light;
        this.id = "dash_gui_color_picker_" + Dash.Math.Random();

        this.input = $(
            "<input>",
            {
                "type": "color",
                "id": this.id,
                "value": this.initial_hex_color || this.default_hex_color
            }
        );

        this.setup_styles();
    }

    setup_styles () {
        var text = this.label_text.replace(":", "").trim();

        if (text && text !== "none") {
            this.add_label();
        }

        this.input.css({
            "height": this.height,
            "margin-left": Dash.Size.Padding * 0.5,
            "background": "none",
            "cursor": "pointer",
            "border": "1px solid " + this.color.StrokeLight,
            "border-radius": Dash.Size.Padding * 0.3
        });

        this.html.append(this.input);

        if (this.include_clear_button) {
            this.add_clear_button();
        }

        if (this.callback) {
            this.input.on("change", () => {
                // noinspection JSValidateTypes
                this.callback(this.input.val() || "");
            });
        }
    }

    GetValue (allow_default_return=false) {
        var val = this.input.val() || "";

        if (val === this.default_hex_color) {
            return allow_default_return ? val : "";
        }

        return val;
    };

    SetValue (color="", fallback_to_default=false) {
        return this.input.val(
            color ? color : (fallback_to_default ? this.default_hex_color : "")
        );
    };

    SetHoverHint (text) {
        this.html.attr("title", text);
    }

    Disable (opacity=0.5) {
        this.Lock();

        this.html.css({
            "opacity": opacity
        });
    };

    Enable () {
        this.Unlock();

        this.html.css({
            "opacity": 1
        });
    };

    Lock () {
        this.input.attr("disabled", true);
    }

    Unlock () {
        this.input.attr("disabled", false);
    }

    add_label () {
        this.label = $(
            "<label>",
            {
                "for": this.id,
                "text": this.label_text
            }
        );

        var line_break = this.label_text.includes("\n");

        var label_css = {
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "color": this.color.Text,
            "top": line_break ? 0 : (Dash.Size.Padding * (this.include_clear_button ? 0.5 : -0.5))
        };

        if (line_break) {
            label_css = {
                ...label_css,
                "white-space": "pre",
                "height": this.height,
                "display": "block",
                "float": "left",
                "text-align": "right",
                "line-height": (this.height * 0.5) + "px"
            };
        }

        this.label.css(label_css);

        this.html.append(this.label);
    }

    add_clear_button () {
        var small = this.height < Dash.Size.RowHeight;

        this.html.css({
            "display": "flex"
        });

        this.clear_button = new Dash.Gui.IconButton(
            "close_square",
            () => {
                this.input.val(this.default_hex_color);

                if (this.clear_cb) {
                    this.clear_cb();
                }
            },
            this,
            this.color,
            {
                "container_size": this.height,
                "size_mult": small ? 0.75 : 0.5
            }
        );

        this.clear_button.SetIconColor(this.color.AccentBad);

        if (small) {
            this.clear_button.html.css({
                "margin-left": Dash.Size.Padding * 0.1
            });
        }

        else {
            this.clear_button.html.css({
                "padding-top": Dash.Size.Padding * 0.1
            });
        }

        this.html.append(this.clear_button.html);
    }
}
