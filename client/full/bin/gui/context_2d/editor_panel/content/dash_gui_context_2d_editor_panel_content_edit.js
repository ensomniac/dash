function DashGuiContext2DEditorPanelContentEdit (content) {
    this.content = content;

    this.contexts = {};
    this.font_combo = null;
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
        this.hide_no_selected_layer_label();

        for (var key in this.contexts) {
            if (key === "general") {
                continue;
            }

            this.hide_context(key);
        }

        var selected_layer = this.panel.GetSelectedLayer();
        var layer_data = selected_layer ? selected_layer.GetData() : {};

        if (!selected_layer || layer_data["hidden"] || layer_data["locked"]) {
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

    this.set_data = function (key, value) {
        var selected_layer = this.panel.GetSelectedLayer();

        if (!selected_layer) {
            return;
        }

        selected_layer.SetData(key, value);
    };

    this.add_context = function (key) {
        this.contexts[key] = {
            "html": $("<div></div>"),
            "visible": false,
            "initialized": false,
            "inputs": []  // Any inputs that get added to these contexts need to be added to this list for external checks
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

        else if (context_key in this.content.edit_tab_custom_context_cbs) {
            this.contexts[context_key]["html"].append(this.content.edit_tab_custom_context_cbs[context_key]());
        }

        else {
            console.warn("Warning: Unhandled 'Edit' tab context type:", context_key);
        }

        if (context_key in this.content.edit_tab_custom_element_configs) {
            for (var element_config of this.content.edit_tab_custom_element_configs[context_key]) {
                if (element_config["callback"]) {
                    this.contexts[context_key]["html"].append(element_config["callback"]());
                }

                else {
                    var element = this[element_config["function_name"]](...element_config["function_params"]);

                    this.contexts[context_key]["html"].append(element.hasOwnProperty("html") ? element.html : element);
                }
            }
        }

        this.contexts[context_key]["initialized"] = true;
    };

    this.initialize_general_context = function (context_key) {
        var combo_tool_row = this.get_combo(
            [
                {"id": "", "label_text": "Normal"},
                {"id": "multiply", "label_text": "Multiply"},
                {"id": "additive", "label_text": "Additive"},
                {"id": "overlay", "label_text": "Overlay"},
                {"id": "color", "label_text": "Color"}
            ],
            "blend_mode",
            "*Blend Mode"
        );

        combo_tool_row.html.css({
            "margin-bottom": Dash.Size.Padding
        });

        var combo_label = combo_tool_row.elements[0];

        combo_label.html.css({
            "cursor": "help"
        });

        combo_label.html.attr("title", "Blend Mode cannot be visualized in this editor");

        this.contexts[context_key]["html"].append(combo_tool_row.html);
        this.contexts[context_key]["html"].append(this.get_slider(1, context_key, "opacity", 1.05).html);
    };

    this.initialize_text_context = function (context_key) {
        this.contexts[context_key]["html"].append(this.get_slider(
            0,
            context_key,
            "stroke_thickness",
            0.735,
            "",
            0,
            0.1

        ).html);

        var font_color_picker = this.get_color_picker("font_color", "Font\nColor");
        var stroke_color_picker = this.get_color_picker("stroke_color", "Stroke\nColor");
        var container = $("<div></div>");

        container.css({
            "display": "flex"
        });

        stroke_color_picker.label.css({
            "margin-left": Dash.Size.Padding
        });

        container.append(font_color_picker.html);
        container.append(stroke_color_picker.html);

        var checkbox = (function (self) {
            return new Dash.Gui.Checkbox(
                "",
                self.get_data()["text_caps"] || false,
                self.color,
                "Toggle",
                self,
                function (checkbox) {
                    self.set_data("text_caps", checkbox.IsChecked());
                },
                "ALL-CAPS:"
            );
        })(this);

        checkbox.html.css({
            "margin-top": Dash.Size.Padding * 0.6,
            "margin-left": Dash.Size.Padding
        });

        checkbox.label.label.css({
            "font-family": "sans_serif_bold",
            "font-size": "80%",
        });

        container.append(checkbox.html);

        this.contexts[context_key]["html"].append(container);

        // This could be on the same row as the color picker, and actually looks better
        // that way, but some font names will be long, so best this is on its own row
        this.contexts[context_key]["html"].append(this.get_combo(
            this.editor.ComboOptions ? (
                this.editor.ComboOptions["fonts"] ? this.editor.ComboOptions["fonts"] : [{"id": "", "label_text": "ERROR"}]
            ) : [{"id": "", "label_text": "Loading..."}],
            "font_id",
            "Font"
        ).html);

        this.contexts[context_key]["html"].append(this.get_combo(
            [
                {"id": "", "label_text": "Center"},
                {"id": "left", "label_text": "Left"},
                {"id": "right", "label_text": "Right"}
            ],
            "text_alignment",
            "Alignment"
        ).html);
    };

    this.initialize_image_context = function (context_key) {
        this.contexts[context_key]["html"].append(this.get_slider(
            1,
            context_key,
            "contrast",
            1.02,
            "",
            0.5,
            2.0
        ).html);

        this.contexts[context_key]["html"].append(this.get_slider(
            1,
            context_key,
            "brightness",
            0.95,
            "",
            0.5,
            2.0
        ).html);

        var color_container = $("<div></div>");

        color_container.css({
            "display": "flex"
        });

        color_container.append(this.get_color_picker("tint_color", "Tint Color").html);

        var button = (function (self) {
            return new Dash.Gui.IconButton(
                "close_square",
                function () {
                    self.set_data("tint_color", "");
                },
                self,
                self.color,
                {
                    "container_size": Dash.Size.ButtonHeight,
                    "size_mult": 0.5
                }
            );
        })(this);

        button.SetIconColor(this.color.AccentBad);

        button.html.css({
            "padding-top": Dash.Size.Padding * 0.1
        });

        color_container.append(button.html);

        this.contexts[context_key]["html"].append(color_container);
    };

    this.get_input = function (data_key, label_text="") {
        if (!label_text) {
            label_text = data_key.Title();
        }

        return (function (self) {
            var input =  new Dash.Gui.InputRow(
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

            input.RemoveSaveButton();

            return input;
        })(this);
    };

    this.get_combo = function (options, data_key, label_text="") {
        var tool_row = (function (self) {
            return self.content.GetCombo(
                label_text || data_key.Title(),
                options,
                function (selected_option) {
                    self.set_data(data_key, selected_option["id"]);
                },
                self.get_data()[data_key] || ""
            );
        })(this);

        this.floating_combos.push({
            "tool_row": tool_row
        });

        if (data_key === "font_id") {
            this.font_combo = tool_row.elements.Last().combo;
        }

        return tool_row;
    };

    this.get_color_picker = function (data_key, label_text="") {
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
                self.get_data()[data_key] || "#000000"
            );
        })(this);

        if (!(label_text.includes("\n"))) {
            color_picker.label.css({
                "top": -Dash.Size.Padding * 0.6
            });
        }

        var css = {"margin-bottom": Dash.Size.Padding};

        if (!this.can_edit) {
            css["user-select"] = "none";
            css["pointer-events"] = "none";
        }

        color_picker.html.css(css);

        return color_picker;
    };

    this.get_slider = function (default_value, context_key, data_key, width_mult, label_text="", reset_value=null, end_range=1.0, start_range=0.0, hover_text="") {
        return (function (self) {
            var slider = new Dash.Gui.Slider(
                self.color,
                (label_text || data_key.Title()) + ":",
                function (value) {
                    self.set_data(data_key, value);
                },
                start_range,
                end_range,
                self.get_value(data_key) || default_value,
                Dash.Size.ColumnWidth * width_mult
            );

            requestAnimationFrame(function () {
                self.style_slider(slider, reset_value || default_value, context_key);
            });

            if (hover_text) {
                slider.label.attr("title", hover_text);
            }

            return slider;
        })(this);
    };

    this.style_slider = function (slider, default_value, context_key) {
        slider.FireCallbackOnUpInsteadOfMove();
        slider.SetMaxValueLabelLength(5);
        slider.StyleForPropertyBox(0);
        slider.AddResetToDefaultButton(default_value, "Reset");

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

        if (!this.can_edit) {
            slider.Disable();
        }

        slider.html.css({
            "margin-left": 0,
            "margin-bottom": Dash.Size.Padding
        });

        this.contexts[context_key]["inputs"].push(slider.value_label);
    };

    this.setup_styles();
}
