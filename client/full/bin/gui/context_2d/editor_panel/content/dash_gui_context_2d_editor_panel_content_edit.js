function DashGuiContext2DEditorPanelContentEdit (content) {
    this.content = content;

    this.contexts = {};
    this.font_combo = null;
    this.html = $("<div></div>");
    this.color = this.content.color;
    this.panel = this.content.panel;
    this.editor = this.panel.editor;
    this.no_selected_layer_label = null;
    this.font_name_data_key = "font_name";
    this.can_edit = this.content.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "overflow-x": "hidden"
        });

        for (var key of ["general", ...this.content.PrimitiveTypes]) {
            this.add_context(key);
        }

        this.redraw();
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
            this.get_data()[this.font_name_data_key] || "",
            true
        );
    };

    this.redraw = function () {
        this.hide_no_selected_layer_label();

        for (var key in this.contexts) {
            if (key === "general") {
                continue;
            }

            this.hide_context(key);
        }

        var selected_layer = this.panel.GetSelectedLayer();

        if (!selected_layer) {
            this.hide_context("general");
            this.show_no_selected_layer_label();

            return;
        }

        this.show_context("general");  // Always show general context when a layer is selected
        this.show_context(selected_layer.GetPrimitiveData()["type"]);
    };

    this.show_no_selected_layer_label = function () {
        if (!this.no_selected_layer_label) {
            this.no_selected_layer_label = $("<div>No Layer Selected</div>");

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
            "inputs": []  // Any inputs that get added to these contexts need to be added to this list
        };

        this.contexts[key]["html"].hide();

        this.html.append(this.contexts[key]["html"]);
    };

    this.initialize_context = function (key) {
        if (key === "general") {
            this.contexts[key]["html"].append(this.get_slider(1, key, "opacity", 1.05).html);
        }

        else if (key === "text") {
            this.contexts[key]["html"].append(this.get_color_picker("font_color", "Color").html);

            // This could be on the same row as the color picker, and actually looks better
            // that way, but some font names will be long, so best this is on its own row
            var tool_row = (function (self) {
                 return self.content.GetCombo(
                     "Font",
                    self.editor.ComboOptions ? (
                        self.editor.ComboOptions["fonts"] ? self.editor.ComboOptions["fonts"] : [{"id": "", "label_text": "ERROR"}]
                    ) : [{"id": "", "label_text": "Loading..."}],
                    function (selected_option) {
                        self.set_data(self.font_name_data_key, selected_option["id"]);
                    },
                    self.get_data()[self.font_name_data_key] || ""
                );
            })(this);

            this.font_combo = tool_row.elements.Last().combo;

            this.contexts[key]["html"].append(tool_row.html);
        }

        else if (key === "image") {
            this.contexts[key]["html"].append(this.get_slider(0.5, key, "contrast", 1.02).html);
            this.contexts[key]["html"].append(this.get_slider(0.5, key, "brightness", 0.95).html);

            // TODO: button to download original image
        }

        else {
            console.warn("Warning: Unhandled 'Edit' tab context type:", key);
        }

        this.contexts[key]["initialized"] = true;
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

        var css = {"margin-bottom": Dash.Size.Padding};

        if (!this.can_edit) {
            css["user-select"] = "none";
            css["pointer-events"] = "none";
        }

        color_picker.html.css(css);

        return color_picker;
    };

    this.get_slider = function (default_value, context_key, data_key, width_mult, label_text="") {
        return (function (self) {
            var slider = new Dash.Gui.Slider(
                self.color,
                (label_text || data_key.Title()) + ":",
                function (value) {
                    self.set_data(data_key, value);
                },
                0.0,
                1.0,
                self.get_data()[data_key] || default_value,
                Dash.Size.ColumnWidth * width_mult
            );

            requestAnimationFrame(function () {
                self.style_slider(slider, default_value, context_key);
            });

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
