
function DashGuiPropertyBox(binder, get_data_cb, set_data_cb, endpoint, dash_obj_id, extra_params){
    this.binder = binder;

    this.get_data_cb = null;
    this.set_data_cb = null;

    if (get_data_cb && set_data_cb) {
        this.get_data_cb = get_data_cb.bind(binder);
        this.set_data_cb = set_data_cb.bind(binder);
    };

    this.endpoint = endpoint;
    this.dash_obj_id = dash_obj_id;
    this.html = Dash.Gui.GetHTMLBoxContext({});
    this.data = {};
    this.property_set_data = null; // Managed Dash data
    this.extra_params = extra_params || {};

    this.num_headers = 0;

    this.update_inputs = {};

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
            row_input.SetText(this.property_set_data[data_key]);
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

    this.AddHeader = function(label_text){

        var header = new d.Gui.Header(label_text).html;

        if (this.num_headers > 0) {
            header.css("margin-top", Dash.Size.Padding*0.5);
        };

        this.html.append(header);
        this.num_headers += 1;
    };

    this.AddButton = function(label_text, callback){
        callback = callback.bind(this.binder);

        (function(self, callback){

            var button = new d.Gui.Button(label_text, function(){
                callback(button);
            }, self);

            button.html.css("margin-top", Dash.Size.Padding);

            self.html.append(button.html);

        })(this, callback);

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
        row_details["value"] = this.data[data_key] || default_value;
        row_details["can_edit"] = can_edit;

        (function(self, row_details){

            var row = new d.Gui.InputRow(
                row_details["label_text"],
                row_details["value"],
                row_details["label_text"],
                combo_options || "Save",
                function(row_input){self.on_row_updated(row_input, row_details)},
                self
            );

            self.update_inputs[data_key] = row;

            var indent_px = 0;
            var indent_row = false;

            if (self.num_headers > 0) {
                indent_row = true;
            };

            if (indent_row) {
                row.html.css("margin-left", Dash.Size.Padding*2);
            };

            if (!row_details["can_edit"]) {
                row.SetLocked(true);
            };

            self.html.append(row.html);

        })(this, row_details);

    };

    this.on_row_updated = function(row_input, row_details){

        var new_value = row_input.Text();

        if (new_value == row_details["value"]) {
            console.log("The data didn't change");
            return;
        };

        var url = "https://" + Dash.Context.domain + "/" + this.endpoint;
        var params = {};
        params["f"] = "set_property";
        params["key"] = row_details["key"];
        params["value"] = new_value;
        params["obj_id"] = this.dash_obj_id;

        for (var key in this.extra_params) {
            params[key] = this.extra_params[key];
        };

        (function(self, row_input, row_details){

            row_input.Request(url, params, function(response){
                self.on_server_response(response, row_details);
            }, self);

        })(this, row_input, row_details);

    };

    this.on_server_response = function(response, row_details){
        console.log("SERVER RESPONSE");
        console.log(response);
    };

    this.setup_styles();

};
