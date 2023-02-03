function DashGuiContext2DPrimitive (canvas, data) {
    this.canvas = canvas;
    this.data = data;

    this.width_px = 0;
    this.height_px = 0;
    this.top_px = null;
    this.left_px = null;
    this.drag_active = false;
    this.drag_context = null;
    this.html = $("<div></div>");
    this.color = this.canvas.color;
    this.editor = this.canvas.editor;
    this.draw_properties_pending = false;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        if (!this.call_style()) {
            return;
        }

        // TODO: position the element in the canvas based on this.data (norms)

        this.html.css({
            // TODO: TESTING
            "background": "pink",
            "width": 500,
            "height": 500
        });

        this.setup_connections();
    };

    this.Deselect = function () {
        this.html.css({
            "border": "none",
            "outline": "none"
        });
    };

    this.select = function () {
        this.html.css({
            // Simulate a double border - one for dark backgrounds, one for light
            "border": "1px solid " + this.color.StrokeDark,
            "outline": "1px solid " + this.opposite_color.StrokeDark,
            "outline-offset": "1px"
        });
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mousedown", function (e) {
                self.on_drag_start(e);
            });

            self.html.on("mousemove", function (e) {
                self.on_drag(e);

                e.preventDefault();

                return false;
            });

            self.html.on("mouseup", function (e) {
                self.on_drag_stop(e);
            });
        })(this);
    };

    this.on_drag_start = function (event) {
        if (this.drag_active) {
            return;  // TODO: do we need to also check if other primitives' drags are active?
        }

        this.drag_active = true;

        // TODO: deselect all other primitives

        this.select();

        var active_tool = this.canvas.GetActiveTool();

        this.drag_context = {
            "scale": active_tool === "scale",  // TODO: implement this like how rotate is implemented, since we're not using the scroll wheel
            "rotate": active_tool === "rotate",
            "start_rot": this.data["rot_deg"],
            "start_mouse_offset_x": event.offsetX,
            "start_mouse_offset_y": event.offsetY,
            "start_img_px_x": this.left_px,
            "start_img_px_y": this.top_px,
            "start_mouse_x": event.clientX,
            "start_mouse_y": event.clientY,
            "drag_start": new Date()
        };
    };

    this.on_drag = function (event) {
        if (!this.drag_active) {
            return;
        }

        var movement_x = event.clientX - this.drag_context["start_mouse_x"];
        var movement_y = event.clientY - this.drag_context["start_mouse_y"];

        // Rotate left / right
        if (this.drag_context["rotate"]) {
            this.data["rot_deg"] = this.drag_context["start_rot"] + movement_x;

            this.draw_properties();
        }

        else {
            this.set_position(
                this.drag_context["start_img_px_x"] + movement_x,
                this.drag_context["start_img_px_y"] + movement_y
            );

            [this.data["anchor_norm_x"], this.data["anchor_norm_y"]] = this.get_offset_norm();
        }

        event.preventDefault();

        return true;
    };

    this.on_drag_stop = function () {
        if (!this.drag_active) {
            return;
        }

        this.drag_active = false;

        // TODO
        // var px_moved = Math.abs(this.drag_context["start_img_px_x"] - this.left_px) + Math.abs(this.drag_context["start_img_px_y"] - this.top_px);
        // var sec_since = (new Date() - this.drag_context["drag_start"]) / 1000;
    };

    this.get_offset_norm = function () {
        if (this.left_px == null) {  // This card isn't visible or hasn't been edited
            return [
                this.data["anchor_norm_x"],
                this.data["anchor_norm_y"]
            ];
        }

        return [
            Dash.Math.InverseLerp(
                -this.width_px * 0.5,
                this.canvas.GetWidth() - (this.width_px * 0.5),
                this.left_px
            ),
            Dash.Math.InverseLerp(
                -this.height_px * 0.5,
                this.canvas.GetHeight() - (this.height_px * 0.5),
                this.top_px
            )
        ];
    };

    this.set_position = function (left, top) {
        this.top_px = top;
        this.left_px = left;

        this.draw_properties();

        // TODO?
        // if (this.manage_text) {
        //     this.draw_text();
        // }
    };

    this.call_style = function () {
        // TODO: are these abstractions even necessary? likely not
        if (this.data["type"] === "text") {
            DashGuiContext2DPrimitiveText.call(this);
        }

        else if (this.data["type"] === "image") {
            DashGuiContext2DPrimitiveImage.call(this);
        }

        else {
            console.error("Error: Unhandled primitive type:", this.data["type"]);

            return false;
        }

        return true;
    };

    this.draw_properties = function (immediate=false) {
        if (immediate) {
            this._draw_properties();

            return;
        }

        if (this.draw_properties_pending) {
            return;
        }

        (function (self) {
            requestAnimationFrame(function () {
                self._draw_properties();
            });
        })(this);

        this.draw_properties_pending = true;
    };

    // Late draw so that multiple functions can call this.draw_properties while only actually drawing once
    this._draw_properties = function () {
        this.draw_properties_pending = false;

        // TODO?
        // var pointer_events = "none";
        //
        // if (this.pointer_events_active) {
        //     pointer_events = "auto";
        // }
        //
        // var box_shadow = "inset 0px 0px 1px 1px rgba(255, 255, 255, 0.0)";
        //
        // if (this.box_highlight_active) {
        //     box_shadow = "inset 0px 0px 1px 1px rgba(255, 255, 255, 0.5)";
        // }

        this.html.css({
            "width": this.width_px,
            "height": this.height_px,
            "left": this.left_px,
            "top": this.top_px,
            "transform": "rotate(" + this.data["rot_deg"] + "deg)",
            // "pointer-events": pointer_events,
            // "box-shadow": box_shadow
        });
    };

    this.setup_styles();
}
