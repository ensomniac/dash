function DashGuiContext2DTool (toolbar, icon_name, hover_hint="", hotkey="") {
    this.toolbar = toolbar;
    this.icon_name = icon_name;
    this.hover_hint = hover_hint || (icon_name === "expand_square_arrows" ? "Expand" : this.icon_name.Title());
    this.hotkey = hotkey || this.hover_hint[0];

    console.debug("TEST", this.hotkey);

    this.selected = false;
    this.icon_button = null;
    this.html = $("<div></div>");
    this.color = this.toolbar.color;
    this.size = this.toolbar.min_width - (this.toolbar.padding * 2) - 2;

    // TODO: add hotkeys for each tool and show that hotkey on hover, and/or next to the icon if feasible, and update the canvas cursor based on the tool

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

        this.setup_icon_button();
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

        this.selected = true;
    };

    this.on_click = function () {
        this.Select();

        // TODO
    };

    this.setup_icon_button = function () {
        this.icon_button = new Dash.Gui.IconButton(
            this.icon_name,
            this.on_click,
            this,
            this.color,
            {
                "container_size": this.size,
                "size_mult": this.icon_name === "rotate" ? 0.66 : 0.7
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

    this.setup_styles();
}
