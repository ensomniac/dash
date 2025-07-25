function DashMobileCardStackFooterButton (stack, icon_name, label_text="", callback=null, left_side_icon=false, icon_only=false) {
    this.stack = stack;
    this.icon_name = icon_name;
    this.label_text = label_text;
    this.callback = callback;
    this.left_side_icon = left_side_icon;
    this.icon_only = icon_only;

    this.icon = null;
    this.label = null;
    this.disabled = false;
    this.load_dots = null;
    this.icon_size = null;
    this.click_active = false;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();
    this.icon_circle = Dash.Gui.GetHTMLAbsContext();
    this.height = Dash.Size.ButtonHeight - (Dash.Size.Padding * (this.icon_only ? 0.4 : 1));

    this.setup_styles = function () {
        var css = {
            "height": this.height,
            "width": this.icon_only ? this.height : "auto",
            "background": this.icon_only ? "none" : Dash.Color.Mobile.ButtonGradient,
            "margin-top": Dash.Size.Padding * (this.icon_only ? 0.2 : 0.5),
            "margin-bottom": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * (this.icon_only ? 0.25 : 0.5),
            "line-height": this.height + "px",
            "border-radius": this.height
        };

        if (this.icon_only) {
            css["margin-left"] = Dash.Size.Padding * 0.25;
        }

        else {
            css["flex-grow"] = 1;
        }

        this.html.css(css);

        this.add_icon();
        this.add_label();
        this.setup_connections();
    };

    this.SetNotificationActive = function (is_active) {
        if (is_active && !this.notification_icon) {
            this.create_notification_icon();
        }

        if (!is_active && this.notification_icon) {
            this.notification_icon.remove();

            this.notification_icon = null;
        }
    };

    this.StyleAsBorderButton = function () {
        if (!this.icon_only) {
            this.html.css({
                "background": "",
                "border": "1px solid " + Dash.Color.Mobile.AccentPrimary
            });

            this.label.css({
                "color": this.color.Text
            });
        }
    };

    // Copied from DashGuiButtonInterface
    this.SetLoading = function (is_loading, size_mult=1, vertical=true, color=null, css={}) {
        if (is_loading && this.load_dots) {
            return;
        }

        if (!is_loading && !this.load_dots) {
            return;
        }

        if (!is_loading && this.load_dots) {
            this.load_dots.Stop();

            this.load_dots = null;

            return;
        }

        css = {
            "position": "absolute",
            ...css
        };

        if (this.icon_only) {
            if (size_mult === 1) {
                size_mult = 0.9;
            }

            vertical = false;

            css["bottom"] = 0;
            css["left"] = Dash.Size.Padding * 0.6;
        }

        else {
            css["top"] = Dash.Size.Padding * 0.6;
            css["right"] = 0;
        }

        this.load_dots = new Dash.Gui.LoadDots(
            (this.html.outerHeight() - Dash.Size.Padding) * size_mult,
            color || this.color
        );

        if (vertical) {
            this.load_dots.SetOrientation("vertical");
        }

        if (!color) {
            // (Only if 'color' is not already provided, since that's likely
            // the opposite Dash color instance to combat this issue)
            // It seemed like virtually every time I added loading dots to a button with this function,
            // I was having to restyle it this way, so I'm finally adding it here. It seems sensible,
            // since the text color will obviously be something that's visible against the button
            // background, but there's of course a chance that this will break the visuals somewhere.
            this.load_dots.SetColor(this.icon ? this.color.Text : this.color.Button.Text.Base);
        }

        this.load_dots.html.css(css);

        this.html.append(this.load_dots.html);

        this.load_dots.Start();
    };

    // Copied from DashGuiButtonInterface
    this.Disable = function (opacity=0.5) {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "pointer-events": "none",
            "user-select": "none"
        });

        this.html.stop().animate(
            {"opacity": opacity},
            300
        );
    };

    // Copied from DashGuiButtonInterface
    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "pointer-events": "auto",
            "user-select": "auto"
        });

        this.html.stop().animate(
            {"opacity": 1},
            300
        );
    };

    this.add_icon = function () {
        this.icon_size = this.height - (Dash.Size.Padding * (this.icon_only ? 0.25 : 0.5));

        this.icon = new Dash.Gui.Icon(
            this.color,
            icon_name,
            this.icon_size,
            this.icon_only ? 0.65 : 0.75,
            Dash.Color.Mobile.AccentPrimary
        );

        this.icon.AddShadow("0px 1px 2px rgba(0, 0, 0, 0.15)");

        var css = {
            "background": "rgb(250, 250, 250)",
            "height": this.icon_size,
            "width": this.icon_size,
            "border-radius": this.icon_size * 0.5,
            "border": "1px solid " + this.color.PinstripeDark
            // "box-shadow": (
            //     this.icon_only ? "0px 0px 7px 2px rgba(0, 0, 0, 0.35)" : "0px 6px 10px 1px rgba(0, 0, 0, 0.1)"
            // ) + ", inset 0px 2px 2px 0px rgba(255, 255, 255, 1)"
        };

        if (this.icon_only) {
            css["inset"] = 0;
            css["top"] = (this.height - this.icon_size) * 0.5;
            css["left"] = (this.height - this.icon_size) * 0.5;
        }

        else {
            css["left"] = this.left_side_icon ? Dash.Size.Padding * 0.25 : "auto";
            css["top"] = Dash.Size.Padding * 0.2;
            css["right"] = this.left_side_icon ? "auto" : Dash.Size.Padding * 0.25;
            css["bottom"] = "auto";
        }

        this.icon_circle.css(css);

        this.icon_circle.append(this.icon.html);

        this.html.append(this.icon_circle);
    };

    this.add_label = function () {
        if (this.icon_only) {
            return;
        }

        this.label = Dash.Gui.GetHTMLAbsContext();

        var label_css = {
            "height": this.height,
            "line-height": this.height + "px",
            "background": "none",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "color": "white"
        };

        label_css["margin-" + (this.left_side_icon ? "left" : "right")] = this.height - (Dash.Size.Padding * 0.5);
        label_css["padding-" + (this.left_side_icon ? "right" : "left")] = this.height - (Dash.Size.Padding * 0.5);

        this.label.css(label_css);

        this.label.text(this.label_text);

        this.html.append(this.label);
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mousedown", function (event) {
                self.on_button_clicked();

                event.preventDefault();

                return false;
            });
        })(this);
    };

    // Button presses have a short timeout to prevent accidental multiple taps
    this.on_button_clicked = function () {
        if (this.click_active) {
            return;
        }

        if (this.callback) {
            this.callback();
        }

        else {
            console.error("Error: No callback associated with button!");
        }

        this.click_active = true;

        (function (self) {
            setTimeout(
                function () {
                    self.click_active = false;
                },
                750
            );
        })(this);
    };

    this.create_notification_icon = function () {
        this.notification_icon = Dash.Gui.GetMobileNotificationIcon(this.height * 0.25);

        this.html.append(this.notification_icon);
    };

    this.setup_styles();
}
