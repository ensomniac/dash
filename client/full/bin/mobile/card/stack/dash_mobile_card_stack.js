function DashMobileCardStack (binder, color=null) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.width = 0;
    this.frame = 0;
    this.height = 0;
    this.cards = [];
    this.slider = null;
    this.banner = null;
    this.anim_duration = 250;
    this.left_content = null;
    this.footer_buttons = [];
    this.footer_spacer = null;
    this.right_content = null;
    this.banner_fixed = false;  // By default, the banner scrolls with the rest of the content
    this.banner_spacer = null;
    this.touch_active = false;
    this.center_content = null;
    this.center_scroll_top = 0;
    this.active_panel_index = 1;  // Center
    this.backing_gradient = null;
    this.panel_offsets = [0, 0, 0];
    this.footer_button_overlay = null;
    this.vertical_scroll_active = false;
    this.vertical_scroll_timer_id = null;
    this.html = Dash.Gui.GetHTMLAbsContext();
    this.iphone_standalone = /iPhone/i.test(navigator.userAgent) && Dash.IsMobileFromHomeScreen;
    this.footer_height = Dash.Size.ButtonHeight + (this.iphone_standalone ? Dash.Size.Padding * 0.5 : 0);

    this.setup_styles = function () {
        this.slider = $("<div></div>");

        this.slider.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            ...Dash.HardwareAccelerationCSS
        });

        this.left_content = this.make_content_panel();
        this.center_content = this.make_content_panel();
        this.right_content = this.make_content_panel();

        this.center_content.css({
            "display": "block"
        });

        this.html.css({
            "color": this.color.Text,
            "overflow": "hidden",
            "overflow-y": "auto",
            "background": this.color.Background,
            ...Dash.HardwareAccelerationCSS
        });

        this.setup_connections();

        this.html.append(this.slider);

        Dash.OnHTMLResized(this, this.on_resized);

        this.on_resized(window.innerWidth, window.innerHeight);
    };

    this.setup_connections = function () {
        (function (self) {
            self.center_content.scroll(function () {
                self.on_center_scroll();
            });

            self.slider.on("touchstart", function () {
                self.touch_active = true;
            });

            self.slider.on("touchmove", function () {
                self.touch_active = true;
            });

            self.slider.on("touchend", function () {
                self.touch_active = false;

                if (!self.vertical_scroll_timer_id) {
                    self.set_scroll_active(false);
                }
            });

            self.slider.on("touchcancel", function () {
                self.touch_active = false;

                if (!self.vertical_scroll_timer_id) {
                    self.set_scroll_active(false);
                }
            });
        })(this);
    };

    this.GetScrollTop = function () {
        return this.center_scroll_top;
    };

    this.GetScrollActive = function () {
        return this.vertical_scroll_active;
    };

    this.AddBanner = function () {
        if (this.banner) {
            console.error("Error: Stack.AddBanner() >> A banner already exists!");

            return this.banner;
        }

        this.banner = new DashMobileCardStackBanner(this);

        this.AddHTML(this.banner.html);

        return this.banner;
    };

    // When is_fixed is true, the banner does not scroll with the rest of the content on the page
    this.SetFixedBanner = function (is_fixed) {
        if (is_fixed) {
            this.fix_banner_on_top();
        }

        else {  // TODO?
            console.warn("Warning: Stack.SetFixedBanner(false) >> This is not implemented yet!");
        }
    };

    this.AddCard = function (prepend=false) {
        var existing_card;
        var card = new DashMobileCard(this);

        if (!this.cards.length && this.banner) {
            if (!this.banner.header_row && !this.banner.footer_row) {
                card.html.css({
                    "margin-top": Dash.Size.Padding
                });
            }
        }

        if (prepend && Dash.Validate.Object(this.cards)) {
            for (existing_card of this.cards) {
                existing_card.html.detach();
            }
        }

        this.AddHTML(card.html);

        if (prepend && Dash.Validate.Object(this.cards)) {
            for (existing_card of this.cards) {
                this.center_content.append(existing_card.html);
            }
        }

        this.cards.push(card);

        return card;
    };

    this.RemoveCard = function (card) {
        this.cards.splice(this.cards.indexOf(card), 1);

        card.html.remove();

        return null;
    };

    this.AddUserBanner = function () {
        var banner = new DashMobileCardStackUserBanner(this);

        this.AddHTML(banner.html);

        return banner;
    };

    this.AddHTML = function (html) {
        html.css({
            ...Dash.HardwareAccelerationCSS
        });

        this.center_content.append(html);

        if (this.footer_spacer) {
            this.center_content.append(this.footer_spacer);
        }
    };

    // DEPRECATED in favor of AddHTML to stay consistent with that naming across Dash
    this.AppendHTML = function (html) {
        this.AddHTML(html);
    };

    this.AddLeftContent = function (html) {
        // if (this.banner_fixed) {
        //     console.log("AddLeftContent >> This banner is fixed, it needs to be re-attached before transition!");
        // };

        if (this.active_panel_index === 0) {
            console.warn("The left panel is already loaded");
        }

        html.css({
            ...Dash.HardwareAccelerationCSS
        });

        this.left_content.empty();
        this.left_content.append(html);

        this.slide_to_index(0);
    };

    this.ShowCenterContent = function () {
        // if (this.banner_fixed) {
        //     console.log("ShowCenterContent >> This banner is fixed, it needs to be re-attached before transition!");
        // };

        this.slide_to_index(1);
    };

    this.AddFooterOverlay = function () {
        this.create_footer_overlay();
    };

    this.AddRightContent = function (html) {
        // if (this.banner_fixed) {
        //     console.log("AddRightContent >> This banner is fixed, it needs to be re-attached before transition!");
        //
        //     this.unfix_banner_on_top();
        // };

        if (this.active_panel_index === 2) {
            console.warn("The right panel is already loaded");
        }

        html.css({
            ...Dash.HardwareAccelerationCSS
        });

        this.right_content.empty();
        this.right_content.append(html);

        this.slide_to_index(2);
    };

    this.AddFooterButton = function (icon_name, label_text, callback, left_side_icon=false) {
        if (!this.footer_button_overlay) {
            this.create_footer_overlay();
        }

        var button = new DashMobileCardStackFooterButton(this, icon_name, label_text, callback, left_side_icon);

        this.footer_buttons.push(button);

        this.footer_button_overlay.append(button.html);

        return button;
    };

    this.reset_scroll_timer = function () {
        this.vertical_scroll_timer_id = null;

        if (!this.touch_active) {
            this.set_scroll_active(false);
        }
    };

    this.set_scroll_active = function (scrolling_is_active) {
        this.vertical_scroll_active = scrolling_is_active;

        // if (this.vertical_scroll_active) {
        //     this.center_content.css("background", "red");
        // }
        // else {
        //     this.center_content.css("background", "none");
        // };
    };

    this.on_center_scroll = function () {
        this.center_scroll_top = this.center_content.scrollTop();

        this.set_scroll_active(true);

        if (this.vertical_scroll_timer_id) {
            clearTimeout(this.vertical_scroll_timer_id);

            this.vertical_scroll_timer_id = null;
        }

        (function (self) {
            self.vertical_scroll_timer_id = setTimeout(
                function () {
                    self.reset_scroll_timer();
                },
                300
            );
        })(this);

        if (!this.banner_fixed) {
            return;
        }

        var banner_height = this.banner.html.height();

        this.banner_spacer.css("height", banner_height);

        this.banner.OnScroll(this.center_scroll_top);
    };

    this.on_resized = function (width, height) {
        this.panel_offsets = [0, -width, -width * 2];

        this.slider.css({
            "width": width * 3,
            "height": height,
            "left": this.panel_offsets[this.active_panel_index]
        });

        this.left_content.css({
            "left": 0,
            "width": width,
            "height": height
        });

        this.center_content.css({
            "left": width,
            "width": width,
            "height": height
        });

        this.right_content.css({
            "left": width * 2,
            "width": width,
            "height": height
        });

        this.width = width;
        this.height = height;

        if (this.footer_button_overlay) {
            this.set_footer_overlay_size();
        }

        if (this.banner_fixed) {
            this.set_fixed_banner_size();
            this.on_center_scroll();
        }
    };

    this.make_content_panel = function () {
        var content = $("<div></div>");

        content.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "text-align": "center",
            "color": this.color.Text,
            "overflow-y": "auto",
            ...Dash.HardwareAccelerationCSS,
            "background": "none",
            "display": "none",
            // "margin-left": Dash.Size.Padding * 4,
            // "margin-right": Dash.Size.Padding
        });

        this.slider.append(content);

        return content;
    };

    this.fix_banner_on_top = function () {
        if (this.banner_fixed || !this.banner) {
            return;
        }

        this.banner_fixed = true;

        this.set_fixed_banner_size();

        // this.html.append(this.banner.html);
        this.slider.append(this.banner.html);

        // You should never see this, but it allows the window to scroll correctly
        this.banner_spacer = $("<div></div>");

        this.banner_spacer.css({
            "height": this.banner.html.height()
        });

        this.center_content.prepend(this.banner_spacer);

        // Wait until the next frame to force on_center_scroll since if this was called
        // as part of the constructor, it will not yet be attached and have no height
        (function (self) {
            requestAnimationFrame(function () {
                self.on_center_scroll();
            });
        })(this);
    };

    this.create_footer_overlay = function () {
        this.footer_button_overlay = Dash.Gui.GetHTMLAbsContext(
            "",
            this.color,
            {
                "display": "flex",
                "top": "auto",
                "color": "white",
                "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
                "padding-left": Dash.Size.Padding * 0.5,

                // This prevents cut-off from the rounded corners of the modern iPhone screen, which are only problematic on the bottom
                "padding-bottom": this.iphone_standalone ? Dash.Size.Padding * 0.5 : 0
            }
        );

        this.set_footer_overlay_size();

        this.slider.append(this.footer_button_overlay);

        // You should never see this, but it allows the window to scroll correctly
        // without having to add padding/margin for the lower button content
        this.footer_spacer = $("<div></div>");

        this.footer_spacer.css({
            "height": this.footer_height
        });

        this.center_content.append(this.footer_spacer);
    };

    this.set_footer_overlay_size = function () {
        this.footer_button_overlay.css({
            "position": "fixed",
            "height": this.footer_height,
            "line-height": this.footer_height + "px",
            "bottom": 0,
            "left": this.width,
            "width": this.width - (Dash.Size.Padding * 0.5),
            "right": "auto"
        });
    };

    this.set_fixed_banner_size = function () {
        this.banner.html.css({
            "position": "fixed",
            "top": 0,
            "left": this.width,
            "width": this.width,
            "right": "auto"
        });
    };

    this.slide_to_index = function (target_index) {
        var backing_opacity = 0;

        if (target_index === 0) {  // Left
            this.left_content.css({"display": "block", "opacity": 1});

            this.right_content.stop().animate({"opacity":   0}, this.anim_duration);

            this.center_content.stop().animate({"opacity": 0}, this.anim_duration);
        }

        else if (target_index === 2) {  // Right
            this.right_content.css({"display": "block", "opacity": 1});

            this.left_content.stop().animate({"opacity":   0}, this.anim_duration);

            this.center_content.stop().animate({"opacity": 0}, this.anim_duration);
        }

        else {  // Center
            this.center_content.css({"display": "block", "opacity": 1});

            this.left_content.stop().animate({"opacity":  0}, this.anim_duration);

            this.right_content.stop().animate({"opacity": 0}, this.anim_duration);

            backing_opacity = 1;
        }

        if (target_index === 1) {  // Make sure to show header and footer
            if (this.footer_button_overlay) {
                this.footer_button_overlay.stop().animate({"opacity": 1}, this.anim_duration * 0.25);
            }

            if (this.banner_fixed) {
                this.banner.html.stop().animate({"opacity": 1}, this.anim_duration * 0.25);
            }
        }

        else {  // Make sure to hide header and footer
            if (this.footer_button_overlay) {
                this.footer_button_overlay.stop().animate({"opacity": 0}, this.anim_duration * 1.5);
            }

            if (this.banner_fixed) {
                this.banner.html.stop().animate({"opacity": 0}, this.anim_duration * 1.5);
            }
        }

        (function (self) {
            self.slider.stop().animate(
                {"left": self.panel_offsets[target_index]},
                self.anim_duration,
                function () {
                    self.cleanup_hidden_panels();
                }
            );

            if (self.backing_gradient) {
                self.backing_gradient.stop().animate({"opacity": backing_opacity}, self.anim_duration);
            }
        })(this);

        this.active_panel_index = target_index;
    };

    this.reset_center_column = function () {
        this.slide_to_index(1);
    };

    this.cleanup_hidden_panels = function () {
        if (this.active_panel_index === 0) {  // Left is visible
            this.center_content.css({"display": "none"});

            this.right_content.css({"display": "none"});
        }

        else if (this.active_panel_index === 2) {  // Center is visible
            this.left_content.css({"display": "none"});

            this.center_content.css({"display": "none"});
        }

        else {  // Right is visible
            this.left_content.css({"display": "none"});
            this.right_content.css({"display": "none"});
        }
    };

    this.setup_styles();
}
