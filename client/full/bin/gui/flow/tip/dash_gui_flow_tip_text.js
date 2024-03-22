class DashGuiFlowTipText {
    constructor (view, text, more_text="") {
        this.view = view;
        this.text = text;
        this.more_text = more_text;

        this.label = null;
        this.more_label = null;
        this.emphasized = false;
        this.show_more_toggle = null;
        this.color = this.view.color;
        this.html = $("<div></div>");

        this.style = {
            "default": {
                "default": {
                    "bg_color": this.color.PinstripeLight,
                    "font_color": this.color.StrokeLight,
                    "border_color": this.color.PinstripeDark,
                    "font_size": "105%"
                },
                "emphasized": {
                    "bg_color": this.color.Pinstripe,
                    "font_color": this.color.Stroke,
                    "border_color": this.color.StrokeLight,
                    "font_size": "105%"
                }
            },
            "toggle": {
                "default": {
                    "icon_color": this.color.Pinstripe,
                    "font_color": this.color.PinstripeDark,
                    "font_size": "85%"
                },
                "emphasized": {
                    "icon_color": this.color.PinstripeDark,
                    "font_color": this.color.StrokeLight,
                    "font_size": "85%"
                }
            },
            "code": {
                "default": {
                    "bg_color": Dash.Color.Lighten(this.color.Background, 7),
                    "font_color": Dash.Color.GetTransparent(
                        ColorAccentSecondary,
                        0.75
                    ),
                    "border_color": this.color.Pinstripe,
                    "font_size": "85%"
                },
                "emphasized": {
                    "bg_color": Dash.Color.Lighten(this.color.Background, 10),
                    "font_color": Dash.Color.GetTransparent(
                        ColorAccentSecondary,
                        0.85
                    ),
                    "border_color": this.color.Pinstripe,
                    "font_size": "85%"
                }
            },
            "italic": {
                "default": {
                    "font_size": "100%"
                },
                "emphasized": {
                    "font_size": "100%"
                }
            },
            "bold": {
                "default": {
                    "font_size": "100%"
                },
                "emphasized": {
                    "font_size": "100%"
                }
            },
        };

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "filter": "sepia(100%) hue-rotate(-15deg)",
            "cursor": "help",
            "user-select": "none",
            "padding": Dash.Size.Padding,
            "padding-top": Dash.Size.Padding * 0.5,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "border": "1px solid " + this.get_style_value("border_color"),
            "background": this.get_style_value("bg_color"),
            "border-radius": Dash.Size.BorderRadius,
            "max-width": this.view.content_area_size * 0.5,
            "display": "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center"
        });

        this.label = this.get_label(this.text);

        this.html.append(this.label);

        if (this.more_text) {
            this.add_more_label();
        }
    }

    SetText (text) {
        this.text = text;

        this.set_text(this.label, this.text);
    }

    SetMoreText (text) {
        this.more_text = text;

        if (!this.more_label) {
            if (text) {
                this.add_more_label();
            }

            return;
        }

        if (text) {
            this.show_more_toggle.html.show();
        }

        else {
            this.show_more_toggle.html.hide();
        }

        this.set_text(this.more_label, this.more_text);
    }

    Emphasize () {
        this.emphasized = true;

        this.toggle_emphasis();
    }

    EmphasizeOnHover () {
        this.html.on("mouseenter", () => {
            this.Emphasize();
        });

        this.html.on("mouseleave", () => {
            this.reset_emphasis();
        });
    }

    set_text (label, text) {
        var parsed = this.parse_text(text);

        if (parsed.includes("</") || parsed.includes("<br>")) {
            // jQuery's .text() escapes HTML tags, so this approach is required
            label[0].innerHTML = parsed;
        }

        else {
            label.text(parsed);
        }
    }

    get_label (text) {
        var label = $("<div>" + this.parse_text(text) + "</div>");

        label.css(this.get_label_css());

        return label;
    }

    get_label_css (type="default") {
        return {
            "color": this.get_style_value("font_color", type),
            "font-family": "sans_serif_normal",
            "font-size": this.get_style_value("font_size", type),
            "white-space": "pre-wrap",
            "text-align": "center",
            "overflow": "hidden",
            "text-overflow": "ellipsis"
        };
    }

    add_more_label () {
        if (this.more_label) {
            return;
        }

        this.more_label = this.get_label(this.more_text);

        this.more_label.css({
            "opacity": 0,
            "height": 0,
            "overflow": "hidden"
        });

        this.html.append(this.more_label);

        this.show_more_toggle = new Dash.Gui.Checkbox(
            "",
            false,
            this.color,
            "none",
            this,
            (toggle) => {
                if (!this.more_label) {
                    return;
                }

                var delay_ms = 300;

                if (toggle.IsChecked()) {
                    this.more_label.css({
                        "height": "auto"
                    });

                    var height = this.more_label[0].scrollHeight;

                    this.more_label.css({
                        "height": 0
                    });

                    this.more_label.animate(
                        {
                            "opacity": 1,
                            "height": height
                        },
                        delay_ms
                    );

                    this.show_more_toggle.label.SetText("Show less");
                }

                else {
                    this.more_label.animate(
                        {
                            "opacity": 0,
                            "height": 0
                        },
                        delay_ms
                    );

                    this.show_more_toggle.label.SetText("Show more");
                }

                this.refresh_toggle_click();
            },
            "Show more"
        );

        this.show_more_toggle.SetIconColor(this.get_style_value("icon_color", "toggle"));
        this.show_more_toggle.SetFalseIconName("caret_down");
        this.show_more_toggle.SetTrueIconName("caret_up");

        this.show_more_toggle.label.html.css({
            "cursor": "pointer"
        });

        this.show_more_toggle.label.label.css(this.get_label_css("toggle"));

        this.refresh_toggle_click();

        this.html.append(this.show_more_toggle.html);
    }

    refresh_toggle_click () {
        this.show_more_toggle.label.html.on("click", () => {
            this.show_more_toggle.Toggle();
        });
    }

    reset_emphasis () {
        this.emphasized = false;

        this.toggle_emphasis();
    }

    toggle_emphasis () {
        this.html.css({
            "border": "1px solid " + this.get_style_value("border_color"),
            "background": this.get_style_value("bg_color")
        });

        var font_color = this.get_style_value("font_color");

        this.label.css({
            "color": font_color
        });

        this.set_text(this.label, this.text);

        if (this.more_label) {
            this.more_label.css({
                "color": font_color
            });

            this.set_text(this.more_label, this.more_text);

            this.show_more_toggle.label.label.css({
                "color": this.get_style_value("font_color", "toggle")
            });

            this.show_more_toggle.SetIconColor(this.get_style_value("icon_color", "toggle"));
        }

        this.SetText(this.text);
    }

    // Similar to markdown:
    //  - `code`
    //  - ~italic~
    //  - *bold*
    parse_text (text="") {
        if (!text && text !== 0) {
            return "";
        }

        // Line breaks don't work at the beginning for some reason, so replace with one "<br>" for every two "\n"
        if (text === this.more_text && text.startsWith("\n")) {
            var og_len = text.length;

            text = text.LTrim("\n");

            var breaks = "";

            for (var _ of Dash.Math.Range(Math.ceil((og_len - text.length) / 2))) {
                breaks += "<br>";
            }

            text = breaks + text;
        }

        text = text.toString().trim();

        var parsed = "";
        var code_active = false;
        var bold_active = false;
        var italic_active = false;

        for (var char of text) {
            if (  // Code
                   char === "`"
                && !bold_active
                && !italic_active
            ) {
                if (code_active) {
                    parsed += "</i>";

                    code_active = false;
                }

                else {
                    parsed += this.get_style_string({
                        "font-family": "Andale Mono, Monaco, monospace",
                        "font-size": this.get_style_value("font_size", "code"),
                        "color": this.get_style_value("font_color", "code"),
                        "background": this.get_style_value("bg_color", "code"),
                        "border": "1px solid " + this.get_style_value("border_color", "code"),
                        "border-radius": Dash.Size.BorderRadius,
                        "padding-left": Dash.Size.Padding * 0.2,
                        "padding-right": Dash.Size.Padding * 0.2,
                        "padding-top": Dash.Size.Padding * 0.1,
                        "padding-bottom": Dash.Size.Padding * 0.1
                    });

                    code_active = true;
                }
            }

            else if (  // Italic
                   char === "~"
                && !code_active
                && !bold_active
            ) {
                if (italic_active) {
                    parsed += "</i>";

                    italic_active = false;
                }

                else {
                    parsed += this.get_style_string({
                        "font-family": "sans_serif_italic",
                        "font-size": this.get_style_value("font_size", "italic"),
                        "color": this.get_style_value("font_color", "italic")
                    });

                    italic_active = true;
                }
            }

            else if (  // Bold
                   char === "*"
                && !code_active
                && !italic_active
            ) {
                if (bold_active) {
                    parsed += "</i>";

                    bold_active = false;
                }

                else {
                    parsed += this.get_style_string({
                        "font-family": "sans_serif_bold",
                        "font-size": this.get_style_value("font_size", "bold"),
                        "color": this.get_style_value("font_color", "bold")
                    });

                    bold_active = true;
                }
            }

            else {
                parsed += char;
            }
        }

        return parsed;
    }

    get_style_value (key, type="default") {
        var style = this.style[type]?.[this.emphasized ? "emphasized" : "default"];

        if (!style || !(key in style)) {
            style = this.style["default"][this.emphasized ? "emphasized" : "default"];
        }

        if (!(key in style)) {
            Dash.Log.Warn("Warning: Unhandled style key:", key);
        }

        return style[key];
    }

    get_style_string (css) {
        var style = "<i style='";

        for (var key in css) {
            style += key + ": " + css[key];

            if (typeof css[key] === "number") {
                style += "px";
            }

            style += ";";
        }

        style += "'>";

        return style;
    }
}
