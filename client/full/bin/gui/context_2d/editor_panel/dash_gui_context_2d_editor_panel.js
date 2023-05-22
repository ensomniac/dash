function DashGuiContext2DEditorPanel (editor) {
    this.editor = editor;

    this.button_bars = [];
    this.layers_box = null;
    this.content_box = null;
    this.property_box = null;
    this.api = this.editor.api;
    this.aspect_tool_row = null;
    this.html = $("<div></div>");
    this.first_pane_slider = null;
    this.color = this.editor.color;
    this.second_pane_slider = null;
    this.tool_value_tool_row = null;
    this.top_html = $("<div></div>");
    this.aspect_tool_row_inputs = {};
    this.obj_id = this.editor.obj_id;
    this.can_edit = this.editor.can_edit;
    this.preview_mode = this.editor.preview_mode;
    this.override_mode = this.editor.override_mode;
    this.min_width = (Dash.Size.ColumnWidth * 2.4) + (this.editor.min_width_extensions["editor_panel"] || 0);

    // Update if things are added to the box that would increase the overall height
    this.property_box_height = this.override_mode ? (
           Dash.Size.RowHeight
        + (Dash.Size.Padding * 1.5)
    ) : (
           Dash.Size.ButtonHeight        // Header
        + (Dash.Size.RowHeight * 5)      // Rows and toolbar-style-buttons
        + (Dash.Size.Padding   * 2.5)    // Top, bottom, and button padding
        + (this.editor.min_height_extensions["editor_panel_property_box"] || 0)
    );

    // Wrappers
    this.get_data = this.editor.get_data.bind(this.editor);
    this.set_data = this.editor.set_data.bind(this.editor);

    this.setup_styles = function () {
        if (this.preview_mode) {
            this.layers_box = new DashGuiContext2DEditorPanelLayers(this);

            return;
        }

        var abs_css = {
            "position": "absolute",
            "inset": 0
        };

        this.html.css({
            "box-sizing": "border-box",
            "border-left": "1px solid " + this.color.StrokeLight,
            "overflow-x": "hidden",
            ...abs_css
        });

        this.layers_box = new DashGuiContext2DEditorPanelLayers(this);
        this.content_box = new DashGuiContext2DEditorPanelContent(this);
        this.property_box = new Dash.Gui.PropertyBox(this, this.get_data, this.set_data);

        this.first_pane_slider = new Dash.Layout.PaneSlider(
            this,
            true,
            this.property_box_height,
            "dash_gui_context_2d_editor_panel_first" + (this.override_mode ? "_override" : ""),
            true
        );

        this.second_pane_slider = new Dash.Layout.PaneSlider(
            this,
            true,
            this.get_top_html_size(),
            "dash_gui_context_2d_editor_panel_second" + (this.override_mode ? "_override" : ""),
            true
        );

        this.second_pane_slider.SetPaneContentA(this.top_html);
        this.second_pane_slider.SetPaneContentB(this.layers_box.html);

        this.html.append(this.second_pane_slider.html);

        this.first_pane_slider.SetPaneContentA(this.property_box.html);
        this.first_pane_slider.SetPaneContentB(this.content_box.html);

        this.top_html.css(abs_css);
        this.top_html.append(this.first_pane_slider.html);

        this.setup_property_box();

        if (this.GetSelectedLayer()) {
            this.SwitchContentToEditTab();
        }

        else {
            this.SwitchContentToNewTab();
        }
    };

    this.RedrawLayers = function (select=false, redraw_primitives=false) {
        this.layers_box.Redraw(select, redraw_primitives);
    };

    this.OnNewLayer = function (response) {
        this.layers_box.OnNewLayer(response);
    };

    this.SetLayerProperty = function (key, value, id) {
        this.layers_box.SetProperty(key, value, id);
    };

    this.SwitchContentToEditTab = function () {
        if (this.content_box) {
            this.content_box.SwitchToEditTab();
        }
    };

    this.RedrawCurrentContentTab = function () {
        if (this.content_box) {
            this.content_box.RedrawCurrentTab();
        }
    };

    this.SwitchContentToNewTab = function () {
        if (this.content_box) {
            this.content_box.SwitchToNewTab();
        }
    };

    this.InputInFocus = function () {
        return (
               (this.property_box && this.property_box.InputInFocus())
            || (this.layers_box   && this.layers_box.InputInFocus())
            || (this.content_box  && this.content_box.InputInFocus())
        );
    };

    this.GetAspectRatio = function () {
        var data = this.get_data();
        var w = data["aspect_ratio_w"];
        var h = data["aspect_ratio_h"];

        if (!this.aspect_tool_row) {
            return [
                w || 1,
                h || 1
            ];
        }

        return [
            parseFloat(this.aspect_tool_row_inputs["w"].Text() || w || 1) || 1,
            parseFloat(this.aspect_tool_row_inputs["h"].Text() || h || 1) || 1
        ];
    };

    this.GetSelectedLayer = function () {
        return this.layers_box.GetSelectedLayer();
    };

    this.AddLayer = function (primitive_type, primitive_file_data=null) {
        this.layers_box.AddLayer(primitive_type, primitive_file_data);
    };

    this.UpdatePropertyBox = function () {
        if (this.preview_mode) {
            return;
        }

        if (!this.editor.CanvasSizeInitialized()) {
            this.editor.ResizeCanvas();
        }

        if (!this.property_box) {
            return;
        }

        this.property_box.Update();
    };

    this.UpdateContentBoxComboOptions = function () {
        this.content_box.UpdateComboOptions();
    };

    this.SelectLayer = function (id, from_canvas=true) {
        if (this.layers_box) {
            this.layers_box.Select(id, from_canvas);
        }
    };

    this.AddCustomElementToContentNewTab = function (
        built_in_function_name="", built_in_function_params=[], callback_that_returns_html=null, binder=null
    ) {
        if (!this.content_box) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomElementToContentNewTab(
                            built_in_function_name,
                            built_in_function_params,
                            callback_that_returns_html,
                            binder
                        );
                    },
                    1
                );
            })(this);

            return;
        }

        this.content_box.AddCustomElementToNewTab(
            built_in_function_name,
            built_in_function_params,
            callback_that_returns_html,
            binder
        );
    };

    this.AddCustomElementToContentEditTab = function (
        context_key, built_in_function_name="", built_in_function_params=[], callback_that_returns_html=null, binder=null
    ) {
        if (!this.content_box) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomElementToContentEditTab(
                            context_key,
                            built_in_function_name,
                            built_in_function_params,
                            callback_that_returns_html,
                            binder
                        );
                    },
                    10
                );
            })(this);

            return;
        }

        this.content_box.AddCustomElementToEditTab(
            context_key,
            built_in_function_name,
            built_in_function_params,
            callback_that_returns_html,
            binder
        );
    };

    this.AddCustomContextToContentEditTab = function (context_key, callback_that_returns_html=null, binder=null) {
        if (!this.content_box) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomContextToContentEditTab(context_key, callback_that_returns_html, binder);
                    },
                    10
                );
            })(this);

            return;
        }

        this.content_box.AddCustomContextToEditTab(context_key, callback_that_returns_html, binder);
    };

    this.UpdatePropertyBoxToolSlider = function (active_tool="", layer=null) {
        if (!this.property_box) {
            return;
        }

        if (!active_tool) {
            active_tool = this.editor.canvas.GetActiveTool();
        }

        if (!layer) {
            layer = this.GetSelectedLayer();
        }

        var active = layer && active_tool;

        this.tool_value_tool_row.elements = [];

        this.tool_value_tool_row.html.empty();

        var label = this.tool_value_tool_row.AddLabel(
            active ? (active_tool === "move" ? "X" : active_tool.Title()) + ":" : "Tool:",
            null,
            null,
            null,
            false
        );

        label.label.css({
            "padding-left": 0
        });

        var data_key = (
              active_tool === "move"   ? "anchor_norm_x"
            : active_tool === "rotate" ? "rot_deg"
            : active_tool === "scale"  ? "width_norm"
            : ""
        );

        if (!active || !data_key) {
            if (!data_key) {
                console.warn("Warning: Unhandled tool:", active_tool);
            }

            return;
        }

        this.add_tool_value_tool_row_input(layer, data_key);

        if (active_tool !== "move") {
            return;
        }

        this.add_tool_value_tool_row_input(layer, "anchor_norm_y", "Y:");
    };

    this.add_tool_value_tool_row_input = function (layer, data_key, label_text="") {
        var input = (function (self) {
            return self.tool_value_tool_row.AddInput(
                "",
                data_key,
                null,
                true,
                function (value) {
                    self.on_tool_value_tool_row_input_changed(layer, data_key, value);
                },
                null,
                self.can_edit,
                Boolean(label_text),
                label_text,
                true,
                false,
                false
            );
        })(this);

        input.SetText(layer.GetData()[data_key]);
    };

    this.on_tool_value_tool_row_input_changed = function (layer, key, value) {
        if (!(value.LTrim("-").replace(".", "").IsDigit())) {
            alert("Value must be a number");

            return;
        }

        if (layer.GetData()["locked"]) {
            alert("Layer is locked");

            return;
        }

        var primitive = this.editor.canvas.primitives[layer.GetID()];

        if (key === "rot_deg") {
            primitive.on_rotate(value, true);
        }

        else if (key === "width_norm") {
            primitive.on_scale(value, true);
        }

        else if (key.startsWith("anchor_norm_")) {
            primitive.data[key] = value;

            primitive.set_position();
            primitive.save_drag_state(true);
        }
    };

    this.get_top_html_size = function () {
        return (this.content_box.min_height + this.property_box_height + this.first_pane_slider.divider_size);
    };

    this.setup_property_box = function () {
        this.property_box.Flatten();
        this.property_box.SetIndentPx(Dash.Size.Padding);

        this.property_box.html.css({
            "position": "absolute",
            "inset": 0,
            "padding-top": Dash.Size.Padding * 0.5,
            "margin-bottom": 0,
            "background": this.color.Background,
            "box-sizing": "border-box",
            "border-bottom": "1px solid " + this.color.StrokeLight
        });

        if (this.override_mode) {
            this.add_tool_value_tool_row();

            return;
        }

        this.add_property_box_header();

        this.property_box.AddInput("id", "ID", "", null, false).RemoveSaveButton();
        this.property_box.AddInput("display_name", "Display Name", "", null, this.can_edit).RemoveSaveButton();

        this.add_aspect_tool_row();

        if (this.editor.editor_panel_property_box_custom_fields_cb) {
            this.editor.editor_panel_property_box_custom_fields_cb(this);
        }

        this.add_tool_value_tool_row();
        this.add_property_box_button_bar();
    };

    this.add_tool_value_tool_row = function () {
        this.tool_value_tool_row = this.property_box.AddToolRow();

        if (this.override_mode) {
            this.tool_value_tool_row.html.css({
                "margin-left": 0
            });
        }

        var label = this.tool_value_tool_row.AddLabel("Tool:", null, null, null, false);

        label.label.css({
            "padding-left": 0
        });
    };

    this.add_property_box_button_bar = function () {
        var button_bar = this.property_box.AddButtonBar("toolbar");

        if (!this.can_edit) {
            button_bar.Disable();
        }

        button_bar.html.css({
            "height": "fit-content",
            "margin-top": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding
        });

        button_bar.AddButton("Duplicate Context", this.duplicate_context);
        button_bar.AddButton("Fit Layer To Canvas", this.fit_layer_to_canvas);

        this.button_bars.push(button_bar);
    };

    this.fit_layer_to_canvas = function () {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            alert("No layer selected");

            return;
        }

        var primitive = this.editor.canvas.primitives[layer.GetID()];

        primitive.on_rotate(0);
        primitive.on_scale(1);

        primitive.data["anchor_norm_x"] = 0.5;
        primitive.data["anchor_norm_y"] = 0.5;

        primitive.set_position();
        primitive.save_drag_state(true);
    };

    this.add_property_box_header = function () {
        var header = this.property_box.AddHeader(
            this.get_data()["display_name"] || "Properties",
            "display_name"
        );

        header.ReplaceBorderWithIcon("gear").html.css({
            "margin-left": -Dash.Size.Padding * 0.5,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

        header.icon.icon_html.css({
            "padding-left": Dash.Size.Padding * 0.3
        });

        header.html.css({
            "background": this.color.Pinstripe,
            "margin-top": -Dash.Size.Padding,
            "margin-left": -Dash.Size.Padding,
            "margin-right": -Dash.Size.Padding,
            "padding-bottom": Dash.Size.Padding * 0.6,
            "padding-top": Dash.Size.Padding,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding
        });

        header.label.css({
            "flex": 2,
            "margin-right": -Dash.Size.Padding * 0.5,
            "padding-left": Dash.Size.Padding * 0.4,
            "padding-right": Dash.Size.Padding * 1.5,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });
    };

    this.duplicate_context = function () {
        // Should never happen, but just in case
        if (this.editor.preview_mode || this.override_mode) {
            return;
        }

        if (!window.confirm("Duplicate this context?\n\n(Duplicates are not tethered to the original)")) {
            return;
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    if (self.editor.on_duplicate_cb) {
                        self.editor.on_duplicate_cb(response);
                    }
                },
                self.api,
                {
                    "f": "duplicate",
                    "obj_id": self.obj_id
                }
            );
        })(this);
    };

    this.add_aspect_tool_row = function () {
        this.aspect_tool_row = this.property_box.AddToolRow();

        this.get_aspect_tool_row_input("w");

        var label = this.aspect_tool_row.AddLabel("x", Dash.Size.Padding * 0.7, null, null, false);

        label.label.css({
            "padding-left": 0
        });

        this.get_aspect_tool_row_input("h");
    };

    this.get_aspect_tool_row_input = function (key) {
        this.aspect_tool_row_inputs[key] = (function (self) {
            return self.aspect_tool_row.AddInput(
                key.Title(),
                "aspect_ratio_" + key,
                Dash.Size.ColumnWidth * 0.25,
                false,
                function (value, input, additional_data) {
                    if (isNaN(value)) {
                        alert("Aspect ratio values must be numbers");

                        return;
                    }

                    self.set_data(additional_data["data_key"], value);

                    self.editor.ResizeCanvas();
                },
                null,
                self.can_edit,
                key === "w",
                key === "w" ? "Aspect Ratio:" : "",
                false,
                false
            );
        })(this);

        this.aspect_tool_row_inputs[key].html.css({
            "background": this.color.Background
        });

        this.aspect_tool_row_inputs[key].input.css({
            "text-align": "center"
        });

        return this.aspect_tool_row_inputs[key];
    };

    this.setup_styles();
}
