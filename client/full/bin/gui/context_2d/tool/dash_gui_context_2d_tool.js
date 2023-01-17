function DashGuiContext2DTool (toolbar, icon_name, hover_hint="", hotkey="", cursor="") {
    this.toolbar = toolbar;
    this.icon_name = icon_name;
    this.hover_hint = hover_hint || this.icon_name.Title();
    this.hotkey = hotkey || this.hover_hint[0];
    this.cursor = cursor || (
        this.icon_name === "move" ? "url(https://dash.guide/github/dash/client/full/bin/img/cursor/" + this.icon_name + ".png), grab" : "grab"
    );

    this.selected = false;
    this.icon_button = null;
    this.html = $("<div></div>");
    this.color = this.toolbar.color;
    this.size = this.toolbar.min_width - (this.toolbar.padding * 2) - 2;

    this.setup_styles = function () {
        this.html.css({
            "border-radius": Dash.Size.BorderRadius,
            "height": this.size,
            "width": this.size,
            "margin-top": Dash.Size.Padding,
            "margin-bottom": 0,
            "margin-left": "auto",
            "margin-right": "auto"
        });

        this.validate_hotkey();
        this.add_hotkey_letter();
        this.add_icon_button();
        this.setup_connections();
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        this.html.css({
            "background": ""
        });

        this.selected = false;
    };

    this.Select = function () {
        if (this.selected) {
            return;
        }

        this.toolbar.DeselectTools();

        this.html.css({
            "background": this.color.PinstripeDark
        });

        this.toolbar.editor.SetCanvasTool(this.icon_name, this.cursor);

        this.selected = true;
    };

    this.on_click = function () {
        this.Select();

        // Anything else?
    };

    this.add_hotkey_letter = function () {
        if (!this.hotkey) {
            return;
        }

        var letter = $("<div>" + this.hotkey + "</div>");

        letter.css({
            "position": "absolute",
            "bottom": 0,
            "right": 0,
            "color": this.color.Stroke,
            "font-family": "sans_serif_bold",
            "font-size": "75%",
            "user-select": "none",
            "pointer-events": "none"
        });

        this.html.append(letter);
    };

    this.add_icon_button = function () {
        this.icon_button = new Dash.Gui.IconButton(
            this.icon_name,
            this.on_click,
            this,
            this.color,
            {
                "container_size": this.size,
                "size_mult": this.icon_name === "rotate" ? 0.65 : 0.69
            }
        );

        this.icon_button.SetHoverHint(this.hover_hint);

        this.html.append(this.icon_button.html);
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mouseenter", function () {
                if (self.selected) {
                    return;
                }

                self.html.css({
                    "background": self.color.Pinstripe
                });
            });

            self.html.on("mouseleave", function () {
                if (self.selected) {
                    return;
                }

                self.html.css({
                    "background": ""
                });
            });
        })(this);
    };

    this.validate_hotkey = function () {
        if (!this.hotkey) {
            return;
        }

        for (var tool of this.toolbar.tools) {
            if (tool.hotkey !== this.hotkey) {
                continue;
            }

            console.warn("Duplicate hotkey:", this.hotkey);

            this.hotkey = "";

            return;
        }

        this.hover_hint += " [" + this.hotkey + "]";
    };

    this.setup_styles();
}
