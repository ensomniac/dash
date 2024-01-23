function DashMobileCardStackBannerFooterButtonRow (banner) {
    this.banner = banner;

    this.buttons = [];
    this.stack = this.banner.stack;
    this.html = Dash.Gui.GetHTMLContext();
    this.row_height = this.banner.FooterHeight;
    this.button_size = this.banner.FooterHeight;
    this.left_spacer = Dash.Gui.GetHTMLContext();
    this.right_spacer = Dash.Gui.GetHTMLContext();
    this.vertical_offset_slider = $("<div></div>");
    this.center_content = Dash.Gui.GetHTMLContext();
    this.color = this.stack.color || Dash.Color.Light;

    this.setup_styles = function () {
        this.html.css({
            "background": "none",
            "height": this.row_height,
            "pointer-events": "none",
            ...Dash.HardwareAccelerationCSS
        });

        this.vertical_offset_slider.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "height": this.row_height,
            "display": "flex",
            ...Dash.HardwareAccelerationCSS
        });

        var spacer_css = {
            "height": this.row_height,
            "background": "none",
            "flex-grow": 2
        };

        this.left_spacer.css(spacer_css);
        this.right_spacer.css(spacer_css);

        this.center_content.css({
            "display": "flex",
            "background": "none",
            "height": this.row_height,
        });

        this.vertical_offset_slider.append(this.left_spacer);
        this.vertical_offset_slider.append(this.center_content);
        this.vertical_offset_slider.append(this.right_spacer);

        this.html.append(this.vertical_offset_slider);

        this.setup_connections();
    };

    this.OnScroll = function (scroll_norm, headline_offset) {
        var anim_clamp = 0.7;

        if (scroll_norm < anim_clamp) {
            scroll_norm = Dash.Math.InverseLerp(0, anim_clamp, scroll_norm);
        }

        else {
            scroll_norm = 1;
        }

        // This is technically a double ease out...
        scroll_norm = Dash.Animation.Curves.EaseOut(scroll_norm);

        this.vertical_offset_slider.css("top", Dash.Math.Lerp(0, -headline_offset, scroll_norm));
    };

    this.AddIcon = function (icon_name="gear", label_text="--", callback=null) {
        var button = new DashMobileCardStackBannerFooterButtonRowButton(
            this,
            icon_name,
            label_text,
            callback
        );

        var len = this.buttons.length;

        if (len > 0) {
            for (var _button of this.buttons) {
                _button.html.css({
                    "margin-right": Dash.Size.Padding * (len < 3 ? 2 : len < 5 ? 1 : 0.5)
                });
            }

        }

        this.center_content.append(button.html);

        this.buttons.push(button);

        return button;
    };

    // TODO: not needed?
    this.setup_connections = function () {
        // (function (self) {
        //     self.left_button_content.on("click", function () {
        //         self.on_left_button_clicked();
        //     });
        //
        //     self.right_button_content.on("click", function () {
        //         self.on_right_button_clicked();
        //     });
        // })(this);
    };

    this.setup_styles();
}
