function DashGuiPropertyBox(binder, get_data_cb, set_data_cb, endpoint, dash_obj_id, options){
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

    this.setup_styles = function(){
    };

    this.Load = function(){

        var url = "https://" + Dash.Context.domain + "/" + this.endpoint;
        var params = {};
        params["f"] = "get_property_set";
        params["obj_id"] = this.dash_obj_id;

        // binder, callback, endpoint, params
        Dash.Request(this, this.on_server_property_set, this.endpoint, params);

    };

    this.Update = function(){
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
                row_input.SetText(this.get_data_cb()[data_key])
            }
        }
    };

    this.on_server_property_set = function(property_set_data){

        if (property_set_data["error"]) {
            alert("There was a problem accessing data");
            return;
        }

        this.property_set_data = property_set_data;
        this.Update();

    };

    this.add_top_right_label = function(){

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

    this.SetTopRightLabel = function(label_text){

        if (!this.top_right_label) {
            this.add_top_right_label();
        }

        this.top_right_label.text(label_text);


    };

    this.AddTopRightDeleteButton = function (callback, data_key, additional_data=null, alt_icon_id=null) {
        var icon_id = "trash";

        if (alt_icon_id && typeof alt_icon_id === "string") {
            icon_id = alt_icon_id;
        }

        if (this.top_right_delete_button) {
            return;
        }

        if (this.top_right_label) {
            this.top_right_label.css({
                "right": Dash.Size.Padding * 5
            });
        }

        this.top_right_delete_button = Dash.Gui.GetHTMLAbsContext();

        this.top_right_delete_button.css({
            "left": "auto",
            "bottom": "auto",
            "top": Dash.Size.Padding * 0.8,
            "right": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "color": this.color,
            "z-index": 1,
            "overflow-y": ""
        });

        callback = callback.bind(this.binder);

        if (!this.buttons) {
            this.buttons = [];
        }

        (function (self, callback, data_key, additional_data) {
            var button = new Dash.Gui.IconButton(
                icon_id,
                function () {
                    callback(data_key, additional_data);
                },
                self,
                self.color
            );

            self.buttons.push(button);

            button.html.css({
            });

            self.top_right_delete_button.append(button.html);

        })(this, callback, data_key, additional_data);


        if (this.top_right_delete_button.button) {
            this.top_right_delete_button.button.html.css({
                "margin-right": Dash.Size.RowHeight
            });
        }

        this.html.append(this.top_right_delete_button);
    };

    this.AddHTML = function(html){
        this.html.append(html);
    };

    this.AddHeader = function(label_text){

        var header_obj = new d.Gui.Header(label_text, this.color);
        var header = header_obj.html;

        if (this.num_headers > 0) {
            header.css("margin-top", Dash.Size.Padding*0.5);
        }

        this.html.append(header);
        this.num_headers += 1;

        return header_obj;

    };

    this.AddButton = function(label_text, callback){
        callback = callback.bind(this.binder);

        if (!this.buttons) {
            this.buttons = [];
        }

        (function(self, callback){

            var button = new d.Gui.Button(label_text, function(){
                callback(button);
            }, self, self.color);

            self.buttons.push(button);

            button.html.css("margin-top", Dash.Size.Padding);

            self.html.append(button.html);

        })(this, callback);

        return this.buttons[this.buttons.length-1];

    };

    this.AddCombo = function(label_text, combo_options, property_key, default_value=null, bool=false){

        var indent_px = Dash.Size.Padding*2;
        var indent_row = false;

        if (this.num_headers > 0) {
            indent_row = true;
        }

        var row = new d.Gui.InputRow(
            label_text,
            "",
            "",
            "",
            function(row_input){console.log("Do nothing, dummy row");},
            self
        );

        row.input.input.css("pointer-events", "none");
        this.html.append(row.html);

        if (indent_row) {
            row.html.css("margin-left", indent_px);
        }

        var selected_key = default_value || this.get_data_cb()[property_key];

        (function(self, row, selected_key, property_key, combo_options, bool){

            var callback = function(selected_option){
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

    };

    this.AddInput = function(data_key, label_text, default_value, combo_options, can_edit, options={}){

        if (this.get_data_cb) {
            this.data = this.get_data_cb();
        }
        else {
            this.data = {};
        }

        var row_details = {};
        row_details["key"] = data_key;
        row_details["label_text"] = label_text;
        row_details["default_value"] = default_value || null;
        row_details["combo_options"] = combo_options || null;
        row_details["value"] = this.data[data_key]   || default_value;
        row_details["can_edit"] = can_edit;

        (function(self, row_details, callback){
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

            var row = new d.Gui.InputRow(
                row_details["label_text"],
                row_details["value"],
                row_details["label_text"],
                combo_options || "Save",
                _callback,
                self,
                self.color
            );

            self.update_inputs[data_key] = row;

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
                row = self.add_delete_button(row, options["on_delete"], data_key);
            }

            self.html.append(row.html);

        })(this, row_details, options["callback"] || null);

        return this.update_inputs[data_key];
    };

    this.add_combo = function(row, combo_params, bool=false, add_button_margin=false){
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

    this.add_delete_button = function(row, callback, data_key){
        // Note: This function was initially intended for PropertyBox
        // rows - it may not work well with other styles without modification

        callback = callback.bind(this.binder);

        if (!this.buttons) {
            this.buttons = [];
        }

        (function(self, row, callback, data_key){

            var button = new d.Gui.IconButton("trash", function(){
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

    this.on_combo_updated = function(property_key, selected_option){

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

    this.on_row_updated = function(row_input, row_details){

        var new_value = row_input.Text();

        if (new_value == row_details["value"]) {
            console.log("The data didn't change");
            return;
        }

        if (this.dash_obj_id == null) {

            if (this.set_data_cb) {
                this.set_data_cb(row_details["key"], new_value);
            }
            else {
                console.log("Error: Property Box has no callback and no endpoint information!");
            }

            return;

        }

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

        (function(self, row_input, row_details){

            row_input.Request(url, params, function(response){
                self.on_server_response(response, row_details, row_input);
            }, self);

        })(this, row_input, row_details);

    };

    this.on_server_response = function(response, row_details, row_input){
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
            return;
        }

    };

    this.setup_styles();

}
