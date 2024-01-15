/**@member DashGuiCombo*/

function DashGuiComboStyleDefault () {
    this.setup_styles = function () {
        this.dropdown_icon_css = {
            "position": "relative",
            "display": "block",
            "right": Dash.Size.Padding * 0.5,
            "top": Dash.Size.Padding * 0.5,
            "margin-left": -(Dash.Size.Padding * 0.25),
            "pointer-events": "none"
        };

        if (this.style === "default_bubbled") {
            this.list_offset_vertical = 4;
        }

        this.inner_html = $("<div></div>");

        var height = this.height - (this.style === "default_bubbled" ? this.list_offset_vertical : 0);
        var border_radius = this.style === "default_bubbled" ? Dash.Size.Padding * 2 : Dash.Size.BorderRadius;

        this.highlight_css = {
            "position": "absolute",
            "inset": 0,
            "background": this.color_set.Background.BaseHover,
            "border-radius": border_radius,
            "opacity": 0
        };

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
            "height": this.height,
            "line-height": this.height + "px",
            "cursor": "pointer",
            "border-radius": border_radius
        });

        if (this.style === "default_bubbled") {
            this.border_size = 2;

            this.inner_html.css({
                "border": this.border_size + "px solid " + this.color.StrokeLight,
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
