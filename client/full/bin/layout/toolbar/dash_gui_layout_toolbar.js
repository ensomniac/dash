
// Profile page layout for the currently logged in user
function DashGuiLayoutToolbar(binder, color){

    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;
    this.html = new Dash.Gui.GetHTMLContext("", {});
    this.stroke_sep = new Dash.Gui.GetHTMLAbsContext("", {});

    this.objects = [];

    this.setup_styles = function(){

        this.html.css({
            "background": this.color.Background,
            "height": Dash.Size.ButtonHeight+1, // +1 for the bottom stroke
            "padding-right": Dash.Size.Padding*0.5,
            "display": "flex",
            "padding-left": Dash.Size.Padding*0.5,
            // "box-shadow": "0px 0px 5px 1px rgba(0, 0, 0, 0.2)",
        });

        this.stroke_sep.css({
            "background": this.color.Background,
            "background": this.color.AccentGood,
            "top": "auto",
            "height": 1,
        });

        this.html.append(this.stroke_sep);

    };

    this.AddExpander = function(placeholder_label, callback){
        var expander = $("<div></div>");

        expander.css({
            "flex-grow": 2,
        });

        this.html.append(expander);

        return expander;
    };

    this.AddSpace = function(width){
        var spacer = $("<div></div>");

        spacer.css({
            "width": width,
        });

        this.html.append(spacer);
    };

    this.AddIconButton = function (icon_name, callback, width=null, data=null) {

        var obj_index = this.objects.length;
        var button = null;

        (function(self, obj_index, data){
            button = new Dash.Gui.IconButton(
                icon_name,
                function () {
                    self.on_button_clicked(obj_index, data);
                },
                self,
                null,
                {"style": "toolbar"}
            );

            self.html.append(button.html);

            var obj = {};
            obj["html"] = button;
            obj["callback"] = callback.bind(self.binder);
            obj["index"] = obj_index;
            self.objects.push(obj);

        })(this, obj_index, data);

        return button;

    };

    this.AddButton = function (label_text, callback, width=null, data=null) {

        var obj_index = this.objects.length;
        var button = null;

        (function(self, obj_index, data){
            button = new Dash.Gui.Button(
                label_text,
                function () {
                    self.on_button_clicked(obj_index, data);
                },
                self,
                null,
                {"style": "toolbar"}
            );

            self.html.append(button.html);

            var obj = {};
            obj["html"] = button;
            obj["callback"] = callback.bind(self.binder);
            obj["index"] = obj_index;
            self.objects.push(obj);

        })(this, obj_index, data);

        return button;

    };

    this.AddHTML = function(html){
        this.html.append(html);
    };

    this.AddUploadButton = function(label_text, callback, bind, api, params){

        var button = new Dash.Gui.Button(
            label_text,
            callback,
            bind,
            null,
            {"style": "toolbar"}
        );

        button.SetFileUploader(api, params);

        this.html.append(button.html);

        return button;
    };

    this.AddDivider = function () {
        var divider_line = this.AddLabel("", false);

        divider_line.html.css({
            "padding-left": 0,
            "margin-left": Dash.Size.Padding * 0.7,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * 0.2,
        });
    };

    // Intended to be the first item, if you want a header-style label starting the toolbar
    this.AddLabel = function (text, add_end_border=true, color=null) {
        var header = new Dash.Gui.Header(text, color);

        header.html.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding,
        });

        this.html.append(header.html);

        if (!add_end_border) {
            return header;
        }

        var end_border = $("<div></div>");

        end_border.css({
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-bottom": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding * 0.5,
            "left": -Dash.Size.Padding*0.25,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding*0.5,
            "background": this.color.AccentGood,
        });

        this.html.append(end_border);
    };

    this.AddTransparentInput = function (placeholder_label, callback, options={}, additional_data={}) {
        var input = this.AddInput(placeholder_label, callback, options, additional_data);
        var height = Dash.Size.ButtonHeight-Dash.Size.Padding;
        var width = options["width"] || Dash.Size.ColumnWidth;
        var text_align = "left";

        if (options["center"]) {
            text_align = "center";
        }

        input.html.css({
            "padding": 0,
            "margin": 0,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid rgba(0, 0, 0, 0.2)",
            "height": height,
            "background": "none",
            "box-shadow": "none",
            "width": width,
        });

        input.input.css({
            "color": "rgb(20, 20, 20)",
            "height": height,
            "margin": 0,
            "padding": 0,
            "line-height": height + "px",
            "top": -Dash.Size.Padding * 0.5,
            "width": width,
            "text-align": text_align,
        });

        return input;
    };

    this.AddInput = function (placeholder_label, callback, options={}, additional_data={}) {
        var obj_index = this.objects.length;
        var input = new d.Gui.Input(placeholder_label, this.color);

        input.html.css({
            "padding-left": d.Size.Padding*0.5,
            "margin-top": d.Size.Padding*0.5,
        });

        input.input.css({
            "padding-left": 0,
            "color": "rgb(20, 20, 20)",
        });

        var obj = {};
        obj["html"] = input;
        obj["callback"] = callback.bind(this.binder);
        obj["index"] = obj_index;
        obj["additional_data"] = additional_data;

        if (options["on_enter"]) {
            obj["on_enter_callback"] = options["on_enter"].bind(this.binder);
        }

        this.objects.push(obj);

        (function(self, input, obj_index, obj) {

            input.OnChange(function(){
                self.on_input_changed(obj_index);
            }, self);

            if (obj["on_enter_callback"]) {

                input.OnSubmit(function(){
                    self.on_input_submitted(obj_index);
                }, self);

            };

            input.input.dblclick(function(){
                input.SetText("");
                self.on_input_changed(obj_index);
            });

        })(this, input, obj_index, obj);

        this.html.append(input.html);

        return input;
    };

    this.AddCombo = function(label_text, combo_options, selected_id, callback, return_full_option=false, additional_data={}) {
        var obj_index = this.objects.length;

        if (callback) {
            callback = callback.bind(this.binder);
        }

        (function(self, selected_id, combo_options, callback, return_full_option, additional_data){

            var _callback = function(selected_option, previous_selected_option, additional_data){
                self.on_combo_updated(
                    callback,
                    return_full_option ? selected_option : selected_option["id"],
                    return_full_option ? previous_selected_option : previous_selected_option["id"],
                    additional_data
                );
            };

            var combo = new Dash.Gui.Combo (
                selected_id,      // Label
                _callback,        // Callback
                self,             // Binder
                combo_options,    // Option List
                selected_id,      // Selected
                self.color,             // Color set
                {"style": "row", "additional_data": additional_data}
            );

            self.html.append(combo.html);

            combo.html.css({
                "margin-top": Dash.Size.Padding*0.5,
                "margin-right": Dash.Size.Padding*0.5,
                "height": Dash.Size.RowHeight,
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px",
            });

            var obj = {};
            obj["html"] = combo;
            obj["callback"] = callback.bind(self.binder);  // Not sure if this is right
            obj["index"] = obj_index;
            self.objects.push(obj);

        })(this, selected_id, combo_options, callback, return_full_option, additional_data);

        var obj = this.objects[obj_index];
        var combo = obj["html"];

        return combo;
    };

    this.on_combo_updated = function (callback, selected_id, previous_selected_option, additional_data) {
        if (callback) {
            callback(selected_id, previous_selected_option, this, additional_data);
        }
        else {
            console.log("Warning: No on_combo_updated() callback >> selected_option: " + selected_id);
        }

    };

    this.on_input_changed = function(obj_index){
        var obj = this.objects[obj_index];
        obj["callback"](obj["html"].Text(), obj["html"]);
    };

    this.on_input_submitted = function(obj_index){
        var obj = this.objects[obj_index];
        obj["on_enter_callback"](obj["html"].Text(), obj["html"], obj["additional_data"]);
    };

    this.on_button_clicked = function(obj_index, data=null){
        var obj = this.objects[obj_index];
        obj["callback"](obj["html"], data, this);
    };

    this.setup_styles();

}
