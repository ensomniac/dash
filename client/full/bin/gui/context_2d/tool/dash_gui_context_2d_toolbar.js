function DashGuiContext2DToolbar (editor) {
    this.editor = editor;

    this.tools = [];
    this.pil_data = null;
    this.pil_button = null;
    this.pil_preview = null;
    this.initialized = false;
    this.pil_interval = null;
    this.full_res_button = null;
    this.html = $("<div></div>");
    this.pil_button_active = false;
    this.color = this.editor.color;
    this.can_edit = this.editor.can_edit;
    this.padding = Dash.Size.Padding * 0.5;
    this.bottom_button_area = $("<div></div>");
    this.min_width = Dash.Size.ColumnWidth * 0.3;
    this.opposite_color = this.editor.opposite_color;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "display": "flex",
            "flex-direction": "column",
            "box-sizing": "border-box",
            "background": this.color.Tab.Background.BaseHover,
            "border-right": "1px solid " + this.color.StrokeLight,
            "padding": this.padding,
            "overflow": "hidden"
        });

        this.add_header();
        this.add_tools();

        this.html.append(Dash.Gui.GetFlexSpacer());
        this.html.append(this.get_line());
        this.html.append(this.bottom_button_area);

        this.add_bottom_buttons();
        this.setup_connections();

        this.initialized = true;
    };

    this.DeselectTools = function () {
        for (var tool of this.tools) {
            tool.Deselect();
        }
    };

    this.add_bottom_buttons = function () {
        this.full_res_button = this.add_bottom_button(
            "Full\nRes",
            this.on_full_res_button_toggled,
            "Toggle full-resolution media for layers\n(may take a moment to swap out)"
        );

        this.bottom_button_area.append(this.get_line());

        this.pil_button = this.add_bottom_button(
            "PIL",
            this.on_pil_button_toggled,
            "Toggle preview of rendered PIL image\n(takes a few seconds to generate)"
        );
    };

    this.get_line = function () {
        var line = $("<div></div>");

        line.css({
            "height": Dash.Size.Padding * 0.1,
            "background": this.color.StrokeLight,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        return line;
    };

    this.add_bottom_button = function (label_text, callback, hover_hint="") {
        var two_lines = label_text.includes("\n");

        var button = new Dash.Gui.Button(
            label_text,
            callback,
            this,
            this.color,
            {"style": two_lines ? "default" : "toolbar"}
        );

        var label_css = {
            "padding-left": Dash.Size.Padding * (two_lines ? 0.5 : 0.3),
            "padding-right": Dash.Size.Padding * 0.5,
            "font-family": "sans_serif_bold",
            "letter-spacing": Dash.Size.Padding * 0.1,
            "overflow": "visible",
            "user-select": "none"
        };

        if (two_lines) {
            label_css["white-space"] = "pre-wrap";
            label_css["line-height"] = (Dash.Size.ButtonHeight * 0.45) + "px";
            label_css["padding-top"] = Dash.Size.Padding * 0.3;
        }

        button.html.css({
            "box-sizing": "border-box",
            "margin": 0
        });

        button.label.css(label_css);

        if (hover_hint) {
            button.html.attr("title", hover_hint);
        }

        button.DisableHoverTextColorChange();
        button.SetColor("none", this.color.Pinstripe, null, null, this.color.Button.Background.Base);

        this.bottom_button_area.append(button.html);

        return button;
    };

    this.on_full_res_button_toggled = function () {
        this.full_res_button.SetLoading(true);
        this.full_res_button.Disable();

        this.editor.ToggleFullResMode();

        this.full_res_button.SetColor(this.editor.full_res_mode ? this.color.PinstripeDark : "none");
        this.full_res_button.SetLoading(false);
        this.full_res_button.Enable();
    };

    this.on_pil_button_toggled = function () {
        this.pil_data = null;
        this.pil_button_active = !this.pil_button_active;

        if (!this.pil_button_active) {
            this.disable_pil_button();

            return;
        }

        this.pil_button.SetColor(this.color.PinstripeDark);
        this.pil_button.SetLoading(true, 1, true, this.opposite_color);
        this.pil_button.Disable();

        this.pil_interval = Dash.SetInterval(this, this.refresh_pil_data, 5000);
    };

    this.disable_pil_button = function () {
        if (this.pil_preview) {
            this.pil_preview.hide();
        }

        this.pil_button.SetLoading(false);
        this.pil_button.Enable();
        this.pil_button.SetColor("none");

        if (this.pil_interval) {
            clearInterval(this.pil_interval);

            this.pil_interval = null;
        }
    };

    this.refresh_pil_data = function () {
        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        self.disable_pil_button();

                        return;
                    }

                    if (!self.pil_button_active) {
                        self.disable_pil_button();

                        return;
                    }

                    if (!self.pil_data || (self.pil_data && response["url"] !== self.pil_data["url"])) {
                        self.update_pil_preview(response["url"]);
                    }

                    if (!self.pil_data) {
                        self.pil_button.SetLoading(false);
                        self.pil_button.Enable();
                    }

                    self.pil_data = response;
                },
                self.editor.api,
                {
                    "f": "get_pil_preview",
                    "c2d_id": self.editor.c2d_id,
                    ...self.editor.extra_request_params
                }
            );
        })(this);
    };

    this.update_pil_preview = function (url) {
        Dash.Log.Log("PIL URL:", url);

        var css = {"background-image": "url(" + url + ")"};

        if (!this.pil_preview) {
            this.pil_preview = $("<div></div>");

            css = {
                ...css,
                "background-repeat": "no-repeat",
                "background-size": "contain",
                "background-position": "center center",
                "position": "absolute",
                "inset": 0,
                "z-index": 999999998,
                "user-select": "none",
                "pointer-events": "none"
            };

            this.editor.canvas.canvas.append(this.pil_preview);
        }

        else {
            this.pil_preview.show();
        }

        this.pil_preview.css(css);
    };

    this.add_header = function () {
        var icon = new Dash.Gui.Icon(this.color, "tools", Dash.Size.ButtonHeight, 0.75, this.color.AccentGood);

        icon.html.css({
            "margin-top": 0,
            "margin-bottom": 0,
            "margin-left": "auto",
            "margin-right": "auto",
            "pointer-events": "none",
            "user-select": "none"
        });

        var label = $("<div>Tools</div>");

        label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "font-size": "90%",
            "color": this.color.Stroke,
            "padding-bottom": Dash.Size.Padding * 0.1,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "pointer-events": "none",
            "user-select": "none",
            "cursor": "default"
        });

        this.html.append(icon.html);
        this.html.append(label);
    };

    this.add_tools = function () {
        for (var icon_name of ["move", "rotate", "scale"]) {
            var tool = new DashGuiContext2DTool(this, icon_name);

            this.html.append(tool.html);

            this.tools.push(tool);
        }

        // First tool is selected by default
        this.tools[0].Select();
    };

    this.setup_connections = function () {
        if (!this.can_edit) {
            return;
        }

        var identifier = "dash_gui_context_2d_toolbar" + (this.editor.override_mode ? "_override" : "");

        (function (self) {
            $(document).on(
                "keydown." + identifier,  // Adding an ID to the event listener allows us to kill this specific listener
                function (e) {
                    if (self.html && !self.html.is(":visible")) {
                        $(document).off("keydown." + identifier);

                        return;
                    }

                    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                        return;
                    }

                    for (var tool of self.tools) {
                        if (tool.hotkey.toLowerCase() !== e.key) {
                            continue;
                        }

                        // Ignore if typing in an input
                        if (self.editor.EditorPanelInputInFocus() || self.editor.CanvasInputInFocus()) {
                            continue;
                        }

                        tool.Select();

                        break;
                    }
                }
            );
        })(this);
    };

    this.setup_styles();
}
