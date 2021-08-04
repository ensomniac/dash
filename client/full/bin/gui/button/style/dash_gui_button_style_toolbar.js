/** @member DashGuiButton*/

function DashGuiButtonStyleToolbar () {
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
            "border-radius": Dash.Size.BorderRadius,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "padding": 0,
            "margin": 0,
            "margin-top": Dash.Size.Padding*0.5,
            "height": Dash.Size.RowHeight,
            "margin-right": Dash.Size.Padding*0.5,
            // "width": Dash.Size.ColumnWidth,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.default_highlight_background,
            "opacity": 0,
            "border-radius": Dash.Size.BorderRadius,
        });

        this.load_bar.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": 0,
            "background": this.default_load_bar_background,
            "border-radius": Dash.Size.BorderRadius,
        });

        this.click_highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.default_click_highlight_background,
            "opacity": 0,
            "border-radius": Dash.Size.BorderRadius,
        });

        this.label.css({
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "color": this.color_set.Text.Base,
            "text-align": "center",
            "line-height": Dash.Size.RowHeight + "px",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
        });
    };
}
