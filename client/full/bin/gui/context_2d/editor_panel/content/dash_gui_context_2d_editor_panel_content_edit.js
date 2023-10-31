function DashGuiContext2DEditorPanelContentEdit (content) {
    this.content = content;

    this.contexts = {};
    this.font_combo = null;
    this.redrawing = false;
    this.floating_combos = [];
    this.html = $("<div></div>");
    this.color = this.content.color;
    this.panel = this.content.panel;
    this.editor = this.panel.editor;
    this.no_selected_layer_label = null;
    this.can_edit = this.content.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "overflow-x": "hidden"
        });

        var key;

        for (key of ["general", ...this.content.PrimitiveTypes]) {
            this.add_context(key);
        }

        for (key in this.content.edit_tab_custom_context_cbs) {
            this.add_context(key);
        }

        this.Redraw();
    };

    this.InputInFocus = function () {
        for (var key in this.contexts) {
            if (!this.contexts[key]["visible"]) {
                continue;
            }

            for (var input of this.contexts[key]["inputs"]) {
                if (input.InFocus()) {
                    return true;
                }
            }
        }

        return false;
    };

    // Called by DashGuiContext2D when combo options are received
    this.UpdateFontComboOptions = function () {
        if (!this.font_combo) {
            return;
        }

        this.font_combo.Update(
            this.editor.ComboOptions["fonts"] ? this.editor.ComboOptions["fonts"] : [{"id": "", "label_text": "ERROR"}],
            this.get_data()["font_id"] || "",
            true
        );
    };

    this.Redraw = function () {
        this.redrawing = true;

        this.hide_no_selected_layer_label();

        for (var key in this.contexts) {
            if (key === "general") {
                continue;
            }

            this.hide_context(key);
        }

        var selected_layer = this.panel.GetSelectedLayer();
        var layer_data = selected_layer ? selected_layer.GetData() : {};

        if (!selected_layer) {
            this.hide_context("general");
            this.show_no_selected_layer_label(layer_data);

            return;
        }

        this.show_context("general");  // Always show general context when a layer is selected
        this.show_context(layer_data["type"]);

        (function (self) {
            requestAnimationFrame(function () {
                self.content.FloatCombos(self);
            });

            var disabled = layer_data["hidden"] || layer_data["locked"];

            for (var key in self.contexts) {
                var context = self.contexts[key];

                if (!context["visible"]) {
                    continue;
                }

                for (var element of context["all_elements"]) {
                    var html = typeof element.html === "function" ? element : (element.html || element);

                    if (element.hasOwnProperty("Disable") && element.hasOwnProperty("Enable")) {
                        if (disabled) {
                            element.Disable();
                        }

                        else {
                            element.Enable();
                        }

                        html.css({
                            "opacity": disabled ? 0.5 : 1
                        });
                    }

                    else if (element.hasOwnProperty("SetLocked")) {
                        element.SetLocked(disabled);

                        html.css({
                            "opacity": disabled ? 0.5 : 1
                        });
                    }

                    else {
                        html.css({
                            "opacity": disabled ? 0.5 : 1,
                            "user-select": disabled ? "none" : "auto",
                            "pointer-events": disabled ? "none" : "auto"
                        });
                    }

                    if (!disabled && element.hasOwnProperty("RefreshConnections")) {
                        element.RefreshConnections();
                    }
                }
            }

            self.redrawing = false;
        })(this);
    };

    this.show_no_selected_layer_label = function (layer_data) {
        if (!this.no_selected_layer_label) {
            this.no_selected_layer_label = $("<div></div>");

            this.no_selected_layer_label.css({
                "color": this.color.Text,
                "font-family": "sans_serif_bold",
                "width": "fit-content",
                "margin-top": Dash.Size.Padding,
                "margin-bottom": "0",
                "margin-left": "auto",
                "margin-right": "auto"
            });

            this.html.append(this.no_selected_layer_label);
        }

        this.no_selected_layer_label.text(layer_data["hidden"] ? "Layer Hidden" : layer_data["locked"] ? "Layer Locked" : "No Layer Selected");
        this.no_selected_layer_label.show();
    };

    this.hide_no_selected_layer_label = function () {
        if (!this.no_selected_layer_label) {
            return;
        }

        this.no_selected_layer_label.hide();
    };

    this.show_context = function (key) {
        if (!key || !this.contexts[key] || this.contexts[key]["visible"]) {
            return;
        }

        this.contexts[key]["html"].show();

        this.contexts[key]["visible"] = true;

        if (!this.contexts[key]["initialized"]) {
            this.initialize_context(key);
        }
    };

    this.hide_context = function (key) {
        if (!key || !this.contexts[key] || !this.contexts[key]["visible"]) {
            return;
        }

        this.contexts[key]["html"].hide();

        this.contexts[key]["visible"] = false;
    };

    this.get_data = function () {
        var selected_layer = this.panel.GetSelectedLayer();

        if (!selected_layer) {
            return {};
        }

        return selected_layer.GetData();
    };

    this.get_value = function (key) {
        var selected_layer = this.panel.GetSelectedLayer();

        if (!selected_layer) {
            return "";
        }

        var value = selected_layer.GetData()[key];
        var parent_data = selected_layer.GetParentData();

        if (!Dash.Validate.Object(parent_data)) {
            return value;
        }

        if (key !== "linked" && !this.get_value("linked")) {
            return value;
        }

        var override = (parent_data["imported_context"]["layer_overrides"][selected_layer.GetID()] || {})[key] || 0;

        if (!override) {
            return value;
        }

        if (key === "opacity") {
            return override;
        }

        return value + override;
    };

    this.set_data = function (key, value, callback=null, additional_params={}) {
        var selected_layer = this.panel.GetSelectedLayer();

        if (!selected_layer) {
            return;
        }

        selected_layer.SetData(key, value, callback, additional_params);
    };

    this.add_context = function (key) {
        this.contexts[key] = {
            "html": $("<div></div>"),
            "visible": false,
            "initialized": false,
            "inputs": [],  // Any inputs that get added to these contexts need to be added to this list for external checks
            "all_elements": []
        };

        this.contexts[key]["html"].hide();

        this.html.append(this.contexts[key]["html"]);
    };

    this.initialize_context = function (context_key) {
        if (context_key === "general") {
            this.initialize_general_context(context_key);
        }

        else if (context_key === "text") {
            this.initialize_text_context(context_key);
        }

        else if (context_key === "image") {
            this.initialize_image_context(context_key);
        }

        else if (context_key === "video") {
            this.initialize_video_context(context_key);
        }

        else if (context_key === "color") {
            this.initialize_color_context(context_key);
        }

        else if (context_key in this.content.edit_tab_custom_context_cbs) {
            this.contexts[context_key]["html"].append(this.content.edit_tab_custom_context_cbs[context_key]());
        }

        else {
            console.warn("Warning: Unhandled 'Edit' tab context type:", context_key);
        }

        if (context_key in this.content.edit_tab_custom_element_configs) {
            for (var element_config of this.content.edit_tab_custom_element_configs[context_key]) {
                if (element_config["callback"]) {
                    var html = element_config["callback"]();

                    this.contexts[context_key]["html"].append(html);

                    this.contexts[context_key]["all_elements"].push(html);
                }

                else {
                    var element = this[element_config["function_name"]](...element_config["function_params"]);

                    if (element_config["return_element_callback"]) {
                        element_config["return_element_callback"](element);
                    }

                    this.contexts[context_key]["html"].append(element.hasOwnProperty("html") ? element.html : element);
                }
            }
        }

        this.contexts[context_key]["initialized"] = true;
    };

    this.initialize_color_context = function (context_key) {
        this.add_aspect_tool_row(context_key);

        var gradient_direction_combo_tool_row = this.get_combo(
            context_key,
            [
                {"id": "vertical", "label_text": "Vertical"},  // Default to this
                {"id": "horizontal", "label_text": "Horizontal"}
            ],
            "gradient_direction",
            "*Gradient Direction",
            null,
            null,
            "Only applies when using more than one color"
        );

        this.contexts[context_key]["html"].append(gradient_direction_combo_tool_row.html);

        this.add_colors(context_key);
    };

    this.add_colors = function (context_key, key_prefix="color", include_opacity=true, label_text="", total=3) {
        var label = $("<div>" + (label_text || (key_prefix.Title() + "(s)")) + ":</div>");
        var colors_container = $("<div></div>");
        var picker_container = $("<div></div>");

        colors_container.css({
            "display": "flex",
            "margin-top": Dash.Size.Padding * 0.5
        });

        label.css({
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "color": this.color.Text,
            "margin-top": Dash.Size.Padding * 0.9
        });

        var horizontal = !include_opacity && total <= 3;

        if (horizontal) {
            picker_container.css({
                "display": "flex"
            });
        }

        colors_container.append(label);
        colors_container.append(picker_container);

        for (var n of Dash.Math.Range(total)) {
            var num = n + 1;
            var data_key = key_prefix + "_" + num;
            var color_picker = this.get_color_picker(context_key, data_key, "none");

            // Hacky way to access these from the "all_elements" list when using color layers
            color_picker.input._c2d_color_num = num;
            color_picker.input._c2d_parent = color_picker;

            var css = {
                "display": "flex",
                "margin-bottom": Dash.Size.Padding * 0.5
            };

            if (horizontal && num !== total) {
                css["border-right"] = "1px solid " + this.color.PinstripeDark;
                css["margin-right"] = Dash.Size.Padding * 0.5;
            }

            color_picker.html.css(css);

            if (include_opacity) {
                var opacity_slider = this.get_slider(
                    1,
                    context_key,
                    data_key + "_opacity",
                    0.6,
                    "Opacity"
                );

                opacity_slider.html.css({
                    "margin-top": Dash.Size.Padding * 0.6
                });

                (function (opacity_slider) {
                    requestAnimationFrame(function () {
                        opacity_slider.html.css({
                            "margin-bottom": 0
                        });
                    });
                })(opacity_slider);

                color_picker.html.append(opacity_slider.html);
            }

            picker_container.append(color_picker.html);
        }

        this.contexts[context_key]["all_elements"].push(label);

        this.contexts[context_key]["html"].append(colors_container);
    };
    
    this.add_aspect_tool_row = function (context_key) {
        var tool_row = new Dash.Gui.ToolRow(this, this.get_data);

        tool_row.html.css({
            "margin-left": 0,
            "margin-bottom": 0
        });

        var w_input = this.add_numeric_tool_row_input(context_key, "aspect_ratio_w", tool_row, "aspect_inputs", "W", "Aspect Ratio:");

        this.contexts[context_key]["all_elements"].push(w_input);

        if (w_input.label) {
            this.contexts[context_key]["all_elements"].push(w_input.label);
        }

        var label = tool_row.AddLabel("x", Dash.Size.Padding * 0.7, null, null, false);

        label.label.css({
            "padding-left": 0
        });

        this.contexts[context_key]["all_elements"].push(label);

        var h_input = this.add_numeric_tool_row_input(context_key, "aspect_ratio_h", tool_row, "aspect_inputs", "H");

        this.contexts[context_key]["all_elements"].push(h_input);

        if (h_input.label) {
            this.contexts[context_key]["all_elements"].push(h_input.label);
        }

        this.contexts[context_key]["html"].append(tool_row.html);
    };

    this.add_fade_tool_row = function (context_key) {
        var tool_row = new Dash.Gui.ToolRow(this, this.get_data);

        tool_row.html.css({
            "margin-left": 0,
            "margin-bottom": 0
        });

        var start_input = this.add_numeric_tool_row_input(
            context_key,
            "fade_norm_start",
            tool_row,
            "fade_inputs",
            "Start",
            "Fade Start:",
            0,
            1
        );

        this.contexts[context_key]["all_elements"].push(start_input);

        if (start_input.label) {
            this.contexts[context_key]["all_elements"].push(start_input.label);
        }

        var end_input = this.add_numeric_tool_row_input(
            context_key,
            "fade_norm_end",
            tool_row,
            "fade_inputs",
            "End",
            "Fade End:",
            0,
            1
        );

        this.contexts[context_key]["all_elements"].push(end_input);

        if (end_input.label) {
            this.contexts[context_key]["all_elements"].push(end_input.label);
        }

        // var checkbox = (function (self) {
        //     return new Dash.Gui.Checkbox(
        //         "",
        //         self.get_data()[data_key] || false,
        //         self.color,
        //         "Toggle",
        //         self,
        //         function (checkbox) {
        //             self.set_data(data_key, checkbox.IsChecked());
        //         },
        //         label_text
        //     );
        // })(this);
        //
        // checkbox.html.css({
        //     "margin-top": Dash.Size.Padding * 0.6,
        //     "margin-left": Dash.Size.Padding
        // });
        //
        // checkbox.label.label.css({
        //     "font-family": "sans_serif_bold",
        //     "font-size": "80%"
        // });
        //

        this.contexts[context_key]["fade_checkbox"] = (function (self) {
            return tool_row.AddCheckbox(
                "Global:",
                self.get_data()["fade_global"] || false,
                function (checkbox) {
                    self.set_data("fade_global", checkbox.IsChecked());
                },
                "",
                "Toggle",
                null,
                false,
                true
            );
        })(this);

        this.contexts[context_key]["all_elements"].push(this.contexts[context_key]["fade_checkbox"]);

        this.contexts[context_key]["html"].append(tool_row.html);

        if (!this.get_value("fade_direction")) {
            (function (self) {
                requestAnimationFrame(function () {
                    start_input.Disable();

                    end_input.Disable();

                    self.contexts[context_key]["fade_checkbox"].Disable();
                });
            })(this);
        }
    };

    this.add_numeric_tool_row_input = function (context_key, data_key, tool_row, inputs_key, placeholder="", label_text="", min=null, max=null) {
        if (!(inputs_key in this.contexts[context_key])) {
            this.contexts[context_key][inputs_key] = {};
        }

        this.contexts[context_key][inputs_key][data_key] = (function (self) {
            return tool_row.AddInput(
                placeholder || data_key.Title(),
                data_key,
                Dash.Size.ColumnWidth * 0.25,
                false,
                function (value, input, additional_data) {
                    if (isNaN(value)) {
                        alert("Values must be numbers");

                        return;
                    }

                    if (min !== null && value < min) {
                        alert("Value must be at least " + min);

                        return;
                    }

                    if (max !== null && value > max) {
                        alert("Value cannot exceed " + max);

                        return;
                    }

                    self.set_data(additional_data["data_key"], value);
                },
                null,
                self.can_edit,
                Boolean(label_text),
                label_text,
                false,
                false
            );
        })(this);

        this.contexts[context_key][inputs_key][data_key].html.css({
            "background": this.color.Background
        });

        this.contexts[context_key][inputs_key][data_key].input.css({
            "text-align": "center"
        });

        return this.contexts[context_key][inputs_key][data_key];
    };

    // Fresh every time
    this.get_precomp_combo_options = function () {
        var options = [{"id": "", "label_text": "Unspecified (Inherit)"}];
        var precomps = this.editor.get_data()["precomps"];

        for (var num in precomps) {
            var precomp = precomps[num];

            options.push({
                "id": precomp["asset_path"],
                "label_text": precomp["display_name"]
            });
        }

        return options;
    };

    this.initialize_general_context = function (context_key) {
        var blend_mode_combo_tool_row = this.get_combo(
            context_key,
            [
                {"id": "", "label_text": "Normal"},
                {"id": "multiply", "label_text": "Multiply"},
                {"id": "additive", "label_text": "Additive"},
                {"id": "overlay", "label_text": "Overlay"}
            ],
            "blend_mode",
            "*Blend Mode",
            null,
            null,
            "Blend Mode cannot be visualized in this editor"
        );

        var gradient_direction_combo_tool_row = this.get_combo(
            context_key,
            [
                {"id": "", "label_text": "Not Selected"},
                {"id": "vertical", "label_text": "Vertically"},
                {"id": "horizontal", "label_text": "Horizontally"}
            ],
            "invert",
            "Invert/Mirror"
        );

        var fade_direction_combo_tool_row = (function (self) {
            return self.get_combo(
                context_key,
                [
                    {"id": "", "label_text": "No Fade"},
                    {"id": "to_right", "label_text": "Left to Right"},
                    {"id": "to_left", "label_text": "Right to Left"},
                    {"id": "to_bottom", "label_text": "Top to Bottom"},
                    {"id": "to_top", "label_text": "Bottom to Top"}
                ],
                "fade_direction",
                "",
                function (selected_option) {
                    for (var key in self.contexts[context_key]["fade_inputs"]) {
                        if (selected_option["id"]) {
                            self.contexts[context_key]["fade_inputs"][key].Enable();
                        }

                        else {
                            self.contexts[context_key]["fade_inputs"][key].Disable();
                        }
                    }

                    if (selected_option["id"]) {
                        self.contexts[context_key]["fade_checkbox"].Enable();
                    }

                    else {
                        self.contexts[context_key]["fade_checkbox"].Disable();
                    }
                }
            );
        })(this);

        var slider = this.get_slider(1, context_key, "opacity", 1.05);

        slider.html.css({
            "margin-top": Dash.Size.Padding
        });

        if (!this.editor.override_mode) {
            var precomp_combo_tool_row = this.get_combo(
                context_key,
                this.get_precomp_combo_options(),
                "precomp_tag",
                "Pre-Comp Tag"
            );

            this.contexts[context_key]["html"].append(precomp_combo_tool_row.html);
        }

        this.contexts[context_key]["html"].append(blend_mode_combo_tool_row.html);
        this.contexts[context_key]["html"].append(gradient_direction_combo_tool_row.html);
        this.contexts[context_key]["html"].append(fade_direction_combo_tool_row.html);

        this.add_fade_tool_row(context_key);

        this.contexts[context_key]["html"].append(slider.html);
    };

    this.initialize_text_context = function (context_key) {
        var kerning_slider = this.get_slider(
            0,
            context_key,
            "kerning",
            1.05,
            "",
            0.5,
            1.0,
            -1.0
        );

        var thickness_slider = this.get_slider(
            0,
            context_key,
            "stroke_thickness",
            0.735,
            "",
            0,
            0.2
        );

        var font_color_picker = this.get_color_picker(context_key, "font_color", "Font\nColor");
        var stroke_color_picker = this.get_color_picker(context_key, "stroke_color", "Stroke\nColor");
        var container = $("<div></div>");

        container.css({
            "display": "flex"
        });

        stroke_color_picker.label.css({
            "margin-left": Dash.Size.Padding
        });

        container.append(font_color_picker.html);
        container.append(stroke_color_picker.html);

        var checkbox = this.get_checkbox(context_key, "text_caps", "ALL-CAPS:");

        container.append(checkbox.html);

        // This could be on the same row as the color picker, and actually looks better
        // that way, but some font names will be long, so best this is on its own row
        var font_combo_tool_row = this.get_combo(
            context_key,
            this.editor.ComboOptions ? (
                this.editor.ComboOptions["fonts"] ? this.editor.ComboOptions["fonts"] : [{"id": "", "label_text": "ERROR"}]
            ) : [{"id": "", "label_text": "Loading..."}],
            "font_id",
            "Font"
        );

        var alignment_combo_tool_row = this.get_combo(
            context_key,
            [
                {"id": "", "label_text": "Center"},
                {"id": "left", "label_text": "Left"},
                {"id": "right", "label_text": "Right"}
            ],
            "text_alignment",
            "Alignment"
        );

        this.contexts[context_key]["html"].append(kerning_slider.html);
        this.contexts[context_key]["html"].append(thickness_slider.html);
        this.contexts[context_key]["html"].append(container);
        this.contexts[context_key]["html"].append(font_combo_tool_row.html);
        this.contexts[context_key]["html"].append(alignment_combo_tool_row.html);
    };

    this.get_checkbox = function (context_key, data_key, label_text) {
        var checkbox = (function (self) {
            return new Dash.Gui.Checkbox(
                "",
                self.get_data()[data_key] || false,
                self.color,
                "Toggle",
                self,
                function (checkbox) {
                    self.set_data(data_key, checkbox.IsChecked());
                },
                label_text
            );
        })(this);

        checkbox.html.css({
            "margin-top": Dash.Size.Padding * 0.6,
            "margin-left": Dash.Size.Padding
        });

        checkbox.label.label.css({
            "font-family": "sans_serif_bold",
            "font-size": "80%"
        });

        this.contexts[context_key]["all_elements"].push(checkbox);

        return checkbox;
    };

    this.initialize_video_context = function (context_key) {
        this.initialize_media_context(context_key);

        // Add any gui below that is not shared across all media types

        this.add_mask_toolbar(context_key);  // As of writing, this is restricted to video
        this.add_replacement_media_button(context_key);
    };

    this.initialize_image_context = function (context_key) {
        this.initialize_media_context(context_key);

        // Add any gui below that is not shared across all media types

        this.add_replacement_media_button(context_key);
    };

    this.initialize_media_context = function (context_key) {
        var contrast_slider = this.get_slider(
            1,
            context_key,
            "contrast",
            1.02,
            "",
            0.5,
            2.0
        );

        var saturation_slider = this.get_slider(
            1,
            context_key,
            "saturation",
            0.96,
            "",
            0.5,
            2.0
        );

        var brightness_slider = this.get_slider(
            1,
            context_key,
            "brightness",
            0.95,
            "",
            0.5,
            2.0
        );

        this.contexts[context_key]["html"].append(contrast_slider.html);
        this.contexts[context_key]["html"].append(saturation_slider.html);
        this.contexts[context_key]["html"].append(brightness_slider.html);

        this.add_tint_row(context_key);
        this.add_colors(context_key, "multi_tone_color", false, "Multi-Tone");
    };

    this.add_replacement_media_button = function (context_key) {
        var upload_button = this.get_upload_button(
            context_key,
            "Upload Replacement " + context_key.Title(),
            this.on_replacement_media,
            {
                "f": "replace_layer_media",
                "c2d_id": this.editor.c2d_id,
                "layer_id": this.panel.layers_box.GetSelectedID()
            }
        );

        this.contexts[context_key]["html"].append(upload_button.html);
    };

    this.on_replacement_media = function (response, button) {
        button.SetLoading(false);
        button.Enable();

        if (!Dash.Validate.Response(response)) {
            return;
        }

        this.editor.data = response;

        var primitive = this.editor.canvas.last_selected_primitive;

        if (primitive) {
            primitive.ReloadData();

            primitive.layer.UpdateLabel();

            // Resize based on updated aspect
            primitive.set_init();
            primitive.redraw_media();
        }
    };

    // TODO: break this up
    this.add_mask_toolbar = function (context_key) {
        var toolbar = new Dash.Layout.Toolbar(this);

        toolbar.html.css({
            "background": "none",
            "padding": 0
        });

        toolbar.RemoveStrokeSep();
        toolbar.DisablePaddingRefactoring();

        var label = toolbar.AddLabel("Mask:", false, null, false);

        label.label.css({
            "font-size": "80%"
        });

        var mask = this.get_data()["mask"] || {};
        var width = toolbar.height - 1;
        var height = width;

        if (Dash.Validate.Object(mask)) {
            if (mask["aspect"] > 1) {
                if (mask["aspect"] > 3) {
                    height = width / mask["aspect"];
                }

                else {
                    width *= mask["aspect"];
                }
            }

            else if (mask["aspect"] < 1) {
                width *= mask["aspect"];
            }
        }

        var checker_url = (
            "https://dash.guide/github/dash/client/full/bin/img/checker_bg_"
            + (Dash.Color.IsDark(this.color) ? "light" : "dark") + ".png"
        );

        var preview = Dash.File.GetImagePreview(
            mask["thumb_url"] || mask["thumb_png_url"] || mask["orig_url"] || mask["url"] || checker_url
            , height
            , width
        );

        preview.css({
            "border-radius": Dash.Size.BorderRadius,
            "user-select": "none",
            "pointer-events": "none",
            "margin-right": Dash.Size.Padding
        });

        toolbar.AddHTML(preview);

        var [upload_button, download_button, delete_button] = (function (self) {
            return [
                toolbar.AddIconButton(
                    "upload",
                    function (response, button) {
                        button.SetLoading(false);
                        button.Enable();

                        if (!Dash.Validate.Response(response)) {
                            return;
                        }

                        self.editor.data = response;

                        var mask = self.get_data()["mask"] || {};
                        var url = mask["thumb_url"] || mask["thumb_png_url"] || mask["orig_url"] || mask["url"];

                        if (!url) {
                            alert("Upload failed for an unexpected reason, please try again.");

                            return;
                        }

                        preview.css({
                            "background-image": "url(" + url + ")"
                        });

                        if (self.editor.canvas.last_selected_primitive) {
                            self.editor.canvas.last_selected_primitive.Update("mask");
                        }
                    },
                    null,
                    null,
                    toolbar.height,
                    0.6,
                    true
                ),
                toolbar.AddIconButton(
                    "download",
                    function (button) {
                        var mask = self.get_data()["mask"] || {};
                        var url = mask["url"] || mask["orig_url"];

                        if (!url) {
                            alert("No file found");

                            return;
                        }

                        button.SetLoading(true);
                        button.Disable();

                        Dash.Gui.OpenFileURLDownloadDialog(
                            url,
                            "",
                            function () {
                                button.SetLoading(false);
                                button.Enable();
                            }
                        );
                    },
                    null,
                    null,
                    toolbar.height,
                    0.6
                ),
                toolbar.AddIconButton(
                    "trash",
                    function (button) {
                        if (!Dash.Validate.Object(self.get_data()["mask"])) {
                            alert("No file found");

                            return;
                        }

                        button.SetLoading(true);
                        button.Disable();

                        self.set_data(
                            "mask",
                            {},
                            function () {
                                button.SetLoading(false);
                                button.Enable();

                                preview.css({
                                    "background-image": "url(" + checker_url + ")"
                                });
                            },
                            {"file_op_key": "mask"}
                        );
                    },
                    null,
                    null,
                    toolbar.height,
                    0.6
                )
            ];
        })(this);

        upload_button.SetFileUploader(
            this.editor.api,
            {
                "f": "upload_layer_mask",
                "c2d_id": this.editor.obj_id,
                "layer_id": this.panel.layers_box.GetSelectedID()
            },
            function () {
                upload_button.SetLoading(true);
                upload_button.Disable();
            },
            {},
            true
        );

        this.contexts[context_key]["all_elements"].push(label);
        this.contexts[context_key]["all_elements"].push(preview);
        this.contexts[context_key]["all_elements"].push(upload_button);
        this.contexts[context_key]["all_elements"].push(download_button);
        this.contexts[context_key]["all_elements"].push(delete_button);

        this.contexts[context_key]["html"].append(toolbar.html);
    };

    this.add_tint_row = function (context_key) {
        var container = $("<div></div>");

        container.css({
            "display": "flex",
            "margin-top": Dash.Size.Padding * 0.5
        });

        var color_picker = this.get_color_picker(context_key, "tint_color", "Tint Color");

        var mode_combo_tool_row = this.get_combo(
            context_key,
            [
                {"id": "", "label_text": "Default"},
                {"id": "replace", "label_text": "Replace"}
            ],
            "tint_mode",
            "Mode",
            null,
            null,
            "When using 'Replace' mode, you can best visualize it in this editor by using an asset that is white",
            container
        );

        mode_combo_tool_row.html.css({
            "margin-left": Dash.Size.Padding * 0.7,
            "margin-top": Dash.Size.Padding * 0.6,
            "border": "none"
        });

        container.append(color_picker.html);
        container.append(mode_combo_tool_row.html);

        this.contexts[context_key]["html"].append(container);
    };

    this.get_input = function (context_key, data_key, label_text="") {
        if (!label_text) {
            label_text = data_key.Title();
        }

        var input = (function (self) {
            return new Dash.Gui.InputRow(
                label_text,
                self.get_data()[data_key] || "",
                label_text,
                "",
                function (input) {
                    self.set_data(data_key, input.Text());
                },
                self,
                self.color,
                data_key
            );
        })(this);

        input.RemoveSaveButton();

        this.contexts[context_key]["all_elements"].push(input);

        return input;
    };

    this.get_upload_button = function (context_key, label_text, callback, params, css={}, return_button=true) {
        var button = this.get_button(context_key, label_text, callback);

        button.SetFileUploader(
            this.editor.api,
            params,
            function () {
                button.SetLoading(true);
                button.Disable();
            },
            css,
            return_button
        );

        return button;
    };

    this.get_button = function (context_key, label_text, callback) {
        var button = (function (self) {
            return new Dash.Gui.Button(
                label_text,
                callback,
                self,
                self.color,
                {"style": "toolbar"}
            );
        })(this);

        button.html.css({
            "margin-right": 0,
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        if (!this.can_edit) {
            button.Disable();
        }

        this.contexts[context_key]["all_elements"].push(button);

        return button;
    };

    this.get_combo = function (context_key, options, data_key, label_text="", extra_cb=null, on_draw=null, hover_text="", parent=null) {
        var starting_value = this.get_data()[data_key] || "";

        var tool_row = (function (self) {
            return self.content.GetCombo(
                label_text || data_key.Title(),
                options,
                function (selected_option) {
                    self.set_data(
                        data_key,
                        selected_option["id"],
                        extra_cb ? function () {
                            extra_cb(selected_option, self);
                        } : null
                    );
                },
                starting_value
            );
        })(this);

        this.floating_combos.push({
            "tool_row": tool_row,
            "parent": parent
        });

        if (data_key === "font_id") {
            this.font_combo = tool_row.elements.Last().combo;
        }

        this.contexts[context_key]["all_elements"].push(tool_row.elements[0]);
        this.contexts[context_key]["all_elements"].push(tool_row.elements[1]);

        if (on_draw) {
            this._on_draw(on_draw, [starting_value, this]);
        }

        if (hover_text) {
            var combo_label = tool_row.elements[0];

            combo_label.html.css({
                "cursor": "help"
            });

            combo_label.html.attr("title", hover_text);
        }

        return tool_row;
    };

    this.get_color_picker = function (context_key, data_key, label_text="", include_clear_button=true) {
        var color_picker = (function (self) {
            return Dash.Gui.GetColorPicker(
                self,
                function (color_val) {
                    if (!color_val) {
                        return;
                    }

                    self.set_data(data_key, color_val);
                },
                (label_text || data_key.Title()) + ":",
                self.color,
                self.get_data()[data_key] || "#000000",
                include_clear_button,
                function () {
                    self.set_data(data_key, "");
                }
            );
        })(this);

        if (color_picker.label) {
            if (!(label_text.includes("\n"))) {
                color_picker.label.css({
                    "top": Dash.Size.Padding * 0.9
                });
            }

            this.contexts[context_key]["all_elements"].push(color_picker.label);
        }

        if (!this.can_edit) {
            color_picker.html.css({
                "user-select": "none",
                "pointer-events": "none"
            });
        }

        this.contexts[context_key]["all_elements"].push(color_picker.input);

        if (include_clear_button) {
            this.contexts[context_key]["all_elements"].push(color_picker.clear_button);
        }

        return color_picker;
    };

    this.get_slider = function (
        default_value, context_key, data_key, width_mult, label_text="",
        reset_value=null, end_range=1.0, start_range=0, hover_text=""
    ) {
        var value = this.get_value(data_key);

        return (function (self) {
            var slider = new Dash.Gui.Slider(
                self.color,
                (label_text || data_key.Title()) + ":",
                function (value) {
                    self.set_data(data_key, value);
                },
                start_range,
                end_range,
                (value || value === 0) ? value : default_value,
                Dash.Size.ColumnWidth * width_mult
            );

            requestAnimationFrame(function () {
                self.style_slider(
                    slider,
                    reset_value !== null ? reset_value : default_value,
                    context_key
                );
            });

            if (hover_text) {
                slider.label.attr("title", hover_text);
            }

            self.contexts[context_key]["all_elements"].push(slider);

            return slider;
        })(this);
    };

    this.style_slider = function (slider, default_value, context_key) {
        slider.FireCallbackOnUpInsteadOfMove();
        slider.SetMaxValueLabelLength(5);
        slider.StyleForPropertyBox(0);
        slider.AddResetToDefaultButton(default_value, "Reset");

        if (!this.can_edit) {
            slider.Disable();
        }

        // Ideally, we use this instead of the below slop, but it's not fully worked out yet
        // slider.FlexInsteadOfAbsolute();

        slider.label.css({
            "padding-left": 0
        });

        slider.reset_button.label.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5
        });

        slider.slider.css({
            "left": parseInt(slider.slider.css("left")) - (Dash.Size.Padding * 0.5)
        });

        slider.value_label.html.css({
            "left": parseInt(slider.value_label.html.css("left")) - (Dash.Size.Padding * 1.5)
        });

        slider.reset_button.html.css({
            "left": parseInt(slider.reset_button.html.css("left")) - (Dash.Size.Padding * 2.5)
        });

        slider.html.css({
            "margin-left": 0,
            "background": ""
        });

        this.contexts[context_key]["inputs"].push(slider.value_label);
    };

    this._on_draw = function (callback, params) {
        if (this.redrawing) {
            (function (self) {
                setTimeout(
                    function () {
                        self._on_draw(callback, params);
                    },
                    10
                );
            })(this);

            return;
        }

        callback(...params);
    };

    this.setup_styles();
}
