/**@member DashGuiCombo*/

function DashGuiComboStyleRow () {
    this.dropdown_icon_css ={
        "position": "relative",
        "display": "block",
        "margin-left": -(Dash.Size.Padding * 0.25),
        "pointer-events": "none"
    };

    this.setup_styles = function () {
        this.font_size = "100%";
        this.text_alignment = "left";
        this.label_background = this.color_set.Background.Base;

        this.html.append(this.highlight);
        this.html.append(this.click);
        this.html.append(this.label_container);
        this.html.append(this.rows);

        this.label_container.append(this.label);

        this.add_dropdown_icon(0.5);

        this.html.css({
            "margin-right": Dash.Size.Padding*0.5,
            "height": Dash.Size.ButtonHeight,
            "line-height": Dash.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": 3,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "width": "auto",
            "bottom": 0,
            "opacity": 0,
            "cursor": "pointer",
        });

        this.click.css({
            "position": "absolute",
            "left": 0,
            "top": "auto",
            "right": 0,
            "bottom": Dash.Size.Padding,
            "height": Dash.Size.Stroke,
            "opacity": 0,
        });

        this.label_container.css({
            "display": "flex",
        });

        this.label.css({
            "line-height": Dash.Size.RowHeight + "px",
            "text-align": "left",
            "color": this.color.Text,
            "white-space": "nowrap",
            "text-overflow": "ellipsis",
        });

        this.rows.css({
            "position": "absolute",
            "width": Dash.Size.ColumnWidth,
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "border-radius": 3,
            "background": "orange",
        });
    };
}
