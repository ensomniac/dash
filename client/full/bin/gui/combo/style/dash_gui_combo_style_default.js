
function DashGuiComboStyleDefault(){

    this.setup_styles = function() {

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

        this.html.append(this.highlight);
        this.html.append(this.click);
        this.html.append(this.label);
        this.html.append(this.rows);
        this.label.html(this.label_text);

        this.html.css({
            "background": this.label_background,
            "margin-right": Dash.Size.Padding*0.5,
            "height": d.Size.ButtonHeight,
            "line-height": d.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": 3,
            "width": d.Size.ColumnWidth,
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
            "position": "absolute",
            "left": Dash.Size.Padding*0.5,
            "top": 0,
            "right": Dash.Size.Padding*0.5,
            "bottom": 0,
            "line-height": d.Size.ButtonHeight + "px",
            "text-align": this.text_alignment,
            "font-size": this.font_size,
            "color": this.color_set.Text.Base,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
        });

        this.rows.css({
            "width": d.Size.ColumnWidth,
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "overflow": "hidden",
            "border-radius": 3,
        });

        console.log("Default styler");

    };

};
