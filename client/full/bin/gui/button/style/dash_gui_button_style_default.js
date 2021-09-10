/** @member DashGuiButton*/

function DashGuiButtonStyleDefault () {
    this.setup_styles = function () {
        this.html.append(this.highlight);
        this.html.append(this.load_bar);
        this.html.append(this.click_highlight);
        this.html.append(this.label);

        this.default_html_background = this.color_set.Background.Base;
        this.default_highlight_background = this.color_set.Background.BaseHover;
        this.default_load_bar_background = Dash.Color.Primary;
        this.default_click_highlight_background = "rgba(255, 255, 255, 0.5)";

        this.html.css({
            "background": this.default_html_background,
            "cursor": "pointer",
            "height": Dash.Size.ButtonHeight,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "padding": 0,
            "margin": 0,
        });

        this.highlight.css({
            "position": "absolute",
            "inset": 0,
            "background": this.default_highlight_background,
            "opacity": 0,
            "border-radius": Dash.Size.BorderRadiusInteractive,
        });

        this.load_bar.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": 0,
            "background": this.default_load_bar_background,
            "border-radius": Dash.Size.BorderRadiusInteractive,
        });

        this.click_highlight.css({
            "position": "absolute",
            "inset": 0,
            "background": this.default_click_highlight_background,
            "opacity": 0,
            "border-radius": Dash.Size.BorderRadiusInteractive,
        });

        this.label.css({
            "line-height": (Dash.Size.ButtonHeight) + "px",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "text-align": "center",
            "color": this.color_set.Text.Base,
        });
    };
}
