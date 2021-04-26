
function DashGuiComboStyleRow(){

    // this.dropdown_icon = $("<div>!</div>");
    this.dropdown_icon = null;

    this.setup_styles = function() {

        this.dropdown_icon = new DashIcon(this.color, "arrow_down");

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

        // this.label.text(this.label_text);
        // this.html.append(this.highlight);
        // this.html.append(this.click);
        // this.html.append(this.label_container);
        // this.html.append(this.rows);
        // this.label.text(this.label_text);
        // this.label_container
        // this.label.text(this.label_text);
        // this.label.append(this.dropdown_icon);

        this.dropdown_icon.html.css({
            "position": "relative",
            "display": "block",
            "width": d.Size.RowHeight,
            "height": d.Size.RowHeight,
            "margin-left": Dash.Size.Padding*0.5,
            "background": "green",
        });

        this.html.css({
            // "background": this.label_background,
            // "background": "rgba(0, 0, 0, 0.1)",
            "margin-right": Dash.Size.Padding*0.5,
            "height": d.Size.ButtonHeight,
            "line-height": d.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": 3,
            "width": d.Size.ColumnWidth * 2,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "width": "auto",
            // "right": 0,
            "bottom": 0,
            "background": this.color_set.Background.BaseHover,
            "opacity": 0,
            "cursor": "pointer",
        });

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

        this.label_container.css({
            "position": "absolute",
            "display": "flex",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            // "line-height": d.Size.ButtonHeight + "px",
            "background": "red",
        });

        this.label.css({
            // "position": "absolute",
            // "left": Dash.Size.Padding*0.5,
            // "left": 0,
            // "top": 0,
            // "right": Dash.Size.Padding*0.5,
            // "bottom": 0,
            "line-height": d.Size.RowHeight + "px",
            "text-align": "left",
            "color": this.color.Text,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            // "background": "orange",
            // "color": "black",
        });

        this.rows.css({
            "width": d.Size.ColumnWidth,
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "overflow": "hidden",
            "border-radius": 3,
        });

    };

};
