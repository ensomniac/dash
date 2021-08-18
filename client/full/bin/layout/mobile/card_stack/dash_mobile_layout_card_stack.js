function DashMobileLayoutCardStack (binder, color) {

    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.html = Dash.Gui.GetHTMLAbsContext();

    this.slider = null;
    this.center_content = null;
    this.left_content = null;
    this.right_content = null;
    this.banner = null;
    this.banner_fixed = false; // By default, the banner scrolls with the rest of the content

    this.footer_button_overlay = null;

    this.anim_duration = 400;
    this.backing_gradient = null;
    this.banner_spacer = null;

    this.width = 0;
    this.height = 0;
    this.frame = 0;
    this.center_scroll_top = 0;

    this.active_panel_index = 1; // Center
    this.panel_offsets = [0, 0, 0];
    this.slider_offsets = [0, 0, 0];
    this.footer_spacer = null;
    this.footer_buttons = [];

    this.setup_styles = function () {

        this.slider = $("<div></div>");

        this.slider.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
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

        this.setup_connections();

        this.html.append(this.slider);

        Dash.OnHTMLResized(this, this.on_resized);
        this.on_resized(window.innerWidth, window.innerHeight);

    };

    this.setup_connections = function () {

        (function(self){

            self.center_content.scroll(function() {
                self.on_center_scroll();
            });

        })(this);

    };

    this.on_center_scroll = function () {
        this.center_scroll_top = this.center_content.scrollTop();

        if (!this.banner_fixed) {
            return;
        };

        // console.log("center_content scrolling >>");

        var banner_height = this.banner.html.height();
        this.banner_spacer.css("height", banner_height);
        this.banner.OnScroll(this.center_scroll_top);

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

        if (this.banner_fixed) {
            this.on_center_scroll();
        };

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

        if (this.banner) {
            console.log("ERROR: Stack.AddBanner() >> A banner already exists!");
            return this.banner;
        };

        this.banner = new DashCardStackBanner(this);
        this.AppendHTML(this.banner.html);
        return this.banner;

    };

    this.SetFixedBanner = function(is_fixed){
        // When is_fixed is true, the banner does not scroll
        // with the rest of the content on the page

        if (is_fixed) {
            this.fix_banner_on_top();
        }
        else {
            console.log("WARNING: Stack.SetFixedBanner(false) >> This is not implemented yet!");
        };

    };

    this.fix_banner_on_top = function(){

        if (this.banner_fixed || !this.banner) {
            return;
        };

        this.banner_fixed = true;
        // this.banner.html.unbind();
        this.banner.html.css({
            "position": "fixed",
            "top": 0,
            "left": 0,
            "right": 0,
        });

        this.html.append(this.banner.html);

        // You should never see this, but it allows the window to scroll correctly
        this.banner_spacer = $("<div></div>");
        this.banner_spacer.css({
            "height": this.banner.html.height(),
        });
        this.center_content.prepend(this.banner_spacer);

        // Wait until the next frame to force on_center_scroll since if this was called
        // as part of the constructor, it will not yet be attached and have no height
        (function(self){

            requestAnimationFrame(function(){
                self.on_center_scroll();
            });

        })(this);

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

        if (this.footer_spacer) {
            this.center_content.append(this.footer_spacer);
        };

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

    this.AddFooterButton = function (icon_name, label_text, callback) {

        if (!this.footer_button_overlay) {
            this.create_footer_overlay();
        };

        var button = new DashMobileCardStackFooterButton(this, icon_name, label_text, callback);
        this.footer_buttons.push(button);
        this.footer_button_overlay.append(button.html);

        return button;

    };

    this.create_footer_overlay = function () {

        this.footer_button_overlay = Dash.Gui.GetHTMLAbsContext();

        this.footer_button_overlay.css({
            "position": "fixed",
            "display": "flex",
            "background": this.color.Background,
            "height": Dash.Size.ButtonHeight,
            "top": "auto",
            "line-height": Dash.Size.ButtonHeight + "px",
            "color": "white",
            "bottom": 0,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "padding-left": Dash.Size.Padding*0.5,
            // "padding-right": Dash.Size.Padding*0.5,
        });

        this.html.append(this.footer_button_overlay);

        // You should never see this, but it allows the window to scroll correctly
        // without having to add padding/margin for the lower button content
        this.footer_spacer = $("<div></div>");
        this.footer_spacer.css({
            "height": Dash.Size.ButtonHeight,
        });
        this.center_content.append(this.footer_spacer);


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
