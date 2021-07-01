function DashGuiPropertyBox (binder, get_data_cb, set_data_cb, endpoint, dash_obj_id, options) {
    this.binder = binder;

    this.get_data_cb = null;
    this.set_data_cb = null;

    if (get_data_cb && set_data_cb) {
        this.get_data_cb = get_data_cb.bind(binder);
        this.set_data_cb = set_data_cb.bind(binder);
    }

    this.endpoint = endpoint;
    this.dash_obj_id = dash_obj_id;
    this.data = {};
    this.property_set_data = null; // Managed Dash data

    this.options = options || {};
    this.additional_request_params = this.options["extra_params"] || {};
    this.color = this.options["color"] || Dash.Color.Light;
    this.indent_properties = this.options["indent_properties"] || 0;

    this.num_headers = 0;
    this.update_inputs = {};

    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);

    DashGuiPropertyBoxInterface.call(this);

    this.setup_styles = function () {
    };

    this.Load = function () {

        // var url = "https://" + Dash.Context.domain + "/" + this.endpoint;
        var params = {};
        params["f"] = "get_property_set";
        params["obj_id"] = this.dash_obj_id;

        // binder, callback, endpoint, params
        Dash.Request(this, this.on_server_property_set, this.endpoint, params);

    };

    this.Update = function () {
        // Do we have new data?

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
        this.html.append(this.top_right_label);

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
        });

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
                "margin-right": add_button_margin ? Dash.Size.RowHeight * 2.5 : 0
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

            var button = new Dash.Gui.IconButton("trash", function () {
                callback(data_key);
            }, self, self.color);

            self.buttons.push(button);

            button.html.css({
                "position": "absolute",
                "right": 0,
                "top": 0,
                "height": Dash.Size.RowHeight,
                "width": Dash.Size.RowHeight,
            });

            row.html.append(button.html);

        })(this, row, callback, data_key);


        if (row.button) {
            // We need to leave space for this button to coexist with this new button
            row.button.html.css("margin-right", Dash.Size.RowHeight);
        }

        return row;

    };

    this.on_combo_updated = function (property_key, selected_option) {

        if (this.dash_obj_id) {
            var params = {};
            params["f"] = "set_property";
            params["key"] = property_key;
            params["value"] = selected_option;
            params["obj_id"] = this.dash_obj_id;
            Dash.Request(this, this.on_server_response, this.endpoint, params);
            return;
        }

        if (this.set_data_cb) {
            this.set_data_cb(property_key, selected_option);
            return;
        }

        console.log("Error: Property Box has no callback and no endpoint information!");

    };

    this.on_row_updated = function (row_input, row_details) {

        var new_value = row_input.Text();

        if (this.dash_obj_id == null) {

            if (this.set_data_cb) {
                this.set_data_cb(row_details["key"], new_value);
            }
            else {
                console.log("Error: Property Box has no callback and no endpoint information!");
            };

            return;

        };

        var url = "https://" + Dash.Context.domain + "/" + this.endpoint;
        var params = {};
        params["f"] = "set_property";
        params["key"] = row_details["key"];
        params["value"] = new_value;
        params["obj_id"] = this.dash_obj_id;

        for (var key in this.additional_request_params) {
            params[key] = this.additional_request_params[key];
        }

        if (row_details["key"].includes("password") && this.endpoint == "Users") {
            params["f"] = "update_password";
            params["p"] = new_value;
        }

        (function (self, row_input, row_details) {

            row_input.Request(url, params, function (response) {
                self.on_server_response(response, row_details, row_input);
            }, self);

        })(this, row_input, row_details);

    };

    this.on_server_response = function (response, row_details, row_input) {
        if (!Dash.ValidateResponse(response)) {

            if (row_input) {
                row_input.SetInputValidity(false);
            }

            return;
        }

        console.log("SERVER RESPONSE");
        console.log(response);

        row_input.FlashSave();

        if (this.set_data_cb) {
            this.set_data_cb(response);
        }

    };

    this.setup_styles();

};
