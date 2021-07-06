function DashGuiLayoutDashboardModule (binder, style, sub_style) {
    this.binder = binder;
    this.style = style;
    this.sub_style = sub_style;

    this.color = this.binder.color || Dash.Color.Dark;
    this.padding = Dash.Size.Padding;
    this.html = null;
    this.styles = [];
    this.header_text = $("<div>SetHeaderText()</div>");
    this.bold_font = "sans_serif_bold";
    this.primary_color = this.color.AccentGood;
    this.secondary_color = window.Dash.Color.Light.Tab.AreaBackground;
    this.secondary_color = this.color.Tab.AreaBackground;

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

        this.header_text.css({
            "color": this.secondary_color,
            "font-family": this.bold_font,
            "margin": "0 auto",
            "width": "95%",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "text-align": "center",

            // TODO: How can we make the text auto-scale with the div without using vh?
            //  Even using a percentage, like 85%, doesn't auto-scale the text, and all
            //  the answers online use ready functions. Using vh, however, works perfectly
            //  for this purpose. What is the reason for being so against using those units?

            "font-size": "1vh",  // TEMP
            "height": "1vh",  // TEMP
        });

        this.html.append(this.header_text);
    };

    // Applies to all module styles
    this.SetHeaderText = function (text) {
        this.header_text.text(text.toString().toUpperCase());
    };

    this.initialize_style();
}
