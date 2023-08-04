function DashGuiButtonBar (binder, color=null, button_style="default") {
    this.binder = binder;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.style = button_style;

    this.buttons = [];
    this.disabled = false;
    this.fit_content = false;
    this.html = $("<div></div>");
    this.auto_spacing_enabled = true;

    this.setup_styles = function () {
        this.html.css({
            "display": "flex",
            "height": this.style === "toolbar" ? Dash.Size.RowHeight : Dash.Size.ButtonHeight
        });
    };

    this.SetHeight = function (height) {
        this.html.css({
            "height": height
        });

        return this;
    };

    this.FitContent = function () {
        this.html.css({
            "height": "fit-content",
            "width": "fit-content"
        });

        this.fit_content = true;

        return this;
    };

    this.DisableAutoSpacing = function () {
        this.auto_spacing_enabled = false;

        return this;
    };

    this.Disable = function () {
        for (var button of this.buttons) {
            this.buttons.Disable();
        }

        this.disabled = true;
    };

    this.Enable = function () {
        for (var button of this.buttons) {
            this.buttons.Enable();
        }

        this.disabled = false;
    };

    this.Remove = function (button) {
        button.html.remove();

        this.buttons.Remove(button);

        this.update_spacing();
    };

    this.GetIndex = function (button) {
        return this.buttons.indexOf(button);
    };

    this.AddButton = function (label_text, callback, prepend=false) {
        callback = callback.bind(this.binder);

        var button = (function (self, callback) {
            return new Dash.Gui.Button(
                label_text,
                function () {
                    callback(button);
                },
                self,
                self.color,
                {"style": self.style}
            );
        })(this, callback);

        var css = {"margin": 0};

        if (this.fit_content) {
            css["flex"] = "none";
        }

        else {
            css["flex-grow"] = 1;
        }

        button.html.css(css);

        if (prepend) {
            this.html.prepend(button.html);

            this.buttons.unshift(button);
        }

        else {
            this.html.append(button.html);

            this.buttons.push(button);
        }

        this.update_spacing();

        if (this.disabled) {
            button.Disable();
        }

        return button;
    };

    // TODO: Make this more efficient - we don't need to hit this multiple times on the same frame
    this.update_spacing = function () {
        if (!this.auto_spacing_enabled) {
            return;
        }

        for (var i in this.buttons) {
            var button = this.buttons[i];

            button.html.css({
                "margin-right": (parseInt(i) === this.buttons.length - 1) ? 0 : (
                    Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1)
                )
            });
        }
    };

    this.setup_styles();
}
