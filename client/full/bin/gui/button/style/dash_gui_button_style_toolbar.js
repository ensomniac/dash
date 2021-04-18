
function DashGuiButtonStyleToolbar(){

    this.setup_styles = function() {

        this.html.append(this.highlight);
        this.html.append(this.load_bar);
        this.html.append(this.click_highlight);
        this.html.append(this.label);

        this.html.css({
            "background": this.color_set.Background.Base,
            "cursor": "pointer",
            "height": d.Size.ButtonHeight,
            "border-radius": d.Size.BorderRadius,
            "padding-left": d.Size.Padding,
            "padding-right": d.Size.Padding,
            "padding": 0,
            "margin": 0,
            "margin-top": Dash.Size.Padding*0.5,
            "height": Dash.Size.RowHeight,
            "width": d.Size.ColumnWidth,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.color_set.Background.BaseHover,
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });

        this.load_bar.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": 0,
            "background": d.Color.Primary,
            "border-radius": d.Size.BorderRadius,
        });

        this.click_highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": "rgba(255, 255, 255, 0.5)",
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });

        this.label.css({
            "position": "absolute",
            "left": d.Size.Padding,
            "top": 0,
            "right": d.Size.Padding,
            "bottom": 0,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "color": this.color_set.Text.Base,
            "text-align": "center",
            "line-height": Dash.Size.RowHeight + "px",
        });

    };

};
