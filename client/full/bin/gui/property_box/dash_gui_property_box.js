function DashGuiPropertyBox (
    binder, get_data_cb=null, set_data_cb=null, endpoint="", dash_obj_id="", options={}
) {
    this.binder = binder;
    this.get_data_cb = get_data_cb ? get_data_cb.bind(binder) : function () {return {};};
    this.set_data_cb = set_data_cb ? set_data_cb.bind(binder) : function () {};
    this.endpoint = endpoint;
    this.dash_obj_id = dash_obj_id;
    this.options = options;

    this.data = {};
    this.rows = [];
    this.combos= {};
    this.inputs = {};
    this.headers = [];
    this.addresses = {};
    this.tool_rows = [];
    this.text_areas = {};
    this.num_headers = 0;
    this.disabled = false;
    this.custom_html = [];
    this.color_pickers = {};
    this.bottom_divider = null;
    this.property_set_data = null; // Managed Dash data
    this.get_formatted_data_cb = null;
    this.top_right_delete_button = null;
    this.indent_px = Dash.Size.Padding * 2;
    this.every_other_row_hightlight = null;
    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);
    this.indent_properties = this.options["indent_properties"] || 0;
    this.additional_request_params = this.options["extra_params"] || {};
    this.color = this.options["color"] || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.bottom_border = "1px dotted " + this.color.PinstripeDark;

    DashGuiPropertyBoxInterface.call(this);

    this.setup_styles = function () {
        this.html.css({
            "background": "rgba(255, 255, 255, 0.25)"
        });

        if (Dash.IsMobile) {
            this.setup_mobile_styles();
        }
    };

    this.setup_mobile_styles = function () {
        this.html.css({
            "border-radius": 0,
            "margin": 0,
            "padding": 0,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding
        });

        this.Flatten();
    };

    this.update_inputs = function () {
        for (var data_key in this.inputs) {
            var input_row = this.inputs[data_key];

            if (!input_row.CanAutoUpdate() || input_row.InFocus()) {
                Dash.Log.Log("(Currently being edited) Skipping update for " + data_key);

                continue;
            }

            input_row.SetText(this.get_update_value(data_key));
        }
    };

    this.update_color_pickers = function () {
        for (var data_key in this.color_pickers) {
            var og_val = this.color_pickers[data_key].input.val();
            var new_val = this.get_update_value(data_key);

            if (!new_val) {
                new_val = this.color_pickers[data_key].default_hex_color;
            }

            if (og_val === new_val) {
                continue;
            }

            this.color_pickers[data_key].input.val(new_val);
        }
    };

    this.update_text_areas = function () {
        for (var data_key in this.text_areas) {
            var text_area = this.text_areas[data_key];

            if (text_area.InFocus()) {
                Dash.Log.Log("(Currently being edited) Skipping update for " + data_key);

                continue;
            }

            text_area.SetText(this.get_update_value(data_key));
        }
    };

    this.update_combos = function () {
        for (var data_key in this.combos) {
            if (data_key === "") {
                continue;
            }

            var combo = this.combos[data_key];

            if (combo.InFocus(false)) {
                Dash.Log.Log("(Currently being edited) Skipping update for " + data_key);

                continue;
            }

            var value = this.get_update_value(data_key);

            // This might be too biased... unsure, but without it, a default value provided to the
            // combo gets immediately switched to the first option if the data has no value for that key
            if (value !== "") {
                combo.Update(null, value, true);
            }
        }
    };

    this.update_headers = function () {
        if (!this.get_data_cb) {
            return;
        }

        for (var i in this.headers) {
            this.headers[i]["obj"].SetText(this.get_update_value(this.headers[i]["update_key"]));
        }
    };

    this.update_tool_rows = function () {
        for (var tool_row of this.tool_rows) {
            for (var element of tool_row.elements) {
                if (element instanceof DashGuiInput || element instanceof DashGuiInputRow) {
                    if (element.InFocus()) {
                        Dash.Log.Log("(Currently being edited) Skipping update for " + element.data_key);

                        continue;
                    }

                    if (element.data_key) {
                        element.SetText(this.get_update_value(element.data_key));
                    }
                }

                // Add more as needed
            }
        }
    };

    this.get_update_value = function (data_key) {
        if (this.property_set_data) {
            return this.property_set_data[data_key];
        }

        return this.get_formatted_data_cb ? this.get_formatted_data_cb(data_key) : this.get_data_cb()[data_key];
    };

    this.indent_row = function (row) {
        if (this.num_headers <= 0) {
            return;
        }

        (typeof row.html === "function" ? row : row.html).css({
            "margin-left": this.indent_px + (
                (this.indent_properties || this.indent_properties > 0) ? this.indent_properties : 0
            )
        });
    };

    this.on_input_added = function (key, can_edit) {
        if (!can_edit) {
            this.inputs[key].SetLocked(true);
        }

        this.indent_row(this.inputs[key]);
        this.AddHTML(this.inputs[key].html);
        this.track_row(this.inputs[key]);

        return this.inputs[key];
    };

    this.on_server_property_set = function (property_set_data) {
        if (property_set_data["error"]) {
            alert("There was a problem accessing data");

            return;
        }

        this.property_set_data = property_set_data;

        this.Update();
    };

    this.add_top_right_label = function () {
        this.top_right_label = Dash.Gui.GetTopRightLabel("", this.color);

        this.top_right_label.css({
            "top": Dash.Size.Padding
        });

        this.html.append(this.top_right_label);
    };

    this.add_combo = function (row, combo_params, bool=false, add_button_margin=false) {
        var combo_options = combo_params["combo_options"];
        var property_key = combo_params["property_key"];
        var default_value = combo_params["default_value"] || null;
        var callback = combo_params["callback"] || null;
        var selected_key = default_value || this.get_data_cb()[property_key];

        (function (self, row, selected_key, property_key, combo_options, bool, callback) {
            var _callback;

            if (callback) {
                _callback = function (selected_option) {
                    callback(property_key, selected_option["id"]);
                };
            }

            else {
                _callback = function (selected_option) {
                    self.on_combo_updated(property_key, selected_option["id"]);
                };
            }

            var combo = new Dash.Gui.Combo (
                selected_key,     // Label
                _callback,         // Callback
                self,             // Binder
                combo_options,    // Option List
                selected_key,     // Selected
                self.color,       // Color set
                {"style": "row"}, // Options
                bool              // Bool (Toggle)
            );

            combo.html.css({
                "position": "absolute",
                "right": 0,
                "top": 0,
                "height": Dash.Size.RowHeight,
                "margin-right": add_button_margin ? Dash.Size.RowHeight * 1.25 : 0,
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px"
            });

            row.html.append(combo.html);
        })(this, row, selected_key, property_key, combo_options, bool, callback);

        return row;
    };

    // Note: This function was initially intended for PropertyBox
    // rows - it may not work well with other styles without modification
    this.add_delete_button = function (row, callback, data_key) {
        callback = callback.bind(this.binder);

        if (!this.buttons) {
            this.buttons = [];
        }

        (function (self, row, callback, data_key) {
            var button = new Dash.Gui.IconButton(
                "trash",
                function () {
                    callback(data_key);
                },
                self,
                self.color,
                {"size_mult": 0.9}
            );

            self.buttons.push(button);

            button.html.css({
                "position": "absolute",
                "right": 0,
                "top": 0,
                "height": Dash.Size.RowHeight,
                "width": Dash.Size.RowHeight,
                "margin-right": -Dash.Size.Padding * 0.2
            });

            row.html.append(button.html);
        })(this, row, callback, data_key);

        if (row.button) {
            row.button.html.css("margin-right", Dash.Size.RowHeight);
        }

        return row;
    };

    this.on_combo_updated = function (property_key, selected_option) {
        if (this.dash_obj_id) {
            Dash.Request(
                this,
                this.on_server_response,
                this.endpoint,
                {
                    "f": "set_property",
                    "key": property_key,
                    "value": selected_option,
                    "obj_id": this.dash_obj_id
                }
            );

            return;
        }

        if (this.set_data_cb) {
            this.set_data_cb(property_key, selected_option);

            return;
        }

        console.error("Error: Property Box has no callback and no endpoint information!");
    };

    this.on_row_updated = function (row_input, row_details) {
        var new_value = row_input.Text();

        if (!row_details["can_edit"]) {
            return;
        }

        if (this.get_data_cb) {
            var old_value = this.get_data_cb()[row_details["key"]];

            if (old_value === new_value) {
                return;
            }
        }

        if (!this.dash_obj_id) {
            if (this.set_data_cb) {
                this.set_data_cb(row_details["key"], new_value);
            }

            else {
                console.error("Error: Property Box has no callback and no endpoint information!");
            }

            return;
        }

        this.set_property(row_details["key"], new_value, row_input, false);
    };

    this.set_property = function (key, value, row_input=null, check=true) {
        if (check && this.get_data_cb) {
            var old_value = this.get_data_cb()[key];

            if (old_value === value) {
                return;
            }
        }

        var params = {
            "f": "set_property",
            "key": key,
            "value": value,
            "obj_id": this.dash_obj_id
        };

        Dash.Log.Log("Set property '" + key + "':", value);

        for (var k in this.additional_request_params) {
            params[k] = this.additional_request_params[k];
        }

        if (key.includes("password") && this.endpoint === "Users") {
            params["f"] = "update_password";
            params["p"] = value;

            if (this.inputs && this.inputs["email"]) {
                var email = this.inputs["email"].Text();

                if (email) {
                    params["email"] = email;
                }
            }
        }

        (function (self) {
            if (row_input && row_input.hasOwnProperty("Request")) {
                row_input.Request(
                    self.endpoint,
                    params,
                    function (response) {
                        self.on_server_response(response, row_input);
                    },
                    self
                );
            }

            else {
                Dash.Request(
                    self,
                    function (response) {
                        self.on_server_response(response);
                    },
                    self.endpoint,
                    params
                );
            }
        })(this);
    };

    this.on_server_response = function (response, row_input=null) {
        if (!Dash.Validate.Response(response)) {
            if (row_input && row_input.hasOwnProperty("SetInputValidity")) {
                row_input.SetInputValidity(false);
            }

            return;
        }

        Dash.Log.Log("SERVER RESPONSE:", response);

        if (row_input && row_input.hasOwnProperty("FlashSave")) {
            row_input.FlashSave();
        }

        if (this.set_data_cb) {
            this.set_data_cb(response);
        }
    };

    this.add_hover_highlight = function (html) {
        var highlight = $("<div></div>");

        highlight.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.AccentGood,
            "border-radius": Dash.Size.BorderRadius,
            "opacity": 0
        });

        html.on("mouseenter", function () {
            highlight.stop().animate({"opacity": 0.25}, 50);
        });

        html.on("mouseleave", function () {
            highlight.stop().animate({"opacity": 0}, 250);
        });

        html.prepend(highlight);

        return highlight;
    };

    this.highlight_row_if_applicable = function (row) {
        if (!row || !this.every_other_row_hightlight) {
            return;
        }

        if (this.every_other_row_hightlight["highlight"]) {
            (typeof row.html === "function" ? row : row.html).css({
                "background": this.every_other_row_hightlight["color"]
            });
        }

        this.every_other_row_hightlight["highlight"] = !this.every_other_row_hightlight["highlight"];
    };

    this.track_row = function (row) {
        this.rows.push(row);

        this.highlight_row_if_applicable(row);
    };

    this.setup_styles();
}
