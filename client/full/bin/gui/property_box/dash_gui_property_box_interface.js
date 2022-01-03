/**@member DashGuiPropertyBox*/

function DashGuiPropertyBoxInterface () {
    this.SetTopRightLabel = function (label_text) {

        if (!this.top_right_label) {
            this.add_top_right_label();
        }

        this.top_right_label.text(label_text);
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
        var header = header_obj.html;

        if (this.num_headers > 0) {
            header.css("margin-top", Dash.Size.Padding*0.5);
        }

        this.html.append(header);
        this.num_headers += 1;

        if (update_key != null && this.get_data_cb) {
            this.header_update_objects.push({
                "obj": header_obj,
                "update_key": update_key
            });
        };

        return header_obj;

    };

    this.AddButtonBar = function (label_text) {
        var bar = new Dash.Gui.Layout.ButtonBar(this.binder, this.color);

        bar.html.css({
            "margin-top": Dash.Size.Padding,
        });

        this.AddHTML(bar.html);

        return bar;
    };

    this.AddButton = function (label_text, callback) {
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
                self.color
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

    this.AddCombo = function (label_text, combo_options, property_key, default_value=null, bool=false) {
        var indent_px = Dash.Size.Padding*2;
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
                {"style": "row"}, // Options
                bool              // Bool (Toggle)
            );

            row.input.html.append(combo.html);

            combo.html.css({
                "position": "absolute",
                "left": Dash.Size.Padding*0.5,
                "top": 0,
                "height": Dash.Size.RowHeight,
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px",
            });

        })(this, row, selected_key, property_key, combo_options, bool);

        return row;
    };

    this.AddInput = function (data_key, label_text, default_value, combo_options, can_edit, options={}) {
        if (this.get_data_cb) {
            this.data = this.get_data_cb();
        }

        else {
            this.data = {};
        }

        var row_details = {
            "key": data_key,
            "label_text": label_text,
            "default_value": default_value || null,
            "combo_options": combo_options || null,
            "value": this.data[data_key] || default_value,
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

            var row = new Dash.Gui.InputRow(
                row_details["label_text"],
                row_details["value"],
                row_details["default_value"] || row_details["label_text"],
                combo_options || "Save",
                _callback,
                self,
                self.color,
                row_details["key"]
            );

            self.update_inputs[row_details["key"]] = row;

            var indent_px = Dash.Size.Padding*2;
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
}
