function DashCardStackBannerHeadline (banner) {

    this.banner = banner;
    this.stack = this.banner.stack;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();

    this.label_top = Dash.Gui.GetHTMLContext();
    this.label_bottom = Dash.Gui.GetHTMLContext();

    this.setup_styles = function () {

        this.html.append(this.label_top);
        this.html.append(this.label_bottom);

        this.label_top.text("Top");
        this.label_bottom.text("Bottom");

        this.html.css({
            "background": "none",
            "padding-top": Dash.Size.Padding*2,
            "padding-bottom": Dash.Size.Padding*2,
        });

        this.label_top.css({
            "background": "none",
            "color": "white",
            "font-size": "175%",
        });

        this.label_bottom.css({
            "background": "none",
            "color": "white",
            "font-family": "sans_serif_bold",
            "font-size": "175%",
        });

    };

    this.SetHeadlineText = function(text_primary, text_secondary){
        this.label_top.text(text_primary);
        this.label_bottom.text(text_secondary);
    };

    this.setup_styles();

};
