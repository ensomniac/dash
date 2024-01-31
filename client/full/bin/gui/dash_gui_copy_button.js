function DashGuiCopyButton (
    binder, getter_cb, size_mult=1, container_size=null, style="default",
    icon_name="copy", color=null, label_text="Copied!"
) {
    this.binder = binder;
    this.getter_cb = getter_cb.bind(binder);
    this.size_mult = size_mult;
    this.container_size = container_size || Dash.Size.RowHeight;
    this.style = style;
    this.icon_name = icon_name;
    this.color = color || binder.color || Dash.Color.Light;
    this.label_text = label_text;

    this.button = null;
    this.icon_color = null;
    this.html = $("<div></div>");
    this.label = $("<div>" + this.label_text + "</div>");
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        this.add_button();
        this.add_label();
    };

    this.add_button = function () {
        this.button = new Dash.Gui.IconButton(
            this.icon_name,
            this.on_click,
            this,
            this.color,
            {
                "container_size": this.container_size,
                "size_mult": this.size_mult
            }
        );

        this.html.append(this.button.html);
    };

    this.SetIconColor = function (color) {
        this.button.SetIconColor(color);

        this.icon_color = color;
    };

    this.AddHighlight = function () {
        this.button.AddHighlight(true);
    };

    this.add_label = function () {
        this.label.css({
            "z-index": 10000,
            "font-family": "sans_serif_normal",
            "color": this.opposite_color.Text,
            "background": this.opposite_color.BackgroundRaised,
            "padding-left": Dash.Size.Padding * 0.25,
            "padding-right": Dash.Size.Padding * 0.25,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "padding-top": Dash.Size.Padding * 0.1,
            "border-radius": Dash.Size.BorderRadius,
            "font-size": (85 * this.size_mult) + "%",
            "pointer-events": "none",
            "user-select": "none",
            "width": "fit-content",
            "text-align": "center",
            "clip-path": "polygon(" +
                "0% 0%, " +     // Top left corner of bubble
                "100% 0%, " +   // Top right corner of bubble
                "100% 85%, " +  // Bottom right corner of bubble
                "60% 85%, " +   // Right point of triangle
                "50% 100%, " +  // Tip of triangle
                "40% 85%, " +   // Left point of triangle
                "0% 85%" +      // Bottom left corner of bubble
            ")"
        });

        this.html.append(this.label);

        this.label.hide();

        (function (self) {
            setTimeout(
                function () {
                    self.label.css({
                        "position": "absolute",
                        "top": -self.label.innerHeight() - ((Dash.Size.Padding * 0.25) * self.size_mult),
                        "left": -((self.label.innerWidth() * 0.5) - (self.button.html.innerWidth() * 0.5))
                    });
                },
                500
            );
        })(this);
    };

    this.on_click = function () {
        var text = this.getter_cb();

        this.button.SetIconColor(this.color.Button.Background.Selected);

        (function (self) {
            navigator.clipboard.writeText(text).then(function () {
                Dash.Log.Log("Copied '" + text + "' to clipboard");

                self.label.stop().fadeIn(
                    "fast",
                    function () {
                        self.button.SetIconColor(self.icon_color || self.color.Button.Background.Base);

                        setTimeout(
                            function () {
                                self.label.stop().fadeOut("slow");
                            },
                            1250
                        );
                    }
                );
            });
        })(this);
    };

    this.setup_styles();
}
