function DashGuiContext2DToolbar (editor) {
    this.editor = editor;

    this.tools = [];
    this.pil_data = null;
    this.pil_button = null;
    this.pil_preview = null;
    this.initialized = false;
    this.pil_interval = null;
    this.html = $("<div></div>");
    this.pil_button_active = false;
    this.color = this.editor.color;
    this.can_edit = this.editor.can_edit;
    this.padding = Dash.Size.Padding * 0.5;
    this.min_width = Dash.Size.ColumnWidth * 0.3;
    this.opposite_color = this.editor.opposite_color;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "display": "flex",
            "flex-direction": "column",
            "box-sizing": "border-box",
            "border-right": "1px solid " + this.color.StrokeLight,
            "padding": this.padding
        });

        this.add_header();
        this.add_tools();
        this.add_pil_button();
        this.setup_connections();

        this.initialized = true;
    };

    this.DeselectTools = function () {
        for (var tool of this.tools) {
            tool.Deselect();
        }
    };

    this.add_pil_button = function () {
        this.html.append(Dash.Gui.GetFlexSpacer());

        this.pil_button = new Dash.Gui.Button(
            "PIL",
            this.on_pil_button_toggled,
            this,
            this.color,
            {"style": "toolbar"}
        );

        this.pil_button.html.css({
            "box-sizing": "border-box",
            "margin": 0
        });

        this.pil_button.label.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "font-family": "sans_serif_bold",
            "letter-spacing": Dash.Size.Padding * 0.1,
            "overflow": "visible",
            "user-select": "none"
        });

        this.pil_button.html.attr(
            "title",
            "Toggle preview of rendered PIL image\n(takes a few seconds to generate)"
        );

        this.pil_button.DisableHoverTextColorChange();
        this.pil_button.SetColor("none", this.color.Pinstripe, null, null, this.color.Button.Background.Base);

        this.html.append(this.pil_button.html);
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
