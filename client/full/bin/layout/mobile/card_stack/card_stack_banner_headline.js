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
            // "background": "green",
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

    this.GetHeight = function () {
        return this.html.height() + (Dash.Size.Padding*6)
    };

    this.OnScroll = function (scroll_norm) {

        var opac_norm = 1;

        if (scroll_norm > 0.25 && scroll_norm  < 0.5) {
            opac_norm = Dash.Math.InverseLerp(0.5, 0.25, scroll_norm);
        }
        else if (scroll_norm >= 0.5) {
            opac_norm = 0;
        }
        else {
            opac_norm = 1;
            // this.html.css("height", 10);
        };

        this.label_top.css("opacity", opac_norm);
        this.label_bottom.css("opacity", opac_norm);


    };

    this.SetHeadlineText = function(text_primary, text_secondary){
        this.label_top.text(text_primary);
        this.label_bottom.text(text_secondary);
    };

    this.SetTopBottomMargins = function(margin_top, margin_bottom) {

        this.html.css({
            "padding-top": margin_top,
            "padding-bottom": margin_bottom,
        });

    };

    this.setup_styles();

};
