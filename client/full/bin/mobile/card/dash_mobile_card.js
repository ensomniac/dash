function DashMobileCard (stack) {

    this.stack = stack;
    this.color = this.stack.color;

    this.html = Dash.Gui.GetHTMLContext();
    this.slider = null;
    this.content = Dash.Gui.GetHTMLContext();

    this.pull_active = false;
    this.pull_mechanic_ready = false; // This is off by default since it requires more overhead
    this.restoring_pull = false;
    this.restoring_pull_start_x = 0;
    this.last_touch_move_event = null;

    this.left_pull_area = null;
    this.right_pull_area = null;

    this.left_pull_callback = null;
    this.right_pull_callback = null;

    this.left_pull_icon = null;
    this.right_pull_icon = null;

    this.setup_styles = function () {

        this.html.css({
            "background": "none",
            "margin-bottom": Dash.Size.Padding,
            ...Dash.HardwareAccelerationCSS,
            "overflow": "visible",
        });

        this.content.css({
            "background": "white",
            "padding": Dash.Size.Padding,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 6px 10px 1px rgba(0, 0, 0, 0.1), inset 0px 1px 1px 0px rgba(255, 255, 255, 0.5)",
            "color": this.color.Text,
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding,
        });

        this.html.append(this.content);

    };

    this.PullToDelete = function (callback) {
        this.SetLeftPullCallback(callback, "trash_solid");
    };

    this.SetLeftPullCallback = function (callback, icon) {

        this.left_pull_callback = callback;

        if (!this.pull_mechanic_ready) {
            this.setup_pull_mechanic();
        }

        this.left_pull_icon = icon;

    };


    this.setup_slider = function () {

        this.slider = $("<div></div>");

        var content_width = this.content.width() + (Dash.Size.Padding*2);
        var content_height = this.content.height() + (Dash.Size.Padding*2);

        this.content.remove();
        this.setup_pull_icons();

        this.html.append(this.slider);
        this.slider.append(this.content);

        this.slider.css({
            "width": content_width,
            "height": content_height,
            "left": 0,
            "top": 0,
            "position": "absolute",
            ...Dash.HardwareAccelerationCSS,
            "margin-left": Dash.Size.Padding,
        });

        this.content.css({
            "margin-right": 0,
            "margin-left": 0,
        });

        this.html.css({
            "height": content_height,
        });

    };

    this.setup_pull_icons = function () {

        if (this.left_pull_area) {
            return;
        }

        this.left_pull_area = new DashMobileCardPullIcon(this, this.left_pull_icon);
        this.right_pull_area = new DashMobileCardPullIcon(this, this.right_pull_icon);

        this.html.append(this.left_pull_area.html);
        this.html.append(this.right_pull_area.html);

    };

    this.position_pull_icons = function () {

        var content_width = this.content.width() + (Dash.Size.Padding*2);
        var content_height = this.content.height() + (Dash.Size.Padding*2);

        this.left_pull_area.html.css({
            "left": Dash.Size.Padding,
            "top": (content_height*0.5)-(this.left_pull_area.Size*0.5),
            "opacity": 0,
        });

        this.right_pull_area.html.css({
            "left": "auto",
            "right": Dash.Size.Padding,
            "top": content_height*0.5-(this.left_pull_area.Size*0.5),
            "opacity": 0,
        });

    };

    this.restore_slider_content = function () {

        this.content.remove();
        this.html.append(this.content);
        this.slider.remove();
        this.slider = null;

        this.html.css({
            "height": "auto",
        });

        this.content.css({
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding,
        });

    };

    this.get_coords_from_event = function (event) {

        for (var i in event.originalEvent["changedTouches"]) {
            var touch = event.originalEvent["changedTouches"][i];
            return [touch.clientX, touch.clientY];
        }

        return null;

    };

    this.on_drag_start = function (event) {
        if (this.pull_active || this.restoring_pull) {
            return;
        }

        if (!this.slider) {
            this.setup_slider();
        }

        this.position_pull_icons();

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
        }

        if (!touch_found) {
            this.pull_active = null;
            return;
        }

        this.pull_active["offset_x"] = this.html.offset()["left"];
        this.pull_active["offset_y"] = this.html.offset()["top"];

    };

    this.on_drag = function (event) {
        if (!this.pull_active || this.restoring_pull) {
            return;
        }

        var touch_found = false;

        for (var i in event.originalEvent["changedTouches"]) {
            var touch = event.originalEvent["changedTouches"][i];
            this.pull_active["touch_now_x"] = touch.clientX;
            this.pull_active["touch_now_y"] = touch.clientY;
            touch_found = true;
            break;
        }

        if (!touch_found) {
            console.warn("Warning: No touches found??");
            return;
        }

        var screen_px_moved_x = this.pull_active["touch_now_x"]-this.pull_active["touch_start_x"];
        var screen_px_moved_y = this.pull_active["touch_now_y"]-this.pull_active["touch_start_y"];

        this.restoring_pull_start_x = screen_px_moved_x;
        var pulled_norm = Dash.Math.InverseLerp(0, $(window).width(), Math.abs(this.restoring_pull_start_x));

        if (this.restoring_pull_start_x > 0) {
            this.left_pull_area.OnDrag(pulled_norm);
        }
        else {
            this.right_pull_area.OnDrag(pulled_norm);
        }

        this.slider.css({
            "left": screen_px_moved_x,
        });

    };

    this.on_drag_end = function (event) {

        if (!this.pull_active || this.restoring_pull) {
            return;
        }

        if (this.left_pull_callback && this.left_pull_area.IsTriggered) {
            this.left_pull_callback();
        }

        if (this.right_pull_callback && this.right_pull_area.IsTriggered) {
            this.right_pull_callback();
        }

        this.pull_active = null;
        this.restoring_pull = true;

        var pulled_norm = Dash.Math.InverseLerp(0, $(window).width(), Math.abs(this.restoring_pull_start_x));
        var animation_duration = Dash.Math.Lerp(300, 1000, pulled_norm); // Longer duration for a further pull
        Dash.Animation.Start(animation_duration, this.on_restore.bind(this), Dash.Animation.Curves.EaseOutBounce);

    };

    this.FancyShow = function () {
        // Prepare for a fancy show by shrinking the box. Wait until the next frame to
        // ensure we can calculate the destination height of the show

        this.html.css({
            "margin-bottom": 0,
            "height": 0,
            "overflow": "hidden",
        });

        (function (self) {
            requestAnimationFrame(function () {
                self._fancy_show();
            });
        })(this);

    };

    this._fancy_show = function () {
        // This is the frame after this card was hidden

        this.html.stop().css({
            "height": "auto",
            "margin-bottom": Dash.Size.Padding,
        });

        var display_height = this.html.height();

        this.html.css({
            "height": 0,
            "margin-bottom": 0,
        });

        this.html.animate({
            "height": display_height,
            "margin-bottom": Dash.Size.Padding,
        }, 550, function () {
            $(this).css({
                "height": "auto",
            });
        });

    };

    this.Clear = function () {
        // Animate the hiding of this card

        this.html.stop().animate({
            "opacity": 0,
            "height": 0,
            "padding-top": 0,
            "padding-bottom": 0,
            "margin-top": 0,
            "margin-bottom": 0
        }, function () {
            this.remove();
        });

    };

    this.on_restore = function (t) {

        this.slider.css({
            "left": Dash.Math.Lerp(this.restoring_pull_start_x, 0, t),
        });

        if (t >= 1.0) {
            this.restoring_pull = false;
            this.restore_slider_content();
        }

    };

    this.manage_touch_start = function (event) {

        if (!event.cancelable || this.pull_active) {
            return;
        }

        // Reset this to ensure that if we do activate a pull and want to use
        // the positioning from this event, it's a fresh event
        this.last_touch_move_event = null;

        (function (self, event) {

            setTimeout(function () {

                if (!self.stack.GetScrollActive()) {

                    if (self.last_touch_move_event) {
                        self.on_drag_start(self.last_touch_move_event);
                        self.last_touch_move_event.preventDefault();
                    }
                    else {
                        self.on_drag_start(event);
                    }

                    event.preventDefault();

                }

            }, 150);

        })(this, event);

    };

    this.setup_pull_mechanic = function () {
        this.pull_mechanic_ready = true;

        this.html.css({
            "pointer-events": "auto",
        });

        (function (self) {

            self.html.on("touchstart", function (e) {
                self.manage_touch_start(e);
            });

            self.html.on("touchmove", function (e) {

                self.last_touch_move_event = e;

                self.on_drag(e);

                if (self.pull_active && e.cancelable) {
                    e.preventDefault();
                }

            });

            self.html.on("touchend", function (e) {

                self.on_drag_end(e);

                if (self.pull_active && e.cancelable) {
                    e.preventDefault();
                }

            });

            self.html.on("touchcancel", function (e) {
                self.on_drag_end(e);

                if (self.pull_active && e.cancelable) {
                    e.preventDefault();
                }

            });

        })(this);

    };

    this.SetText = function (text) {

        this.content.text(text);

    };

    this.setup_styles();

}
