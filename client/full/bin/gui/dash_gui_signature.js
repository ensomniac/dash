function DashGuiSignature (width=null, height=null, binder=null, on_save_cb=null, on_clear_cb=null, color=null) {
    this.width = width;
    this.height = height || (width ? width * 0.5 : height);
    this.binder = binder;
    this.on_save_cb = binder && on_save_cb ? on_save_cb.bind(binder) : on_save_cb;
    this.on_clear_cb = binder && on_clear_cb ? on_clear_cb.bind(binder) : on_clear_cb;
    this.color = color || Dash.Color.Light;

    this.signature = null;
    this.html = $("<div></div>");
    this.canvas = $("<canvas></canvas>");

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
                window.addEventListener("resize", self.ensure_proper_size.bind(self));

                self.ensure_proper_size();
                self.add_button_bar();
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
        this.signature.off();
    };

    this.Enable = function () {
        this.signature.on();
    };

    this.GetPNGDataURL = function () {
        return this.signature.toDataURL();
    };

    this.GetJPEGDataURL = function (quality=1.0) {
        return this.signature.toDataURL("image/jpeg", quality);
    };

    this.RestoreFromDataURL = function (data_url) {
        this.signature.fromDataURL(data_url);
    };

    this.SetWidth = function (width) {
        this.width = width;

        // This is the only way it will work without breaking the canvas (jQuery.css doesn't work properly)
        this.canvas[0].width = width;
    };

    this.SetHeight = function (height) {
        this.height = height;

        // This is the only way it will work without breaking the canvas (jQuery.css doesn't work properly)
        this.canvas[0].height = height;
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

    this.add_button_bar = function () {
        var button_bar = new Dash.Gui.ButtonBar(this, this.color, "toolbar");

        button_bar.html.css({
            "height": Dash.IsMobile ? Dash.Size.RowHeight : "fit-content",
            "padding-top": Dash.Size.Padding * (Dash.IsMobile ? 0.25 : 0.5),
            "padding-left": Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1),
            "padding-right": Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1)
        });

        (function (self) {
            button_bar.AddButton(
                "Clear",
                function () {
                    self.Clear();

                    if (self.on_clear_cb) {
                        self.on_clear_cb();  // TODO: what to return?
                    }
                }
            );

            button_bar.AddButton(
                "Save",
                function () {
                    if (self.IsEmpty()) {
                        alert("The signature box is empty.\nPlease sign first, then try again.");

                        return;
                    }

                    if (self.on_save_cb) {
                        self.on_save_cb(self.GetPNGDataURL());  // TODO: what to return?
                    }
                }
            );
        })(this);

        this.html.append(button_bar.html);
    };

    // This ensures a correctly-handled canvas on both high and low DPI screens
    this.ensure_proper_size = function () {
        var ratio =  Math.max(window.devicePixelRatio || 1, 1);

        this.SetWidth(this.canvas[0].offsetWidth * ratio);
        this.SetHeight(this.canvas[0].offsetHeight * ratio);

        this.canvas[0].getContext("2d").scale(ratio, ratio);

        this.signature.clear(); // Otherwise this.signature.isEmpty() might return incorrect value
    };

    this.setup_styles();
}
