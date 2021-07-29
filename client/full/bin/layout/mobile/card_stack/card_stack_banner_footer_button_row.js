function DashCardStackBannerFooterButtonRow (banner) {

    this.banner = banner;
    this.stack = this.banner.stack;
    this.color = this.stack.color;
    this.html = Dash.Gui.GetHTMLContext();

    this.left_spacer = Dash.Gui.GetHTMLContext();
    this.right_spacer = Dash.Gui.GetHTMLContext();
    this.center_content = Dash.Gui.GetHTMLContext();

    this.row_height = this.banner.FooterHeight;
    this.button_size = this.banner.FooterHeight;

    this.buttons = [];

    this.setup_styles = function () {

        this.html.append(this.left_spacer);
        this.html.append(this.center_content);
        this.html.append(this.right_spacer);

        this.html.css({
            "background": "none",
            "height": this.row_height,
            "display": "flex",
            // "background": "orange",
        });

        this.left_spacer.css({
            "height": this.row_height,
            "background": "none",
            "flex-grow": 2,
        });

        this.right_spacer.css({
            "height": this.row_height,
            "background": "none",
            "flex-grow": 2,
        });

        this.center_content.css({
            "display": "flex",
            "background": "none",
            "height": this.row_height,
        });

        this.setup_connections();

    };

    this.setup_connections = function(){

        (function(self){

            // self.left_button_content.click(function(){
            //     self.on_left_button_clicked();
            // });
            //
            // self.right_button_content.click(function(){
            //     self.on_right_button_clicked();
            // });

        })(this);

    };

    this.on_button_clicked = function() {
        // Button presses have a short timeout to prevent accidental multiple taps

        // if (this.left_icon_callback && !this.left_icon_click_active) {
        //     this.left_icon_click_active = true;
        //     this.left_button_content.css("opacity", 0.75);
        //
        //     (function(self){
        //         setTimeout(function(){
        //             self.left_icon_click_active = false;
        //             self.left_button_content.stop().animate({"opacity": 1.0}, 400);
        //         }, 750);
        //     })(this);
        //
        //     this.left_icon_callback();
        //
        // };

    };

    this.AddIcon = function(icon_name="gear", label_text="--", callback=null){

        var button = new DashCardStackBannerFooterButtonRowButton(
            this,
            icon_name,
            label_text,
            callback
        );

        if (this.buttons.length > 0) {

            this.buttons[this.buttons.length-1].html.css({
                "margin-right": Dash.Size.Padding*2,
            });
        };

        this.center_content.append(button.html);
        this.buttons.push(button);

        return button;

    };

    this.set_icon = function(container, icon, icon_name){
        icon.SetIcon(icon_name);
    };

    this.setup_styles();

};
