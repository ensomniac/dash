function DashGuiContext2DPrimitive (canvas, data, index) {
    this.canvas = canvas;
    this.data = data;
    this.index = index;

    this.top_px = 0;
    this.left_px = 0;
    this.px_min = 20;
    this.width_px = 0;
    this.height_px = 0;
    this.selected = false;
    this.z_index_base = 10;  // Somewhat arbitrary
    this.drag_active = false;
    this.drag_context = null;
    this.last_width_norm = null;
    this.html = $("<div></div>");
    this.color = this.canvas.color;
    this.editor = this.canvas.editor;
    this.draw_properties_pending = false;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        if (!this.call_style()) {
            return;
        }

        this.set_width_px();
        this.set_height_px();

        // After the above two are set
        this.set_top_px();
        this.set_left_px();

        this.html.css({
            "position": "absolute",
            "top": this.top_px,
            "left": this.left_px,
            "width": this.width_px,
            "height": this.height_px,
            "z-index": this.get_z_index(),
            "opacity": "opacity" in this.data ? this.data["opacity"] : 1,
            "background": Dash.Color.Random()  // TODO: TESTING
        });

        if (this.data["hidden"]) {
            this.html.hide();
        }

        this.setup_connections();
    };

    this.SetIndex = function (index) {
        this.index = index;

        this.html.css({
            "z-index": this.get_z_index
        });
    };

    this.SetProperty = function (key, value) {
        if (this.data[key] === value) {
            return;
        }

        this.data[key] = value;

        if (key === "opacity") {
            this.html.css({
                "opacity": value
            });
        }

        else if (key === "hidden") {
            if (value) {
                this.html.hide();
            }

            else {
                this.html.show();
            }
        }
    };

    this.IsSelected = function () {
        return this.selected;
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        this.html.css({
            "border": "none",
            "outline": "none"
        });

        if (this.data["type"] === "text") {
            this.text_area.Lock(false);
        }

        this.selected = false;
    };

    this.Select = function (from_click=false) {
        if (this.selected || this.data["locked"]) {
            return;
        }

        this.canvas.DeselectAllPrimitives();

        this.html.css({
            // Simulate a double border - one for dark backgrounds, one for light
            "border": "1px solid " + this.color.StrokeLight,
            "outline": "1px solid " + this.opposite_color.StrokeDark,
            "outline-offset": "1px"
        });

        if (from_click) {
            this.canvas.OnPrimitiveSelected(this);
        }

        if (this.data["type"] === "text") {
            this.text_area.Unlock(false);
        }

        this.selected = true;
    };

    this.OnCanvasResize = function () {
        this.set_scale(null, null, false);
        this.set_position();
    };

    this.OnDragStart = function (event) {
        if (this.drag_active || this.data["locked"]) {
            return;
        }

        this.drag_active = true;

        this.Select(true);

        var active_tool = this.canvas.GetActiveTool();

        this.drag_context = {
            "scale": active_tool === "scale",
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

    this.OnDrag = function (event) {
        if (!this.drag_active || this.data["locked"]) {
            return;
        }

        var movement_x = event.clientX - this.drag_context["start_mouse_x"];
        var movement_y = event.clientY - this.drag_context["start_mouse_y"];

        // Rotate left / right
        if (this.drag_context["rotate"]) {
            this.data["rot_deg"] = this.drag_context["start_rot"] + (movement_x + movement_y);

            this.draw_properties();
        }

        // Scale bigger / smaller
        else if (this.drag_context["scale"]) {
            this.last_width_norm = this.data["width_norm"];

            this.data["width_norm"] += ((movement_x - movement_y) * 0.0001);

            this.set_scale();
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

    this.OnDragStop = function () {
        if (!this.drag_active || this.data["locked"]) {
            return;
        }

        this.drag_active = false;
    };

    this.get_z_index = function () {
        return this.z_index_base + this.index;
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("click", function (e) {
                self.Select(true);

                e.stopPropagation();
            });
        })(this);
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

    this.set_position = function (left=null, top=null, draw=true) {
        this.set_top_px(top);
        this.set_left_px(left);

        if (draw) {
            this.draw_properties();
        }

        // TODO?
        // if (this.manage_text) {
        //     this.draw_text();
        // }
    };

    this.set_top_px = function (override=null) {
        this.top_px = override || ((this.canvas.GetHeight() * this.data["anchor_norm_y"]) - (this.height_px * 0.5));
    };

    this.set_left_px = function (override=null) {
        this.left_px = override || ((this.canvas.GetWidth() * this.data["anchor_norm_x"]) - (this.width_px * 0.5));
    };

    this.set_width_px = function (override=null) {
        this.width_px = override || (this.canvas.GetWidth() * this.data["width_norm"]);

        // Ensure it doesn't get so small that it can't be edited
        if (this.width_px < this.px_min) {
            this.width_px = this.px_min;

            if (this.last_width_norm) {
                this.data["width_norm"] = this.last_width_norm;
            }
        }
    };

    this.set_height_px = function (override=null) {
        this.height_px = override || (this.width_px / this.canvas.editor.GetAspectRatio(true));

        // Ensure it doesn't get so small that it can't be edited
        if (this.height_px < this.px_min) {
            this.height_px = this.px_min;
        }
    };

    this.set_scale = function (width=null, height=null, draw=true) {
        this.set_width_px(width);
        this.set_height_px(height);

        if (draw) {
            this.draw_properties();
        }

        // TODO?
        // if (this.manage_text) {
        //     this.draw_text();
        // }
    };

    this.call_style = function () {
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

        this.html.css({
            "width": this.width_px,
            "height": this.height_px,
            "left": this.left_px,
            "top": this.top_px,
            "opacity": this.data["opacity"],
            "transform": "rotate(" + this.data["rot_deg"] + "deg)"
        });
    };

    this.setup_styles();
}
