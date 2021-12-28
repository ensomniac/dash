function DashGuiPropertyBox (binder, get_data_cb, set_data_cb, endpoint, dash_obj_id, options={}) {
    this.binder = binder;
    this.get_data_cb = get_data_cb ? get_data_cb.bind(binder) : null;
    this.set_data_cb = set_data_cb ? set_data_cb.bind(binder) : null;
    this.endpoint = endpoint;
    this.dash_obj_id = dash_obj_id;
    this.options = options;

    this.data = {};
    this.num_headers = 0;
    this.update_inputs = {};
    this.property_set_data = null; // Managed Dash data
    this.top_right_delete_button = null;
    this.color = this.options["color"] || Dash.Color.Light;
    this.indent_properties = this.options["indent_properties"] || 0;
    this.additional_request_params = this.options["extra_params"] || {};
    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);

    DashGuiPropertyBoxInterface.call(this);

    this.setup_styles = function () {

        // DashGlobalImpactChange | 12/21/21 | Ryan
        // Updating the property box's background color to reflect
        // a slightly brighter color than whatever background it's
        // placed over. This change will affect the look of all
        // property boxes, but it does not change mobile styles.

        this.html.css({
            "background": "rgba(255, 255, 255, 0.25)",
        });

        if (Dash.IsMobile) {
            this.setup_mobile_styles();
        }
    };

    this.setup_mobile_styles = function () {
        this.html.css({
            "background": "none",
            "border-radius": 0,
            "margin": 0,
            "padding": 0,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "box-shadow": "none"
        });
    };

    this.Load = function () {
        Dash.Request(
            this,
            this.on_server_property_set,
            this.endpoint,
            {
                "f": "get_property_set",
                "obj_id": this.dash_obj_id
            }
        );
    };

    this.Update = function () {
        for (var data_key in this.update_inputs) {
            var row_input = this.update_inputs[data_key];

            if (!row_input.CanAutoUpdate()) {
                console.log("(Currently being edited) Skipping update for " + data_key);

                continue;
            }

            if (this.property_set_data) {
                row_input.SetText(this.property_set_data[data_key]);
            }

            else {
                row_input.SetText(this.get_data_cb()[data_key]);
            }
        }
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
        this.top_right_label = Dash.Gui.GetHTMLAbsContext();

        this.top_right_label.css({
            "left": "auto",
            "bottom": "auto",
            "top": Dash.Size.Padding,
            "right": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "text-align": "right",
            "color": this.color.Text,
            "opacity": 0.6,
            "z-index": 1,
            "cursor": "auto"
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

    this.add_delete_button = function (row, callback, data_key) {
        // Note: This function was initially intended for PropertyBox
        // rows - it may not work well with other styles without modification

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

            if (old_value == new_value) {
                // Values are unchanged!
                return;
            }
        }

        if (this.dash_obj_id == null) {
            if (this.set_data_cb) {
                this.set_data_cb(row_details["key"], new_value);
            }

            else {
                console.error("Error: Property Box has no callback and no endpoint information!");
            }

            return;
        }

        var params = {
            "f": "set_property",
            "key": row_details["key"],
            "value": new_value,
            "obj_id": this.dash_obj_id
        };

        console.log("Row updated - uploading...");

        for (var key in this.additional_request_params) {
            params[key] = this.additional_request_params[key];
        }

        if (row_details["key"].includes("password") && this.endpoint === "Users") {
            params["f"] = "update_password";
            params["p"] = new_value;

            if (this.update_inputs && this.update_inputs["email"]) {
                var email = this.update_inputs["email"].Text();

                if (email) {
                    params["email"] = email;
                }
            }
        }

        (function (self, row_input, row_details, params) {
            row_input.Request(
                self.endpoint,
                params,
                function (response) {
                    self.on_server_response(response, row_details, row_input);
                },
                self
            );
        })(this, row_input, row_details, params);
    };

    this.on_server_response = function (response, row_details, row_input) {
        if (!Dash.Validate.Response(response)) {

            if (row_input) {
                row_input.SetInputValidity(false);
            }

            return;
        }

        console.log("SERVER RESPONSE:", response);

        row_input.FlashSave();

        if (this.set_data_cb) {
            this.set_data_cb(response);
        }
    };

    this.setup_styles();
}
