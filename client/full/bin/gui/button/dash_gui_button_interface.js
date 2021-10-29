/**@member DashGuiButton*/

function DashGuiButtonInterface () {
    this.ChangeLabel = function (label_text, width=null) {
        this.label.text(label_text);

        if (width) {
            this.html.css({"width": width});
        }
    };

    this.SetColor = function (base=null, highlight=null, load_bar=null, click_highlight=null) {
        if (!base && !highlight && !load_bar && !click_highlight) {
            this.reset_background_colors();

            return;
        }

        if (base) {
            this.html.css({
                "background": base
            });
        }

        if (highlight) {
            this.highlight.css({
                "background": highlight
            });
        }

        if (load_bar) {
            this.load_bar.css({
                "background": load_bar
            });
        }

        if (click_highlight) {
            this.click_highlight.css({
                "background": click_highlight
            });
        }
    };

    this.Disable = function () {
        this.html.css({"opacity": 0.5, "pointer-events": "none"});
    };

    this.Enable = function () {
        this.html.css({"opacity": 1.0, "pointer-events": "auto"});
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

    this.SetLoading = function (is_loading) {
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

        this.load_dots = new Dash.Gui.LoadDots(this.html.outerHeight()-Dash.Size.Padding);
        this.load_dots.SetOrientation("vertical");
        this.html.append(this.load_dots.html);

        this.load_dots.html.css({
            "position": "absolute",
            "top": Dash.Size.Padding*0.5,
            "bottom": 0,
            "right": 0,

        });

        this.load_dots.Start();
    };

    this.SetFileUploader = function (api, params, optional_on_start_callback) {
        if (!params["token"]) {
            var token = Dash.Local.Get("token");

            if (token) {
                params["token"] = token;
            }
        }

        this.file_upload_type = "file";
        this.file_upload_api = api;
        this.file_upload_params = params;

        if (this.file_uploader) {
            this.file_uploader.html.remove();
        }

        if (optional_on_start_callback) {
            this.on_file_upload_start_callback = optional_on_start_callback.bind(this.bind);
        }

        else {
            this.on_file_upload_start_callback = null;
        }

        this.file_uploader = null;

        (function (self) {
            self.file_uploader = new DashGuiButtonFileUploader(
                self,
                api,
                params,
                function (response) {
                    self.on_file_upload_response(response);
                },
                function () {
                    if (self.on_file_upload_start_callback) {
                        self.on_file_upload_start_callback();
                    }
                }
            );
        })(this);

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

    this.RefreshConnections  = function () {
        // This may be necessary in certain cases when the parent html is emptied
        // and then this button is then re-appended to that parent.

        this.setup_connections();
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
}
