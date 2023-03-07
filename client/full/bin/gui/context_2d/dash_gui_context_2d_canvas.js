function DashGuiContext2DCanvas (editor) {
    this.editor = editor;

    this.primitives = [];
    this.active_tool = "";
    this.last_aspect_ratio = null;
    this.html = $("<div></div>");
    this.size_initialized = false;
    this.resize_event_timer = null;
    this.skip_resize_event = false;
    this.color = this.editor.color;
    this.canvas = $("<div></div>");
    this.border = $("<div></div>");
    this.top_mask = $("<div></div>");
    this.left_mask = $("<div></div>");
    this.right_mask = $("<div></div>");
    this.bottom_mask = $("<div></div>");
    this.last_selected_primitive = null;
    this.padding = Dash.Size.Padding * 2;
    this.opposite_color = this.editor.opposite_color;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.Stroke,
            "box-sizing": "border-box",
            "border-bottom": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 2,
            "overflow": "hidden",
            "z-index": 1
        });

        var calc = "calc(100% - " + (this.padding * 2) + "px)";

        var css = {
            "width": calc,
            "height": calc,
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)"
        };

        this.canvas.css({
            "background": this.color.Background,
            "z-index": 2,
            ...css
        });

        this.canvas.hide();

        this.border.css({
            "z-index": 999999999,
            "user-select": "none",
            "pointer-events": "none",
            ...css,

            // Simulate a double border - one for dark backgrounds, one for light
            "border": "1px solid " + this.opposite_color.StrokeDark,
            "outline": "1px solid " + this.color.StrokeLight,
            "outline-offset": "1px"
        });

        this.border.hide();

        this.html.append(this.canvas);
        this.html.append(this.border);

        this.setup_connections();
    };

    this.InputInFocus = function () {
        for (var id in this.primitives) {
            if (this.primitives[id].InputInFocus()) {
                return true;
            }
        }

        return false;
    };

    this.GetActiveTool = function () {
        return this.active_tool;
    };

    this.SizeInitialized = function () {
        return this.size_initialized;
    };

    this.SetTool = function (name, cursor="grab") {
        this.active_tool = name;

        this.canvas.css({
            "cursor": cursor
        });
    };

    this.UpdatePrimitive = function (key, value, id="") {
        if (id && this.primitives[id]) {
            this.primitives[id].Update(key, value);

            return;
        }

        if (!this.last_selected_primitive) {
            return;
        }

        this.last_selected_primitive.Update(key, value);
    };

    this.SetActivePrimitive = function (id) {
        if (!this.primitives[id]) {
            return;
        }

        this.primitives[id].Select();

        this.last_selected_primitive = this.primitives[id];
    };

    this.AddPrimitive = function (layer, select=true) {
        var id = layer.GetID();

        if (this.primitives[id]) {
            return;
        }

        this.primitives[id] = new DashGuiContext2DPrimitive(this, layer);

        this.canvas.append(this.primitives[id].html);

        if (select) {
            this.SetActivePrimitive(id);
        }
    };

    this.RemoveAllPrimitives = function () {
        for (var id in this.primitives) {
            this.RemovePrimitive(id);
        }
    };

    this.UpdateAllChildrenPrimitives = function (parent_id, key, value) {
        for (var id in this.primitives) {
            if (this.primitives[id].parent_id !== parent_id) {
                continue;
            }

            this.primitives[id].Update(key, value);
        }
    };

    this.RemovePrimitive = function (id, _update_z_indexes=true) {
        if (!this.primitives[id]) {
            return;
        }

        if (this.primitives[id].data["type"] === "context") {
            var imported_context = this.primitives[id].data["imported_context"];
            var default_order = imported_context["layers"]["order"];

            // Do not use this.primitives[id].layer.GetChildrenLayerOrder() here
            var order = !this.primitives[id].get_value("linked") ? default_order : (imported_context["context_overrides"]["layer_order"] || default_order);

            for (var layer_id of order) {
                this.RemovePrimitive(layer_id, false);
            }
        }

        this.primitives[id].html.remove();

        delete this.primitives[id];

        if (_update_z_indexes) {
            this.UpdatePrimitiveZIndexes();
        }
    };

    this.GetHeight = function () {
        return this.canvas.innerHeight();
    };

    this.GetWidth = function () {
        return this.canvas.innerWidth();
    };

    this.DeselectAllPrimitives = function () {
        for (var id in this.primitives) {
            this.primitives[id].Deselect();
        }

        this.last_selected_primitive = null;
    };

    // To be called by primitive
    this.OnPrimitiveSelected = function (primitive) {
        this.last_selected_primitive = primitive;

        for (var id in this.primitives) {
            if (this.primitives[id] !== primitive) {
                continue;
            }

            this.editor.SelectLayer(id);

            break;
        }
    };

    this.Resize = function (from_event=false) {
        if (!from_event) {
            this.skip_resize_event = true;
        }

        var css;
        var aspect_ratio = this.editor.GetAspectRatio();
        var w = aspect_ratio[0];
        var h = aspect_ratio[1];
        var html_width = this.html.innerWidth() - (this.padding * 2);
        var html_height = this.html.innerHeight() - (this.padding * 2);

        // Horizontal aspect
        if (w > h) {
            if (html_width > html_height && (html_width * (h / w)) > html_height) {
                html_width = html_height * (w / h);
            }

            css = {
                "width": html_width,
                "height": html_width * (h / w)
            };
        }

        // Vertical aspect
        else if (w < h) {
            if (html_height > html_width && (html_height * (w / h)) > html_width) {
                html_height = html_width * (h / w);
            }

            css = {
                "width": html_height * (w / h),
                "height": html_height
            };
        }

        // Square aspect
        else {
            if (html_width > html_height) {
                css = {
                    "width": html_height,
                    "height": html_height
                };
            }

            else if (html_width < html_height) {
                css = {
                    "width": html_width,
                    "height": html_width
                };
            }

            else {
                css = {
                    "width": html_width,
                    "height": html_height
                };
            }
        }

        this.canvas.css(css);

        this.border.css(css);

        if (!this.last_aspect_ratio || this.last_aspect_ratio[0] !== w || this.last_aspect_ratio[1] !== h) {
            this.editor.AddToLog("Canvas aspect ratio set to: " + w + "/" + h);
        }

        this.last_aspect_ratio = aspect_ratio;

        for (var id in this.primitives) {
            this.primitives[id].OnCanvasResize();
        }

        if (this.size_initialized) {
            this.set_mask_width_and_height();

            return;
        }

        this.canvas.show();

        this.border.show();

        this.setup_masks();
        this.add_observer();

        this.size_initialized = true;
    };

    this.UpdatePrimitiveZIndexes = function () {
        for (var id in this.primitives) {
            this.primitives[id].UpdateZIndex();
        }
    };

    this.OnPrimitiveUpdated = function (primitive, key, value) {
        // Intended to be overwritten by abstractions/extensions of this code
    };

    this.add_observer = function () {
        (function (self) {
            new ResizeObserver(function () {
                if (self.skip_resize_event) {
                    self.skip_resize_event = false;

                    return;
                }

                if (self.resize_event_timer) {
                    clearTimeout(self.resize_event_timer);
                }

                self.resize_event_timer = setTimeout(
                    function () {
                        self.Resize(true);
                    },
                    50
                );
            }).observe(self.html[0]);
        })(this);
    };

    this.setup_masks = function () {
        var css = {
            "position": "absolute",
            "z-index": 999999998,
            "user-select": "none",
            "pointer-events": "none",
            "background": this.color.Stroke
        };

        this.top_mask.css({
            ...css,
            "top": 0
        });

        this.left_mask.css({
            ...css,
            "top": 0,
            "left": 0,
            "bottom": 0
        });

        this.right_mask.css({
            ...css,
            "top": 0,
            "right": 0,
            "bottom": 0
        });

        this.bottom_mask.css({
            ...css,
            "bottom": 0
        });

        this.set_mask_width_and_height();

        this.html.append(this.top_mask);
        this.html.append(this.left_mask);
        this.html.append(this.right_mask);
        this.html.append(this.bottom_mask);
    };

    this.set_mask_width_and_height = function () {
        var [width, height] = this.get_mask_width_and_height();

        this.top_mask.css({
            "left": width,
            "right": width,
            "height": height
        });

        this.left_mask.css({
            "width": width
        });

        this.right_mask.css({
            "width": width
        });

        this.bottom_mask.css({
            "left": width,
            "right": width,
            "height": height
        });
    };

    this.get_mask_width_and_height = function () {
        return [  // -3 for border/outline and an extra pixel
            ((this.html.outerWidth() - this.GetWidth()) / 2) - 3,
            ((this.html.outerHeight() - this.GetHeight()) / 2) - 3
        ];
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mousedown", function (e) {
                if (self.last_selected_primitive) {
                    self.last_selected_primitive.OnDragStart(e);
                }
            });

            self.html.on("mousemove", function (e) {
                // Left mouse button is still down (https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons)
                if (self.last_selected_primitive && e.buttons % 2 !== 0) {
                    self.last_selected_primitive.OnDrag(e);
                }

                e.preventDefault();
            });

            self.html.on("mouseup", function (e) {
                if (self.last_selected_primitive) {
                    self.last_selected_primitive.OnDragStop(e);
                }
            });

            self.canvas.on("click", function () {
                self.editor.DeselectAllLayers();
            });
        })(this);
    };

    this.setup_styles();
}
