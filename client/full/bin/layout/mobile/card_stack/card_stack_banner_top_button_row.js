function DashCardStackBannerTopButtonRow (banner) {

    this.banner = banner;
    this.stack = this.banner.stack;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();

    this.left_button_content = Dash.Gui.GetHTMLContext();
    this.right_button_content = Dash.Gui.GetHTMLContext();
    this.center_content = Dash.Gui.GetHTMLContext();

    this.row_height = this.banner.HeaderHeight;
    this.button_size = Dash.Size.ButtonHeight-Dash.Size.Padding;

    this.left_icon = new Dash.Gui.Icon(this.color, "gear", this.button_size, 0.75, "white");
    this.right_icon = new Dash.Gui.Icon(this.color, "gear", this.button_size, 0.75, "white");

    this.left_icon_callback = null;
    this.right_icon_callback = null;

    this.left_icon_click_active = false;
    this.right_icon_click_active = false;

    this.setup_styles = function () {

        this.html.append(this.left_button_content);
        this.html.append(this.center_content);
        this.html.append(this.right_button_content);

        this.left_button_content.append(this.left_icon.html);
        this.right_button_content.append(this.right_icon.html);

        this.html.css({
            "background": "none",
            "height": this.row_height,
            "display": "flex",
            // "background": "yellow",
            // "overflow": "hidden",
        });

        this.left_button_content.css({
            "height": this.button_size,
            "width": this.button_size,
            "margin": (this.row_height-this.button_size)*0.5,
            "border-radius": this.button_size*0.5,
            "background": "none",
            "display": "none",
            // "background": "blue",
            "flex-grow": 0,
        });

        this.right_button_content.css({
            "height": this.button_size,
            "width": this.button_size,
            "margin": (this.row_height-this.button_size)*0.5,
            "border-radius": this.button_size*0.5,
            "background": "none",
            "display": "none",
            // "background": "blue",
            "flex-grow": 0,
        });

        this.center_content.css({
            "background": "none",
            "height": this.row_height,
            "flex-grow": 2,
        });

        this.setup_connections();

    };

    this.setup_connections = function () {

        (function (self) {

            self.left_button_content.click(function () {
                self.on_left_button_clicked();
            });

            self.right_button_content.click(function () {
                self.on_right_button_clicked();
            });

        })(this);

    };

    this.on_left_button_clicked = function () {
        // Button presses have a short timeout to prevent accidental multiple taps

        if (this.left_icon_callback && !this.left_icon_click_active) {
            this.left_icon_click_active = true;
            this.left_button_content.css("opacity", 0.75);

            (function (self) {
                setTimeout(function () {
                    self.left_icon_click_active = false;
                    self.left_button_content.stop().animate({"opacity": 1.0}, 400);
                }, 750);
            })(this);

            this.left_icon_callback();

        }

    };

    this.on_right_button_clicked = function () {
        // Button presses have a short timeout to prevent accidental multiple taps

        if (this.right_icon_callback && !this.right_icon_click_active) {
            this.right_icon_click_active = true;
            this.right_button_content.css("opacity", 0.75);

            (function (self) {
                setTimeout(function () {
                    self.right_icon_click_active = false;
                    self.right_button_content.stop().animate({"opacity": 1.0}, 400);
                }, 750);
            })(this);

            this.right_icon_callback();
        }

    };

    this.SetLeftIcon = function (icon_name="gear", callback=null) {
        this.set_icon(this.left_button_content, this.left_icon, icon_name);
        this.left_icon_callback = callback.bind(this.banner);

        this.left_button_content.css({
            "display": "block",
            "pointer-events": "auto",
        });

    };

    this.SetRightIcon = function (icon_name="gear", callback=null) {
        this.set_icon(this.right_button_content, this.right_icon, icon_name);
        this.right_icon_callback = callback.bind(this.banner);

        this.right_button_content.css({
            "display": "block",
            "pointer-events": "auto",
        });

    };

    this.set_icon = function (container, icon, icon_name) {
        icon.SetIcon(icon_name);
    };

    this.setup_styles();

}
