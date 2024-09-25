function DashGuiIcon (
    color=null, icon_name="unknown", container_size=null, icon_size_mult=1, icon_color=null
) {
    this.color = color || Dash.Color.Light;
    this.name = icon_name;
    this.size = container_size || Dash.Size.RowHeight;
    this.size_mult = icon_size_mult;
    this.icon_color = icon_color || this.color.Button.Background.Base;

    // this.theme = "light";
    this.icon_html = null;
    this.icon_fill = null;
    this.icon_definition = new DashGuiIcons(this);
    this.html = $("<div class='GuiIcon'></div>");
    this.set_color = null;
    this.initialized = false;

    if (!this.color.Text) {
        console.error("Error: Incorrect color object passed to DashGuiIcon:", this.color);
        console.trace();

        debugger;
    }

    this.setup_styles = function () {
        this.html.css({
            "width": this.size,
            "height": this.size,
            "margin": 0,
            "padding": 0,
            "cursor": "pointer",  // Why is this the default?
            "user-select": "none"
        });

        this.icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');

        this.icon_html.css(this.icon_definition.get_css());

        this.html.append(this.icon_html);

        (function (self) {
            requestAnimationFrame(function () {
                self.initialized = true;
            });
        })(this);
    };

    // TODO: write a function very similar to this to use a different icon as
    //  the "background" to essentially "combine" two different icons into one
    this.AddColorFill = function (color) {
        if (this.icon_fill) {
            console.warn("Warning: A color-fill already exists for this icon. Its color will be updated instead.");

            this.icon_fill.css({
                "color": color
            });

            return this.icon_fill;
        }

        var fill_icon_name = this.name + "_solid";

        if (!(fill_icon_name in DashGuiIconMap)) {
            fill_icon_name = this.name + "_heavy";

            if (!(fill_icon_name in DashGuiIconMap)) {
                console.error(
                      "Error:\nCan't add color-fill to icon because there's no solid version in DashGuiIcons\n"
                    + "(expecting an identically-named icon with a suffix of '_solid' or '_heavy' using the "
                    + "'solid' weight).\nAdd a solid version of the icon to DashGuiIcons to resolve this."
                );

                return;
            }
        }

        if (DashGuiIconMap[fill_icon_name][1] !== "s") {
            console.error(
                  "Error: Can't add color-fill to icon because the solid version of "
                + "the icon that was found does not have its weight set to 'solid'."
            );

            return;
        }

        this.icon_fill = new Dash.Gui.Icon(this.color, icon_name + "_solid", this.size, this.size_mult, color);

        this.icon_fill.html.css({
            "position": "absolute",
            "inset": 0
        });

        this.html.prepend(this.icon_fill.html);

        return this.icon_fill;
    };

    this.SetIcon = function (icon_name) {
        if (icon_name === this.name) {
            return this;
        }

        var fill_color = "";
        
        if (this.icon_fill) {
            fill_color = this.icon_fill.icon_color;

            this.icon_fill.html.remove();

            this.icon_fill = null;
        }

        this.name = icon_name || "unknown";
        this.icon_definition = new DashGuiIcons(this);

        var icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');
        var icon_css = this.icon_definition.get_css();

        if (this.set_color) {
            icon_css["color"] = this.set_color;
        };

        icon_html.css(icon_css);

        if (this.icon_html) {

            if (this.initialized) {
                // Animate icon change

                icon_html.css({"opacity": 0});

                (function (self, icon_html) {

                    self.icon_html.stop().animate({"opacity": 0}, 200, function () {
                        self.icon_html.remove();
                        self.html.append(icon_html);
                        self.icon_html = icon_html;
                        icon_html.stop().animate({"opacity": 1}, 300, function () {
                            // ...
                        });
                    });

                })(this, icon_html);

            }
            else {
                // No anim
                this.html.append(icon_html);
                this.icon_html.remove();
                this.icon_html = icon_html;
            };

        };

        if (fill_color) {
            this.AddColorFill(fill_color);
        };

        return this;

    };

    this.SetSize = function (icon_size_percent_num, container_size=null, enforce_container_size_num=true) {
        if (container_size) {
            container_size = enforce_container_size_num ? parseInt(container_size) : container_size;

            if (enforce_container_size_num && isNaN(container_size)) {
                Dash.Log.Warn("Warning: DashGuiIcon SetSize requires a number for container_size");
            }

            else {
                this.size = container_size * (Dash.Size.DesktopToMobileMode ? 0.8 : 1);

                this.html.css({
                    "width": this.size,
                    "height": this.size
                });

                this.icon_html.css(this.icon_definition.get_css());

                if (this.icon_fill) {
                    this.icon_fill.size = this.size;

                    this.icon_fill.html.css({
                        "width": this.size,
                        "height": this.size
                    });

                    this.icon_fill.icon_html.css(this.icon_fill.icon_definition.get_css());
                }
            }
        }

        icon_size_percent_num = parseInt(icon_size_percent_num);

        if (isNaN(icon_size_percent_num)) {
            console.error(
                "Error: DashGuiIcon SetSize requires a number for " +
                "icon_size_percent_num (that represents a percentage)"
            );

            return this;
        }

        var css = {
            "font-size": (icon_size_percent_num * (Dash.Size.DesktopToMobileMode ? 0.8 : 1)).toString() + "%"
        };

        this.icon_html.css(css);

        if (this.icon_fill) {
            this.icon_fill.icon_html.css(css);
        }

        return this;
    };

    this.SetColor = function (color) {
        var css = {"color": color};
        this.set_color = color;
        this.icon_html.css(css);

        if (this.icon_fill) {
            this.icon_fill.icon_html.css(css);
        }

        return this;
    };

    this.Mirror = function () {
        var css = {"transform": "scale(-1, 1)"};

        this.icon_html.css(css);

        if (this.icon_fill) {
            this.icon_fill.icon_html.css(css);
        }

        return this;
    };

    this.AddStroke = function (color="black") {
        this.AddShadow(
            "-1px 1px 0 " + color + ", 1px 1px 0 " + color + ", 1px -1px 0 " + color + ", -1px -1px 0 " + color
        );

        return this;
    };

    this.AddShadow = function (value="") {
        if (!value) {
            if (Dash.DarkModeActive) {
                value = "0px 0px 0px rgba(255, 255, 255, 0.2)";
            }

            else {
                value = "0px 0px 0px rgba(0, 0, 0, 0.2)";
            }
        }

        var css = {"text-shadow": value};

        this.icon_html.css(css);

        if (this.icon_fill) {
            this.icon_fill.icon_html.css(css);
        }

        return this;
    };

    this.setup_styles();
}
