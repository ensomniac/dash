/** @member DashGuiListRow*/

function DashGuiListRowElements () {
    this.add_default_column = function (column_config_data, index) {
        column_config_data["left_aligned"] = true;

        var column = new DashGuiListRowColumn(this, column_config_data, index);

        this.column_box.append(column.html);

        if (!this.columns["default"]) {
            this.columns["default"] = [];
        }

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

        if (!this.columns["spacers"]) {
            this.columns["spacers"] = [];
        }

        this.columns["spacers"].push({
            "obj": spacer,
            "column_config_data": column_config_data
        });
    };

    this.add_divider_column = function (column_config_data) {
        var divider = this.get_divider(column_config_data);

        this.column_box.append(divider);

        if (!this.columns["dividers"]) {
            this.columns["dividers"] = [];
        }

        this.columns["dividers"].push({
            "obj": divider,
            "column_config_data": column_config_data
        });
    };

    this.add_combo_column = function (column_config_data) {
        var combo = this.get_combo(column_config_data);

        this.column_box.append(combo.html);

        if (!this.columns["combos"]) {
            this.columns["combos"] = [];
        }

        this.columns["combos"].push({
            "obj": combo,
            "column_config_data": column_config_data
        });
    };

    this.add_input_column = function (column_config_data) {
        var input = this.get_input(column_config_data);

        this.column_box.append(input.html);

        if (!this.columns["inputs"]) {
            this.columns["inputs"] = [];
        }

        this.columns["inputs"].push({
            "obj": input,
            "column_config_data": column_config_data
        });
    };

    this.add_icon_button_column = function (column_config_data) {
        var icon_button = this.get_icon_button(column_config_data);

        this.column_box.append(icon_button.html);

        if (!this.columns["icon_buttons"]) {
            this.columns["icon_buttons"] = [];
        }

        this.columns["icon_buttons"].push({
            "obj": icon_button,
            "column_config_data": column_config_data
        });
    };

    this.get_spacer = function () {
        var spacer = $("<div></div>");

        spacer.css({
            "height": Dash.Size.RowHeight,
            "flex-grow": 2,
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

        return divider_line;
    };

    this.get_combo = function (column_config_data) {
        var combo = new Dash.Gui.Combo (
            column_config_data["options"]["label_text"] || "",                                             // Label
            column_config_data["options"]["callback"] || column_config_data["on_click_callback"] || null,  // Callback
            column_config_data["options"]["binder"] || null,                                               // Binder
            column_config_data["options"]["combo_options"] || null,                                        // Option List
            this.get_data_for_key(column_config_data, "", true),           // Selected ID
            this.color,                                                                                    // Color set
            {"style": "row", "additional_data": {"row_id": this.id}}                                       // Options
        );

        combo.html.css({
            "height": Dash.Size.RowHeight
        });

        combo.label.css({
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px"
        });

        if (column_config_data["css"]) {
            combo.html.css(column_config_data["css"]);
        }

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't show the actual element
            combo.html.css({
                "opacity": 0
            });
        }

        return combo;
    };

    this.get_input = function (column_config_data) {
        var input = new Dash.Gui.Input(
            column_config_data["options"]["placeholder_label"] || "",
            column_config_data["options"]["color"] || this.color
        );

        input.html.css({
            "height": Dash.Size.RowHeight * 0.9,
            "margin-top": Dash.Size.Padding * 0.1,
            "box-shadow": "0px 0px 4px 1px rgba(0, 0, 0, 0.2)"
        });

        if (column_config_data["width"]) {
            input.html.css({
                "width": column_config_data["width"]
            });
        }

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            input.input.remove();

            return input;
        }

        input.input.css({
            "height": Dash.Size.RowHeight * 0.9,
            "line-height": (Dash.Size.RowHeight * 0.9) + "px",
            "padding-left": Dash.Size.Padding * 0.35
        });

        var starting_value = this.get_data_for_key(column_config_data);

        if (starting_value) {
            input.SetText(starting_value.toString());
        }

        if (column_config_data["options"]["callback"] && column_config_data["options"]["binder"]) {
            var row_id = this.id;

            (function (self, column_config_data, row_id, input) {
                input.OnSubmit(
                    function () {
                        var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                        callback(row_id, input.Text());
                    },
                    column_config_data["options"]["binder"]
                );

                input.EnableAutosave();
            })(this, column_config_data, row_id, input);
        }

        return input;
    };

    this.get_icon_button = function (column_config_data) {
        var row_id = this.id;

        var icon_button = new Dash.Gui.IconButton(
            column_config_data["options"]["icon_name"],
            function () {
                var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                callback(row_id);
            },
            column_config_data["options"]["binder"],
            column_config_data["options"]["color"] || this.color,
            column_config_data["options"]["options"] || {}
        );

        icon_button.html.css({
            "height": Dash.Size.RowHeight
        });

        if (column_config_data["css"]) {
            icon_button.html.css(column_config_data["css"]);
        }

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            icon_button.icon.icon_html.remove();

            return icon_button;
        }

        if (column_config_data["options"]["hover_text"]) {
            icon_button.SetHoverHint(column_config_data["options"]["hover_text"]);
        }

        return icon_button;
    };
}