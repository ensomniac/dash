/**@member DashGuiButton*/

function DashGuiButtonInterface () {
    this.SetText = function (label_text, width=null) {
        this.label.text(label_text);

        if (width) {
            this.html.css({"width": width});
        }
    };

    this.FitContent = function () {
        this.html.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "width": "fit-content"
        });
    };

    this.DisableHoverTextColorChange = function () {
        this.change_text_color_on_hover = false;
    };

    this.Text = function () {
        return this.label.text();
    };

    this.IsSelected = function () {
        return this.is_selected;
    };

    // Deprecated
    this.ChangeLabel = function (label_text, width=null) {
        this.SetText(label_text, width);
    };

    this.StyleAsDeleteButton = function (width=null, faint=true) {
        if (faint) {
            this.html.css({
                "background": this.color.PinstripeDark
            });
        }

        this.html.css({
            "width": width || "auto"
        });

        this.highlight.css({
            "background": this.color.AccentBad
        });
    };

    this.StyleAsBorderButton = function (
        border_size=1, border_type="solid", border_color="", background="", highlight_color=""
    ) {
        this.html.css({
            "border": border_size + "px " + border_type + " " + (
                   border_color
                || background
                || this.html.css("background-color")
                || this.color_set.Background.Base
            ),
            "box-sizing": "border-box",
            "background": background || "none",
        });

        this.highlight.css({
            "margin": -border_size,
            "background": highlight_color || Dash.Color.GetTransparent(
                this.highlight.css("background-color") || this.color_set.Background.BaseHover,
                0.75
            )
        });

        this.label.css({
            "margin-top": -border_size
        });
    };

    this.SetColor = function (base=null, highlight=null, load_bar=null, click_highlight=null, label=null) {
        if (!base && !highlight && !load_bar && !click_highlight && !label) {
            this.reset_colors();

            return;
        }

        if (base) {
            this.base_color_override = base;

            this.html.css({
                "background": base
            });
        }

        if (highlight) {
            this.highlight_color_override = highlight;

            this.highlight.css({
                "background": highlight
            });
        }

        if (load_bar) {
            this.load_bar_color_override = load_bar;

            this.load_bar.css({
                "background": load_bar
            });
        }

        if (click_highlight) {
            this.click_highlight_color_override = click_highlight;

            this.click_highlight.css({
                "background": click_highlight
            });
        }

        if (label) {
            this.label_color_override = label;

            this.label.css({
                "color": label
            });
        }

        return this;
    };

    this.Disable = function (opacity=0.5) {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "opacity": opacity,
            "pointer-events": "none",
            "user-select": "none"
        });
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
    };

    this.SetBorderRadius = function (border_radius) {
        this.html.css({
            "border-radius": border_radius,
        });

        this.highlight.css({
            "border-radius": border_radius,
        });

        this.load_bar.css({
            "border-radius": border_radius,
        });

        this.click_highlight.css({
            "border-radius": border_radius,
        });
    };

    this.SetTextAlign = function (text_alignment) {
        this.label.css({
            "text-align": text_alignment,
        });
    };

    this.SetFontSize = function (font_size) {
        this.label.css({
            "font-size": font_size,
        });
    };

    this.SetSelected = function (is_selected) {
        if (is_selected === this.is_selected) {
            return;
        }

        this.is_selected = is_selected;

        if (this.is_selected) {
            this.html.css({"background": this.color_set.Background.Selected});
            this.highlight.css({"background": this.color_set.Background.SelectedHover});
        }

        else {
            this.html.css({"background": this.color_set.Background.Base});
            this.highlight.css({"background": this.color_set.Background.BaseHover});
        }

        this.on_hover_out();
    };

    this.SetButtonVisibility = function (button_visible) {
        if (button_visible) {
            this.html.css({"opacity": 1, "pointer-events": "auto"});
        }

        else {
            this.html.css({"opacity": 0, "pointer-events": "none"});
        }
    };

    this.SetLoadBar = function (t) {
        this.load_bar.css({"width": this.html.width()*t});
    };

    this.IsLoading = function () {
        return !!this.load_dots; // If this.load_dots, return true - else, return false
    };

    this.SetHoverHint = function (hint) {
        this.html.attr("title", hint);
    };

    this.SetLoading = function (is_loading, size_mult=1, vertical=true, color=null, css={}) {
        if (is_loading && this.load_dots) {
            return;
        }

        if (!is_loading && !this.load_dots) {
            return;
        }

        if (!is_loading && this.load_dots) {
            this.load_dots.Stop();

            this.load_dots = null;

            return;
        }

        this.load_dots = new Dash.Gui.LoadDots(
            (this.html.outerHeight() - Dash.Size.Padding) * size_mult,
            color || this.color
        );

        if (vertical) {
            this.load_dots.SetOrientation("vertical");
        }

        if (!color) {
            // (Only if 'color' is not already provided, since that's likely
            // the opposite Dash color instance to combat this issue)
            // It seemed like virtually every time I added loading dots to a button with this function,
            // I was having to restyle it this way, so I'm finally adding it here. It seems sensible,
            // since the text color will obviously be something that's visible against the button
            // background, but there's of course a chance that this will break the visuals somewhere.
            this.load_dots.SetColor(this.icon ? this.color.Text : this.color.Button.Text.Base);
        }

        this.load_dots.html.css({
            "position": "absolute",
            "top": Dash.Size.Padding * 0.5,
            "bottom": 0,
            "right": 0,
            ...css
        });

        this.html.append(this.load_dots.html);

        this.load_dots.Start();
    };

    this.SetFileUploader = function (
        api, params, optional_on_start_callback=null, optional_css={}, return_button=false
    ) {
        if (!params["token"]) {
            var token = Dash.Local.Get("token");

            if (token) {
                params["token"] = token;
            }
        }

        this.file_upload_type = "file";
        this.file_upload_api = api;
        this.file_upload_params = params;
        this.file_upload_optional_css = optional_css;
        this.file_upload_return_button = return_button;

        if (this.file_uploader) {
            this.file_uploader.html.remove();
        }

        if (optional_on_start_callback) {
            this.on_file_upload_start_callback = optional_on_start_callback.bind(this.bind);
        }

        else {
            this.on_file_upload_start_callback = null;
        }

        this.file_uploader = (function (self) {
            return new DashGuiButtonFileUploader(
                self,
                api,
                params,
                function (response) {
                    self.on_file_upload_response(response, return_button);
                },
                function () {
                    if (self.on_file_upload_start_callback) {
                        self.on_file_upload_start_callback();
                    }
                }
            );
        })(this);

        if (Dash.Validate.Object(this.file_upload_optional_css)) {
            this.file_uploader.html.css(this.file_upload_optional_css);
        }

        else {
            this.set_file_uploader_size();
        }

        this.html.append(this.file_uploader.html);
    };

    this.Request = function (endpoint, params, callback, binder=null) {
        if (this.load_dots) {
            return;
        }

        this.on_request_response_callback = null;

        binder = binder || this.bind;

        if (binder && callback) {
            this.on_request_response_callback = callback.bind(binder);
        }

        this.SetLoading(true);

        (function (self, endpoint, params) {
            Dash.Request(
                binder,
                function (response) {
                    self.SetLoading(false);

                    if (self.on_request_response_callback) {
                        self.on_request_response_callback(response);
                    }
                },
                endpoint,
                params
            );
        })(this, endpoint, params);
    };

    // This may be necessary in certain cases when the parent html is
    // emptied and then this button is then re-appended to that parent.
    this.RefreshConnections = function () {
        this.BreakConnections();
        this.setup_connections();
    };

    this.BreakConnections = function () {
        this.html.off("mouseenter");
        this.html.off("mouseleave");
        this.html.off("click");
    };

    this.SetRightLabelText = function (label_text) {
        if (!this.right_label) {
            this.setup_right_label();
        }

        if (label_text === this.last_right_label_text && this.label_shown) {
            return;
        }

        if (this.label_shown) {
            // Was visible

            (function (self) {
                self.right_label.animate({"opacity": 0}, 200, function () {
                    self.set_right_label_text(label_text);
                    self.right_label.animate({"opacity": 1}, 600);
                });
            })(this);
        }

        else {
            // Was never visible
            this.set_right_label_text(label_text);

            this.right_label.animate({"opacity": 1}, 200, function () {
            });
        }

        this.label_shown = true;
    };

    this.AddIcon = function (icon_name, icon_size_mult=0.75, icon_color=null, right=true) {
        var side = right ? "right" : "left";

        this.html.css({
            "display": "flex"
        });

        var icon = new Dash.Gui.Icon(
            this.color,
            icon_name,
            this.html.height(),
            icon_size_mult,
            icon_color || this.color_set.Text.Base
        );

        var html_css = {};
        var icon_css = {};
        var min_pad = Dash.Size.Padding * 0.5;
        var side_padding = parseInt(this.html.css("padding-" + side));

        icon_css["margin-" + (right ? "left" : "right")] = side_padding * 0.5;

        icon.html.css(icon_css);

        html_css["padding-" + side] = side_padding > min_pad ? min_pad : 0;

        this.html.css(html_css);
        this.html.append(icon.html);

        if (!right){
            this.label.detach();

            this.html.append(this.label);
        }

        return icon;
    };
}
