function DashGuiPrompt (
    bound_cb, width=null, height=null, message="", header_text="Alert", continue_text="Continue",
    cancel_text="Cancel", color=null, include_bg=true, bg_opacity=0.1, use_esc_and_enter_shortcuts=true
) {
    /**
     * DashGuiPrompt
     * -------------
     *
     * This a replacement for `window.confirm`.
     *
     * Once instantiated and configured as desired (using `AddButton`, `AddHTML`, etc), simply call `Show` as a last step.
     *
     * @param {function} bound_cb - Once a selection is made, this will receive the selected button index
     *                              (pre-bound because we have no use for a `binder` param)
     * @param {number} width - Modal width (passed to `Dash.Gui.Modal`)
     * @param {number} height - Modal height (passed to `Dash.Gui.Modal`)
     * @param {string} message - Text to display if a basic message prompt is desired (not using custom HTML via `AddHTML`)
     * @param {string} header_text - Label text for header
     * @param {string} continue_text - Label text for default `Continue` button
     * @param {string} cancel_text - Label text for default `Cancel` button
     * @param {DashColorSet} color - `DashColorSet` instance (ideally, opposite to the primary color set of the site)
     * @param {boolean} include_bg - Use impenetrable full-screen background behind modal (passed to `Dash.Gui.Modal`)
     * @param {number} bg_opacity - Opacity for background (passed to `Dash.Gui.Modal`)
     * @param {boolean} use_esc_and_enter_shortcuts - Add an `Esc` key shortcut that maps to the default `Cancel` button
     *                                                and an `Enter` key shortcut that maps to the default `Continue` button
     *                                                (applicable only when using the default two buttons)
     */

    this.bound_cb = bound_cb;
    this.message = message;
    this.header_text = header_text;
    this.continue_text = continue_text;
    this.cancel_text = cancel_text;
    this.use_esc_and_enter_shortcuts = use_esc_and_enter_shortcuts;

    Dash.Gui.Modal.call(
        this,
        color || Dash.Color.Dark,
        $("body"),  // Window
        width || height || (Math.min(window.innerWidth, window.innerHeight) * 0.5),
        height || width || (Math.min(window.innerWidth, window.innerHeight) * 0.5),
        include_bg,
        bg_opacity,
        false
    );

    this.header = null;
    this.button_bar = null;
    this.cancel_button = null;
    this.remove = this.Remove;  // Remap this to not be public
    this.continue_button = null;
    this.shortcuts_active = false;
    this.content_area = $("<div></div>");

    this.message_css = {
        "white-space": "pre-line",
        "color": this.color.StrokeDark,
        "font-family": "sans_serif_normal"
    };

    // Delete inapplicable public functions from Dash.Gui.Modal to keep things clear
    delete this.Hide;
    delete this.Remove;
    delete this.UpdateSize;
    delete this.SetParentHTML;
    delete this.IncreaseZIndex;
    delete this.SetOnCloseCallback;

    this.setup_styles = function () {
        this.modal.css({
            "border-radius": Dash.Size.BorderRadius,
            "box-sizing": "border-box",
            "border": "2px solid " + this.color.Background
        });

        this.add_header();

        this.modal.append(this.content_area);

        this.add_button_bar();
        this.add_shortcuts();

        (function (self) {
            requestAnimationFrame(function () {
                self.content_area.css({
                    "position": "absolute",
                    "inset": 0,
                    "top": self.header.html.outerHeight(),
                    "bottom": self.button_bar.html.outerHeight(),
                    "padding": Dash.Size.Padding * 2,
                    "overflow": "auto",
                    "font-size": "105%",
                    ...self.message_css
                });

                if (self.message) {
                    self.content_area.text(self.message);
                }
            });
        })(this);
    };

    this.AddButton = function (label_text, prepend=false) {
        var button = (function (self) {
            return self.button_bar.AddButton(
                label_text,
                function (button) {
                    self.on_selection(self.button_bar.GetIndex(button));
                },
                prepend
            );
        })(this);

        button.label.css({
            "font-family": "sans_serif_bold"
        });

        if (prepend) {
            button.StyleAsBorderButton();
        }

        // Shortcut is only applicable when using default two buttons
        if (this.shortcuts_active) {
            $(document).off("keydown." + this.identifier);
        }

        return button;
    };

    this.AddHTML = function (html, add_message_css=false) {
        this.set_message("");  // One or the other

        if (add_message_css) {
            html.css({
                // For some reason, this is required for the text size to match the default message size,
                // even though that uses 105%. I'm suspicious it's because the message text is being set
                // directly on the content area itself, which has padding, causing a discrepancy in this case.
                "font-size": "100%",
                ...this.message_css
            });
        }

        this.content_area.append(html);
    };

    this.SetMessage = function (message) {
        this.content_area.empty();  // One or the other

        this.set_message(message);
    };

    this.RemoveContinueButton = function () {
        this.button_bar.Remove(this.continue_button);

        this.continue_button = null;
    };

    this.RemoveCancelButton = function () {
        this.button_bar.Remove(this.cancel_button);

        this.cancel_button = null;
    };

    this.on_selection = function (index) {
        // Because there can be more than the two default buttons, returning an
        // index makes more sense than returning true/false. Even when using only
        // the two default buttons, you can still treat the response like true and
        // false, since the values are 0 for cancel (false) and 1 for continue (true).
        this.bound_cb(index);

        this.remove();  // Single-use
    };

    this.add_header = function () {
        this.header = new Dash.Gui.Header(this.header_text, this.color);

        this.header.ReplaceBorderWithIcon("alert_square").SetSize(165);

        this.header.html.css({
            "user-select": "none",
            "pointer-events": "none",
            "border-top-left-radius": Dash.Size.BorderRadius,
            "border-top-right-radius": Dash.Size.BorderRadius,
            "background": this.color.Background,
            "position": "absolute",
            "top": 0,
            "left": 0,
            "right": 0,
            "padding": Dash.Size.Padding,
            "margin": 0
        });

        this.header.label.css({
            "font-size": "120%",
            "padding-left": Dash.Size.Padding * 1.1
        });

        this.modal.append(this.header.html);
    };

    this.add_button_bar = function () {
        this.button_bar = new Dash.Gui.ButtonBar(this);

        this.button_bar.html.css({
            "background": this.color.Background,
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "padding": Dash.Size.Padding
        });

        this.continue_button = this.AddButton(this.continue_text);
        this.cancel_button = this.AddButton(this.cancel_text, true);

        this.modal.append(this.button_bar.html);
    };

    this.set_message = function (message) {
        if (this.message === message) {
            return;
        }

        this.message = message;

        this.content_area.text(this.message);
    };

    this.add_shortcuts = function () {
        if (!this.use_esc_and_enter_shortcuts) {
            return;
        }

        (function (self) {
            $(document).on(
                "keydown." + self.identifier,  // Adding an ID to the event listener allows us to kill this specific listener
                function (e) {
                    if (self.modal && !self.modal.is(":visible")) {
                        $(document).off("keydown." + self.identifier);

                        self.shortcuts_active = false;

                        return;
                    }

                    if (e.key === "Escape") {
                        console.log("(Esc key pressed) Cancel");

                        self.on_selection(0);
                    }

                    else if (e.key === "Enter") {
                        console.log("(Enter key pressed) Continue");

                        self.on_selection(1);
                    }
                }
            );
        })(this);

        this.shortcuts_active = true;
    };

    this.setup_styles();
}
