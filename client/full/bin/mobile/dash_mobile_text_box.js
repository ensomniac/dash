function DashMobileTextBox (color=null, placeholder_text="", binder=null, on_change_cb=null) {
    this.color = color || Dash.Color.Light;
    this.placeholder_text = placeholder_text;
    this.binder = binder;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;

    this.html = $(
        "<textarea></textarea>",
        {
            "class": this.color.PlaceholderClass,
            "placeholder": this.placeholder_text
        }
    );

    this.setup_styles = function () {
        this.html.css({
            "color": this.color.Text,
            "padding": Dash.Size.Padding * 0.5,
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

    // Deliberately setting null as the default so that an empty string can be supplied
    this.GetText = function (line_break_replacement=null) {
        var val = this.html.val();

        if (typeof line_break_replacement === "string") {
            return val.replaceAll("\n", line_break_replacement);
        }

        return val;
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
        })(this);
    };

    this.setup_styles();
}
