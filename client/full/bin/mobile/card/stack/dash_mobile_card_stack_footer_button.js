function DashMobileCardStackFooterButton (stack, icon_name, label_text="--", callback=null) {
    this.stack = stack;
    this.icon_name = icon_name;
    this.label_text = label_text;
    this.callback = callback;

    this.click_active = false;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();
    this.label = Dash.Gui.GetHTMLAbsContext();
    this.icon_circle = Dash.Gui.GetHTMLAbsContext();
    this.height = Dash.Size.ButtonHeight - Dash.Size.Padding;
    this.icon = new Dash.Gui.Icon(this.color, icon_name, this.height - (Dash.Size.Padding * 0.5), 0.75, this.stack.AccentOrange);

    this.setup_styles = function () {    
        this.icon.icon_html.css({
            "text-shadow": "0px 2px 3px rgba(0, 0, 0, 0.2)"
        });

        this.label.text(this.label_text);

        this.html.css({
            "height": this.height,
            "width": "auto",
            "flex-grow": 1,
            "background": this.stack.AccentOrange,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-bottom": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * 0.5,
            "line-height": this.height + "px",
            "border-radius": this.height
        });

        this.icon_circle.css({
            "position": "absolute",
            "left": "auto",
            "top": Dash.Size.Padding * 0.25,
            "right": Dash.Size.Padding * 0.25,
            "bottom": "auto",
            "background": "rgb(250, 250, 250)",
            "height": this.height-(Dash.Size.Padding * 0.5),
            "width": this.height-(Dash.Size.Padding * 0.5),
            "border-radius": (this.height-(Dash.Size.Padding * 0.5)) * 0.5,
            "box-shadow": "0px 6px 10px 1px rgba(0, 0, 0, 0.1), inset 0px 2px 2px 0px rgba(255, 255, 255, 1)"
        });

        this.label.css({
            "height": this.height,
            "line-height": this.height + "px",
            "background": "none",
            "margin-right": this.height * 0.5,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "color": "white"
        });

        this.icon_circle.append(this.icon.html);

        this.html.append(this.icon_circle);
        this.html.append(this.label);

        this.setup_connections();
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.mousedown(function (event) {
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

    this.SetNotificationActive = function (is_active) {
        if (is_active && !this.notification_icon) {
            this.create_notification_icon();
        }

        if (!is_active && this.notification_icon) {
            this.notification_icon.remove();

            this.notification_icon = null;
        }
    };

    this.create_notification_icon = function () {
        var icon_size = this.height * 0.25;

        this.notification_icon = $("<div></div>");

        this.notification_icon.css({
            "background": "red",
            "position": "absolute",
            "top": 0,
            "right": 0,
            "width": icon_size,
            "height": icon_size,
            "border-radius": icon_size,
            "box-shadow": "0px 3px 5px 1px rgba(0, 0, 0, 0.2)",
            "border": "2px solid white"
        });

        this.html.append(this.notification_icon);
    };

    this.setup_styles();
}
