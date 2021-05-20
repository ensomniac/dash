function DashGuiComboStyleDefault () {
    this.dropdown_icon = null;

    this.setup_styles = function () {
        var icon_color = this.color;

        // This inverse color setting is needed because it's not showing the
        // right color to match the color of the text and looks odd
        if (this.color === Dash.Color.Light) {
            icon_color = Dash.Color.Dark;
        }

        else if (this.color === Dash.Color.Dark) {
            icon_color = Dash.Color.Light;
        }

        this.dropdown_icon = new DashIcon(icon_color, "arrow_down", Dash.Size.RowHeight, 0.75);
        this.dropdown_icon.html.addClass("ComboLabel");
        this.dropdown_icon.html.addClass("Combo");

        this.dropdown_icon.html.css({
            "position": "relative",
            "display": "block",
            "right": Dash.Size.Padding * 0.5,
            "top": Dash.Size.Padding * 0.5,
            "margin-left": -(Dash.Size.Padding*0.25),
            "pointer-events": "none",
        });

        this.font_size = "100%";

        this.highlight_css = {
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.color_set.Background.BaseHover,
            "opacity": 0,
        };

        this.text_alignment = "center";
        this.label_text_color = "rgba(0, 0, 0, 0.8)";
        this.label_background = this.color_set.Background.Base;

        this.inner_html = $("<div></div>");
        this.html.append(this.inner_html);

        this.inner_html.append(this.highlight);
        this.inner_html.append(this.click);
        // this.inner_html.append(this.label);
        this.inner_html.append(this.label_container);
        this.inner_html.append(this.rows);
        this.label.text(this.label_text);

        this.label_container.css({
            "display": "flex"
        });

        this.label_container.append(this.label);
        this.label_container.append(this.dropdown_icon.html);

        this.html.css({
            "display": "flex",
            "height": d.Size.ButtonHeight,
        });

        this.inner_html.css({
            "background": this.label_background,
            "height": d.Size.ButtonHeight,
            "line-height": d.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": 3,
        });

        this.highlight.css(this.highlight_css);

        this.click.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "line-height": d.Size.ButtonHeight + "px",
            "background": this.color_set.Background.Base,
            "opacity": 0,
        });

        this.label.css({
            "line-height": d.Size.ButtonHeight + "px",
            "text-align": this.text_alignment,
            "font-size": this.font_size,
            "color": this.color_set.Text.Base,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.ButtonHeight,
        });

        this.rows.css({
            "position": "absolute",
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "border-radius": 3,
            "background": "orange",
        });
    };
}
