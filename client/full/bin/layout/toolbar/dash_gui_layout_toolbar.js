
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

        return expander;
    };

    this.AddSpace = function(width){
        var spacer = $("<div></div>");

        spacer.css({
            "width": width,
        });

        this.html.append(spacer);
    };

    this.AddButton = function (label_text, callback, width=null, data=null) {
        var obj_index = this.objects.length;

        (function(self, obj_index, data){
            var button = new Dash.Gui.Button(
                label_text,
                function () {
                    self.on_button_clicked(obj_index, data);
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

        })(this, obj_index, data);

        var obj = this.objects[obj_index];
        var button = obj["html"];

        button.html.css({
            "margin": 0,
            "margin-top": Dash.Size.Padding*0.5,
            "margin-right": Dash.Size.Padding*0.5,
            "height": Dash.Size.RowHeight,
            "width": width || Dash.Size.ColumnWidth,
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
        var button = new Dash.Gui.Button(label_text, callback, bind);
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
    this.AddLabel = function (text, add_end_border=true) {
        var header = new Dash.Gui.Header(text);

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

    // Ryan, adding `return_full_option` because I need the full combo returned as it happens in
    // the regular Dash.Gui.Combo, but I don't want to break any existing Combos across all the portals
    this.AddCombo = function(label_text, combo_options, selected_id, callback, return_full_option=false) {
        var obj_index = this.objects.length;

        if (callback) {
            callback = callback.bind(this.binder);
        };

        (function(self, selected_id, combo_options, callback, return_full_option){

            var _callback = function(selected_option, previous_selected_option){
                self.on_combo_updated(
                    callback,
                    return_full_option ? selected_option : selected_option["id"],
                    return_full_option ? previous_selected_option : previous_selected_option["id"]
                );
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

            var obj = {};
            obj["html"] = combo;
            obj["callback"] = callback.bind(self.binder);  // Not sure if this is right
            obj["index"] = obj_index;
            self.objects.push(obj);

        })(this, selected_id, combo_options, callback, return_full_option);

        var obj = this.objects[obj_index];
        var combo = obj["html"];

        return combo;  // Ryan, I added this to make it more flexible like a standalone combo
    };

    this.on_combo_updated = function (callback, selected_id, previous_selected_option) {
        if (callback) {
            callback(selected_id, previous_selected_option, this);
        }
        else {
            console.log("Warning: No on_combo_updated() callback >> selected_option: " + selected_id);
        };

    };

    this.on_input_changed = function(obj_index){
        var obj = this.objects[obj_index];
        obj["callback"](obj["html"].Text(), obj["html"]);
    };

    this.on_button_clicked = function(obj_index, data=null){
        // console.log(this);
        var obj = this.objects[obj_index];
        obj["callback"](obj["html"], data, this);
    };

    this.setup_styles();

};
