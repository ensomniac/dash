function DashGuiSignature (width=null, height=null, binder=null, on_save_cb=null, on_clear_cb=null, color=null) {
    this.width = width;
    this.height = height || (width ? width * 0.5 : height);
    this.binder = binder;
    this.on_save_cb = binder && on_save_cb ? on_save_cb.bind(binder) : on_save_cb;
    this.on_clear_cb = binder && on_clear_cb ? on_clear_cb.bind(binder) : on_clear_cb;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);

    this.last_url = "";
    this.signature = null;
    this.save_button = null;
    this.clear_button = null;
    this.initialized = false;
    this.size_doubled = false;
    this.html = $("<div></div>");
    // this.device_dimensions = null;  // For mobile
    this.initial_width_margin = null;
    this.canvas = $("<canvas></canvas>");
    this.initial_height_to_width_ratio = null;

    this.setup_styles = function () {
        this.html.append(this.canvas);

        this.canvas.css({
            "border": "1px solid " + this.color.Stroke,
            "border-radius": Dash.Size.BorderRadius * 0.5
        });

        if (this.width) {
            this.SetWidth(this.width);
        }

        if (this.height) {
            this.SetHeight(this.height);
        }

        // This must be instantiated after the canvas size has initially been set, if applicable
        this.signature = new SignaturePad(this.canvas[0]);

        (function (self) {
            requestAnimationFrame(function () {
                if (Dash.IsMobile) {
                    if (window.navigator.standalone === true) {  // iOS - as of writing, doesn't support latest methods
                        window.addEventListener("orientationchange", self.ensure_proper_size.bind(self));
                    }

                    else {
                        screen.orientation.addEventListener("change", self.ensure_proper_size.bind(self));
                    }
                }

                else {
                    window.addEventListener("resize", self.ensure_proper_size.bind(self));
                }

                self.ensure_proper_size();
                self.add_button_bar();
                self.add_icon();

                self.initialized = true;
            });
        })(this);
    };

    this.Clear = function () {
        this.signature.clear();
    };

    this.IsEmpty = function () {
        return this.signature.isEmpty();
    };

    this.Disable = function () {
        if (!this.save_button) {
            (function (self) {
                setTimeout(
                    function () {
                        self.Disable();
                    },
                    10
                );
            })(this);

            return;
        }

        this.signature.off();

        this.save_button.Disable();

        this.clear_button.Disable();
    };

    this.Enable = function () {
        this.signature.on();

        this.save_button.Enable();

        this.clear_button.Enable();
    };

    this.GetPNGDataURL = function () {
        return this.signature.toDataURL();
    };

    this.GetJPEGDataURL = function (quality=1.0) {
        return this.signature.toDataURL("image/jpeg", quality);
    };

    this.RestoreFromDataURL = function (data_url, disabled=false) {
        if (!this.initialized) {
            (function (self) {
                setTimeout(
                    function () {
                        self.RestoreFromDataURL(data_url);
                    },
                    250
                );
            })(this);

            return;
        }

        this.signature.fromDataURL(data_url);

        this.last_url = data_url;

        if (disabled) {
            this.Disable();
        }
    };

    this.SetWidth = function (width, ratio=null) {
        this.width = width;

        // This is the only way it will work without breaking the canvas (jQuery.css doesn't work properly)
        this.canvas[0].style.width = width + "px";
        this.canvas[0].width = width * (ratio || window.devicePixelRatio || 1);
    };

    this.SetHeight = function (height, ratio=null) {
        this.height = height;

        // This is the only way it will work without breaking the canvas (jQuery.css doesn't work properly)
        this.canvas[0].style.height = height + "px";
        this.canvas[0].height = height * (ratio || window.devicePixelRatio || 1);
    };

    this.SetLineColor = function (color="black") {
        this.signature.penColor = color;
    };

    this.SetBackgroundColor = function (color="rgba(0, 0, 0, 0)") {
        // Use a non-transparent color to be able to save signatures as JPEG images without transparency.
        this.signature.backgroundColor = color;
    };

    this.SetMinLineWidth = function (width=0.5) {
        this.signature.minWidth = width;
    };

    this.SetMaxLineWidth = function (width=2.5) {
        this.signature.maxWidth = width;
    };

    this.SetDotRadius = function (size=1.0) {
        this.signature.dotSize = size;
    };

    this.SetOnBeginStroke = function (callback, binder=null) {
        this.signature.addEventListener("beginStroke", binder ? callback.bind(binder) : callback);
    };

    this.SetOnEndStroke = function (callback, binder=null) {
        this.signature.addEventListener("endStroke", binder ? callback.bind(binder) : callback);
    };

    this.add_icon = function () {
        var icon = new Dash.Gui.Icon(this.color, "signature", Dash.Size.Padding);

        icon.SetColor(this.color.StrokeLight);

        icon.html.css({
            "pointer-events": "none",
            "user-select": "none",
            "z-index": 10,
            "position": "absolute",
            "top": Dash.Size.Padding * 0.25,
            "left": Dash.Size.Padding * 0.25
        });

        this.html.append(icon.html);
    };

    this.add_button_bar = function () {
        var button_bar = new Dash.Gui.ButtonBar(this, this.color, "toolbar");

        button_bar.html.css({
            "height": Dash.IsMobile ? Dash.Size.RowHeight : "fit-content",
            "padding-top": Dash.Size.Padding * (Dash.IsMobile ? 0.25 : 0.5),
            "padding-left": Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1),
            "padding-right": Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1)
        });

        (function (self) {
            self.clear_button = button_bar.AddButton(
                "Clear",
                function () {
                    self.Clear();

                    if (self.on_clear_cb) {
                        self.on_clear_cb();  // Return anything?
                    }
                }
            );

            self.save_button = button_bar.AddButton(
                "Save",
                function () {
                    if (self.IsEmpty()) {
                        alert("The signature box is empty.\nPlease sign first, then try again.");

                        return;
                    }

                    self.last_url = self.GetPNGDataURL();

                    if (self.on_save_cb) {
                        self.on_save_cb(self.last_url);
                    }
                }
            );
        })(this);

        this.html.append(button_bar.html);
    };

    // This ensures a correctly-handled canvas on both high and low DPI screens, as well as mobile device rotation
    this.ensure_proper_size = function () {
        var width = this.canvas[0].offsetWidth;
        var height = this.canvas[0].offsetHeight;
        var ratio = window.devicePixelRatio || 1;

        // window.orientation is deprecated in favor of screen.orientation.type, but as of writing, iOS Safari still doesn't support the latter
        var landscape = screen.orientation && screen.orientation.type ? screen.orientation.type.includes("landscape") : [90, -90].includes(window.orientation);

        if (!this.initialized) {
            if (window.innerWidth > width) {
                this.initial_width_margin = window.innerWidth - width;
            }

            else {
                this.initial_width_margin = width - window.innerWidth;
            }

            this.initial_height_to_width_ratio = height / width;
        }

        // On mobile, the width > height check doesn't seem to work, so attempt the extra orientation check as a backup
        else if (window.innerWidth > window.innerHeight || landscape) {
            width = width * 2;
            height = height * 2;

            this.size_doubled = true;
        }

        else if (window.innerWidth <= this.width || this.size_doubled) {
            width = width * 0.5;
            height = height * 0.5;

            this.size_doubled = false;
        }

        if (Dash.IsMobile) {
            var width_margin;

            if (window.innerWidth > width) {
                width_margin = window.innerWidth - width;
            }

            else {
                width_margin = width - window.innerWidth;
            }

            if (width_margin !== this.initial_width_margin) {
                width = window.innerWidth - this.initial_width_margin;
                height = width * this.initial_height_to_width_ratio;
            }
        }

        this.SetWidth(width, ratio);
        this.SetHeight(height, ratio);

        this.canvas[0].getContext("2d").scale(ratio, ratio);

        this.signature.clear(); // Otherwise this.signature.isEmpty() might return incorrect value

        // In case this listener is called while the signature is still being viewed/used
        if (this.last_url) {
            this.RestoreFromDataURL(this.last_url);
        }
    };

    this.setup_styles();
}
