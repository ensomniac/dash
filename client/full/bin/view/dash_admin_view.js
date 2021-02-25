
function DashAdminView(){

    this.layout = new Dash.Gui.Layout.SideTabs(this);
    this.html = this.layout.html;

    this.tmp_style = $("<div>Styles</div>");
    this.tmp_size = $("<div>Sizes</div>");

    this.setup_styles = function(){

        // this.html.css({
        //     "position": "absolute",
        //     "left": 0,
        //     "top": 0,
        //     "right": 0,
        //     "bottom": 0,
        //     "background": d.Color.Background,
        // });

        this.layout.Append("Style", this.tmp_style);
        this.layout.Append("Size", this.tmp_size);

    };

    this.setup_styles();

};
