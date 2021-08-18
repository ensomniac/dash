function DashMobileLayoutCard (stack) {

    this.stack = stack;
    this.color = this.stack.color;

    this.html = Dash.Gui.GetHTMLContext();
    this.slider = null;
    this.content = Dash.Gui.GetHTMLContext();

    this.pull_active = false;
    this.pull_to_delete_callback = null;
    this.pull_mechanic_ready = false; // This is off by default since it requires more overhead
    this.restoring_pull = false;
    this.restoring_pull_start_x = 0;

    this.setup_styles = function () {

        this.html.css({
            "background": "none",
            // "background": "#666",
            "margin-bottom": Dash.Size.Padding,
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding,
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.content.css({
            "background": "white",
            "padding": Dash.Size.Padding,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 6px 10px 1px rgba(0, 0, 0, 0.1), inset 0px 1px 1px 0px rgba(255, 255, 255, 0.5)",
            // "pointer-events": "none",
            "background": "none",
            "color": this.color.Text,
        });

        this.html.append(this.content);

    };

    this.PullToDelete = function(callback) {
        this.pull_to_delete_callback = callback;

        if (!this.pull_mechanic_ready) {
            this.setup_pull_mechanic();
        };

    };

    this.setup_slider = function() {

        this.slider = $("<div></div>");

        var content_width = this.content.width() + (Dash.Size.Padding*2);
        var content_height = this.content.height() + (Dash.Size.Padding*2);

        console.log("content size: " + content_width + " x " + content_height);

        this.content.remove();

        this.html.prepend(this.slider);
        this.slider.append(this.content);

        this.slider.css({
            "width": content_width,
            "height": content_height,
            "left": 0,
            "top": 0,
            "position": "absolute",
            // "background": "red",
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "-o-transform": "translateZ(0)",
            "transform": "translateZ(0)",
        });

        this.html.css({
            "height": content_height,
        });

    };

    this.restore_slider_content = function() {

        this.content.remove();
        this.html.append(this.content);
        this.slider.remove();
        this.slider = null;

        this.html.css({
            "height": "auto",
        });

    };

    this.on_drag_start = function(event) {
        if (this.pull_active || this.restoring_pull) {
            return;
        };

        if (!this.slider) {
            this.setup_slider();
        };

        var touch_found = false;
        this.pull_active = {};
        this.pull_active["touch_start_x"] = 0;
        this.pull_active["touch_start_y"] = 0;
        this.pull_active["touch_now_x"] = 0;
        this.pull_active["touch_now_y"] = 0;

        for (var i in event.originalEvent["changedTouches"]) {
            var touch = event.originalEvent["changedTouches"][i];
            this.pull_active["touch_start_x"] = touch.clientX;
            this.pull_active["touch_start_y"] = touch.clientY;
            this.pull_active["touch_now_x"] = touch.clientX;
            this.pull_active["touch_now_y"] = touch.clientY;
            touch_found = true;
            break;
        };

        if (!touch_found) {
            this.pull_active = null;
            return;
        };

        this.pull_active["offset_x"] = this.html.offset()["left"];
        this.pull_active["offset_y"] = this.html.offset()["top"];

    };

    this.on_drag = function(event) {
        if (!this.pull_active || this.restoring_pull) {
            return;
        };

        var touch_found = false;

        for (var i in event.originalEvent["changedTouches"]) {
            var touch = event.originalEvent["changedTouches"][i];
            this.pull_active["touch_now_x"] = touch.clientX;
            this.pull_active["touch_now_y"] = touch.clientY;
            touch_found = true;
            break;
        };

        if (!touch_found) {
            console.log("Warning: No touches found??");
            return;
        };

        var screen_px_moved_x = this.pull_active["touch_now_x"]-this.pull_active["touch_start_x"];
        var screen_px_moved_y = this.pull_active["touch_now_y"]-this.pull_active["touch_start_y"];

        this.slider.css({
            "left": screen_px_moved_x,
        });

        this.restoring_pull_start_x = screen_px_moved_x;

        console.log("dragging " + screen_px_moved_x);

    };

    this.on_drag_end = function(event) {

        if (!this.pull_active || this.restoring_pull) {
            return;
        };

        this.pull_active = null;
        this.restoring_pull = true;

        var pulled_norm = Dash.Math.InverseLerp(0, $(window).width(), Math.abs(this.restoring_pull_start_x));
        var animation_duration = Dash.Math.Lerp(300, 1000, pulled_norm); // Longer duration for a further pull
        Dash.Animation.Start(animation_duration, this.on_restore.bind(this), Dash.Animation.Curves.EaseOutBounce);

    };

    this.on_restore = function(t) {

        this.slider.css({
            "left": Dash.Math.Lerp(this.restoring_pull_start_x, 0, t),
        });

        if (t >= 1.0) {
            this.restoring_pull = false;
            this.restore_slider_content();
        };

    };

    this.setup_pull_mechanic = function() {
        this.pull_mechanic_ready = true;

        this.html.css({
            "pointer-events": "auto",
        });

        console.log("Set up pull");

        (function(self){

            self.html.on("touchstart", function(e){
                self.on_drag_start(e);
                e.preventDefault();
            });

            self.html.on("touchmove", function(e){
                self.on_drag(e);
                e.preventDefault();
            });

            self.html.on("touchend", function(e){
                self.on_drag_end(e);
                e.preventDefault();
            });

            self.html.on("touchcancel", function(e){
                self.on_drag_end(e);
                e.preventDefault();
            });

            self.html.mousedown(function(e){
                self.on_drag_start(e);
                e.preventDefault();
            });

            self.html.mousemove(function(e){
                self.on_drag(e);
                e.preventDefault();
            });

            self.html.mouseup(function(e){
                self.on_drag_end(e);
                e.preventDefault();
            });

        })(this);

    };

    this.SetText = function(text) {

        this.content.text(text);

    };

    this.setup_styles();

};
