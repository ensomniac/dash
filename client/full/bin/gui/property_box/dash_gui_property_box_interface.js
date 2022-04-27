/**@member DashGuiPropertyBox*/

function DashGuiPropertyBoxInterface () {
    this.SetTopRightLabel = function (label_text) {

        if (!this.top_right_label) {
            this.add_top_right_label();
        }

        this.top_right_label.text(label_text);
    };

    this.Flatten = function () {
        Dash.Gui.Flatten(this.html);
    };

    // Intended for Flattened boxes
    this.AddBottomDivider = function () {
        if (this.bottom_divider) {
            return;
        }

        this.html.css({
            "margin-bottom": 0
        });

        this.bottom_divider = Dash.Gui.GetBottomDivider(this.color);

        this.html.append(this.bottom_divider);

        return this.bottom_divider;
    };

    // This is intended to nicely format a prop box that only uses locked rows for displaying data, therefore,
    // it's only been implemented in input-related areas for now (there may be other areas it should be added)
    this.SetGetFormattedDataCallback = function (callback, binder=null) {
        this.get_formatted_data_cb = binder || this.binder ? callback.bind(binder ? binder : this.binder) : callback;
    };

    this.AddTopRightIconButton = function (callback, data_key, additional_data=null, icon_id="trash") {
        if (this.top_right_delete_button) {
            return;
        }

        if (!this.buttons) {
            this.buttons = [];
        }

        this.top_right_delete_button = Dash.Gui.GetTopRightIconButton(
            this.binder,
            callback,
            icon_id,
            data_key,
            additional_data,
            this.top_right_label
        );

        this.html.append(this.top_right_delete_button.html);

        return this.top_right_delete_button;
    };

    this.AddHTML = function (html) {
        this.html.append(html);
    };

    this.AddExpander = function () {
        var expander = Dash.Gui.GetFlexSpacer();

        this.html.css({
            "display": "flex",
            "flex-direction": "column"
        });

        this.html.append(expander);

        return expander;
    };

    this.AddHeader = function (label_text, update_key=null) {
        var header_obj = new Dash.Gui.Header(label_text, this.color);

        if (this.num_headers > 0) {
            // header.css("margin-top", Dash.Size.Padding * 0.5);

            header_obj.html.css({
                "margin-top": Dash.Size.Padding * 1.5
            });
        }

        // Ryan, I made these margin changes on 2/1/22 because I do it with every property box,
        // so it felt right to adjust the default - please let me know if you feel otherwise!

        header_obj.html.css({
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        this.html.append(header_obj.html);

        this.num_headers += 1;

        if (update_key != null && this.get_data_cb) {
            this.header_update_objects.push({
                "obj": header_obj,
                "update_key": update_key
            });
        }

        return header_obj;
    };

    this.AddButtonBar = function (style="default") {
        var bar = new Dash.Gui.ButtonBar(this.binder, this.color, style);

        bar.html.css({
            "margin-top": Dash.Size.Padding,
        });

        this.AddHTML(bar.html);

        return bar;
    };

    this.AddToolRow = function () {
        var tool_row = new Dash.Gui.ToolRow(
            this.binder,
            this.get_formatted_data_cb ? this.get_formatted_data_cb : this.get_data_cb,
            this.set_data_cb,
            this.color
        );

        if (this.get_formatted_data_cb) {
            tool_row.SetGetFormattedDataCallback(this.get_formatted_data_cb);
        }

        this.AddHTML(tool_row.html);

        return tool_row;
    };

    this.AddButton = function (label_text, callback, options={}) {
        callback = callback.bind(this.binder);

        if (!this.buttons) {
            this.buttons = [];
        }

        (function (self, callback) {
            var button = new Dash.Gui.Button(
                label_text,
                function () {
                    callback(button);
                },
                self,
                self.color,
                options
            );

            self.buttons.push(button);

            button.html.css({
                "margin-top": Dash.Size.Padding
            });

            self.html.append(button.html);
        })(this, callback);

        return this.buttons.Last();
    };

    this.AddDeleteButton = function (callback, faint=true) {
        var button = this.AddButton("Delete", callback);

        button.StyleAsDeleteButton(Dash.Size.ColumnWidth, faint);

        button.html.css({
            "margin-left": Dash.Size.Padding * 2,
            "margin-right": "auto"
        });

        return button;
    };

    this.AddCombo = function (label_text, combo_options, property_key, default_value=null, bool=false, options={}) {

        var indent_px = Dash.Size.Padding * 2;
        var indent_row = false;

        if (this.num_headers > 0) {
            indent_row = true;
        }

        var row = new Dash.Gui.InputRow(
            label_text,
            "",
            "",
            "",
            function (row_input) {
                // Do nothing, dummy row
            },
            this
        );

        row.input.input.css("pointer-events", "none");

        this.html.append(row.html);

        if (indent_row) {
            row.html.css("margin-left", indent_px);
        }

        var selected_key = default_value || this.get_data_cb()[property_key];

        (function (self, row, selected_key, property_key, combo_options, bool) {
            var callback = function (selected_option) {
                self.on_combo_updated(property_key, selected_option["id"]);
            };

            var combo = new Dash.Gui.Combo (
                selected_key,     // Label
                callback,         // Callback
                self,             // Binder
                combo_options,    // Option List
                selected_key,     // Selected
                self.color,       // Color set
                {
                    "style": "row",
                    ...options
                },
                bool              // Bool (Toggle)
            );

            row.input.html.append(combo.html);

            combo.html.css({
                "position": "absolute",
                "left": Dash.Size.Padding * 0.5,
                "top": 0,
                "height": Dash.Size.RowHeight,
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px",
            });

            row.property_box_input_combo = combo;
        })(this, row, selected_key, property_key, combo_options, bool);

        return row;
    };

    this.AddInput = function (data_key, label_text, default_value, combo_options, can_edit, options={}) {
        this.data = this.get_data_cb ? this.get_data_cb() : {};

        var value = this.get_formatted_data_cb ? this.get_formatted_data_cb(data_key) : this.data[data_key];

        var row_details = {
            "key": data_key,
            "label_text": label_text,
            "default_value": default_value || null,
            "combo_options": combo_options || null,
            "value": value !== null && value !== undefined ? value : default_value,  // Keep 'false' intact
            "can_edit": can_edit
        };

        (function (self, row_details, callback) {
            var _callback;

            if (callback) {
                _callback = function (row_input) {
                    callback(row_details["key"], row_input.Text());
                };
            }

            else {
                _callback = function (row_input) {
                    self.on_row_updated(row_input, row_details);
                };
            }

            var label = row_details["label_text"] || row_details["display_name"];

            var row = new Dash.Gui.InputRow(
                label,
                row_details["value"],
                row_details["default_value"] || label,
                combo_options || "Save",
                _callback,
                self,
                self.color,
                row_details["key"]
            );

            self.update_inputs[row_details["key"]] = row;

            var indent_px = Dash.Size.Padding * 2;
            var indent_row = false;

            if (self.num_headers > 0) {
                indent_row = true;
            }

            if (self.indent_properties || self.indent_properties > 0) {
                indent_px += self.indent_properties;
            }

            if (indent_row) {
                row.html.css("margin-left", indent_px);
            }

            if (!row_details["can_edit"]) {
                row.SetLocked(true);
            }

            if (options["add_combo"]) {
                row = self.add_combo(
                    row,
                    options["add_combo"],
                    false,
                    !!options["on_delete"]
                );
            }

            if (options["on_delete"]) {
                row = self.add_delete_button(row, options["on_delete"], row_details["key"]);
            }

            self.html.append(row.html);

        })(this, row_details, options["callback"] || null);

        return this.update_inputs[data_key];
    };

    this.AddLabel = function (text, color=null) {
        var header = new Dash.Gui.Header(text, color);

        header.html.css({
            "margin-left": Dash.Size.Padding * 2
        });

        this.html.append(header.html);

        return header;
    };

    this.AddText = function (text, color=null) {
        var label = this.AddLabel(text, false, color);

        label.border.remove();

        label.label.css({
            "font-family": "sans_serif_normal",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "padding-left": 0
        });

        this.html.append(label.html);

        return label;
    };

    this.AddCheckbox = function (
        local_storage_key, default_state=true, color=null, hover_hint="Toggle", binder=null,
        callback=null, label_text="", label_first=true, include_border=false, read_only=false
    ) {
        var checkbox = new Dash.Gui.Checkbox(
            local_storage_key,
            default_state,
            color,
            hover_hint,
            binder,
            callback,
            label_text,
            label_first,
            include_border
        );

        checkbox.html.css({
            "border-bottom": "1px dotted rgba(0, 0, 0, 0.2)"
        });

        checkbox.label.label.css({
            "font-family": "sans_serif_bold",
            "font-size": "80%"
        });

        checkbox.icon_button.html.css({
            "margin-top": Dash.Size.Padding * 0.15
        });

        checkbox.SetIconSize(125);

        if (read_only) {
            checkbox.SetReadOnly(true);
        }

        this.AddHTML(checkbox.html);

        return checkbox;
    };
}
