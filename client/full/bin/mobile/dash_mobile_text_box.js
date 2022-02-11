function DashMobileTextBox (color=null, placeholder_text="", binder=null, on_change_cb=null, on_submit_cb=null) {
    this.color = color || Dash.Color.Light;
    this.placeholder_text = placeholder_text;
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;
    this.on_submit_cb = binder && on_submit_cb ? on_submit_cb.bind(binder) : on_submit_cb;

    this.html = $("<textarea class='" + this.color.PlaceholderClass + "' placeholder='" + this.placeholder_text + "'>");

    this.setup_styles = function () {
        this.html.css({
            "color": this.color.Text,
            "padding": Dash.Size.Padding,
            "box-sizing": "border-box",
            "width": "100%",
            "min-width": "100%",
            "max-width": "100%",
            "height": Dash.Size.RowHeight * 4,
            "min-height": Dash.Size.RowHeight * 1.6,  // Just before a scrollbar appears when it's empty
            "border-radius": Dash.Size.BorderRadius * 0.5,
            "border": "1px solid " + this.color.Stroke
        });

        this.setup_connections();
    };

    this.Text = function () {
        return this.html.val();
    };

    this.SetText = function (text) {
        return this.html.val(text);
    };

    this.setup_connections = function () {
        // Important note:
        // When testing on a desktop's mobile view, you can't select the text with the
        // mouse in the traditional way, since it's simulating a mobile device. To select
        // the text, click and hold, to simulate a long press like you would on mobile.

        (function (self) {
            self.html.on("change", function () {
                if (self.on_change_cb) {
                    self.on_change_cb(self.Text());
                }
            });

            self.html.on("paste", function () {
                if (self.on_change_cb) {
                    self.on_change_cb(self.Text());
                }
            });

            self.html.on("keydown",function (e) {
                if (e.key === "Enter" && self.on_submit_cb) {
                    self.on_submit_cb(self.Text());
                }
            });
        })(this);
    };

    this.setup_styles();
}
