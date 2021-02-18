function AdminView(){

    this.html = $("<div>Admin View</div>");

    this.setup_styles = function(){

        this.html.css({
            "color": "rgba(0, 0, 0, 0.9)",
            "padding": d.Size.Padding,
        });

    };

    this.setup_styles();

};
