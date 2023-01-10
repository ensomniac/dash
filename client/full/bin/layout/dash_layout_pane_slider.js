function DashLayoutPaneSlider (binder, is_vertical=false, default_size=null, identifier="", inverted=false) {
    this.binder = binder;
    this.is_vertical = is_vertical;
    this.default_size = default_size || Dash.Size.ColumnWidth;
    this.identifier = identifier;
    this.inverted = inverted;

    this.drag_properties = {};
    this.html = $("<div></div>");
    this.divider = $("<div></div>");
    this.content_a = $("<div></div>");
    this.content_b = $("<div></div>");
    this.divider_hover = $("<div></div>");
    this.locked_size = this.default_size;
    this.divider_color = "rgba(0, 0, 0, 0.2)";
    this.divider_size = Dash.Size.Padding * 0.1;
    this.divider_color_active = "rgba(0, 0, 0, 0.6)";
    this.divider_hover_size = Dash.Size.Padding * 1.5; // A slightly larger size for dragging
    this.min_size = this.default_size || Dash.Size.ColumnWidth * 0.5;

    this.recall_id = "dash_layout_pane_slider_" + (
        // If using multiple sliders with the same binder, they'll need their own, unique identifier strings
        this.identifier || (this.binder.constructor + "").replace(/[^A-Za-z]/g, "").slice(0, 100).trim().toLowerCase()
    );

    if (this.is_vertical) {
        this.recall_id += "_v";
    }

    else {
        this.recall_id += "_h";
    }

    if (Dash.Local.Get(this.recall_id)) {
        this.locked_size = parseInt(Dash.Local.Get(this.recall_id));
    }

    this.SetPaneContentA = function (html) {
        this.content_a.empty().append(html);
    };

    this.SetPaneContentB = function (html) {
        this.content_b.empty().append(html);
    };

    this.SetMinSize = function (size) {
        this.min_size = size;
    };

    this.setup_styles = function () {
        this.html.append(this.content_a);
        this.html.append(this.content_b);
        this.html.append(this.divider);
        this.html.append(this.divider_hover);

        this.html.css({
            "position": "absolute",
            "inset": 0
        });

        if (this.is_vertical) {
            this.setup_vertical();
        }

        else {
            this.setup_horizontal();
        }

        this.draw();
    };

    this.setup_vertical = function () {
        this.content_a.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "overflow-y": "auto",
        });

        this.content_b.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "overflow-y": "auto",
        });

        this.divider.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "height": this.divider_size,
            "background": this.divider_color,
            "user-select": "none"  // Disable unintentional highlighting when dragging slider
        });

        this.divider_hover.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "height": this.divider_hover_size,
            "background": "rgba(0, 0, 0, 0)",
            "opacity": 0.5,
            "cursor": "ns-resize",
            "user-select": "none"  // Disable unintentional highlighting when dragging slider
        });
    };

    this.setup_horizontal = function () {
        this.content_a.css({
            "position": "absolute",
            "inset": 0,
            "overflow-x": "auto"
        });

        this.content_b.css({
            "position": "absolute",
            "inset": 0,
            "overflow-x": "auto"
        });

        this.divider.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": this.divider_size,
            "background": this.divider_color,
            "user-select": "none"  // Disable unintentional highlighting when dragging slider
        });

        this.divider_hover.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": this.divider_hover_size,
            "background": "rgba(0, 0, 0, 0)",
            "opacity": 0.5,
            "cursor": "ew-resize",
            "user-select": "none"  // Disable unintentional highlighting when dragging slider
        });
    };

    this.setup_connections = function () {
        (function (self) {
            self.divider_hover.on("mouseenter", function () {
                self.divider.css({
                    "background": self.divider_color_active
                });
            });

            self.divider_hover.on("mouseleave", function () {
                self.divider.css({
                    "background": self.divider_color
                });
            });

            self.html.on("mousemove", function (e) {
                if (!self.drag_active) {
                    return;
                }

                self.drag_properties["last_pos"] = self.is_vertical ? e.screenY : e.screenX;

                self.on_drag();
            });

            self.divider_hover.on("mousedown", function (e) {
                if (self.drag_active) {
                    return;
                }

                self.drag_active = true;

                self.drag_properties["start_locked_size"] = self.locked_size;
                self.drag_properties["start_pos"] = self.is_vertical ? e.screenY : e.screenX;

                self.on_draw_start();
            });

            self.html.on("mouseup", function () {
                if (!self.drag_active) {
                    return;
                }

                self.drag_active = false;

                self.on_draw_end();
            });
        })(this);
    };

    // Called when dragging starts
    this.on_draw_start = function () {

    };

    // Called when dragging ends
    this.on_draw_end = function () {
        Dash.Local.Set(this.recall_id, this.locked_size);
    };

    this.on_drag = function () {
        var size_now = this.locked_size;

        this.drag_properties["change"] = this.inverted ? this.drag_properties["last_pos"] - this.drag_properties["start_pos"] : this.drag_properties["start_pos"] - this.drag_properties["last_pos"];

        this.locked_size = this.drag_properties["start_locked_size"] + this.drag_properties["change"];

        var content_a_size = (this.is_vertical ? this.html.height() : this.html.width()) - this.locked_size;

        if (content_a_size < this.min_size) {
            this.locked_size = size_now;
        }

        if (this.locked_size < this.min_size) {
            this.locked_size = this.min_size;
        }

        this.draw();
    };

    this.draw = function () {
        if (this.is_vertical) {
            this.draw_vertical();
        }

        else {
            this.draw_horizontal();
        }
    };

    this.draw_vertical = function () {
        if (this.inverted) {
            this.content_a.css({
                "height": this.locked_size - (this.divider_size * 0.5)
            });

            this.content_b.css({
                "top": this.locked_size + (this.divider_size * 0.5)
            });

            this.divider.css({
                "top": this.locked_size - (this.divider_size * 0.5),
                "bottom": "auto"
            });

            this.divider_hover.css({
                "top": this.locked_size - (this.divider_hover_size * 0.5),
                "bottom": "auto"
            });
        }

        else {
            this.content_a.css({
                "bottom": this.locked_size + (this.divider_size * 0.5)
            });

            this.content_b.css({
                "height": this.locked_size - (this.divider_size * 0.5)
            });

            this.divider.css({
                "bottom": this.locked_size - (this.divider_size * 0.5),
                "top": "auto"
            });

            this.divider_hover.css({
                "bottom": this.locked_size - (this.divider_hover_size * 0.5),
                "top": "auto"
            });
        }
    };

    this.draw_horizontal = function () {
        if (this.inverted) {
            this.content_a.css({
                "width": this.locked_size - (this.divider_size * 0.5),
                "right": "auto"
            });

            this.content_b.css({
                "left": this.locked_size + (this.divider_size * 0.5)
            });

            this.divider.css({
                "left": this.locked_size - (this.divider_size * 0.5),
                "right": "auto"
            });

            this.divider_hover.css({
                "left": this.locked_size - (this.divider_hover_size * 0.5),
                "right": "auto"
            });
        }

        else {
            this.content_a.css({
                "right": this.locked_size + (this.divider_size * 0.5)
            });

            this.content_b.css({
                "width": this.locked_size - (this.divider_size * 0.5),
                "left": "auto"
            });

            this.divider.css({
                "right": this.locked_size - (this.divider_size * 0.5),
                "left": "auto"
            });

            this.divider_hover.css({
                "right": this.locked_size - (this.divider_hover_size * 0.5),
                "left": "auto"
            });
        }
    };

    this.setup_styles();
    this.setup_connections();
}
