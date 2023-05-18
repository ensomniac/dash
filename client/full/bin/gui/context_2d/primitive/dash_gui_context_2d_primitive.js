function DashGuiContext2DPrimitive (canvas, layer) {
    this.canvas = canvas;
    this.layer = layer;

    this.top_px = 0;
    this.left_px = 0;
    this.width_px = 0;
    this.height_px = 0;
    this.selected = false;
    this.width_px_max = 0;
    this.width_px_min = 5;
    this.height_px_max = 0;
    this.drag_state = null;
    this.height_px_min = 5;
    this.drag_active = false;
    this.drag_context = null;
    this.z_index_mult = 1000;
    this.z_index_base = 1010;
    this.last_width_norm = null;
    this.color = this.canvas.color;
    this.data = this.layer.GetData();
    this.editor = this.canvas.editor;
    this.draw_properties_pending = false;
    this.file_data = this.data["file"] || {};
    this.parent_id = this.layer.GetParentID();
    this.parent_data = this.layer.GetParentData();
    this.opposite_color = this.editor.opposite_color;
    this.highlight_color = this.editor.highlight_color;
    this.html = $("<div class='DashGuiContext2DPrimitive'></div>");
    this.hover_color = Dash.Color.GetTransparent(this.highlight_color, 0.5);

    this.id = this.data["id"];
    this.type = this.data["type"] || "";

    this.setup_styles = function () {
        this.set_max();

        if (!this.call_style()) {
            return;
        }

        this.set_init(false);

        var css = {
            "position": "absolute",
            "z-index": this.get_z_index(),

            // Retain the physical space of the border, just make it invisible
            // (this prevents the box from appearing to "jitter" when the border is toggled)
            "border": "1px solid rgba(0, 0, 0, 0)"
        };

        if (this.type === "context") {
            css["pointer-events"] = "none";
        }

        this.html.css(css);

        this.draw_properties(true);
        this.on_opacity_change(this.get_value("opacity"));

        var hidden = this.get_value("hidden");
        var locked = this.get_value("locked");
        var contained = this.get_value("contained");
        var fade_direction = this.get_value("fade_direction");

        if (hidden) {
            this.on_hidden_change(hidden);
        }

        if (locked) {
            this.on_locked_change(locked);
        }

        if (!contained) {
            this.on_contained_change(contained);
        }

        if (fade_direction) {
            this.update_fade();
        }

        this.setup_connections();
    };

    this.InputInFocus = function () {
        if (this.type !== "text") {
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
        if (key === "display_name") {
            return;
        }

        this.data = this.layer.GetData();
        this.file_data = this.data["file"] || {};
        this.parent_data = this.layer.GetParentData();

        if (key === "opacity") {
            this.on_opacity_change(this.get_value(key));
        }

        else if (key === "locked") {
            this.on_locked_change(value);
        }

        else if (key === "hidden") {
            this.on_hidden_change(value);
        }

        else if (key === "contained") {
            this.on_contained_change(value);
        }

        else if (key === "linked" && this.parent_id) {
            this.on_linked_change();
        }

        else if (key.startsWith("fade_")) {
            this.update_fade();
        }

        if (!value && (key === "locked" || key === "hidden")) {
            this.Select();
        }

        this.on_update(key);

        this.canvas.OnPrimitiveUpdated(this, key, value);

        if (this.type === "context") {
            this.canvas.UpdateAllChildrenPrimitives(this.id, key, value);
        }
    };

    this.IsSelected = function () {
        return this.selected;
    };

    this.Deselect = function () {
        if (!this.selected || this.drag_active) {
            return;
        }

        var css = {
            // Retain the physical space of the border, just make it invisible
            // (this prevents the box from appearing to "jitter" when the border is toggled)
            "border": "1px solid rgba(0, 0, 0, 0)"
        };

        if (this.type === "context") {
            css["pointer-events"] = "none";
        }

        this.html.css(css);

        if (this.type === "text") {
            this.lock_text_area();
        }

        this.selected = false;
    };

    this.Select = function (from_click=false, border=true) {
        if (this.selected) {
            return;
        }

        if (from_click && this.type === "context") {
            return;
        }

        if (from_click && this.parent_id && this.canvas.primitives[this.parent_id].IsSelected()) {
            return;
        }

        var locked = this.get_value("locked");

        if (from_click && locked) {
            return;
        }

        this.canvas.DeselectAllPrimitives();

        var css = (border && !this.editor.preview_mode) ? {"border": "1px solid " + this.highlight_color} : {};

        if (this.type === "context") {
            css["pointer-events"] = "none";
        }

        // When a layer is hovered in the layer stack, it adds +0.1 to the brightness
        // to indicate in the canvas which layer is hovered over in the layer stack,
        // so when selected, we want to remove that slight highlight
        if (this.hasOwnProperty("update_filter")) {
            this.update_filter(this.get_value("brightness"));
        }

        else {
            css["filter"] = "brightness(" + this.get_value("brightness") + ")";
        }

        this.html.css(css);

        this.canvas.OnPrimitiveSelected(this, from_click);

        if (!locked && this.type === "text") {
            this.unlock_text_area();
            this.focus_text_area();
        }

        this.selected = true;
    };

    this.OnCanvasResize = function () {
        this.set_scale(null, null, false);
        this.set_position();
        this.set_max();
    };

    this.OnDragStart = function (event) {
        if (this.drag_active || this.get_value("locked")) {
            return;
        }

        this.drag_active = true;

        this.Select(true);

        var active_tool = this.canvas.GetActiveTool();

        this.drag_context = {
            "scale": active_tool === "scale",
            "rotate": active_tool === "rotate",
            "start_rot": parseFloat(this.data["rot_deg"]),
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
        if (!this.drag_active || this.get_value("locked")) {
            return;
        }

        if (this.type === "video" && !this.media[0].paused) {
            this.media[0].pause();
        }

        if (this.selected && !(this.type === "video" && this.drag_context["scale"])) {
            this.html.css({"border": "1px solid rgba(0, 0, 0, 0)"});  // Hide border when dragging (except when scaling a video)
        }

        var movement_x = event.clientX - this.drag_context["start_mouse_x"];
        var movement_y = event.clientY - this.drag_context["start_mouse_y"];

        // Rotate left / right
        if (this.drag_context["rotate"]) {
            this.on_rotate(this.drag_context["start_rot"] + (movement_x + (-movement_y)));  // Invert y value
        }

        // Scale bigger / smaller
        else if (this.drag_context["scale"]) {
            // Only take input from one axis at a time, so use the greater one
            var movement = Math.abs(movement_x) >= Math.abs(movement_y) ? movement_x : -movement_y;  // Invert y value if using y

            this.on_scale(this.data["width_norm"] + (movement * 0.00005));
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
        if (!this.drag_active || this.get_value("locked")) {
            return;
        }

        this.drag_active = false;

        if (this.selected) {
            this.html.css({"border": "1px solid " + this.highlight_color});
        }

        this.save_drag_state();
    };

    this.update_fade = function () {
        var direction = this.get_value("fade_direction");
        var norm_start = this.get_value("fade_norm_start");
        var norm_end = this.get_value("fade_norm_end");

        if (this.get_value("fade_global")) {
            if (direction === "to_bottom" || direction === "to_top") {
                var canvas_height = this.canvas.GetHeight();
                var top_norm = ((canvas_height * norm_start) - this.top_px) / this.height_px;
                var bottom_norm = ((canvas_height * norm_end) - this.top_px) / this.height_px;

                if (direction === "to_bottom") {
                    norm_start = top_norm;
                    norm_end = bottom_norm;
                }

                else if (direction === "to_top") {
                    norm_start = bottom_norm;
                    norm_end = top_norm;
                }
            }

            else if (direction === "to_right" || direction === "to_left") {
                var canvas_width = this.canvas.GetWidth();
                var left_norm = ((canvas_width * norm_start) - this.left_px) / this.width_px;
                var right_norm = ((canvas_width * norm_end) - this.left_px) / this.width_px;

                if (direction === "to_right") {
                    norm_start = left_norm;
                    norm_end = right_norm;
                }

                else if (direction === "to_left") {
                    norm_start = right_norm;
                    norm_end = left_norm;
                }
            }

            else {
                console.warn("Warning: Unhandled global fade direction:", direction);
            }
        }

        this.html.css({
            "mask-image": direction ? (
                "linear-gradient("
                + direction.replaceAll("_", " ")
                + ", rgba(255, 255, 255, 1.0) "
                + (norm_start * 100)
                + "%, rgba(255, 255, 255, 0.0) "
                + (norm_end * 100)
                + "%)"
            ) : "none"
        });
    };

    this.on_rotate = function (rot_deg, force_save=false) {
        this.data["rot_deg"] = parseFloat(rot_deg);

        this.draw_properties();

        if (force_save) {
            this.save_drag_state(true);
        }
    };

    this.on_scale = function (width_norm, force_save=false) {
        [this.data["anchor_norm_x"], this.data["anchor_norm_y"]] = this.get_offset_norm();

        this.last_width_norm = this.get_value("width_norm");

        this.data["width_norm"] = parseFloat(width_norm);

        this.set_scale();

        if (force_save) {
            this.save_drag_state(true);
        }
    };

    this.set_max = function () {
        var max = Math.max(this.canvas.GetWidth(), this.canvas.GetHeight());

        // Text gets special handling since it has an extra-wide container
        this.width_px_max = max * (this.type === "text" ? 8 : 2);
        this.height_px_max = max * (this.type === "text" ? 1 : 2);
    };

    this.set_drag_state = function () {
        this.drag_state = {
            "anchor_norm_x": this.data["anchor_norm_x"],
            "anchor_norm_y": this.data["anchor_norm_y"],
            "rot_deg": this.data["rot_deg"],
            "width_norm": this.data["width_norm"]
        };
    };

    this.save_drag_state = function (modified=false) {
        if (!modified) {
            for (var key in this.drag_state) {
                if (this.drag_state[key] === this.data[key]) {
                    continue;
                }

                modified = true;

                break;
            }
        }

        if (!modified) {
            return;
        }

        this.set_drag_state();

        // Should never happen, but just in case
        if (this.editor.preview_mode) {
            return;
        }

        var properties = (
            this.parent_id || this.type === "context" ? (
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
        );

        if (this.editor.override_mode) {
            var renamed = {};

            for (var k in properties) {
                renamed[k + "_override"] = properties[k];
            }

            properties = renamed;
        }

        var params = {
            "f": "set_layer_properties",
            "obj_id": this.editor.obj_id,
            "layer_id": this.parent_id || this.id,
            "properties": JSON.stringify(properties),
            ...this.editor.extra_request_params
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

                    self.on_set_properties(response);

                    if (self.editor.linked_preview) {
                        self.editor.linked_preview.canvas.primitives[self.id].on_set_properties(response);
                    }
                },
                self.editor.api,
                params
            );
        })(this);
    };

    this.on_set_properties = function (response) {
        this.editor.data = response;

        // Is there a lighter way to achieve the same thing? maybe via Update()?
        if (this.type === "context" || this.parent_id) {
            this.canvas.RemoveAllPrimitives();

            this.editor.RedrawLayers(true);
        }
    };

    this.get_value = function (key, data=null, parent_data=null) {
        data = data || this.data;
        parent_data = parent_data || this.parent_data;

        var value = data[key];

        if (key.endsWith("_norm")) {
            value = parseFloat(value);
        }

        if (!Dash.Validate.Object(parent_data)) {
            return value;
        }

        if (key !== "linked" && !this.get_value("linked")) {
            return value;
        }

        var layer_overrides = parent_data["imported_context"]["layer_overrides"][this.id] || {};

        // Strings
        if (parent_data["str_keys"].includes(key)) {
            return (layer_overrides[key] || value).toString();
        }

        // Bools
        if (parent_data["bool_keys"].includes(key)) {
            return (key in layer_overrides ? layer_overrides[key] : value);
        }

        // Floats
        if (parent_data["float_keys"].includes(key)) {
            value = parseFloat(value);

            var override = parseFloat(layer_overrides[key] || 0);

            if (key === "opacity") {
                var parent_opacity = parent_data["opacity"];

                if (override) {
                    return override * parent_opacity;
                }

                return value * parent_opacity;
            }


            if (!override) {
                return value;
            }

            return value + override;
        }

        return value;
    };

    this.set_init = function (draw=true) {
        this.set_width_px();
        this.set_height_px();

        // After the above two are set
        this.set_top_px();
        this.set_left_px();

        if (draw) {
            this.draw_properties(true);
        }
    };

    this.on_linked_change = function () {
        this.set_init();  // Redraw - anything else?
    };

    // Meant to be overridden by member classes
    this.on_hidden_change = function (hidden) {
        if (this.type === "context") {
            return;
        }

        // console.warn("'on_hidden_change' function override is not defined in member class for type:", this.type);

        if (hidden) {
            this.html.hide();
        }

        else {
            this.html.show();
        }
    };

    // Meant to be overridden by member classes
    this.on_update = function () {
        if (this.type !== "context") {
            console.warn("'on_update' function override is not defined in member class for type:", this.type);
        }
    };

    // Meant to be overridden by member classes
    this.on_locked_change = function () {
        if (!(["context", "color"]).includes(this.type)) {
            console.warn("'on_locked_change' function override is not defined in member class for type:", this.type);
        }
    };

    // Meant to be overridden by member classes
    this.on_opacity_change = function (value) {
        if (this.type !== "context") {
            console.warn("'on_opacity_change' function override is not defined in member class for type:", this.type);
        }

        this.html.css({
            "opacity": value
        });
    };

    this.on_contained_change = function (value) {
        // If contained, it's not allowed to extend past the canvas' bounds and needs to be faded
        // underneath the canvas' masks, and the inverse if not contained. I'm not sure if this is possible
        // though, because raising this above the canvas' masks would also raise it above all other
        // layers, breaking the layer stacking order. There's no way to make both work that I can think of...
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
                parseFloat(this.data["anchor_norm_x"]),
                parseFloat(this.data["anchor_norm_y"])
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

        if (this.type === "text") {
            this.resize_text();
        }
    };

    this.set_top_px = function (override=null) {
        this.top_px = override || ((this.canvas.GetHeight() * this.get_value("anchor_norm_y")) - (this.height_px * 0.5));
    };

    this.set_left_px = function (override=null) {
        this.left_px = override || ((this.canvas.GetWidth() * this.get_value("anchor_norm_x")) - (this.width_px * 0.5));
    };

    this.set_width_px = function (override=null) {
        var capped = false;

        this.width_px = override || (this.canvas.GetWidth() * this.get_value("width_norm"));

        // Ensure it doesn't get so small that it can't be edited
        if (this.width_px < this.width_px_min) {
            this.width_px = this.width_px_min;

            // console.warn("Warning: Minimum width reached");

            capped = true;
        }

        // Or unreasonably large
        if (this.width_px > this.width_px_max) {
            this.width_px = this.width_px_max;

            // console.warn("Warning: Maximum width reached");

            capped = true;
        }

        if (capped) {
            if (this.last_width_norm) {
                this.data["width_norm"] = parseFloat(this.last_width_norm);
            }
        }
    };

    this.set_height_px = function (override=null) {
        this.height_px = override || (this.width_px / (this.data["aspect"] || this.editor.GetAspectRatio(true)));

        // Ensure it doesn't get so small that it can't be edited
        if (this.height_px < this.height_px_min) {
            this.height_px = this.height_px_min;

            // console.warn("Warning: Minimum height reached");
        }

        // Or unreasonably large
        if (this.height_px > this.height_px_max) {
            this.height_px = this.height_px_max;

            // console.warn("Warning: Maximum height reached");
        }
    };

    this.set_scale = function (width=null, height=null, draw=true) {
        this.set_width_px(width);
        this.set_height_px(height);

        if (draw) {
            this.draw_properties();

            if (["image", "video"].includes(this.type)) {
                this.redraw_media();
            }
        }

        if (this.type === "text") {
            this.resize_text();

            (function (self) {
                requestAnimationFrame(function () {
                    self.update_stroke();
                });
            })(this);

            this.update_textarea_width();
        }
    };

    // Each type should have its own file which is called as a member of this file
    this.call_style = function () {
        if (this.type === "context") {
            return true;
        }

        if (this.type === "text") {
            DashGuiContext2DPrimitiveText.call(this);
        }

        else if (this.type === "color") {
            DashGuiContext2DPrimitiveColor.call(this);
        }

        else {  // Media types
            if (!Dash.Validate.Object(this.file_data)) {
                console.error("Error: Missing file data (required for file-based primitives like images, videos, etc):", this.file_data);

                return false;
            }

            if (["image", "video"].includes(this.type)) {
                DashGuiContext2DPrimitiveMedia.call(this);
            }

            else {
                console.error("Error: Unhandled primitive type:", this.type);

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

    this.setup_connections = function () {
        if (!this.editor.can_edit) {
            return;
        }

        (function (self) {
            self.html.on("click", function (event, _event_override=null, _previous_layer_index=null, _skip_checks=false) {
                if (!_skip_checks) {
                    if (
                           self.click_next_layer_if_transparent_image_pixel(_event_override || event, _previous_layer_index)
                        || self.click_next_layer_if_hidden(_event_override || event, _previous_layer_index)
                    ) {
                        self.Deselect();
                    }

                    event.stopPropagation();

                    return;
                }

                self.Select(true);

                event.stopPropagation();
            });

            // Without this, if you try to move/rotate/scale/etc this
            // container while it's not already selected, it won't work
            // TODO: This does not pass through the transparent part of
            //  an image like the click event does, because it's very
            //  complicated and I've spent enough time for now on getting
            //  the click pass-through to work, so need to leave it for now.
            self.html.on("mousedown", function () {
                self.Select(true, false);
            });
        })(this);
    };

    this.click_next_layer_if_hidden = function (event, previous_layer_index=null) {
        if (!this.get_value("hidden") && this.get_value("opacity")) {
            return false;
        }

        var [next_layer, layer_index] = this.get_next_primitive_and_index(event, previous_layer_index);

        if (next_layer) {  // Click the next layer
            $(next_layer).trigger("click", [event, layer_index]);
        }

        // Even if no next layer, we don't want to follow through
        // with the original click, since the layer is hidden
        return true;
    };

    this.click_next_layer_if_transparent_image_pixel = function (event, previous_layer_index=null) {
        if (this.type !== "image") {
            return false;
        }

        var url = this.get_url();

        if (!url || !url.toLowerCase().endsWith(".png")) {
            return false;
        }

        var img = new Image();
        var canvas = $("<canvas></canvas>");
        var ctx = canvas[0].getContext("2d");

        canvas.css({
            "position": "absolute",
            "inset": 0,
            "width": this.width_px,
            "height": this.height_px
        });

        canvas.attr("width", this.width_px);
        canvas.attr("height", this.height_px);

        img.src = url;
        img.crossOrigin = "Anonymous";

        (function (self) {
            img.onload = function () {
                var img_data = null;
                var next_layer = null;
                var layer_index = null;

                ctx.drawImage(img, 0, 0, self.width_px, self.height_px);

                try {
                    img_data = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;
                }

                catch {
                    // Pass
                }

                // If clicked pixel is transparent
                if (img_data && img_data[3] === 0) {
                    [next_layer, layer_index] = self.get_next_primitive_and_index(event, previous_layer_index);
                }

                if (next_layer) {  // Click the next layer
                    $(next_layer).trigger("click", [event, layer_index]);
                }

                else {  // Re-trigger the click without checking for transparency
                    self.html.trigger("click", [event, null, true]);
                }

                return true;
            };
        })(this);

        return false;
    };

    this.get_next_primitive_and_index = function (event, previous_layer_index=null) {
        var next_primitive = null;
        var primitive_index = null;
        var elements = document.elementsFromPoint(event.clientX, event.clientY);

        for (var i in elements) {
            if (previous_layer_index !== null && parseInt(i) <= previous_layer_index) {
                continue;
            }

            var element = elements[i];
            var parent = $(element).parent()[0];

            if (parent === this.html[0] || element === this.html[0]) {
                continue;
            }

            if (element === this.canvas.html[0] || parent === this.canvas.html[0]) {
                break;
            }

            if ($(element).attr("class") !== "DashGuiContext2DPrimitive") {
                continue;
            }

            next_primitive = element;
            primitive_index = parseInt(i);

            break;
        }

        return [next_primitive, primitive_index];
    };

    // Late draw so that multiple functions can call this.draw_properties while only actually drawing once
    this._draw_properties = function () {
        this.draw_properties_pending = false;

        this.html.css({
            "width": this.width_px,
            "height": this.height_px,
            "top": this.top_px,
            "left": this.left_px,
            "transform": (
                "rotate(" + this.get_value("rot_deg") + "deg) "

                // This was added as an alternative to setting "top" and "left",
                // but it causes a complete breakage when media is rotated
                // + "translate3d(" + this.left_px + "px, " + this.top_px + "px, 0px)"
            )
        });

        this.on_opacity_change(this.get_value("opacity"));
        this.update_fade();
    };

    this.setup_styles();
}
