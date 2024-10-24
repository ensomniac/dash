function DashLayoutDashboardModule (dashboard, style, sub_style) {
    this.dashboard = dashboard;
    this.style = style;
    this.sub_style = sub_style;

    this.color = this.dashboard.color || Dash.Color.Dark;
    this.modules = this.dashboard.modules;
    this.use_v = this.dashboard.use_v;
    this.rect_aspect_ratio = this.dashboard.rect_aspect_ratio;
    this.square_aspect_ratio = this.dashboard.square_aspect_ratio;
    this.html = null;
    this.styles = [];
    this.header = $("<div></div>");
    this.header_text = null;
    this.bold_font = "sans_serif_bold";
    this.primary_color = this.color.AccentGood;
    this.margin = this.dashboard.margin;
    this.padding = this.dashboard.padding;
    this.canvas = null;
    this.secondary_color = this.color.Stroke;

    this.text_css = {
        "font-family": this.bold_font,
        "white-space": "nowrap"
    };

    this.centered_text_css = {
        ...this.text_css,
        "text-align": "center",
        "margin-left": "auto",
        "margin-right": "auto"
    };

    // Applies to all module styles
    this.SetHeaderText = function (text) {
        text = text.toString().toUpperCase();

        if (text === this.header_text) {
            return;
        }

        if (!this.header_text) {
            this.header_text = text;

            this.header.text(this.header_text);

            return;  // No need to animate
        }

        this.header_text = text;

        (function (self) {
            self.header.fadeOut(
                500,
                function () {
                    self.header.text(self.header_text);
                    self.header.fadeIn(500);
                }
            );
        })(this);
    };

    this.initialize_style = function () {
        if (this.style === "flex") {
            DashLayoutDashboardModuleFlex.call(this);
        }

        else if (this.style === "square") {
            DashLayoutDashboardModuleSquare.call(this);
        }

        else if (this.style === "rect") {
            DashLayoutDashboardModuleRect.call(this);
        }

        else {
            console.error("Error: Invalid Module Style:", this.style);

            return;
        }

        if (!this.styles.includes(this.sub_style)) {
            console.error("Error: Invalid Module Sub-Style:", this.sub_style);

            return;
        }

        this.html = Dash.Gui.GetHTMLBoxContext();

        this.add_header();
        this.setup_styles();
        this.modify_styles();
    };

    this.modify_styles = function () {
        this.html.css({
            "background": this.color.BackgroundRaised,
            "margin": this.dashboard.get_vmargin() + (this.use_v ? "vh" : 0),
            "padding": this.padding + (this.use_v ? "vh" : 0)
        });

        if (this.modules && this.modules.length > 0) {
            this.html.css({
                "margin-left": 0
            });
        }
    };

    this.add_header = function () {
        this.header.css({
            ...this.centered_text_css,
            "color": this.secondary_color,
            "width": "95%",
            "font-size": this.dashboard.get_text_vsize(0.06) + (this.use_v ? "vh" : 0),
            "height": this.dashboard.get_text_vsize(0.06) + (this.use_v ? "vh" : 0)
        });

        if (this.header_text) {
            this.SetHeaderText(this.header_text);
        }

        this.html.append(this.header);
    };

    this.initialize_style();
}
