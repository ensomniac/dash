function DashMobileCardStackBanner (stack) {
    this.stack = stack;

    this.headline = null;
    this.footer_row = null;
    this.header_row = null;
    this.last_sizing_mode = -1;
    this.skirt_bottom_rest = 0;
    this.color = this.stack.color;
    this.margin_mode_override = null;
    this.content = $("<div></div>");
    this.html = Dash.Gui.GetHTMLContext();
    this.background_skirt = $("<div></div>");
    this.HeaderHeight = Dash.Size.ButtonHeight;
    this.FooterHeight = Dash.Size.ButtonHeight * 2;
    this.FooterButtonWidth = Dash.Size.ButtonHeight + Dash.Size.Padding;

    this.setup_styles = function () {
        this.headline = new DashMobileCardStackBannerHeadline(this);

        this.html.css({
            "background": "none",
            "pointer-events": "none"
        });

        this.background_skirt.css({
            "background": "orange",
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "pointer-events": "none",
            "display": "none"
        });

        this.content.append(this.headline.html);

        this.html.append(this.background_skirt);
        this.html.append(this.content);

        // Default
        this.SetBackground(Dash.Color.Mobile.BackgroundGradient);
    };

    this.SetBackground = function (html_color_or_url) {
        if (!html_color_or_url || html_color_or_url === "none") {
            this.background_skirt.css({
                "display": "none",
                "background": "none"
            });

            return;
        }

        if (html_color_or_url.includes("http")) {
            this.background_skirt.css({
                "display": "block",
                "background": "#000",
                "background-image": "url(" + html_color_or_url + ")",
                "background-size": "cover",
                "background-position": "center"
            });
        }

        else {
            this.background_skirt.css({
                "display": "block",
                "background": html_color_or_url
            });
        }
    };

    this.SetHeadlineText = function (text_primary, text_secondary="") {
        this.headline.SetHeadlineText(text_primary, text_secondary);

        this.adjust_margins();
    };

    this.SetLeftIcon = function (icon_name, callback) {
        this.assert_header_row();

        this.header_row.SetLeftIcon(icon_name, callback);
    };

    this.SetRightIcon = function (icon_name, callback) {
        this.assert_header_row();

        this.header_row.SetRightIcon(icon_name, callback);
    };

    // When is_fixed is true, the banner does not scroll with the rest of the content on the page
    this.SetFixed = function (is_fixed) {
        this.stack.SetFixedBanner(is_fixed);
    };

    this.AddFooterIcon = function (icon_name, label_text, callback=null) {
        this.assert_footer_row();

        return this.footer_row.AddIcon(icon_name, label_text, callback);
    };

    this.OnScroll = function (scroll_top) {
        var scroll_norm = 1; // Scrolled past the banner
        // var footer_row_height = 0;
        var current_height = this.html.height();
        var scroll_max = current_height * 0.5;

        if (scroll_top <= scroll_max) {
            scroll_norm = scroll_top / scroll_max;
        }

        scroll_norm = Dash.Animation.Curves.EaseOut(scroll_norm);

        // if (this.footer_row) {
        //     footer_row_height = this.footer_row.row_height;
        // }

        // var scroll_norm = scroll_top / current_height;
        // var max_offset = current_height + footer_row_height;
        var headline_offset = 0;

        if (this.headline) {
            headline_offset = this.headline.GetHeight();

            this.headline.OnScroll(scroll_norm);
        }

        if (this.footer_row) {
            this.footer_row.OnScroll(scroll_norm, headline_offset);
        }

        if (this.background_skirt) {
            var shadow_opacity = scroll_norm * 0.7;

            this.background_skirt.css({
                "bottom": Dash.Math.Lerp(-this.skirt_bottom_rest, headline_offset, scroll_norm),
                "box-shadow": "0px 0px 40px 1px rgba(0, 0, 0, " + shadow_opacity + ")"
            });
        }
    };

    this.SetMarginMode = function (mode, save=true) {
        if (save) {
            this.margin_mode_override = mode;
        }

        this.set_margins(mode);
    };

    // Create the header row if it doesn't exist yet
    this.assert_header_row = function () {
        if (this.header_row) {
            return;
        }

        this.header_row = new DashMobileCardStackBannerTopButtonRow(this);

        this.content.prepend(this.header_row.html);

        this.adjust_margins();
    };

    // Create the footer row if it doesn't exist yet
    this.assert_footer_row = function () {
        if (this.footer_row) {
            return;
        }

        this.footer_row = new DashMobileCardStackBannerFooterButtonRow(this);

        this.content.append(this.footer_row.html);

        this.adjust_margins();
    };

    this.adjust_margins = function () {
        if (this.margin_mode_override !== null) {
            this.SetMarginMode(this.margin_mode_override);

            return;
        }

        if (this.header_row) {
            if (this.footer_row) {
                this.SetMarginMode(2, false);
            }

            else {
                this.SetMarginMode(1, false);
            }
        }

        else if (this.footer_row) {
            this.SetMarginMode(3, false);
        }

        else {
            this.SetMarginMode(0, false);
        }
    };

    this.set_margins = function (mode) {
        if (mode === this.last_sizing_mode) {
            return;
        }

        // Default/auto modes:
        //  0: No header or footer
        //  1: Header only
        //  2: Header and footer
        //  3: Footer only

        // No-overlap/manual modes (useful when abs-filling the content area)
        //  4: Slim version of mode 0
        //  5: Slimmer version of mode 0
        //  6: Slimmest version of mode 0

        // Alternate default/auto modes:
        // 7: Header and footer version for when not using a double-lined headline that size banner is desired

        this.skirt_bottom_rest = (mode === 2 || mode === 3) ? -(this.FooterHeight - (this.FooterButtonWidth * 0.5)) :
                                 Dash.Size.ButtonHeight * (mode === 1 ? 2 : mode === 4 ? 0.65 : mode === 5 ? 0.35 : mode === 6 ? 0.2 : mode === 7 ? -1.35 : 1);

        this.headline.SetTopBottomMargins(
            Dash.Size.Padding * ((mode === 1 || mode === 2) ? 0.25 : (mode === 3 || mode === 5) ? 1 : mode === 6 ? 0.65 : mode === 7 ? 5 : 2),
            (Dash.Size.Padding * ((mode === 1 || mode === 2) ? 0.25 : mode === 3 ? 1 : mode === 7 ? 2 : 0)) +
                (mode === 2 ? Dash.Size.ButtonHeight : 0)  // To account for the weight of the header
        );

        this.html.css({
            "margin-bottom": mode === 1 ? Dash.Size.ButtonHeight : (mode === 2 || mode === 3 || mode === 7) ? Dash.Size.Padding : 0
        });

        this.background_skirt.css({
            "bottom": -this.skirt_bottom_rest
        });

        this.last_sizing_mode = mode;
    };

    this.setup_styles();
}
