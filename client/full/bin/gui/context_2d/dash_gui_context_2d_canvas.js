function DashGuiContext2DCanvas (editor) {
    this.editor = editor;

    this.last_aspect_ratio = null;
    this.html = $("<div></div>");
    this.size_initialized = false;
    this.resize_event_timer = null;
    this.skip_resize_event = false;
    this.color = this.editor.color;
    this.canvas = $("<div></div>");
    this.padding = Dash.Size.Padding * 2;

    // TODO: flexible, unscaled canvas in the middle of the interface for all elements to be drawn on,
    //  with bounding box that represents working area based on selected aspect ratio, and canvas shouldn't
    //  flex smaller than the bounding box (or bounding box and contained elements should shrink when
    //  the canvas gets too small) - default behavior when an element is clicked should probably be to
    //  auto-select the layer and be able to manipulate it without having to select the desired layer first

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.StrokeDark,
            "box-sizing": "border-box",
            "border-bottom": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 2
        });

        this.canvas.css({
            "background": this.color.Background,
            "width": "calc(100% - " + (this.padding * 2) + "px)",
            "height": "calc(100% - " + (this.padding * 2) + "px)",
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)"
        });

        this.canvas.hide();

        this.html.append(this.canvas);
    };

    this.SizeInitialized = function () {
        return this.size_initialized;
    };

    this.SetTool = function (name, cursor="grab") {
        this.canvas.css({
            "cursor": cursor
        });

        // TODO: restyle the bounding box or something depending on the tool (name)
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
            this.editor.AddToLog("Canvas aspect ration changed to: " + w + "/" + h);
        }

        this.last_aspect_ratio = aspect_ratio;

        // TODO: elements will need to be resized as well, but that may happen automatically

        if (this.size_initialized) {
            return;
        }

        this.canvas.show();

        this.add_observer();

        this.size_initialized = true;
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
