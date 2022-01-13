function DashGuiSearchableListSearchInput (slist) {

    this.slist = slist;
    this.color = this.slist.color;
    this.row_height = this.slist.row_height;

    this.html = $("<div></div>");
    this.hover = $("<div></div>");
    this.display_name_label = $("<div></div>");

    this.setup_styles = function () {

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "height": this.row_height,
            "overflow-y": "auto",
            "border-bottom": "1px solid " + this.color.Pinstripe,
            "background": Dash.Color.Lighten(this.color.Background, 10),
        });

    };

    this.setup_styles();

};
