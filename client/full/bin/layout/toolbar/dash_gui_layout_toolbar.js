
// Profile page layout for the currently logged in user
function DashGuiLayoutToolbar(binder, color){

    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Light;
    this.html = new Dash.Gui.GetHTMLContext("", {});

    this.objects = [];

    this.setup_styles = function(){
        this.html.css({
            "background": this.color.Background,
            "height": Dash.Size.ButtonHeight,
            "padding-right": Dash.Size.Padding*0.5,
            "display": "flex",
            "padding-left": Dash.Size.Padding*0.5,
        });
    };

    this.AddExpander = function(placeholder_label, callback){
        var expander = $("<div></div>");
        expander.css({
            "flex-grow": 2,
        });
        this.html.append(expander);
    };

    this.AddSpace = function(width){
        var spacer = $("<div></div>");

        spacer.css({
            "width": width,
        });

        this.html.append(spacer);
    };

    this.AddButton = function(label_text, callback){

        var obj_index = this.objects.length;

        (function(self, obj_index){

            var button = new Dash.Gui.Button(
                label_text,
                function () {
                    self.on_button_clicked(obj_index);
                },
                self,
                null,
                {"style": "toolbar"}  // We're now telling GuiButton that this is a toolbar button
            );

            self.html.append(button.html);

            var obj = {};
            obj["html"] = button;
            obj["callback"] = callback.bind(self.binder);
            obj["index"] = obj_index;
            self.objects.push(obj);

        })(this, obj_index);

        var obj = this.objects[obj_index];
        var button = obj["html"];

        button.html.css({
            "margin": 0,
            "margin-top": Dash.Size.Padding*0.5,
            "margin-right": Dash.Size.Padding*0.5,
            "height": Dash.Size.RowHeight,
            "width": d.Size.ColumnWidth,
        });

        button.highlight.css({
        });

        button.label.css({
            "text-align": "center",
            "line-height": Dash.Size.RowHeight + "px",
        });

        return button;  // Ryan, I added this to make it more flexible like a standalone button
    };

    this.AddUploadButton = function(label_text, callback, bind, api, params){
        let button = new Dash.Gui.Button(label_text, callback, bind);
        button.SetFileUploader(api, params)

        button.html.css({
            "margin": 0,
            "margin-top": Dash.Size.Padding*0.5,
            "margin-right": Dash.Size.Padding*0.5,
            "height": Dash.Size.RowHeight,
            "width": d.Size.ColumnWidth,
        });

        button.highlight.css({
        });

        button.label.css({
            "text-align": "center",
            "line-height": Dash.Size.RowHeight + "px",
        });

        this.html.append(button.html)
    };

    this.AddInput = function(placeholder_label, callback){

        var obj_index = this.objects.length;
        var input = new d.Gui.Input(placeholder_label, this.color);

        input.html.css({
            "padding-left": d.Size.Padding*0.5,
            "margin-top": d.Size.Padding*0.5,
            "margin-right": d.Size.Padding*0.5,
        });

        input.input.css({
            "padding-left": 0,
            "color": "rgb(20, 20, 20)",
        });

        input.html.css({
            "background": "#ffc74c",
        });

        var obj = {};
        obj["html"] = input;
        obj["callback"] = callback.bind(this.binder);
        obj["index"] = obj_index;
        this.objects.push(obj);

        (function(self, input, obj_index){
            input.OnChange(function(){
                self.on_input_changed(obj_index);
            }, self);

            input.input.dblclick(function(){
                console.log(input);
                input.SetText("");
                self.on_input_changed(obj_index);
                console.log("double");
            });

        })(this, input, obj_index);

        this.html.append(input.html);

    };

    this.AddCombo = function(label_text, combo_options, selected_id, callback){

        if (callback) {
            callback = callback.bind(this.binder);
        };

        (function(self, selected_id, combo_options, callback){

            var _callback = function(selected_option){
                self.on_combo_updated(callback, selected_option["id"]);
            };

            var combo = new Dash.Gui.Combo (
                selected_id,      // Label
                _callback,        // Callback
                self,             // Binder
                combo_options,    // Option List
                selected_id,      // Selected
                null,             // Color set
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

        })(this, selected_id, combo_options, callback);

    };

    this.on_combo_updated = function(callback, selected_id){

        if (callback) {
            callback(selected_id);
        }
        else {
            console.log("Warning: No on_combo_updated() callback >> selected_option: " + selected_id);
        };

    };

    this.on_input_changed = function(obj_index){
        var obj = this.objects[obj_index];
        obj["callback"](obj["html"].Text(), obj["html"]);
    };

    this.on_button_clicked = function(obj_index){
        console.log(this);
        var obj = this.objects[obj_index];
        obj["callback"](obj["html"]);
    };

    this.setup_styles();

};
