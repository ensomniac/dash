function DashGuiButtonBar (binder, color=null, button_style="default") {
    this.binder = binder;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.style = button_style;

    this.buttons = [];
    this.disabled = false;
    this.end_spacer = null;
    this.start_spacer = null;
    this.fit_content = false;
    this.html = $("<div></div>");

    this.setup_styles = function () {
        this.html.css({
            "display": "flex",
            "flex-wrap": "wrap",
            "gap": Dash.Size.Padding * (Dash.IsMobile ? 0.5 : 1),
            "height": this.style === "toolbar" ? Dash.Size.RowHeight : Dash.Size.ButtonHeight
        });
    };

    this.SetHeight = function (height) {
        this.html.css({
            "height": height
        });

        return this;
    };

    this.FitContent = function (centered=false) {
        var css = {"height": "fit-content"};

        this.fit_content = true;

        if (centered) {
            this.end_spacer = Dash.Gui.GetFlexSpacer();
            this.start_spacer = Dash.Gui.GetFlexSpacer();

            this.html.prepend(this.start_spacer);
            this.html.append(this.end_spacer);
        }

        else {
            css["width"] = "fit-content";
        }

        this.html.css(css);

        return this;
    };

    this.Disable = function (opacity=0.5) {
        for (var button of this.buttons) {
            this.buttons.Disable(opacity);
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
    };

    this.GetIndex = function (button) {
        return this.buttons.indexOf(button);
    };

    this.AddButton = function (label_text, callback, prepend=false, as_uploader=false) {
        callback = callback.bind(this.binder);

        var button = (function (self, callback) {
            return new Dash.Gui.Button(
                label_text,
                function (event, button) {
                    if (as_uploader) {
                        callback(button, event);
                    }

                    else {
                        callback(button);
                    }
                },
                self,
                self.color,
                {"style": self.style}
            );
        })(this, callback);

        var css = {"margin": 0};

        if (this.fit_content) {
            css["flex"] = "none";

            if (this.style === "default") {
                css["padding-left"] = Dash.Size.Padding;
                css["padding-right"] = Dash.Size.Padding;
            }
        }

        else {
            css["flex-grow"] = 1;
        }

        button.html.css(css);

        if (prepend) {
            this.html.prepend(button.html);

            if (this.start_spacer) {
                this.start_spacer.detach();

                this.html.prepend(this.start_spacer);
            }

            this.buttons.unshift(button);
        }

        else {
            this.html.append(button.html);

            if (this.end_spacer) {
                this.end_spacer.detach();

                this.html.append(this.end_spacer);
            }

            this.buttons.push(button);
        }

        if (this.disabled) {
            button.Disable();
        }

        return button;
    };

    this.setup_styles();
}
