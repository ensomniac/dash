
function DashGuiPropertyBox(binder, get_data_cb, set_data_cb, endpoint, dash_obj_id, options){
    this.binder = binder;

    this.get_data_cb = null;
    this.set_data_cb = null;

    if (get_data_cb && set_data_cb) {
        this.get_data_cb = get_data_cb.bind(binder);
        this.set_data_cb = set_data_cb.bind(binder);
    };

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
            };

            if (this.property_set_data) {
                row_input.SetText(this.property_set_data[data_key]);
            }
            else {
                row_input.SetText(this.get_data_cb()[data_key]);
            };

        };

    };

    this.on_server_property_set = function(property_set_data){

        if (property_set_data["error"]) {
            alert("There was a problem accessing data");
            return;
        };

        this.property_set_data = property_set_data;
        this.Update();

    };

    this.AddHTML = function(html){
        this.html.append(html);
    };

    this.AddHeader = function(label_text){

        var header_obj = new d.Gui.Header(label_text, this.color);
        var header = header_obj.html;

        if (this.num_headers > 0) {
            header.css("margin-top", Dash.Size.Padding*0.5);
        };

        this.html.append(header);
        this.num_headers += 1;

        return header_obj;

    };

    this.AddButton = function(label_text, callback){
        callback = callback.bind(this.binder);

        if (!this.buttons) {
            this.buttons = [];
        };

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

    this.AddCombo = function(label_text, combo_options, property_key){

        var row = new d.Gui.InputRow(
            label_text,
            "",
            "",
            "",
            function(row_input){console.log("Do nothing, dummy row")},
            self
        );

        row.input.input.css("pointer-events", "none");
        this.html.append(row.html);

        var selected_key = this.get_data_cb()[property_key];

        (function(self, row, selected_key, property_key, combo_options){

            var callback = function(selected_option){
                self.on_combo_updated(property_key, selected_option["id"]);
            };

            var combo = new Dash.Gui.Combo (
                selected_key,     // Label
                callback,         // Callback
                self,             // Binder
                combo_options,    // Option List
                selected_key,     // Selected
                null,             // Color set
            );

            row.input.html.append(combo.html);

            combo.html.css({
                "position": "absolute",
                "left": Dash.Size.Padding,
                "top": 0,
                "height": Dash.Size.RowHeight,
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px",
            });

        })(this, row, selected_key, property_key, combo_options);

    };

    this.AddInput = function(data_key, label_text, default_value, combo_options, can_edit){

        if (this.get_data_cb) {
            this.data = this.get_data_cb();
        }
        else {
            this.data = {};
        };

        var row_details = {};
        row_details["key"] = data_key;
        row_details["label_text"] = label_text;
        row_details["default_value"] = default_value || null;
        row_details["combo_options"] = combo_options || null;
        row_details["value"] = this.data[data_key]   || default_value;
        row_details["can_edit"] = can_edit;

        (function(self, row_details){

            var row = new d.Gui.InputRow(
                row_details["label_text"],
                row_details["value"],
                row_details["label_text"],
                combo_options || "Save",
                function(row_input){self.on_row_updated(row_input, row_details)},
                self,
                self.color
            );

            self.update_inputs[data_key] = row;

            var indent_px = Dash.Size.Padding*2;
            var indent_row = false;

            if (self.num_headers > 0) {
                indent_row = true;
            };

            if (self.indent_properties || self.indent_properties > 0) {
                indent_px += self.indent_properties;
            };

            if (indent_row) {
                row.html.css("margin-left", indent_px);
            };

            if (!row_details["can_edit"]) {
                row.SetLocked(true);
            };

            self.html.append(row.html);

        })(this, row_details);

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
        };

        if (this.set_data_cb) {
            this.set_data_cb(property_key, selected_option);
            return;
        };

        console.log("Error: Property Box has no callback and no endpoint information!");

    };

    this.on_row_updated = function(row_input, row_details){

        var new_value = row_input.Text();

        if (new_value == row_details["value"]) {
            console.log("The data didn't change");
            return;
        };

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
        };

        if (row_details["key"].includes("password") && this.endpoint == "Users") {
            params["f"] = "update_password";
            params["p"] = new_value;
        };

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
            };

            return;
        };

        console.log("SERVER RESPONSE");
        console.log(response);

        row_input.FlashSave();

        if (this.set_data_cb) {
            this.set_data_cb(response);
            return;
        };

    };

    this.setup_styles();

};
