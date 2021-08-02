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
        this.highlight_css = {
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.color_set.Background.BaseHover,
            "opacity": 0,
        };

        this.font_size = "100%";
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
            "height": Dash.Size.ButtonHeight,
        });

        this.inner_html.css({
            "background": this.label_background,
            "height": Dash.Size.ButtonHeight,
            "line-height": Dash.Size.ButtonHeight + "px",
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
            "line-height": Dash.Size.ButtonHeight + "px",
            "background": this.color_set.Background.Base,
            "opacity": 0,
        });

        this.label.css({
            "line-height": Dash.Size.ButtonHeight + "px",
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
