function DashGuiHeader (label_text, color=null, include_border=true) {
    this.label_text = label_text;
    this.color = color || Dash.Color.Light;
    this.include_border = include_border;

    this.icon = null;
    this.line = null;
    this.border = null;
    this.html = $("<div></div>");
    this.label = $("<div>" + this.label_text + "</div>");

    this.setup_styles = function () {
        this.html.css({
            "height": Dash.Size.RowHeight,
            "margin-bottom": Dash.Size.Padding,
            "cursor": "auto"
        });

        this.label.css({
            "text-align": "left",
            "color": this.color.TextHeader,
            "padding-left": Dash.Size.Padding,
            "line-height": Dash.Size.RowHeight + "px",
            "font-family": "sans_serif_bold",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis"
        });

        this.html.append(this.label);

        if (this.include_border) {
            this.border = $("<div></div>");

            this.border.css({
                "position": "absolute",
                "left": -Dash.Size.Padding * 0.25,
                "top": 0,
                "bottom": 0,
                "width": Dash.Size.Padding * 0.5,
                "background": this.color.AccentGood,
            });

            this.html.append(this.border);
        }
    };

    this.Text = function () {
        return this.label.text();
    };

    this.SetText = function (label_text) {
        this.label.text(label_text);
    };

    this.ReplaceBorderWithIcon = function (icon_name, icon_color=null, icon_html_css={}, icon_container_size=null) {
        if (!icon_name) {
            return;
        }

        this.html.empty();

        this.html.css({
            "display": "flex",
            "margin-left": -Dash.Size.Padding * 0.25
        });

        this.icon = new Dash.Gui.Icon(this.color, icon_name, icon_container_size);

        this.icon.html.css({
            ...icon_html_css,
            "cursor": "auto"
        });

        this.icon.SetColor(icon_color || this.color.AccentGood);

        this.label.css({
            "padding-left": Dash.Size.Padding * 0.75,
            "margin-top": "auto",
            "margin-bottom": "auto",
            "margin-right": Dash.Size.Padding
        });

        this.html.append(this.icon.html);
        this.html.append(this.label);

        return this.icon;
    };

    this.AddLine = function (height=0, color="", additional_css={}) {
        if (this.line) {
            return this.line;
        }

        if (!this.icon) {
            this.html.css({
                "display": "flex"
            });

            if (!("margin-left" in additional_css)) {
                additional_css["margin-left"] = Dash.Size.Padding;
            }
        }

        this.line = Dash.Gui.GetFlexSpacer();

        if (!height) {
            height = Dash.Size.Padding * 0.1;
        }

        this.line.css({
            "background": color || this.color.Pinstripe,
            "height": height,
            "margin-top": (this.html.height() * 0.5) - height,
            ...additional_css
        });

        this.html.append(this.line);

        return this.line;
    };

    this.setup_styles();
}
