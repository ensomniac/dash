function DashDocsColors (color=null) {
    this.color = color || Dash.Color.Light;

    this.html = $("<div>Dash Site Color Reference: Placeholder</div>");
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {

        this.html.css({
            "color":       "rgba(0, 0, 0, 0.9)",
            "padding":     Dash.Size.Padding,
            "font-family": "sans_serif_bold",
        });

    };

    this.setup_styles();

}
