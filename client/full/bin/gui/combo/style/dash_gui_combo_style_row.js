
function DashGuiComboStyleRow(){

    this.dropdown_icon = null;

    this.setup_styles = function() {

        this.dropdown_icon = new DashIcon(this.color, "arrow_down", d.Size.RowHeight, 0.5);
        this.dropdown_icon.html.addClass("ComboLabel");
        this.dropdown_icon.html.addClass("Combo");

        this.font_size = "100%";
        this.text_alignment = "left";
        this.label_text_color = "rgba(0, 0, 0, 0.8)";
        this.label_background = this.color_set.Background.Base;

        this.html.append(this.highlight);
        this.html.append(this.click);
        this.html.append(this.label_container);
        this.html.append(this.rows);

        this.label_container.append(this.label);
        this.label_container.append(this.dropdown_icon.html);

        this.dropdown_icon.html.css({
            "position": "relative",
            "display": "block",
            "margin-left": -(Dash.Size.Padding*0.25),
            "pointer-events": "none",
        });

        this.html.css({
            "margin-right": Dash.Size.Padding*0.5,
            "height": d.Size.ButtonHeight,
            "line-height": d.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": 3,
            // "width": d.Size.ColumnWidth * 2,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "width": "auto",
            "bottom": 0,
            // "background": this.color_set.Background.BaseHover,
            "opacity": 0,
            "cursor": "pointer",
            // "background": "purple",
        });

        this.click.css({
            "position": "absolute",
            "left": 0,
            "top": "auto",
            "right": 0,
            "bottom": Dash.Size.Padding,
            "height": Dash.Size.Stroke,
            "opacity": 0,
            // "background": this.color.AccentBad,
            // "background": "orange",
        });

        this.label_container.css({
            "display": "flex",
        });

        this.label.css({
            "line-height": d.Size.RowHeight + "px",
            "text-align": "left",
            "color": this.color.Text,
            "white-space": "nowrap",
            "text-overflow": "ellipsis",
        });

        this.rows.css({
            "position": "absolute",
            "width": d.Size.ColumnWidth,
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "border-radius": 3,
            "background": "orange",
        });

    };

};
