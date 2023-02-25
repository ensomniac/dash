function DashGuiContext2DPrimitive (canvas, layer) {
    this.canvas = canvas;
    this.layer = layer;

    this.top_px = 0;
    this.left_px = 0;
    this.width_px = 0;
    this.height_px = 0;
    this.aspect = null;
    this.selected = false;
    this.z_index_base = 10;  // Somewhat arbitrary
    this.width_px_min = 20;
    this.drag_state = null;
    this.height_px_min = 20;
    this.drag_active = false;
    this.drag_context = null;
    this.last_width_norm = null;
    this.html = $("<div></div>");
    this.color = this.canvas.color;
    this.data = this.layer.GetData();
    this.editor = this.canvas.editor;
    this.starting_width_override = null;
    this.starting_height_override = null;
    this.draw_properties_pending = false;
    this.file_data = this.data["file"] || {};
    this.width_px_max = this.canvas.GetWidth() * 2;
    this.height_px_max = this.canvas.GetHeight() * 2;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    console.debug("TEST primitive data", this.data);

    // TODO: scaling should happen from the center point, rather than the top left
    //  corner, and/or should also consider the mouse position and scale from there

    this.setup_styles = function () {
        if (this.file_data["aspect"]) {
            this.aspect = this.file_data["aspect"];
        }

        if (!this.call_style()) {
            return;
        }

        if (this.starting_width_override) {
            this.data["width_norm"] = this.starting_width_override / this.canvas.GetWidth();

            if (this.starting_height_override) {
                this.aspect = this.starting_width_override / this.starting_height_override;
            }
        }

        this.set_width_px(this.starting_width_override);
        this.set_height_px(this.starting_height_override);

        // After the above two are set
        this.set_top_px();
        this.set_left_px();

        this.html.css({
            // "background": Dash.Color.Random(),  // TESTING
            "position": "absolute",
            "top": this.top_px,
            "left": this.left_px,
            "width": this.width_px,
            "height": this.height_px,
            "z-index": this.get_z_index(),
            "opacity": this.data["opacity"]
        });

        this.setup_connections();

        if (this.data["hidden"]) {
            this.html.hide();
        }
    };

    this.InputInFocus = function () {
        if (this.data["type"] !== "text") {
            return false;
        }

        return this.text_area.InFocus();
    };

    this.UpdateZIndex = function () {
        this.html.css({
            "z-index": this.get_z_index()
        });
    };

    this.Update = function (key, value) {
        if (this.data[key] === value || key === "display_name") {
            return;
        }

        this.data[key] = value;

        if (key === "opacity") {
            this.on_opacity_change(value);
        }

        else if (key === "hidden") {
            if (value) {
                this.html.hide();
            }

            else {
                this.html.show();
            }
        }

        this.on_set_property(key);
    };

    this.IsSelected = function () {
        return this.selected;
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        this.html.css({
            // Retain the physical space of the border, just make it invisible
            // (this prevents the box from appearing to "jitter" when the border is toggled)
            "border": "1px solid rgba(0, 0, 0, 0)",
            "outline": "1px solid rgba(0, 0, 0, 0)"
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
            this.text_area.Focus();
        }

        this.selected = true;
    };

    this.OnCanvasResize = function () {
        this.set_scale(null, null, false);
        this.set_position();

        this.width_px_max = this.canvas.GetWidth() * 2;
        this.height_px_max = this.canvas.GetHeight() * 2;
    };

    this.OnDragStart = function (event) {
        if (this.drag_active || this.data["locked"]) {
            return;
        }
        console.debug("TEST drag start");

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

        this.drag_state = {
            "anchor_norm_x": this.data["anchor_norm_x"],
            "anchor_norm_y": this.data["anchor_norm_y"],
            "rot_deg": this.data["rot_deg"],
            "width_norm": this.data["width_norm"]
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

        console.debug("TEST drag stop");

        this.save_drag_state();
    };

    this.save_drag_state = function () {

        this.drag_state = {
            "anchor_norm_x": this.data["anchor_norm_x"],
            "anchor_norm_y": this.data["anchor_norm_y"],
            "rot_deg": this.data["rot_deg"],
            "width_norm": this.data["width_norm"]
        };

        console.debug("TEST save pos data");

        Dash.Request(
            this,
            function (response) {
                Dash.Validate.Response(response);
            },
            this.editor.api,
            {
                "f": "set_layer_properties",
                "obj_id": this.editor.obj_id,
                "layer_id": this.data["id"],
                "properties": JSON.stringify(this.drag_state)
            }
        );
    };

    // Meant to be overridden by member classes
    this.on_set_property = function () {
        console.warn("'on_set_property' function override is not defined in member class for type:", this.data["type"]);
    };

    // Meant to be overridden by member classes
    this.on_opacity_change = function (value) {
        console.warn("'on_opacity_change' function override is not defined in member class for type:", this.data["type"]);

        this.html.css({
            "opacity": value
        });
    };

    this.get_z_index = function () {
        return this.z_index_base + this.layer.GetIndex();
    };

    this.data_is_default = function () {
        return (
               this.data["anchor_norm_x"] === 0.5
            && this.data["anchor_norm_y"] === 0.5
            && this.data["width_norm"]    === 0.5
            && this.data["rot_deg"]       === 0
        );
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("click", function (e) {
                self.Select(true);

                e.stopPropagation();
            });

            // Without this, if you try to move/rotate/scale/etc this
            // container while it's not already selected, it won't work
            self.html.on("mousedown", function () {
                self.Select(true);
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

        if (this.data["type"] === "text") {
            this.resize_text();
        }
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
        if (this.width_px < this.width_px_min) {
            this.width_px = this.width_px_min;

            if (this.last_width_norm) {
                this.data["width_norm"] = this.last_width_norm;
            }
        }

        // Or unreasonably large
        if (this.width_px > this.width_px_max) {
            this.width_px = this.width_px_max;

            if (this.last_width_norm) {
                this.data["width_norm"] = this.last_width_norm;
            }
        }
    };

    this.set_height_px = function (override=null) {
        this.height_px = override || (this.width_px / (this.aspect || this.editor.GetAspectRatio(true)));

        // Ensure it doesn't get so small that it can't be edited
        if (this.height_px < this.height_px_min) {
            this.height_px = this.height_px_min;
        }

        // Or unreasonably large
        if (this.height_px > this.height_px_max) {
            this.height_px = this.height_px_max;
        }
    };

    this.set_scale = function (width=null, height=null, draw=true) {
        this.set_width_px(width);
        this.set_height_px(height);

        if (draw) {
            this.draw_properties();
        }

        if (this.data["type"] === "text") {
            this.resize_text();
        }
    };

    // Each type should have its own file which is called as a member of this file
    this.call_style = function () {
        if (this.data["type"] === "text") {
            DashGuiContext2DPrimitiveText.call(this);
        }

        else {
            if (!Dash.Validate.Object(this.file_data)) {
                console.error("Error: Missing file data (required for file-based primitives like images, etc):", this.file_data);

                return false;
            }

            if (this.data["type"] === "image") {
                DashGuiContext2DPrimitiveImage.call(this);
            }

            else {
                console.error("Error: Unhandled primitive type:", this.data["type"]);

                return false;
            }
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
