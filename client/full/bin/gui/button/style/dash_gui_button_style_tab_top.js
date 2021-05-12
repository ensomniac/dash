
function DashGuiButtonStyleTabTop(){

    this.setup_styles = function() {

        this.html.append(this.highlight);
        this.html.append(this.load_bar);
        this.html.append(this.click_highlight);
        this.html.append(this.label);

        this.html.css({
            "background": this.color_set.Background.Base,
            "cursor": "pointer",
            "height": d.Size.ButtonHeight,
            "padding": 0,
            "margin": 0,
            "padding-left": Dash.Size.Padding*0.5,
            "padding-right": Dash.Size.Padding*0.5,
        });

        this.highlight.css({
            "position": "absolute",
            "left": Dash.Size.Padding,
            "bottom": 0,
            "right": Dash.Size.Padding,
            "height": Dash.Size.Stroke,
            "background": this.color_set.Background.BaseHover,
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
            "background": "rgba(255, 255, 255, 0)",
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });

        this.label.css({
            "bottom": 0,
            "line-height": (d.Size.ButtonHeight) + "px",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "text-align": "center",
            "color": this.color_set.Text.Base,
            "font-family": "sans_serif_bold",
            "padding-left": Dash.Size.Padding*0.5,
            "padding-right": Dash.Size.Padding*0.5,
            "font-size": "80%",
        });

    };

    this.on_hover_in = function(){

        if (this.is_selected) {
            this.label.css("color", this.color_set.Text.SelectedHover);
        }
        else {
            this.label.css("color", this.color_set.Text.BaseHover);
        };

    };

    this.on_hover_out = function(){

        if (this.is_selected) {
            this.label.css("color", this.color_set.Text.Selected);
        }
        else {
            this.label.css("color", this.color_set.Text.Base);
        };

    };

    this.manage_style_on_click = function(label_text){

        this.click_highlight.stop().css({"opacity": 1});
        this.click_highlight.stop().animate({"opacity": 0}, 150);

    };

};
