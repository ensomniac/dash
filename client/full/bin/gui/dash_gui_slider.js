function DashGuiSlider (color, label_text, callback, start_range, end_range, current_value) {
    this.color = color;
    this.label_text = label_text;
    this.callback = callback;
    this.start_range = start_range;
    this.end_range = end_range;

    this.value = Dash.Math.InverseLerp(this.start_range, this.end_range, current_value);
    this.initial_value = this.value;
    this.html = Dash.Gui.GetHTMLContext();
    this.label = $("<div></div>");
    this.value_label = $("<div></div>");
    this.slider = $("<div></div>");
    this.bar = $("<div></div>");
    this.bar_fill = $("<div></div>");
    this.thumb = $("<div></div>");
    this.thumb_inner = $("<div></div>");
    this.thumb_outer = $("<div></div>");
    this.mark = $("<div></div>");
    this.height = null;
    this.width = null;
    this.outline_size = 1;
    this.border_size = 3;
    this.value_label_visible = true;
    this.on_change_callback = null;
    this.is_active = false;
    this.setup_complete = false;
    this.initial_mark_value = 0;
    this.extra_data = {};
    this.touch_start = 0;
    this.animate_initial_value = false;
    this.slider_pos = 0; // 0-1
    this.slider_pos_touch_start = 0; // PX
    this.locked = false;
    this.value = null;
    this.manual_value = true;
    this.track_width = false;

    this.setup_styles = function () {
        this.html.append(this.slider);
        this.slider.append(this.bar);
        this.bar.append(this.bar_fill);
        this.slider.append(this.thumb);
        this.thumb.append(this.thumb_outer);
        this.thumb_outer.append(this.thumb_inner);

        this.html.css({
            "display": "flex",
            "height": Dash.Size.RowHeight
        });

        this.label.css({
            "position": "absolute",
            "top": 0,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "font-size": "90%",
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5
        });

        this.value_label.css({
            "position": "absolute",
            "bottom": 0,
            "right": 0,
            "text-align": "center",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "font-size": "90%"
        });

        this.slider.css({
            "position": "absolute",
            "bottom": 0,
        });

        this.bar.css({
            "background": "rgba(0,0,0,0.2)",
            "position": "absolute"
        });

        this.bar_fill.css({
            "position": "absolute"
        });

        this.thumb.css({
            "position": "absolute",
            "left": 0
        });

        this.thumb_inner.css({
            "position": "absolute"
        });

        this.mark.css({
            "position": "absolute"
        });

        this.setup_connections();

        (function (self) {
            requestAnimationFrame(function () {
                self.SetValue(self.initial_value);
            });
        })(this);
    };

    this.StyleForPropertyBox = function (extra_slider_left_padding=0) {
        this.label.css({
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "width": "",
            "white-space": "",
            "overflow": "",
            "text-overflow": "",
            "text-align": "",
            "background": "none",
            "box-shadow": ""
        });

        this.label_width = this.label.width();

        this.html.css({
            "margin-bottom": Dash.Size.Padding * 0.5,
            "width": this.width + (this.label_width * 1.5)
        });

        var slider_left = this.label_width + extra_slider_left_padding + Dash.Size.Padding;

        this.slider.css({
            "left": slider_left
        });

        this.value_label.css({
            "width": Dash.Size.ColumnWidth * 0.25,
            "background": "none",
            "box-shadow": "",
            "border": "1px solid " + this.color.StrokeLight,
            "height": this.height - 2,
            "left": slider_left + this.slider_width + Dash.Size.Padding
        });
    };

    this.setup_sizing = function () {
        this.track_width = true;
        this.height = Dash.Size.RowHeight;
        this.label_width = Dash.Size.ColumnWidth * 0.75;
        this.width = (Dash.Size.ColumnWidth * 2);
        this.slider_width = this.width;
        this.slider_height = this.height;

        this.html.append(this.label);

        this.label.text(this.label_text);

        this.slider_width = this.width - this.slider_height;

        this.html.append(this.value_label);

        this.slider_max_px = this.slider_width - (this.slider_height); // PX
        this.thumb_size = this.slider_height - (this.outline_size * 2);
        this.thumb_outer_size = this.thumb_size - (this.border_size * 2);
        this.thumb_inner_size = this.thumb_outer_size - (this.border_size * 2);
        this.bar_width = this.slider_width;
        this.bar_height = this.slider_height * 0.5;
        this.bar_fill_height = (this.bar_height * 0.4) - (this.outline_size * 2);
        this.bar_fill_width = (this.bar_width - (this.thumb_size * 0.5)) - (this.outline_size * 2);
        this.mark_height = this.slider_height * 0.9;
        this.mark_width = this.mark_height * 0.08;
        this.initial_value_px = Dash.Math.Lerp(0, this.slider_width, this.initial_value);

        this.set_thumb(this.initial_value_px, this.animate_initial_value);

        this.initial_mark_value_px = Dash.Math.Lerp(0, this.slider_width, this.initial_mark_value);

        this.set_mark(this.initial_mark_value_px, this.animate_initial_value);

        this.setup_complete = true;

        if (this.track_width && !this.monitoring_width) {
            this.monitoring_width = true;
            this.last_width = -1;
        }
    };

    this.draw = function (interactive_update) {
        if (interactive_update) {
            this.width = null;
            this.height = null;
        }

        this.setup_sizing();

        this.html.css({
            "height": this.height,
            "width": this.width + (this.label_width * 1.5),
        });

        this.label.css({
            "width": this.label_width - Dash.Size.Padding,
            "height": this.height,
            "line-height": this.height + "px",
            "color": this.color.Text,
            "text-align": "center",
            "border-radius": 3,
            "background": "rgba(255, 255, 255, 0.9)",
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)"
        });

        this.value_label.css({
            "width": (this.label_width * 0.5) - Dash.Size.Padding,
            "height": this.height,
            "line-height": this.height + "px",
            "color": this.color.Text,
            "text-align": "center",
            "border-radius": 3,
            "background": "rgba(255, 255, 255, 0.9)",
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)",
            "right": 0,
            "left": "auto"
        });

        this.slider.css({
            "width": this.slider_width,
            "height": this.slider_height,
            "left": this.label_width + Dash.Size.Padding
        });

        this.bar.css({
            "height": this.bar_height,
            "width": this.bar_width,
            "top": (this.slider_height * 0.5) - (this.bar_height * 0.5),
            "border-radius": this.bar_height
        });

        this.bar_fill.css({
            "background": "rgba(255,255,255,1)",
            "width": this.bar_fill_width,
            "height": this.bar_fill_height,
            "position": "absolute",
            "top": (this.bar_height * 0.5) - (this.bar_fill_height * 0.5) - this.outline_size,
            "left": (this.bar_width * 0.5) - (this.bar_fill_width * 0.5) - this.outline_size,
            "border-radius": this.bar_fill_height,
            "border": this.outline_size + "px solid rgba(0, 0, 0, 0.5)"
        });

        this.thumb.css({
            "width": this.thumb_size,
            "height": this.thumb_size,
            "border-radius": this.thumb_size,
            "border": this.outline_size + "px solid rgba(0, 0, 0, 0.5)"

        });

        this.thumb_outer.css({
            "width": this.thumb_outer_size,
            "height": this.thumb_outer_size,
            "border-radius": this.thumb_outer_size,
            "border": this.border_size + "px solid rgba(255, 255, 255, 1)"

        });

        this.thumb_inner.css({
            "background": "rgba(255,255,255,1)",
            "width": this.bar_height,
            "height": this.bar_height,
            "top": (this.thumb_outer_size - this.bar_height) * 0.5,
            "left": (this.thumb_outer_size - this.bar_height) * 0.5,
            "border-radius": this.bar_height
        });

        this.mark.css({
            "height": this.mark_height,
            "width": this.mark_width,
            "background": "rgba(255,255,255,0.8)",
            "top": (this.container_height * 0.5) - (this.mark_height * 0.5)  // TODO: this.container_height is undefined...
        });
    };

    this.SetSize = function (width, height) {
        this.width = width;
        this.height = height;

        this.setup_sizing();
    };

    this.SetLabel = function (label) {
        this.label_text = label;
    };

    // When true, sliders can't be MANUALLY moved
    this.SetLock = function (locked) {
        this.locked = locked;

        if (this.locked) {
            this.slider.stop().animate({"opacity": 0.6});
        }

        else {
            this.slider.stop().animate({"opacity": 1});
        }
    };

    // The value is manually set, externally
    this.SetValue = function (value) {
        var valPx = Dash.Math.Lerp(0, this.slider_width, value);

        this.value = value;
        this.manual_value = true;

        this.set_thumb(valPx, false);
        this.update_value_label();
    };

    this.update_value_label = function () {
        var display = "" + Dash.Math.Lerp(this.start_range, this.end_range, this.value);

        if (display.length > 4) {
            display = display.slice(0, 4);
        }

        this.value_label.text(display);
    };

    this.GetValue = function () {
        return Dash.Math.Lerp(this.start_range, this.end_range, this.value);
    };

    this.SetExtraData = function (data) {
        this.extra_data = data;
    };

    this.OnChange = function (on_change_callback) {
        this.on_change_callback = on_change_callback;
    };

    this.SetAnimate = function (animate) {
        this.animate_initial_value = animate;
    };

    this.SetValueLabelVisibility = function (visible) {
        this.value_label_visible = visible;
    };

    this.on_mouse_up = function (event) {
        if (!this.is_active) {
            return;
        }

        this.is_active = false;
    };

    this.get_touch_w_offset = function (event) {
        return event.pageX - $(this.slider).parent().offset().left - (this.label_width + Dash.Size.Padding);
    };

    this.on_mouse_down = function (event) {
        if (this.is_active) {
            return;
        }

        this.touch_start = this.get_touch_w_offset(event);
        this.slider_pos_touch_start = this.set_thumb(this.touch_start);
        this.is_active = true;
    };

    this.on_mouse_move = function (event) {
        if (!this.is_active) {
            return;
        }

        var now_pos = this.get_touch_w_offset(event) + (this.height * 0.5);

        this.slider_pos = this.set_thumb(this.slider_pos_touch_start + (now_pos - this.touch_start));

        this.update_value_label();

        this.callback(this.GetValue());
    };

    // Safely set the position of the slider. Returns a clamped value if provided value extends slider bounds
    this.set_thumb = function (xPosPx, animate) {
        animate = false;
        xPosPx = xPosPx-(this.slider_height * 0.5);

        if (xPosPx < 0) {
            xPosPx = 0;
        }

        if (xPosPx > this.slider_max_px) {
            xPosPx = this.slider_max_px;
        }

        if (animate) {
            this.thumb.stop().animate({"left": xPosPx}, 500);
            this.bar_fill.stop().animate({"width": xPosPx + (this.thumb_size * 0.5)}, 500);
        }

        else {
            this.thumb.css({"left": xPosPx});
            this.bar_fill.css({"width": xPosPx + (this.thumb_size * 0.5)});
        }

        if (this.setup_complete) {
            var value = Dash.Math.InverseLerp(0, this.slider_max_px, xPosPx);

            if (this.manual_value) {
                value = this.value;
            }

            if (!animate) {
                this.value = value;
            }

            if (this.on_change_callback) {
                this.on_change_callback(value, this.slider, this.extra_data, animate);
            }
        }

        return xPosPx;
    };

    this.set_mark = function (xPosPx, animate) {
        xPosPx = xPosPx - (this.slider_height * 0.5);
        if (xPosPx < 0) {
            xPosPx = 0;
        }

        if (xPosPx > this.slider_max_px) {
            xPosPx = this.slider_max_px;
        }

        animate = false;  // Why?

        if (animate) {
            this.mark.stop().animate({"left": xPosPx + (this.thumb_size * 0.5)}, 500);
        }

        else {
            this.mark.css({"left": xPosPx + (this.thumb_size * 0.5)});

        }
    };

    this.setup_connections = function () {
        (function (self) {
            self.slider.on("mousedown", function ( event ) {
                if (self.locked) {
                    return;
                }

                self.manual_value = false;

                self.on_mouse_down(event);

                self.thumb.stop();
                self.bar_fill.stop();

                event.preventDefault();
            });

            $(document).on("mousemove", self.slider, function (event) {
                self.on_mouse_move(event);

                event.preventDefault();
            });

            $(document).on("mouseup", self.slider, function (event) {
                self.on_mouse_up(event);
            });

            requestAnimationFrame(function () {
                self.draw();
            });
        })(this);
    };

    this.setup_styles();
}
