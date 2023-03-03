function DashGuiContext2DPrimitive (canvas, layer) {
    this.canvas = canvas;
    this.layer = layer;

    this.top_px = 0;
    this.left_px = 0;
    this.width_px = 0;
    this.height_px = 0;
    this.selected = false;
    this.width_px_min = 20;
    this.drag_state = null;
    this.height_px_min = 20;
    this.drag_active = false;
    this.drag_context = null;
    this.z_index_mult = 1000;
    this.z_index_base = 1010;
    this.last_width_norm = null;
    this.id = this.layer.GetID();
    this.html = $("<div></div>");
    this.color = this.canvas.color;
    this.data = this.layer.GetData();
    this.editor = this.canvas.editor;
    this.draw_properties_pending = false;
    this.file_data = this.data["file"] || {};
    this.parent_id = this.layer.GetParentID();
    this.parent_data = this.layer.GetParentData();
    this.width_px_max = this.canvas.GetWidth() * 2;
    this.height_px_max = this.canvas.GetHeight() * 2;
    this.opposite_color = this.editor.opposite_color;

    // TODO: scaling should happen from the center point, rather than the top left
    //  corner, and/or should also consider the mouse position and scale from there

    this.setup_styles = function () {
        if (!this.call_style()) {
            return;
        }

        this.set_width_px();
        this.set_height_px();

        // After the above two are set
        this.set_top_px();
        this.set_left_px();

        var css = {
            "position": "absolute",
            "z-index": this.get_z_index(),

            // Retain the physical space of the border, just make it invisible
            // (this prevents the box from appearing to "jitter" when the border is toggled)
            "border": "1px solid rgba(0, 0, 0, 0)",
            "outline": "1px solid rgba(0, 0, 0, 0)"
        };

        if (this.data["type"] === "context") {
            css["pointer-events"] = "none";
        }

        this.html.css(css);

        this.draw_properties(true);
        this.on_opacity_change(this.data["opacity"]);

        if (this.data["hidden"]) {
            this.on_hidden_change(this.data["hidden"]);
        }

        if (this.data["locked"]) {
            this.on_locked_change(this.data["locked"]);
        }

        this.setup_connections();
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

        else if (key === "locked") {
            this.on_locked_change(value);
        }

        else if (key === "hidden") {
            this.on_hidden_change(value);
        }

        if (!value && (key === "locked" || key === "hidden")) {
            this.Select();
        }

        this.on_update(key);
    };

    this.IsSelected = function () {
        return this.selected;
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        var css = {
            // Retain the physical space of the border, just make it invisible
            // (this prevents the box from appearing to "jitter" when the border is toggled)
            "border": "1px solid rgba(0, 0, 0, 0)",
            "outline": "1px solid rgba(0, 0, 0, 0)"
        };

        if (this.data["type"] === "context") {
            css["pointer-events"] = "none";
        }

        this.html.css(css);

        if (this.data["type"] === "text") {
            this.lock_text_area();
        }

        this.selected = false;
    };

    this.Select = function (from_click=false) {
        if (this.selected || this.data["locked"]) {
            return;
        }

        if (from_click && this.data["type"] === "context") {
            return;
        }

        if (from_click && this.parent_id && this.canvas.primitives[this.parent_id].IsSelected()) {
            return;
        }

        this.canvas.DeselectAllPrimitives();

        var css = {
            // Simulate a double border - one for dark backgrounds, one for light
            "border": "1px solid " + this.color.StrokeLight,
            "outline": "1px solid " + this.opposite_color.StrokeDark,
            "outline-offset": "1px"
        };

        if (this.data["type"] === "context") {
            css["pointer-events"] = "none";
        }

        this.html.css(css);

        if (from_click) {
            this.canvas.OnPrimitiveSelected(this);
        }

        if (this.data["type"] === "text") {
            this.unlock_text_area();

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

        this.set_drag_state();
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
            [this.data["anchor_norm_x"], this.data["anchor_norm_y"]] = this.get_offset_norm();

            this.last_width_norm = this.get_drag_state_value("width_norm");

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

        this.save_drag_state();
    };

    this.set_drag_state = function () {
        this.drag_state = {
            "anchor_norm_x": this.data["anchor_norm_x"],
            "anchor_norm_y": this.data["anchor_norm_y"],
            "rot_deg": this.data["rot_deg"],
            "width_norm": this.data["width_norm"]
        };
    };

    this.save_drag_state = function () {
        var modified = false;

        for (var key in this.drag_state) {
            if (this.drag_state[key] === this.data[key]) {
                continue;
            }

            modified = true;

            break;
        }

        if (!modified) {
            return;
        }

        this.set_drag_state();

        var params = {
            "f": "set_layer_properties",
            "obj_id": this.editor.obj_id,
            "layer_id": this.parent_id || this.id,
            "properties": JSON.stringify(
                this.parent_id || this.data["type"] === "context" ? (
                    this.drag_context["rotate"] ? {
                        "rot_deg": this.data["rot_deg"]
                    }
                    : this.drag_context["scale"] ? {
                        "width_norm": this.data["width_norm"],
                        "anchor_norm_x": this.data["anchor_norm_x"],
                        "anchor_norm_y": this.data["anchor_norm_y"]
                    }
                    : {
                        "anchor_norm_x": this.data["anchor_norm_x"],
                        "anchor_norm_y": this.data["anchor_norm_y"]
                    }
                ) : this.drag_state
            )
        };

        if (this.parent_id) {
            params["imported_context_layer_id"] = this.id;
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.editor.data = response;

                    if (self.data["type"] === "context" || self.parent_id) {  // TODO: parent_id condition is just for TESTING (maybe keep?)
                        self.canvas.RemoveAllPrimitives();  // TODO: is there a lighter way to achieve the same thing? maybe via Update()?

                        self.editor.RedrawLayers(true);
                    }
                },
                self.editor.api,
                params
            );
        })(this);
    };

    this.get_drag_state_value = function (key, data=null, parent_data=null) {
        data = data || this.data;
        parent_data = parent_data || this.parent_data;

        var value = data[key];

        if (!Dash.Validate.Object(parent_data)) {
            return value;
        }

        var override = (parent_data["imported_context"]["layer_overrides"][this.id] || {})[key] || 0;

        if (!override) {
            return value;
        }

        return value + override;
    };

    this.on_hidden_change = function (hidden) {
        if (hidden) {
            this.html.hide();
        }

        else {
            this.html.show();
        }
    };

    // Meant to be overridden by member classes
    this.on_update = function () {
        if (this.data["type"] !== "context") {
            console.warn("'on_update' function override is not defined in member class for type:", this.data["type"]);
        }
    };

    // Meant to be overridden by member classes
    this.on_locked_change = function () {
        if (this.data["type"] !== "context" && this.data["type"] !== "image") {
            console.warn("'on_locked_change' function override is not defined in member class for type:", this.data["type"]);
        }
    };

    // Meant to be overridden by member classes
    this.on_opacity_change = function (value) {
        if (this.data["type"] !== "context") {
            console.warn("'on_opacity_change' function override is not defined in member class for type:", this.data["type"]);
        }

        this.html.css({
            "opacity": value
        });
    };

    this.get_z_index = function () {
        var index = this.layer.GetIndex();

        if (!this.parent_id) {
            // Multiply the index by this.z_index_mult so that there's plenty of
            // room for recursive nested context layers to have recursive sub-indexes
            return this.z_index_base + (index * this.z_index_mult);
        }

        var parent_z_index = this.z_index_base + (this.layer.GetParentIndex() * this.z_index_mult);

        // When contexts are imported, bringing in nested layers, and potentially more
        // nested contexts, those indexes need to fall within the range of the parent's
        // index (ex: 9000), and the index of the layer before the parent (ex: 8000).
        return ((parent_z_index - this.z_index_mult) + (index + 1));
    };

    this.get_offset_norm = function () {
        if (this.left_px == null) {  // This isn't visible or hasn't been edited
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
        this.top_px = override || ((this.canvas.GetHeight() * this.get_drag_state_value("anchor_norm_y")) - (this.height_px * 0.5));
    };

    this.set_left_px = function (override=null) {
        this.left_px = override || ((this.canvas.GetWidth() * this.get_drag_state_value("anchor_norm_x")) - (this.width_px * 0.5));
    };

    this.set_width_px = function (override=null) {
        this.width_px = override || (this.canvas.GetWidth() * this.get_drag_state_value("width_norm"));

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
        this.height_px = override || (this.width_px / (this.data["aspect"] || this.editor.GetAspectRatio(true)));

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
        if (this.data["type"] === "context") {
            // this.calculate_context_bounding_box_size();

            return true;
        }

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

    // Not sure if this should happen in ToDict on the backend instead of here, but
    // that would also mean that we'd need an equivalent of this.get_drag_state_value
    // on the backend. It's all working as expected here, so I'm leaving it here.
    this.calculate_context_bounding_box_size = function () {  // TODO: still use this?
        // var y = 0;
        // var x = 0;
        var w = 0;
        var order = this.layer.GetChildrenLayerOrder();
        // var len = order.length || 1;

        for (var layer_id of order) {
            var layer_data = this.data["imported_context"]["layers"]["data"][layer_id];

            // y += this.get_drag_state_value("anchor_norm_y", layer_data, this.data);
            // x += this.get_drag_state_value("anchor_norm_x", layer_data, this.data);

            if (layer_data["type"] !== "text") {
                w = Math.max(w, this.get_drag_state_value("width_norm", layer_data, this.data));
            }
        }

        // y /= len;
        // x /= len;

        // this.data["anchor_norm_y"] = y;
        // this.data["anchor_norm_x"] = x;
        this.data["width_norm"] = w || 0.5;  // TODO: if still using this, don't actually change this value, use some override attr in this class instead
        // this.data["aspect"] = 1.0;
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

    this.setup_connections = function () {
        (function (self) {
            self.html.on("click", function (e) {
                if (!self.data["locked"]) {
                    self.Select(true);
                }

                e.stopPropagation();
            });

            // Without this, if you try to move/rotate/scale/etc this
            // container while it's not already selected, it won't work
            self.html.on("mousedown", function () {
                if (!self.data["locked"]) {
                    self.Select(true);
                }
            });
        })(this);
    };

    // Late draw so that multiple functions can call this.draw_properties while only actually drawing once
    this._draw_properties = function () {
        this.draw_properties_pending = false;

        this.html.css({
            "width": this.width_px,
            "height": this.height_px,
            "left": this.left_px,
            "top": this.top_px,
            "transform": "rotate(" + this.get_drag_state_value("rot_deg") + "deg)"
        });
    };

    this.setup_styles();
}
