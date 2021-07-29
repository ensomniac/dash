function DashCardStackBanner (stack) {

    this.stack = stack;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();
    this.header_row = null;
    this.headline = new DashCardStackBannerHeadline(this);
    this.background_skirt = $("<div></div>");

    this.content = $("<div></div>");
    this.last_sizing_mode = -1;

    // Garbage hardcode:
    this.DefaultColorA = "#ffae4c";
    this.DefaultColorB = "#ff684c";
    this.DefaultBackgroundGradient = Dash.Color.GetVerticalGradient(this.DefaultColorA, this.DefaultColorB);

    this.row_height = Dash.Size.ButtonHeight;
    this.footer_height = Dash.Size.ButtonHeight*2;
    this.footer_button_width = Dash.Size.ButtonHeight + Dash.Size.Padding;

    this.HeaderHeight = this.row_height;
    this.FooterHeight = this.footer_height;
    this.FooterHeight = this.footer_height;
    this.FooterButtonWidth = this.footer_button_width;

    this.setup_styles = function () {

        this.html.append(this.background_skirt);
        this.html.append(this.content);
        this.content.append(this.headline.html);

        this.html.css({
            "background": "none",
            // "background": "black",
        });

        this.content.css({
            // "background": "purple",
        });

        this.background_skirt.css({
            "background": "orange",
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "pointer-events": "none",
            "display": "none",
        });

    };

    this.SetBackground = function (html_color_or_url) {

        if (!html_color_or_url || html_color_or_url == "none") {

            this.background_skirt.css({
                "display": "none",
                "background": "none",
            });

            return;

        };

        if (html_color_or_url.includes("http")) {
            this.background_skirt.css({
                "display": "block",
                "background": "#000",
                "background-image": "url(" + html_color_or_url + ")",
                "background-size": "cover",
                "background-position": "center",
            });
        }
        else {
            this.background_skirt.css({
                "display": "block",
                "background": html_color_or_url,
            });
        };

    };

    // text_secondary = optional
    this.SetHeadlineText = function(text_primary, text_secondary){
        this.headline.SetHeadlineText(text_primary, text_secondary);
        this.adjust_margins();
    };

    this.SetLeftIcon = function(icon_name, callback){
        this.assert_header_row();
        this.header_row.SetLeftIcon(icon_name, callback);
    };

    this.SetRightIcon = function(icon_name, callback){
        this.assert_header_row();
        this.header_row.SetRightIcon(icon_name, callback);
    };

    this.AddFooterIcon = function(icon_name, label_text, callback){
        this.assert_footer_row();
        return this.footer_row.AddIcon(icon_name, label_text, callback);
    };

    this.assert_header_row = function() {
        // Create the button row if it doesn't exist yet
        if (this.header_row) {
            // Header already exists
            return;
        };

        this.header_row = new DashCardStackBannerTopButtonRow(this);
        this.content.prepend(this.header_row.html);
        this.adjust_margins();

    };

    this.assert_footer_row = function() {
        // Create the button row if it doesn't exist yet
        if (this.footer_row) {
            // Footer already exists
            return;
        };

        this.footer_row = new DashCardStackBannerFooterButtonRow(this);
        this.content.append(this.footer_row.html);
        this.adjust_margins();

    };

    this.adjust_margins = function() {
        // Whenever core content is added or removed, we need to adjust some values

        // + If headline only (no header, no footer)
        //   - MODE: 0
        //   - HEADLINE: Full headline margins on top and bottom
        //   - SKIRT:
        //   -

        // + If headline & top row
        //   - MODE: 1
        //   - HEADLINE: Full headline margins on top and bottom
        //   - SKIRT:

        // + If headline & bottom row
        //   - MODE: 2
        //   - HEADLINE: Full headline margins on top and bottom
        //   - SKIRT:

        var mode = 0;
        var headline_top_margin = Dash.Size.Padding*2;
        var headline_bottom_margin = 0;

        var bottom_margin = 0;
        var background_skirt_bottom = Dash.Size.ButtonHeight;

        if (this.header_row && !this.footer_row) {

            mode = 1;
            headline_top_margin = Dash.Size.Padding*0.25;
            headline_bottom_margin = Dash.Size.Padding*0.25;

            // To account for the balance offset of the
            // top button row when there is no footer
            bottom_margin = Dash.Size.ButtonHeight;
            background_skirt_bottom = Dash.Size.ButtonHeight*2;
        };

        if (this.header_row && this.footer_row) {

            mode = 2;
            headline_top_margin = Dash.Size.Padding*0.25;
            headline_bottom_margin = (Dash.Size.Padding*0.25);
            headline_bottom_margin += Dash.Size.ButtonHeight; // To account for the weight of the header

            // To account for the balance offset of the
            // top button row when there is no footer
            // bottom_margin = Dash.Size.ButtonHeight;
            bottom_margin = Dash.Size.Padding;
            background_skirt_bottom = Dash.Size.ButtonHeight*2;
            background_skirt_bottom = -(this.footer_height-(this.footer_button_width*0.5));

        };

        if (mode == this.last_sizing_mode) {
            // Correct properties are already set
            return;
        };

        this.headline.SetTopBottomMargins(
            headline_top_margin,
            headline_bottom_margin
        );

        this.html.css({
            "margin-bottom": bottom_margin,
        });

        this.background_skirt.css({
            "bottom": -background_skirt_bottom,
        });

        this.last_sizing_mode = mode;

    };

    this.setup_styles();

};
