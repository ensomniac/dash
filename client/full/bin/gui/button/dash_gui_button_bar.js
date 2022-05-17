function DashGuiButtonBar (binder, color=null, button_style="default") {
    this.binder = binder;
    this.color = color || Dash.Color.Light;
    this.style = button_style;

    this.buttons = [];
    this.html = $("<div></div>");

    this.setup_styles = function () {
        this.html.css({
            "display": "flex",
            "height": Dash.Size.ButtonHeight
        });
    };

    this.SetHeight = function (height) {
        this.html.css({
            "height": height
        });
    };

    this.AddButton = function (label_text, callback) {
        callback = callback.bind(this.binder);

        (function (self, callback) {
            var button = new Dash.Gui.Button(
                label_text,
                function () {
                    callback(button);
                },
                self,
                self.color,
                {"style": self.style}
            );

            self.buttons.push(button);

            button.html.css({
                "margin": 0,
                "flex-grow": 1
            });

            self.html.append(button.html);
        })(this, callback);

        this.update_spacing();

        return this.buttons.Last();
    };

    // TODO: Make this more efficient - we don't need to hit this multiple times on the same frame
    this.update_spacing = function () {
        for (var i in this.buttons) {
            var button = this.buttons[i];
            var right_padding = Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1);

            if (parseInt(i) === this.buttons.length - 1) {
                right_padding = 0;
            }

            button.html.css({
                "margin": 0,
                "flex-grow": 1,
                "margin-right": right_padding,
            });
        }
    };

    this.setup_styles();
}
