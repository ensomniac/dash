function DashGuiLayoutDashboardModule (binder, style, sub_style) {
    this.binder = binder;
    this.style = style;
    this.sub_style = sub_style;

    this.color = this.binder.color || Dash.Color.Dark;
    this.padding = Dash.Size.Padding;
    this.html = null;
    this.styles = [];
    this.header = $("<div>SetHeaderText()</div>");
    this.header_text = null;
    this.bold_font = "sans_serif_bold";
    this.primary_color = this.color.AccentGood;
    this.secondary_color = window.Dash.Color.Light.Tab.AreaBackground;
    this.secondary_color = this.color.Tab.AreaBackground;

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
            "padding": Dash.Size.Padding * 0.4
        });

        if (this.binder.modules && this.binder.modules.length > 0) {
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

            // TODO: How can we make the text auto-scale with the div without using vh?
            //  Even using a percentage, like 85%, doesn't auto-scale the text, and all
            //  the answers online use ready functions. Using vh, however, works perfectly
            //  for this purpose. What is the reason for being so against using those units?

            "font-size": "1vh",  // TEMP
            "height": "1vh",  // TEMP
        });

        if (this.header_text) {
            this.SetHeaderText(this.header_text);
        }

        this.html.append(this.header);
    };

    // Applies to all module styles
    this.SetHeaderText = function (text) {
        text = text.toString().toUpperCase();

        this.header_text = text;

        this.header.text(text);
    };

    this.initialize_style();
}
