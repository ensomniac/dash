
function DashGuiHeader(label_text, color){

    this.label_text = label_text;
    this.html = $("<div></div>");
    this.label = $("<div>" + this.label_text + "</div>");
    this.border = $("<div></div>");
    this.color = color || Dash.Color.Light;

    this.setup_styles = function(){

        this.html.append(this.label);
        this.html.append(this.border);

        this.html.css({
            "height": Dash.Size.RowHeight,
            "margin-bottom": Dash.Size.Padding,
        });

        this.label.css({
            "text-align": "left",
            "color": this.color.TextHeader,
            "padding-left": Dash.Size.Padding,
            "line-height": Dash.Size.RowHeight + "px",
            "font-family": "sans_serif_bold",
        });

        this.border.css({
            "position": "absolute",
            "left": -Dash.Size.Padding*0.25,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding*0.5,
            "background": this.color.AccentGood,
        });

    };

    this.setup_styles();

};
