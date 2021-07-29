function DashMobileLayoutCardStack (binder, color) {

    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.html = Dash.Gui.GetHTMLAbsContext();

    this.slider = null;
    this.center_content = null;
    this.left_content = null;
    this.right_content = null;

    this.footer_button_overlay = null;

    this.anim_duration = 400;
    this.backing_gradient = null;

    this.width = 0;
    this.height = 0;
    this.frame = 0;

    this.active_panel_index = 1; // Center
    this.panel_offsets = [0, 0, 0];
    this.slider_offsets = [0, 0, 0];

    this.setup_styles = function () {

        this.slider = $("<div></div>");

        this.slider.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            // "background": Dash.Color.GetHorizontalGradient("red", "yellow"),
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.left_content = this.make_content_panel("yellow");
        this.center_content = this.make_content_panel("red");
        this.right_content = this.make_content_panel("blue");

        this.center_content.css({
            "display": "block",
        });

        this.html.css({
            "color": this.color.Text,
            "overflow": "hidden",
            "overflow-y": "auto",
            "background": "none",
            "background": this.color.Background,
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.html.append(this.slider);

        Dash.OnHTMLResized(this, this.on_resized);
        this.on_resized(window.innerWidth, window.innerHeight);

    };

    this.on_resized = function (width, height) {

        this.panel_offsets = [0, -width, -width*2];

        this.slider.css({
            "width": width*3,
            "height": height,
            "left": this.panel_offsets[this.active_panel_index],
        });

        this.left_content.css({
            "left": 0,
            "width": width,
            "height": height,
        });

        this.center_content.css({
            "left": width,
            "width": width,
            "height": height,
        });

        this.right_content.css({
            "left": width*2,
            "width": width,
            "height": height,
        });

        this.width = width;
        this.height = height;

    };

    this.make_content_panel = function (tmp_color) {

        var content = $("<div></div>");

        content.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "text-align": "center",
            "color": this.color.Text,
            "overflow-y": "auto",
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
            "background": "none",
            "display": "none",
            // "margin-left": Dash.Size.Padding*4,
            // "margin-right": Dash.Size.Padding,
        });

        this.slider.append(content);

        return content;

    };

    this.AddBanner = function(){
        var banner = new DashCardStackBanner(this);
        this.AppendHTML(banner.html);
        return banner;
    };

    this.AddUserBanner = function(){
        var banner = new DashCardStackUserBanner(this);
        this.AppendHTML(banner.html);
        return banner;
    };

    this.AppendHTML = function(html){

        // Force hardware acceleration
        html.css({
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.center_content.append(html);

    };

    this.AddLeftContent = function(html){

        if (this.active_panel_index == 0) {
            console.error("The left panel is already loaded");
        };

        // Force hardware acceleration
        html.css({
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.left_content.empty();
        this.left_content.append(html);

        this.slide_to_index(0);

    };

    this.ShowCenterContent = function(){
        this.slide_to_index(1);
    };

    this.AddRightContent = function(html){

        if (this.active_panel_index == 2) {
            console.error("The right panel is already loaded");
        };

        // Force hardware acceleration
        html.css({
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.right_content.empty();
        this.right_content.append(html);

        this.slide_to_index(2);

    };

    this.AddFooterButton = function () {
        // WIP!
        
        if (!this.footer_button_overlay) {
            this.create_footer_overlay();
        };

        console.log("Add footer");

    };

    this.create_footer_overlay = function () {

        this.footer_button_overlay = Dash.Gui.GetHTMLAbsContext();
        this.footer_button_overlay.text("Continue without images...");

        this.footer_button_overlay.css({
            "position": "fixed",
            "background": "#222",
            "height": Dash.Size.ButtonHeight,
            "top": "auto",
            "line-height": Dash.Size.ButtonHeight + "px",
            "color": "white",

        });

        this.html.append(this.footer_button_overlay);

    };

    this.AddCard = function () {

        var card = new DashMobileLayoutCard(this);

        this.AppendHTML(card.html);

        return card;

    };

    this.slide_to_index = function(target_index){

        var backing_opacity = 0;

        if (target_index == 0) {
            this.left_content.css({"display": "block"});
        }
        else if (target_index == 2) {
            this.right_content.css({"display": "block"});
        }
        else {
            this.center_content.css({"display": "block"});
            backing_opacity = 1;
        };

        (function(self){

            self.slider.stop().animate({
                "left": self.panel_offsets[target_index],
            }, self.anim_duration, function(){
                self.cleanup_hidden_panels();
            });

            if (self.backing_gradient) {

                self.backing_gradient.stop().animate({
                    "opacity": backing_opacity,
                }, self.anim_duration);

            };

        })(this);

        this.active_panel_index = target_index;

    };

    this.reset_center_column = function(){
        this.slide_to_index(1);
    };

    this.cleanup_hidden_panels = function(){

        if (this.active_panel_index == 0) {
            // Left is visible
            this.center_content.css({"display": "none"});
            this.right_content.css({"display": "none"});
        }
        else if (this.active_panel_index == 2) {
            // Center is visible
            this.left_content.css({"display": "none"});
            this.center_content.css({"display": "none"});
        }
        else {
            // Right is visible
            this.left_content.css({"display": "none"});
            this.right_content.css({"display": "none"});
        };

    };

    this.setup_styles();

};
