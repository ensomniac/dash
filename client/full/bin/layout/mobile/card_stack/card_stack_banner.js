function DashCardStackBanner (stack) {

    this.stack = stack;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();
    this.top_button_row = new DashCardStackBannerTopButtonRow(this);
    // this.footer_content = Dash.Gui.GetHTMLAbsContext();
    this.headline = new DashCardStackBannerHeadline(this);
    this.background_skirt = $("<div></div>");

    // Garbage hardcode:
    this.DefaultBackgroundGradient = Dash.Color.GetVerticalGradient("#ffae4c", "#ff684c");

    this.setup_styles = function () {

        this.html.append(this.background_skirt);
        this.html.append(this.top_button_row.html);
        this.html.append(this.headline.html);
        // this.html.append(this.footer_content);

        this.html.css({
            "background": "none",
            "margin-bottom": Dash.Size.Padding,
        });

        this.background_skirt.css({
            "background": "orange",
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": -Dash.Size.ButtonHeight,
            "top": 0,
            "pointer-events": "none",
            "display": "none",
        });

        this.top_button_row.html.css({
            "display": "none",
        });

        this.headline.html.css({
            "background": "red",
        });


        // this.footer_content.css({
        //     "height": Dash.Size.ButtonHeight,
        //     "top": "auto",
        //     "bottom": 0,
        //     "opacity": 0,
        // });

    };

    this.SetBackground = function (html_color) {

        if (!html_color || html_color == "none") {

            this.background_skirt.css({
                "display": "none",
                "background": "none",
            });

            return;

        };

        this.background_skirt.css({
            "display": "block",
            "background": html_color,
        });

    };

    // text_secondary = optional
    this.SetHeadlineText = function(text_primary, text_secondary){

        this.top_button_row.html.css({
            "display": "flex",
        });

        this.headline.SetHeadlineText(text_primary, text_secondary);

    };

    this.SetLeftIcon = function(icon_name, callback){

        this.top_button_row.html.css({
            "display": "flex",
        });


        this.top_button_row.SetLeftIcon(icon_name, callback);

    };

    this.SetRightIcon = function(icon_name, callback){

        // this.top_button_row.html.css({
        //     "display": "block",
        // });

        this.top_button_row.SetRightIcon(icon_name, callback);

    };

    this.setup_styles();

};
