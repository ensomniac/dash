function DashGuiListRow(list, arbitrary_id){

    this.html = $("<div></div>");
    this.list = list;
    this.arbitrary_id = arbitrary_id;

    console.log(this.arbitrary_id);

    this.setup_styles = function(){

        this.html.css({
            "background": Dash.Color.Light.Background,
            "background": "blue",
            // "padding-bottom": Dash.Size.Padding,
            // "padding-top": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
        });

        this.html.text(this.arbitrary_id);

    };

    this.setup_styles();

};
