class DashGuiToggle {
    constructor (
        color=null, height=0, starting_state=true, bound_cb=null, true_label_text="", false_label_text="",
        base_size_percent_num=100, true_icon_name="toggle_on", false_icon_name="toggle_off",
        icon_size_mod=50, text_size_mod=0
    ) {
        this.color = color || Dash.Color.Light;
        this.height = height === null ? 0 : (height || Dash.Size.ButtonHeight);
        this.starting_state = starting_state;
        this.bound_cb = bound_cb;
        this.true_label_text = true_label_text;
        this.false_label_text = false_label_text;
        this.base_size_percent_num = base_size_percent_num;
        this.true_icon_name = true_icon_name;
        this.false_icon_name = false_icon_name;
        this.icon_size_mod = icon_size_mod;
        this.text_size_mod = text_size_mod;

        this.toggle = null;
        this.true_label = null;
        this.false_label = null;
        this.html = $("<div>");
        this.label_bg_color = this.color.PinstripeDark;
        this.icon_font_size = this.base_size_percent_num + this.icon_size_mod;
        this.text_font_size = this.base_size_percent_num + this.text_size_mod;
        this.active_toggle_bg_color = Dash.Color.GetTransparent(this.color.AccentGood, 0.75);

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "display": "flex",
            "align-items": "center",
            "justify-content": "center"
        });

        this.setup_false_label();
        this.setup_toggle();
        this.setup_true_label();

        if (!this.false_label && !this.true_label) {
            this.toggle.SetIconSize(this.icon_font_size);
        }

        this.style_on_toggle(this.starting_state);

        requestAnimationFrame(() => {
            this.toggle.SetIconSize(this.icon_font_size, this.height || this.html.outerHeight());

            if (this.true_label) {
                this.true_label.css({
                    "font-size": this.text_font_size + "%"
                });
            }

            if (this.false_label) {
                this.false_label.css({
                    "font-size": this.text_font_size + "%"
                });
            }
        });
    }

    IsActive () {
        return this.toggle.IsChecked();
    }

    setup_false_label () {
        if (this.false_label || !this.false_label_text) {
            return;
        }

        var container;

        [this.false_label, container] = this.setup_label(this.false_label_text);

        container.css({
            "justify-content": "right"
        });
    }

    setup_true_label () {
        if (this.true_label || !this.true_label_text) {
            return;
        }

        var container;

        [this.true_label, container] = this.setup_label(this.true_label_text);

        this.toggle.html.css({
            "margin-right": Dash.Size.Padding
        });
    }

    setup_label = function (label_text) {
        var label = $("<div>", {"text": label_text});

        var css = {
            "user-select": "none",
            "color": this.color.StrokeDark,
            "font-family": "sans_serif_normal",
            "text-align": "center",
            "white-space": "pre-wrap",
            "text-wrap": "nowrap",
            "width": "fit-content",
            "font-size": this.icon_font_size + "%",  // Starting value only, for initial icon scaling
            "margin": 0,
            "background": this.label_bg_color,
            "border-radius": Dash.Size.BorderRadius,
            "cursor": "pointer"
        };

        if (this.height) {
            css["height"] = this.height;
            css["line-height"] = this.height + "px" ;
            css["padding-left"] = Dash.Size.Padding;
            css["padding-right"] = Dash.Size.Padding;
        }

        else {
            css["padding"] = Dash.Size.Padding;
        }

        label.css(css);

        label.on("click", () => {
            var active = this.toggle.IsChecked();

            if ((active && label === this.true_label) || (!active && label === this.false_label)) {
                return;
            }

            this.toggle.Toggle();
        });

        label.on("mouseenter", () => {
            if ((this.toggle.IsChecked() ? this.false_label : this.true_label) !== label) {
                return;
            }

            label.css({
                "border": "1px solid " + this.active_toggle_bg_color
            });
        });

        label.on("mouseleave", () => {
            if ((this.toggle.IsChecked() ? this.false_label : this.true_label) !== label) {
                return;
            }

            label.css({
                "border": "1px solid " + this.label_bg_color
            });
        });

        var container = $("<div>");

        container.css({
            "display": "flex",
            "flex-basis": 0,
            "flex-grow": 3,
            "flex-shrink": 3
        });

        container.append(label);

        this.html.append(container);

        return [label, container];
    };

    setup_toggle () {
        if (this.toggle) {
            return;
        }

        this.toggle = new Dash.Gui.Checkbox(
            undefined,
            this.starting_state,
            this.color,
            "none",
            undefined,
            (toggle) => {
                var active = toggle.IsChecked();

                this.style_on_toggle(active);

                if (this.bound_cb) {
                    this.bound_cb(active);
                }
            }
        );

        this.toggle.html.css({
            "flex": "none",
            "margin-left": this.false_label ? Dash.Size.Padding : 0
        });

        this.toggle.SetTrueIconName(this.true_icon_name);
        this.toggle.SetFalseIconName(this.false_icon_name);

        this.html.append(this.toggle.html);
    }

    style_on_toggle (active) {
        if (!this.true_label && !this.false_label) {
            return;
        }

        var active_label = active ? this.true_label : this.false_label;
        var inactive_label = active ? this.false_label : this.true_label;

        active_label.css({
            "border": "1px solid rgba(0, 0, 0, 0)",
            "font-family": "sans_serif_bold",
            "font-size": (this.text_font_size - (this.height ? 5 : 10)) + "%",
            "background": this.active_toggle_bg_color
        });

        inactive_label.css({
            "font-size": this.text_font_size + "%",
            "border": "1px solid " + this.label_bg_color,
            "font-family": "sans_serif_normal",
            "background": ""
        });
    }
}
