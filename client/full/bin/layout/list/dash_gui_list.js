function DashGuiList(binder){

    this.html = $("<div></div>");
    this.binder = binder;

    this.recall_id = "dash_list_" + (this.binder.constructor + "").replace(/[^A-Za-z]/g, "")
    this.recall_id = this.recall_id.slice(0, 100).trim().toLowerCase();

    this.rows = [];

    this.setup_styles = function(){

        this.html.css({
            "background": Dash.Color.Light.Background,
            "background": "orange",
            "padding-bottom": Dash.Size.Padding,
            "padding-top": Dash.Size.Padding,
        });

        // this.html.text("List");

    };

    this.AddRow = function(arbitrary_id){
        var row = new DashGuiListRow(this, arbitrary_id);
        this.html.append(row.html);
        return row;
    };

    this.Clear = function(){
        this.html.empty();
        this.rows = [];
    };

    this.setup_styles();

};
