function DashGuiIconButton (icon_name, callback, binder, color, options={}) {
    this.icon = null;
    this.icon_height = options["container_size"] || null;
    this.icon_name = icon_name;
    this.icon_default_opacity = 1;
    this.icon_size_mult = options["size_mult"] || 1.0;
    this.style = options["style"] || "default";
    this.additional_data = options["additional_data"] || null;

    DashGuiButton.call(this, "", callback, binder, color, options);

    this.SetIconColor = function (color) {
        this.icon.SetColor(color);
    };

    this.SetIconSize = function (percentage_number) {
        this.icon.SetSize(percentage_number);

        this.update_container_size();
    };

    this.AddIconShadow = function (value="0px 0px 0px rgba(0, 0, 0, 0.2)") {
        this.icon.AddShadow(value);
    };

    this.SetHoverHint = function (hint) {
        this.html.attr("title", hint);
    };

    this.setup_icon = function () {
        if (this.style === "toolbar") {
            if (!this.icon_height) {
                this.icon_height = Dash.Size.RowHeight;
            }

            this.icon_size_mult = 0.75;

            this.setup_toolbar_icon();
        }

        else if (this.style === "default") {
            if (!this.icon_height) {
                this.icon_height = this.html.height() - (Dash.Size.Padding * 1.2);
            }

            this.setup_default_icon();
        }

        else {
            if (!this.icon_height) {
                this.icon_height = this.html.height() - (Dash.Size.Padding * 1.2);
            }

            console.warn("Warning: Unhandled button / icon style: " + this.style);

            this.setup_default_icon();
        }

        this.update_container_size();

        if (this.icon_name.startsWith("trash")) {
            this.SetHoverHint("Delete");
        }
    };

    this.update_container_size = function () {
        this.html.css({
            "height": this.icon.html.height(),
            "width": this.icon.html.width()
        });
    };

    this.setup_toolbar_icon = function () {
        this.icon = this.get_icon();

        this.highlight.css({
            "background": this.color.AccentGood,
            "top": "auto",
            "height": 3,
            "bottom": -3,
        });

        this.html.css({
            "background": "rgba(0, 0, 0, 0)",
        });

        this.icon.html.css({
            "opacity": this.icon_default_opacity,
        });

        this.html.append(this.icon.html);
    };

    this.setup_default_icon = function () {
        this.icon = this.get_icon();

        this.highlight.css({
            "background": "rgba(0, 0, 0, 0)",
        });

        this.html.css({
            "background": "rgba(0, 0, 0, 0)",
        });

        this.icon.html.css({
            "opacity": this.icon_default_opacity,
        });

        this.html.append(this.icon.html);
    };

    this.get_icon = function () {
        return new Dash.Gui.Icon(
            this.color,          // Dash Color
            this.icon_name,      // Icon name / FA asset path
            this.icon_height,    // Container size
            this.icon_size_mult, // Size mult for the icon, within the container
        );
    };

    this.setup_icon();
}
