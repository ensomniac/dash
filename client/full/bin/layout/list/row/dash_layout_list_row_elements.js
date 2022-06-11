/**@member DashLayoutListRow*/

function DashLayoutListRowElements () {
    this.add_default_column = function (column_config_data, index) {
        column_config_data["left_aligned"] = true;

        var column = new DashLayoutListRowColumn(this, column_config_data, index, this.color);

        this.column_box.append(column.html);

        this.columns["default"].push({
            "obj": column,
            "column_config_data": column_config_data
        });
    };

    this.add_spacer_column = function (column_config_data) {
        if (column_config_data["header_only"] && !this.is_header) {
            return;
        }

        var spacer = this.get_spacer();

        this.column_box.append(spacer);

        this.columns["spacers"].push({
            "obj": spacer,
            "column_config_data": column_config_data
        });
    };

    this.add_divider_column = function (column_config_data) {
        var divider = this.get_divider(column_config_data);

        this.column_box.append(divider);

        this.columns["dividers"].push({
            "obj": divider,
            "column_config_data": column_config_data
        });
    };

    this.add_combo_column = function (column_config_data) {
        var combo = this.get_combo(column_config_data);

        this.column_box.append(combo.html);

        this.columns["combos"].push({
            "obj": combo,
            "column_config_data": column_config_data
        });
    };

    this.add_input_column = function (column_config_data) {
        var input = this.get_input(column_config_data);

        this.column_box.append(input.html);

        this.columns["inputs"].push({
            "obj": input,
            "column_config_data": column_config_data
        });
    };

    this.add_icon_button_column = function (column_config_data) {
        var icon_button = this.get_icon_button(column_config_data);

        this.column_box.append(icon_button.html);

        this.columns["icon_buttons"].push({
            "obj": icon_button,
            "column_config_data": column_config_data
        });
    };

    this.get_spacer = function () {
        var spacer = $("<div></div>");

        spacer.css({
            "height": this.height,
            "flex-grow": 2,
            "flex-shrink": 2
        });

        return spacer;
    };

    this.get_divider = function (column_config_data) {
        var divider_line = $("<div></div>");

        divider_line.css({
            "background": this.color.AccentGood,
            "width": Dash.Size.Padding * 0.3,
            "margin": "none",
            "flex": "none"
        });

        if (column_config_data["css"]) {
            divider_line.css(column_config_data["css"]);
        }

        if (this.is_header) {
            divider_line.css({
                "opacity": 0
            });
        }

        return divider_line;
    };

    this.get_combo = function (column_config_data) {
        var read_only = this.is_header || this.is_sublist;
        var label = column_config_data["options"]["label_text"] || column_config_data["options"]["display_name"] || "";

        var combo = new Dash.Gui.Combo (
            label,
            column_config_data["options"]["callback"] || column_config_data["on_click_callback"] || null,
            column_config_data["options"]["binder"] || null,
            this.is_header && label ? [{"id": label, "label_text": label}] : column_config_data["options"]["combo_options"] || null,
            this.get_data_for_key(column_config_data, "", true),
            this.color,
            {
                "style": "row",
                "read_only": read_only,
                "additional_data": {
                    "row_id": this.id,
                    "row": this,  // For revolving lists, use this instead of relying on row_id
                    "column_index": this.columns["combos"].length
                }
            }
        );

        combo.html.css({
            "height": this.height,
            "width": column_config_data["width"]
        });

        combo.label.css({
            "height": this.height,
            "line-height": this.height + "px"
        });

        if (column_config_data["css"]) {
            combo.html.css(column_config_data["css"]);
        }

        if (read_only) {
            if (this.is_header && label) {
                // TODO: need a title thing up here, use default column element?
                combo.label.css({
                    "font-family": "sans_serif_bold",
                    "color": this.color.Stroke
                });
            }

            else {
                // Keep the container so the row stays properly aligned, but don't show the actual element
                combo.html.css({
                    "opacity": 0
                });
            }

            this.prevent_events_for_header_placeholder(combo.html);
        }

        return combo;
    };

    this.get_input = function (column_config_data) {
        var color = column_config_data["options"]["color"] || this.color;
        var placeholder_label = column_config_data["options"]["placeholder_label"] || "";
        var input = new Dash.Gui.Input(placeholder_label, color);

        var css = {
            "background": "none",
            "height": this.height * 0.9,
            "margin-top": Dash.Size.Padding * 0.1,
            "box-shadow": "none"
        };

        if (column_config_data["width"]) {
            css["width"] = column_config_data["width"];
        }

        if (this.is_header) {
            css["border"] = "none";
        }

        else {
            css["border"] = "1px solid " + this.color.Pinstripe;

            if (column_config_data["css"]) {
                css = {
                    ...css,
                    ...column_config_data["css"]
                };
            }
        }

        input.html.css(css);

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            input.input.remove();

            if (placeholder_label) {
                input.html.css({
                    "color": color.Text,
                    "font-family": "sans_serif_bold"
                });

                input.html.text(placeholder_label);
            }

            this.prevent_events_for_header_placeholder(input.html);

            return input;
        }

        input.input.css({
            "height": this.height * 0.9,
            "line-height": (this.height * 0.9) + "px",
            "padding-left": Dash.Size.Padding * 0.35
        });

        var starting_value = column_config_data["options"]["default_value"] || this.get_data_for_key(column_config_data);

        if (starting_value) {
            input.SetText(starting_value.toString());
        }

        if (column_config_data["options"]["callback"] && column_config_data["options"]["binder"]) {
            (function (self, column_config_data, input) {
                input.SetOnSubmit(
                    function () {
                        var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                        callback(self.id, input.Text(), column_config_data, self, input);
                    },
                    column_config_data["options"]["binder"]
                );

                input.EnableAutosave();
            })(this, column_config_data, input);
        }

        if (column_config_data["options"]["disable_autosave"]) {
            input.DisableAutosave();
        }

        if (column_config_data["can_edit"] === false) {
            input.SetLocked(true);
        }

        return input;
    };

    this.get_icon_button = function (column_config_data) {
        var icon_button = (function (self) {
            return new Dash.Gui.IconButton(
                column_config_data["options"]["icon_name"],
                function () {
                    var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                    callback(self.id);
                },
                column_config_data["options"]["binder"],
                column_config_data["options"]["color"] || self.color,
                column_config_data["options"]["options"] || {}
            );
        })(this);

        icon_button.html.css({
            "height": this.height
        });

        if (column_config_data["css"]) {
            icon_button.html.css(column_config_data["css"]);
        }

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            icon_button.icon.icon_html.remove();

            this.prevent_events_for_header_placeholder(icon_button.html);

            return icon_button;
        }

        if (column_config_data["options"]["hover_text"]) {
            icon_button.SetHoverHint(column_config_data["options"]["hover_text"]);
        }

        return icon_button;
    };

    this.prevent_events_for_header_placeholder = function (html) {
        html.css({
            "pointer-events": "none"
        });

        html.off("click");
    };
}
