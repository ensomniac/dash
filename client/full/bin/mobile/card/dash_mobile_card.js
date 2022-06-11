function DashMobileCard (stack) {
    this.stack = stack;

    this.slider = null;
    this.pull_active = false;
    this.left_pull_icon = null;
    this.left_pull_area = null;
    this.right_pull_icon = null;
    this.right_pull_area = null;
    this.restoring_pull = false;
    this.color = this.stack.color;
    this.left_pull_callback = null;
    this.right_pull_callback = null;
    this.restoring_pull_start_x = 0;
    this.pull_mechanic_ready = false; // This is off by default since it requires more overhead
    this.last_touch_move_event = null;
    this.html = Dash.Gui.GetHTMLContext();
    this.content = Dash.Gui.GetHTMLContext();

    this.setup_styles = function () {
        this.html.css({
            "background": "none",
            "margin-bottom": Dash.Size.Padding,
            ...Dash.HardwareAccelerationCSS,
            "overflow": "visible"
        });

        this.content.css({
            "background": "white",
            "padding": Dash.Size.Padding,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 6px 10px 1px rgba(0, 0, 0, 0.1), inset 0px 1px 1px 0px rgba(255, 255, 255, 0.5)",
            "color": this.color.Text,
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding
        });

        this.html.append(this.content);
    };

    this.AddHTML = function (html) {
        this.content.append(html);
    };

    this.AddLabel = function (text) {
        var label = $("<div>" + text + "</div>");

        label.css({
            "color": Dash.Color.Mobile.AccentPrimary,
            "font-family": "sans_serif_bold",
            "font-size": "120%",
            "margin-bottom": Dash.Size.Padding
        });

        this.AddHTML(label);

        return label;
    };

    this.AddButton = function (label_text, binder, callback) {
        var button = new Dash.Gui.Button(
            label_text,
            callback,
            binder,
            this.color,
            {"style": "toolbar"}
        );

        button.html.css({
            "margin-right": 0
        });

        this.AddHTML(button.html);

        return button;
    };

    this.PullToDelete = function (callback) {
        this.SetLeftPullCallback(callback, "trash_solid");
    };

    this.SetLeftPullCallback = function (callback, icon_name) {
        this.left_pull_callback = callback;

        if (!this.pull_mechanic_ready) {
            this.setup_pull_mechanic();
        }

        this.left_pull_icon = icon_name;
    };

    this.SetRightPullCallback = function (callback, icon_name) {
        this.right_pull_callback = callback;

        if (!this.pull_mechanic_ready) {
            this.setup_pull_mechanic();
        }

        this.right_pull_icon = icon_name;

        if (this.right_pull_area) {
            this.right_pull_area.UpdateIcon(icon_name);
        }
    };

    this.SetText = function (text) {
        this.content.text(text);
    };

    // Animate the hiding of this card
    this.Clear = function () {
        this.html.stop().animate(
            {
                "opacity": 0,
                "height": 0,
                "padding-top": 0,
                "padding-bottom": 0,
                "margin-top": 0,
                "margin-bottom": 0
            },
            function () {
                this.remove();
            }
        );
    };

    // Prepare for a fancy show by shrinking the box. Wait until the next
    // frame to ensure we can calculate the destination height of the show.
    this.FancyShow = function () {
        this.html.css({
            "margin-bottom": 0,
            "height": 0,
            "overflow": "hidden"
        });

        (function (self) {
            requestAnimationFrame(function () {
                self._fancy_show();
            });
        })(this);
    };

    this.setup_slider = function () {
        this.slider = $("<div></div>");

        var content_width = this.content.width() + (Dash.Size.Padding * 2);
        var content_height = this.content.height() + (Dash.Size.Padding * 2);

        this.content.remove();

        this.setup_pull_icons();

        this.slider.css({
            "width": content_width,
            "height": content_height,
            "left": 0,
            "top": 0,
            "position": "absolute",
            ...Dash.HardwareAccelerationCSS,
            "margin-left": Dash.Size.Padding
        });

        this.content.css({
            "margin-right": 0,
            "margin-left": 0
        });

        this.html.css({
            "height": content_height
        });

        this.slider.append(this.content);

        this.html.append(this.slider);
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
        // var content_width = this.content.width() + (Dash.Size.Padding * 2);
        var content_height = this.content.height() + (Dash.Size.Padding * 2);

        this.left_pull_area.html.css({
            "left": Dash.Size.Padding,
            "top": (content_height * 0.5) - (this.left_pull_area.Size * 0.5),
            "opacity": 0
        });

        this.right_pull_area.html.css({
            "left": "auto",
            "right": Dash.Size.Padding,
            "top": content_height * 0.5 - (this.left_pull_area.Size * 0.5),
            "opacity": 0
        });
    };

    this.restore_slider_content = function () {
        this.content.remove();

        this.html.append(this.content);

        this.slider.remove();

        this.slider = null;

        this.html.css({
            "height": "auto"
        });

        this.content.css({
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding
        });
    };

    // this.get_coords_from_event = function (event) {
    //     for (var i in event.originalEvent["changedTouches"]) {
    //         var touch = event.originalEvent["changedTouches"][i];
    //
    //         return [touch.clientX, touch.clientY];
    //     }
    //
    //     return null;
    // };

    this.on_drag_start = function (event) {
        if (this.pull_active || this.restoring_pull) {
            return;
        }

        if (!this.slider) {
            this.setup_slider();
        }

        this.position_pull_icons();

        if (!event || !event.originalEvent || !event.originalEvent["changedTouches"] || !event.originalEvent["changedTouches"][0]) {
            this.pull_active = null;
        }

        this.pull_active = {
            "touch_start_x": event.originalEvent["changedTouches"][0].clientX,
            "touch_start_y": event.originalEvent["changedTouches"][0].clientY,
            "touch_now_x": event.originalEvent["changedTouches"][0].clientX,
            "touch_now_y": event.originalEvent["changedTouches"][0].clientY,
            "offset_x": this.html.offset()["left"],
            "offset_y": this.html.offset()["top"]
        };
    };

    this.on_drag = function (event) {
        if (!this.pull_active || this.restoring_pull) {
            return;
        }

        if (!event || !event.originalEvent || !event.originalEvent["changedTouches"] || !event.originalEvent["changedTouches"][0]) {
            console.warn("Warning: No touches found??");

            return;
        }

        this.pull_active["touch_now_x"] = event.originalEvent["changedTouches"][0].clientX;
        this.pull_active["touch_now_y"] = event.originalEvent["changedTouches"][0].clientY;

        var screen_px_moved_x = this.pull_active["touch_now_x"] - this.pull_active["touch_start_x"];
        // var screen_px_moved_y = this.pull_active["touch_now_y"] - this.pull_active["touch_start_y"];

        this.restoring_pull_start_x = screen_px_moved_x;

        var pulled_norm = Dash.Math.InverseLerp(0, $(window).width(), Math.abs(this.restoring_pull_start_x));

        if (this.restoring_pull_start_x > 0) {
            this.left_pull_area.OnDrag(pulled_norm);
        }

        else {
            this.right_pull_area.OnDrag(pulled_norm);
        }

        this.slider.css({
            "left": screen_px_moved_x
        });
    };

    this.on_drag_end = function () {
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

        Dash.Animation.Start(
            Dash.Math.Lerp(  // Longer duration for a further pull
                300,
                1000,
                Dash.Math.InverseLerp(0, $(window).width(), Math.abs(this.restoring_pull_start_x))
            ),
            this.on_restore.bind(this),
            Dash.Animation.Curves.EaseOutBounce
        );
    };

    // This is the frame after this card was hidden
    this._fancy_show = function () {
        this.html.stop().css({
            "height": "auto",
            "margin-bottom": Dash.Size.Padding
        });

        var display_height = this.html.height();

        this.html.css({
            "height": 0,
            "margin-bottom": 0
        });

        this.html.animate(
            {
                "height": display_height,
                "margin-bottom": Dash.Size.Padding
            },
            550,
            function () {
                $(this).css({
                    "height": "auto"
                });
            }
        );
    };

    this.on_restore = function (t) {
        this.slider.css({
            "left": Dash.Math.Lerp(this.restoring_pull_start_x, 0, t)
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

        // Reset this to ensure that if we do activate a pull and want
        // to use the positioning from this event, it's a fresh event
        this.last_touch_move_event = null;

        (function (self, event) {
            setTimeout(
                function () {
                    if (self.stack.GetScrollActive()) {
                        return;
                    }

                    if (self.last_touch_move_event) {
                        self.on_drag_start(self.last_touch_move_event);

                        self.last_touch_move_event.preventDefault();
                    }

                    else {
                        self.on_drag_start(event);
                    }

                    event.preventDefault();
                },
                150
            );
        })(this, event);
    };

    this.setup_pull_mechanic = function () {
        this.pull_mechanic_ready = true;

        this.html.css({
            "pointer-events": "auto"
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

    this.setup_styles();
}
