function DashGuiIconButton (icon_name, callback, binder, color, options={}) {
    this.icon = null;
    this.icon_height = options["container_size"] || null;
    this.icon_name = icon_name;
    this.icon_default_opacity = 1;
    this.icon_size_mult = options["size_mult"] || 1.0;
    this.style = options["style"] || "default";
    this.additional_data = options["additional_data"] || null;

    DashGuiButton.call(this, "", callback, binder, color, options);

    (function (self, options) {

        requestAnimationFrame(function () {

            if (options["icon_color"]) {
                self.SetIconColor(options["icon_color"]);
            };

        });

    })(this, options);

    this.SetIconColor = function (color) {
        this.icon.SetColor(color);

        return this;
    };

    this.SetIconSize = function (icon_size_percent_num, container_size=null, enforce_container_size_num=true) {
        if (container_size) {
            this.icon_height = container_size;

            this.html.css({
                "height": this.icon_height
            });
        }

        this.icon.SetSize(icon_size_percent_num, container_size, enforce_container_size_num);

        this.update_container_size();

        return this;
    };

    this.AddIconShadow = function (value="0px 0px 0px rgba(0, 0, 0, 0.2)") {
        this.icon.AddShadow(value);

        return this;
    };

    this.AddIconStroke = function (color="black") {
        this.icon.AddStroke(color);

        return this;
    };

    this.MirrorIcon = function () {
        this.icon.Mirror();

        return this;
    };

    this.SetIcon = function (icon_name) {

        if (icon_name == this.icon_name) {
            // WARNING: Ryan modified this on Sep 14 '24 and notes
            // that it's possible this may have breaking implications
            // for existing code and may need to be allowed past this
            // return on initialization!
            return;
        };

        this.icon_name = icon_name;
        this.icon.SetIcon(icon_name);

        return this;
    };

    this.SetHoverHint = function (hint) {
        this.html.attr("title", hint);

        return this;
    };

    this.AddHighlight = function (force_in_container=false) {
        if (Dash.IsMobile) {
            return this;
        }

        var height = 3;

        this.highlight.css({
            "background": this.color.AccentGood,
            "top": force_in_container && this.icon_height ? (this.icon_height - height) : "auto",
            "height": height,
            "bottom": -height
        });

        return this;
    };

    this.FitWidth = function () {
        this.icon.html.css({
            "width": "fit-content"
        });

        this.icon.icon_html.css({
            "width": "fit-content"
        });

        this.html.css({
            "width": "fit-content"
        });
    };

    this.setup_icon = function () {
        if (this.style === "toolbar") {
            if (!this.icon_height) {
                this.icon_height = Dash.Size.RowHeight;
            }

            // This is old and not great, but removing it will break stuff - ugh
            if (this.icon_size_mult === 1.0) {
                this.icon_size_mult = 0.75;
            }

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

            Dash.Log.Warn("Warning: Unhandled button / icon style: " + this.style);

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

        // Should this just be the default regardless of style?
        this.AddHighlight();

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
