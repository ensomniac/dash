function DashGuiLayoutDashboardModule (dashboard, style, sub_style) {
    this.dashboard = dashboard;
    this.style = style;
    this.sub_style = sub_style;

    // TODO: Update all uses of VH

    this.color = this.dashboard.color || Dash.Color.Dark;
    this.modules = this.dashboard.modules;
    this.rect_aspect_ratio = this.dashboard.rect_aspect_ratio;
    this.square_aspect_ratio = this.dashboard.square_aspect_ratio;
    this.html = null;
    this.styles = [];
    this.header = $("<div>SetHeaderText()</div>");
    this.header_text = null;
    this.bold_font = "sans_serif_bold";
    this.primary_color = this.color.AccentGood;
    this.secondary_color = window.Dash.Color.Light.Tab.AreaBackground;
    this.secondary_color = this.color.Tab.AreaBackground;
    this.margin = this.dashboard.margin;
    this.padding = this.dashboard.padding;
    this.canvas = null;

    this.text_css = {
        "font-family": this.bold_font,
        "overflow": "hidden",
        "text-overflow": "ellipsis",
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

        this.header_text = text;

        this.header.text(text);
    };

    this.initialize_style = function () {
        if (this.color === Dash.Color.Dark) {
            this.secondary_color = Dash.Color.Light.Tab.AreaBackground;
        }

        else if (this.color === Dash.Color.Light) {
            this.secondary_color = Dash.Color.Dark.Tab.AreaBackground;
        }

        if (this.style === "flex") {
            DashGuiLayoutDashboardModuleFlex.call(this);
        }

        else if (this.style === "square") {
            DashGuiLayoutDashboardModuleSquare.call(this);
        }

        else if (this.style === "rect") {
            DashGuiLayoutDashboardModuleRect.call(this);
        }

        else {
            console.log("ERROR: Invalid Module Style:", this.style);

            return;
        }

        if (!this.styles.includes(this.sub_style)) {
            console.log("ERROR: Invalid Module Sub-Style:", this.sub_style);

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

            // TODO: Replace units if necessary
            "margin": this.margin.toString() + "vh",  // TEMP
            "padding": this.padding.toString() + "vh"  // TEMP
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

            // TODO: Replace units if necessary
            "font-size": "1vh",  // TEMP
            "height": "1vh",  // TEMP
        });

        if (this.header_text) {
            this.SetHeaderText(this.header_text);
        }

        this.html.append(this.header);
    };

    this.initialize_style();
}