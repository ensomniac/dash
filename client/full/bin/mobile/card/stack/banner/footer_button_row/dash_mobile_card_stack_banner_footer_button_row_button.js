function DashMobileCardStackBannerFooterButtonRowButton (footer, icon_name="gear", label_text="--", callback=null) {
    this.footer = footer;
    this.icon_name = icon_name;
    this.label_text = label_text;
    this.callback = callback;

    this.disabled = false;
    this.highlighted = false;
    this.click_active = false;
    this.upload_button = null;
    this.notification_icon = null;
    this.banner = this.footer.banner;
    this.stack = this.banner.stack;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();
    this.label = Dash.Gui.GetHTMLAbsContext();
    this.row_height = this.banner.FooterHeight;
    this.width = this.banner.FooterButtonWidth;
    this.icon_circle = Dash.Gui.GetHTMLAbsContext();
    // this.icon_circle_box_shadow = "0px 6px 10px 1px rgba(0, 0, 0, 0.1)";
    // this.icon_circle_box_shadow_inset = "inset 0px 2px 2px 0px rgba(255, 255, 255, 1)";
    this.label_height = (this.row_height - this.width) < this.label_height ? this.row_height - this.width : Dash.Size.RowHeight;

    this.icon = new Dash.Gui.Icon(
        this.color,
        icon_name,
        this.width,
        0.5,
        Dash.Color.Mobile.AccentPrimary
    );

    this.setup_styles = function () {
        this.label.text(this.label_text);

        this.icon.AddShadow("0px 1px 2px rgba(0, 0, 0, 0.15)");

        this.html.css({
            "height": this.row_height,
            "width": this.width,
            "background": "none",
            "pointer-events": "auto",
            ...Dash.HardwareAccelerationCSS
        });

        this.icon_circle.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": "auto",
            "background": "rgb(250, 250, 250)",
            "height": this.width,
            "width": this.width,
            "border-radius": this.width * 0.5,
            "border": "1px solid " + this.color.PinstripeDark
            // "box-shadow": this.icon_circle_box_shadow + ", " + this.icon_circle_box_shadow_inset
        });

        this.label.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "bottom": 0,
            "top": "auto",
            "height": this.label_height,
            "line-height": this.label_height + "px",
            "width": this.width + (Dash.Size.Padding * 2),
            "font-size": "80%",
            "background": "none"
        });

        this.icon_circle.append(this.icon.html);

        this.html.append(this.icon_circle);
        this.html.append(this.label);

        this.setup_connections();
    };

    this.AddUploader = function (binder, callback, endpoint, params) {
        if (this.upload_button) {
            return;
        }

        this.upload_button = new Dash.Gui.Button(
            "",
            callback,
            binder,
            this.color
        );

        var abs_css = {
            "position": "absolute",
            "inset": 0,
            "width": "auto",
            "height": "auto"
        };

        this.upload_button.html.css({
            ...abs_css,
            "background": "rgba(0, 0, 0, 0)"
        });

        this.upload_button.highlight.css(abs_css);

        this.upload_button.label.css({
            "opacity": 0
        });

        this.UpdateUploaderParams(endpoint, params);

        this.icon_circle.append(this.upload_button.html);
    };

    this.UpdateUploaderParams = function (endpoint, params) {
        this.upload_button.SetFileUploader(endpoint, params);

        this.upload_button.file_uploader.html.css({
            "width": "auto",
            "height": "auto"
        });
    };

    this.SetNotificationActive = function (is_active) {
        if (!this.notification_icon) {
            this.create_notification_icon();
        }

        if (is_active) {
            this.notification_icon.stop().animate({"opacity": 1}, 350);
        }

        else {
            this.notification_icon.stop().animate({"opacity": 0}, 350);
        }
    };

    this.ToggleHighlight = function (highlighted) {
        if (this.highlighted === highlighted) {
            return;
        }

        if (highlighted) {
            this.icon_circle.css({
                "border": "2px solid " + Dash.Color.Mobile.AccentPrimary
                // "box-shadow": "0px 0px 2px 3px " + Dash.Color.Mobile.AccentPrimary + ", " + this.icon_circle_box_shadow_inset
            });
        }

        else {
            this.icon_circle.css({
                "border": "1px solid " + this.color.PinstripeDark
                // "box-shadow": this.icon_circle_box_shadow + ", " + this.icon_circle_box_shadow_inset
            });
        }

        this.highlighted = highlighted;
    };

    this.Disable = function () {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "pointer-events": "none",
            "user-select": "none"
        });

        this.icon.html.css({
            "opacity": 0.5
        });
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "pointer-events": "auto",
            "user-select": "auto"
        });

        this.icon.html.css({
            "opacity": 1
        });
    };

    this.setup_connections = function () {
        (function (self) {
            self.icon_circle.on("mousedown", function (event) {
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

        else if (!this.upload_button) {
            console.error("Error: No callback associated with button!");
        }

        this.click_active = true;

        (function (self) {
            setTimeout(function () {
                self.click_active = false;
            }, 750);
        })(this);
    };

    this.create_notification_icon = function () {
        this.notification_icon = $("<div></div>");

        var icon_size = this.width * 0.25;

        this.notification_icon.css({
            "background": "red",
            "position": "absolute",
            "top": 0,
            "right": 0,
            "width": icon_size,
            "height": icon_size,
            "border-radius": icon_size,
            "box-shadow": "0px 3px 5px 1px rgba(0, 0, 0, 0.2)",
            "border": "2px solid white",
            "opacity": 0.1
        });

        this.html.append(this.notification_icon);
    };

    this.setup_styles();
}
