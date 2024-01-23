function DashGuiIcon (color=null, icon_name="unknown", container_size=null, icon_size_mult=1, icon_color=null) {
    this.color = color || Dash.Color.Light;
    this.name = icon_name;
    this.size = container_size || Dash.Size.RowHeight;
    this.size_mult = icon_size_mult;
    this.icon_color = icon_color || this.color.Button.Background.Base;

    // this.theme = "light";
    this.icon_html = null;
    this.icon_definition = new DashGuiIcons(this);
    this.html = $("<div class='GuiIcon'></div>");

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
            "cursor": "pointer",  // TODO: why is this the default?
            "user-select": "none"
        });

        this.icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');

        this.icon_html.css(this.icon_definition.get_css());

        this.html.append(this.icon_html);
    };

    this.SetIcon = function (icon_name) {
        if (icon_name === this.name) {
            return;
        }

        this.name = icon_name || "unknown";
        this.icon_definition = new DashGuiIcons(this);

        var icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');

        icon_html.css(this.icon_definition.get_css());

        this.html.append(icon_html);

        if (this.icon_html) {
            this.icon_html.remove();
        }

        this.icon_html = icon_html;

        return this;
    };

    this.SetSize = function (icon_size_percent_num, container_size=null, enforce_container_size_num=true) {
        if (container_size) {
            container_size = enforce_container_size_num ? parseInt(container_size) : container_size;

            if (enforce_container_size_num && isNaN(container_size)) {
                console.warn("Warning: DashGuiIcon SetSize requires a number for container_size");
            }

            else {
                this.size = container_size;

                this.html.css({
                    "width": this.size,
                    "height": this.size
                });

                this.icon_html.css(this.icon_definition.get_css());
            }
        }

        icon_size_percent_num = parseInt(icon_size_percent_num);

        if (isNaN(icon_size_percent_num)) {
            console.error(
                "Error: DashGuiIcon SetSize requires a number for " +
                "icon_size_percent_num (that represents a percentage)"
            );

            return;
        }

        this.icon_html.css({
            "font-size": icon_size_percent_num.toString() + "%"
        });

        return this;
    };

    this.SetColor = function (color) {
        this.icon_html.css({
            "color": color
        });

        return this;
    };

    this.Mirror = function () {
        this.icon_html.css({
            "transform": "scale(-1, 1)"
        });

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

        this.icon_html.css({
            "text-shadow": value
        });

        return this;
    };

    // this.update = function (icon_id) {
    //     this.id = icon_id;
    //     this.url = ICON_MAP["url_prefix"] + ICON_MAP["icons"][this.id][0];
    //     this.default_size = ICON_MAP["icons"][this.id][1];
    // };

    this.setup_styles();
}
