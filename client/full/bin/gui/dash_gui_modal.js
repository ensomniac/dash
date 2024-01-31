/**@member DashGuiPrompt*/

function DashGuiModal (
    color=null, parent_html=null, width=null, height=null,
    include_bg=true, bg_opacity=0.6, include_close_button=true, bg_color=null
) {
    this.parent_html = parent_html;
    this.width = width !== null ? (Math.min(width, (window.innerWidth - (Dash.Size.Padding * 2)))) : null;
    this.height = height !== null ? (Math.min(height, (window.innerHeight - (Dash.Size.Padding * 2)))) : null;
    this.include_bg = include_bg;
    this.bg_opacity = bg_opacity;
    this.color = color || Dash.Color.Light;
    this.include_close_button = include_close_button;
    this.bg_color = bg_color || this.color.BackgroundRaised;

    // Not using 'this.html' is unconventional, but it's not appropriate in
    // this context, since the modal consists of two individual elements with
    // 'this.parent_html' essentially being the equivalent of the usual 'this.html'.
    // It's also important to note that these elements automatically get appended
    // to 'this.parent_html' to ensure the elements get appended appropriately.

    this.modal = null;
    this.background = null;
    this.close_button = null;
    this.on_close_callback = null;
    this.esc_shortcut_active = false;
    this.identifier = "dash_gui_modal_esc_" + Dash.Math.Random();

    this.setup_styles = function () {
        if (!this.parent_html && !this.width && !this.height) {
            console.error("If 'parent_html' is not provided, 'width' and 'height' must be");

            return;
        }

        this.add_background();
        this.add_modal();
        this.add_close_button();
        this.add_esc_shortcut();
    };

    this.SetOnCloseCallback = function (binder, callback) {
        if (!this.include_close_button) {
            return;
        }

        this.on_close_callback = callback.bind(binder);
    };

    this.SetParentHTML = function (parent_html) {
        if (this.parent_html) {
            this.modal.detach();

            if (this.include_bg) {
                this.background.detach();
            }
        }

        this.parent_html = parent_html;

        this.parent_html.append(this.modal);
        this.parent_html.append(this.background);
    };

    this.AddHTML = function (html) {
        this.modal.append(html);
    };

    this.Hide = function () {
        this.modal.hide();

        if (this.background) {
            this.background.hide();
        }
    };

    this.Show = function () {
        this.modal.show();

        if (this.background) {
            this.background.show();
        }

        this.add_esc_shortcut();
    };

    this.Remove = function () {
        (function (self) {
            self.modal.stop().animate(
                {"opacity": 0},
                {
                    "complete": function () {
                        self.modal.remove();
                    }
                }
            );
        })(this);

        if (this.background) {
            (function (self) {
                self.background.stop().animate(
                    {"opacity": 0},
                    {
                        "complete": function () {
                            self.background.remove();
                        }
                    }
                );
            })(this);
        }
    };

    // If you have multiple modals, or a modal alongside other elements that use
    // modals or  modal backgrounds, such as loading labels and loading overlays,
    // you'll need to use this function to prioritize each one from top to bottom
    this.IncreaseZIndex = function (num) {
        var z_index = this.get_bg_z_index() + num;

        if (this.include_bg) {
            this.background.css({
                "z-index": z_index
            });
        }

        this.modal.css({
            "z-index": z_index + 1
        });

        if (this.include_close_button) {
            this.close_button.html.css({
                "z-index": z_index + 2
            });
        }
    };

    this.UpdateSize = function (width=null, height=null) {
        if (!width && !height) {
            return;
        }

        var update_margin = false;

        if (width) {
            this.width = width;

            update_margin = true;
        }

        if (height) {
            this.height = height;
        }

        var css = {
            "width": this.width,
            "height": this.height
        };

        if (update_margin) {
            css["margin-left"] = this.parent_html ? this.get_left_margin(this.width) : 0;
        }

        this.modal.css(css);
    };

    this.add_modal = function () {
        var parent_width = this.get_parent_width();
        var parent_height = this.get_parent_height();

        if (!this.width) {
            this.width = (parent_width ? parent_width * 0.9 : null);
        }

        if (!this.height) {
            this.height = (parent_height ? parent_height * 0.9 : null);
        }

        // This shouldn't happen
        if (!this.width && !this.height) {
            Dash.Log.Warn("Failed to get modal width and height");

            return;
        }

        this.modal = Dash.Gui.GetHTMLBoxContext(
            {
                "z-index": this.get_bg_z_index() + 1,
                "position": "fixed",
                "padding-bottom": 0,
                "margin-left": this.parent_html ? this.get_left_margin(this.width, parent_width) : 0,
                "margin-top": 0,
                "left": "50%",
                "top": "50%",
                "transform": "translate(-50%, -50%)",
                "width": this.width,
                "height": this.height
            },
            this.color
        );

        if (this.parent_html) {
            // We can't append this to this.background because the background has transparency
            this.parent_html.append(this.modal);
        }
    };

    this.get_parent_width = function () {
        return (this.parent_html ? (this.parent_html.outerWidth() || this.parent_html.innerWidth() || this.parent_html.width()) : null);
    };

    this.get_parent_height = function () {
        return (this.parent_html ? (this.parent_html.outerHeight() || this.parent_html.innerHeight() || this.parent_html.height()) : null);
    };

    // Logic to make sure the modal gets centered within the background, which isn't necessarily in the center of the window
    this.get_left_margin = function (modal_width, parent_width=null) {
        if (!parent_width) {
            parent_width = this.get_parent_width();

            if (!parent_width) {
                console.error("Failed to get parent width for left margin");

                return null;
            }
        }

        var left = this.parent_html.offset().left;
        var right = window.innerWidth - (parent_width + left);
        var begin_dif = ((window.innerWidth / 2) - (modal_width / 2)) - left;
        var end_dif = (window.innerWidth - right) - ((window.innerWidth / 2) + (modal_width / 2));
        var median = (begin_dif + end_dif) / 2;

        return (begin_dif > end_dif ? - (begin_dif - median) : end_dif - median);
    };

    this.add_close_button = function () {
        if (!this.include_close_button) {
            return;
        }

        this.close_button = (function (self) {
            return new Dash.Gui.IconButton(
                "close",
                function () {
                    self.Hide();

                    if (self.on_close_callback) {
                        self.on_close_callback();
                    }
                },
                self,
                self.color,
                {
                    "container_size": Dash.Size.Padding * 3,
                    "size_mult": 0.85
                }
            );
        })(this);

        this.close_button.html.css({
            "position": "absolute",
            "top": Dash.Size.Padding * 0.5,
            "right": Dash.Size.Padding * 0.25,
            "z-index": this.get_bg_z_index() + 2
        });

        this.close_button.SetHoverHint("Close window (esc)");

        this.modal.append(this.close_button.html);
    };

    this.add_background = function () {
        if (!this.include_bg) {
            return;
        }

        var height = "100%";

        if (this.parent_html) {
            try {
                var scroll_height = this.parent_html.scrollHeight || this.parent_html.prop("scrollHeight");

                if (scroll_height) {
                    height = scroll_height;
                }
            }

            catch {
                // Ignore
            }
        }

        this.background = Dash.Gui.GetHTMLAbsContext(
            "",
            this.color,
            {
                "z-index": this.get_bg_z_index(),
                "background": this.bg_color,
                "opacity": this.bg_opacity,
                "height": height
            }
        );

        // Block any elements behind this from being clicked
        this.background.on("click", function (event) {
            event.stopPropagation();
        });

        if (this.parent_html) {
            this.parent_html.append(this.background);
        }
    };

    this.get_bg_z_index = function () {
        return this.background ? this.background.css("z-index") : (
            this.parent_html && this.parent_html["selector"] === "body" ? 1000000 : 100000
        );
    };

    this.add_esc_shortcut = function () {
        if (!this.include_close_button || this.esc_shortcut_active) {
            return;
        }

        (function (self) {
            $(document).on(
                "keydown." + self.identifier,  // Adding an ID to the event listener allows us to kill this specific listener
                function (e) {
                    if (self.modal && !self.modal.is(":visible")) {
                        $(document).off("keydown." + self.identifier);

                        self.esc_shortcut_active = false;

                        return;
                    }

                    if (e.key === "Escape") {
                        Dash.Log.Log("(Esc key pressed) Close modal");

                        self.Hide();
                    }
                }
            );
        })(this);

        this.esc_shortcut_active = true;
    };

    this.setup_styles();
}
