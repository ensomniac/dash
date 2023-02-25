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
    this.last_selected_primitive = null;
    this.padding = Dash.Size.Padding * 2;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.StrokeDark,
            "box-sizing": "border-box",
            "border-bottom": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 2,
            "overflow": "hidden",
            "z-index": 1
        });

        this.canvas.css({
            "background": this.color.Background,
            "width": "calc(100% - " + (this.padding * 2) + "px)",
            "height": "calc(100% - " + (this.padding * 2) + "px)",
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)",
            "z-index": 2
        });

        this.canvas.hide();

        this.html.append(this.canvas);

        this.setup_connections();
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

    this.InputInFocus = function () {
        for (var primitive of this.primitives) {
            if (primitive.InputInFocus()) {
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
        if (id) {
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

    this.AddPrimitive = function (layer) {
        var id = layer.GetID();

        if (this.primitives[id]) {
            return;
        }

        var primitive = new DashGuiContext2DPrimitive(this, layer);

        this.primitives[id] = primitive;

        this.SetActivePrimitive(id);

        this.canvas.append(primitive.html);
    };

    this.RemovePrimitive = function (id) {
        this.primitives[id].html.remove();

        delete this.primitives[id];

        this.UpdatePrimitiveZIndexes();
    };

    this.GetHeight = function () {
        return this.canvas.innerHeight();
    };

    this.GetWidth = function () {
        return this.canvas.innerWidth();
    };

    this.DeselectAllPrimitives = function () {
        for (var primitive of this.primitives) {
            primitive.Deselect();
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

            this.canvas.css({
                "width": html_width,
                "height": html_width * (h / w)
            });
        }

        // Vertical aspect
        else if (w < h) {
            if (html_height > html_width && (html_height * (w / h)) > html_width) {
                html_height = html_width * (h / w);
            }

            this.canvas.css({
                "width": html_height * (w / h),
                "height": html_height
            });
        }

        // Square aspect
        else {
            if (html_width > html_height) {
                this.canvas.css({
                    "width": html_height,
                    "height": html_height
                });
            }

            else if (html_width < html_height) {
                this.canvas.css({
                    "width": html_width,
                    "height": html_width
                });
            }

            else {
                this.canvas.css({
                    "width": html_width,
                    "height": html_height
                });
            }
        }

        if (!this.last_aspect_ratio || this.last_aspect_ratio[0] !== w || this.last_aspect_ratio[1] !== h) {
            this.editor.AddToLog("Canvas aspect ratio set to: " + w + "/" + h);
        }

        this.last_aspect_ratio = aspect_ratio;

        for (var primitive of this.primitives) {
            primitive.OnCanvasResize();
        }

        if (this.size_initialized) {
            return;
        }

        this.canvas.show();

        this.add_observer();

        this.size_initialized = true;
    };

    this.UpdatePrimitiveZIndexes = function () {
        for (var id in this.primitives) {
            this.primitives[id].UpdateZIndex();
        }
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

    this.setup_styles();
}
