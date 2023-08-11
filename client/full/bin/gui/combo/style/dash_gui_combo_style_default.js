/**@member DashGuiCombo*/

function DashGuiComboStyleDefault () {
    this.dropdown_icon_css = {
        "position": "relative",
        "display": "block",
        "right": Dash.Size.Padding * 0.5,
        "top": Dash.Size.Padding * 0.5,
        "margin-left": -(Dash.Size.Padding * 0.25),
        "pointer-events": "none"
    };

    this.setup_styles = function () {
        if (this.style === "default_bubbled") {
            this.list_offset_vertical = 4;
        }

        var height = Dash.Size.ButtonHeight - (this.style === "default_bubbled" ? this.list_offset_vertical : 0);
        var border_radius = this.style === "default_bubbled" ? Dash.Size.Padding * 2 : Dash.Size.BorderRadius;

        this.highlight_css = {
            "position": "absolute",
            "inset": 0,
            "background": this.color_set.Background.BaseHover,
            "border-radius": border_radius,
            "opacity": 0
        };

        this.font_size = Dash.Size.DesktopToMobileMode ? "75%" : "100%";
        this.text_alignment = "center";
        this.label_background = this.color_set.Background.Base;
        this.inner_html = $("<div></div>");

        this.html.append(this.inner_html);

        this.inner_html.append(this.highlight);
        this.inner_html.append(this.click);
        this.inner_html.append(this.label_container);
        this.inner_html.append(this.rows);

        this.label.text(this.label_text);

        this.label_container.css({
            "display": "flex"
        });

        this.label_container.append(this.label);

        this.add_dropdown_icon();

        this.html.css({
            "display": "flex",
            "height": height
        });

        this.inner_html.css({
            "background": this.label_background,
            "height": Dash.Size.ButtonHeight,
            "line-height": Dash.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": border_radius
        });

        if (this.style === "default_bubbled") {
            this.inner_html.css({
                "border": "2px solid " + this.color.StrokeLight,
                "box-sizing": "border-box"
            });
        }

        this.highlight.css(this.highlight_css);

        this.click.css({
            "position": "absolute",
            "inset": 0,
            "line-height": height + "px",
            "border-radius": border_radius,
            "background": this.color_set.Background.Base,
            "opacity": 0
        });

        this.label.css({
            "line-height": height + "px",
            "text-align": this.text_alignment,
            "font-size": this.font_size,
            "color": this.color_set.Text.Base,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "padding-left": Dash.Size.Padding,
            "padding-right": height
        });

        this.rows.css({
            "position": "absolute",
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "border-radius": border_radius,
            "background": "orange"
        });
    };
}
