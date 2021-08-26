function DashCardStackBannerFooterButtonRow (banner) {

    this.banner = banner;
    this.stack = this.banner.stack;
    this.color = this.stack.color;

    this.html = Dash.Gui.GetHTMLContext();
    this.vertical_offset_slider = $("<div></div>");
    this.left_spacer = Dash.Gui.GetHTMLContext();
    this.right_spacer = Dash.Gui.GetHTMLContext();
    this.center_content = Dash.Gui.GetHTMLContext();

    this.row_height = this.banner.FooterHeight;
    this.button_size = this.banner.FooterHeight;

    this.buttons = [];

    this.setup_styles = function () {

        this.html.append(this.vertical_offset_slider);

        this.vertical_offset_slider.append(this.left_spacer);
        this.vertical_offset_slider.append(this.center_content);
        this.vertical_offset_slider.append(this.right_spacer);

        this.html.css({
            "background": "none",
            "height": this.row_height,
            "pointer-events": "none",
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.vertical_offset_slider.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "height": this.row_height,
            "display": "flex",
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
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

    this.OnScroll = function (scroll_norm, headline_offset) {

        var anim_clamp = 0.7
        if (scroll_norm < anim_clamp) {
            scroll_norm = Dash.Math.InverseLerp(0, anim_clamp, scroll_norm);
        }
        else {
            scroll_norm = 1;
        };

        // This is technically a double ease out...
        scroll_norm = Dash.Animation.Curves.EaseOut(scroll_norm);

        this.vertical_offset_slider.css("top", Dash.Math.Lerp(0, -headline_offset, scroll_norm));

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
