function DashGuiVDBListRow (list_view, data) {
    this.list_view = list_view;
    this.data = data;

    this.html = $("<div></div>");
    this.hover = $("<div></div>");
    this.vdb_type = this.list_view.vdb_type;
    this.display_name_label = $("<div></div>");
    this.border_color_inactive = "rgba(0, 0, 0, 0)";
    this.color = this.list_view.color || Dash.Color.Light;
    this.border_color_active = this.color.BackgroundRaised;
    this.bg_color = Dash.Color.GetTransparent(this.border_color_active, 0.5);

    this.setup_styles = function (validated=false) {
        if (!validated && !(this instanceof DashGuiVDBListRow)) {
            setTimeout(
                () => {
                    // If this class is inherited, use a small delay
                    // to allow for any overrides before setup
                    this.setup_styles(true);
                },
                100
            );

            return;
        }

        this.html.append(this.hover);
        this.html.append(this.display_name_label);
        this.html.append(Dash.Gui.GetFlexSpacer());

        this.hover.css({
            "position": "absolute",
            "background": this.bg_color,
            "inset": 0,
            "pointer-events": "none",
            "user-select": "none",
            "opacity": 0
        });

        this.html.css({
            "display": "flex",
            "height": Dash.Size.ButtonHeight,
            "line-height": Dash.Size.ButtonHeight + "px",
            "border-bottom": "1px solid " + this.color.Pinstripe,
            "border-top": "1px solid " + this.border_color_inactive,
            "padding-left": Dash.Size.Padding * 0.5,
            "cursor": "pointer",
            "user-select": "none",
            "background": "none"
        });

        this.display_name_label.css({
            "height": Dash.Size.ButtonHeight,
            "line-height": Dash.Size.ButtonHeight + "px",
            "padding-left": Dash.Size.Padding * 0.5,
            "color": this.color.Text
        });

        this.setup_connections();
        this.Update(this.data);
    };

    this.SetActive = function (is_active) {
        if (is_active) {
            this.html.css({
                "background": this.bg_color,
                "border-top": "1px solid " + this.border_color_active
            });

            this.display_name_label.css({
                "opacity": 1.0
            });
        }

        else {
            this.html.css({
                "background": "none",
                "border-top": "1px solid " + this.border_color_inactive
            });

            this.display_name_label.css({
                "opacity": 0.75
            });
        }
    };

    this.Update = function (data) {
        if (!data) {
            return;
        }

        this.data = data;

        this.display_name_label.text(this.data["display_name"] || this.data["id"]);
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("click", function () {
                self.list_view.ViewObj(self.data["id"]);
            });

            self.html.on("mouseenter", function () {
                self.hover.stop().animate({"opacity": 1}, 50);
            });

            self.html.on("mouseleave", function () {
                self.hover.stop().animate({"opacity": 0}, 100);
            });
        })(this);
    };

    this.setup_styles();
}
