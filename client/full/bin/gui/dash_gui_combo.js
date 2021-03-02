
function DashGuiCombo(label, callback, binder, option_list, selected_option_id, color_set){

    this.label = label;
    this.binder = binder;
    this.callback = callback.bind(this.binder);
    this.option_list = option_list;
    this.selected_option_id = selected_option_id;
    this.color_set = color_set || Dash.Color.Light.Button;
    this.initialized = false;

    this.html = $("<div>COMBO</div>");

    // ---------------------------------------------------

    this.html = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.click = $("<div class='Combo'></div>");
    this.label = $("<div class='ComboLabel Combo'></div>");
    this.rows = $("<div class='Combo'></div>");

    this.setup_styles = function(){

        this.font_size = "100%";

        this.highlight_css = {
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.color_set.Background.BaseHover,
            "opacity": 0,
        };

        this.text_alignment = "center";
        this.label_text_color = "rgba(0, 0, 0, 0.8)";
        this.label_background = this.color_set.Background.Base;

        this.html.append(this.highlight);
        this.html.append(this.click);
        this.html.append(this.label);
        this.html.append(this.rows);
        this.label.html(this.label_text);

        this.html.css({
            "background": this.label_background,
            "margin-right": Dash.Size.Padding*0.5,
            "height": d.Size.ButtonHeight,
            "line-height": d.Size.ButtonHeight + "px",
            "cursor": "pointer",
            "border-radius": 3,
            "width": d.Size.ColumnWidth,
        });

        this.highlight.css(this.highlight_css);

        this.click.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "line-height": d.Size.ButtonHeight + "px",
            "background": this.color_set.Background.Base,
            "opacity": 0,
        });

        this.label.css({
            "position": "absolute",
            "left": Dash.Size.Padding*0.5,
            "top": 0,
            "right": Dash.Size.Padding*0.5,
            "bottom": 0,
            "line-height": d.Size.ButtonHeight + "px",
            "text-align": this.text_alignment,
            "font-size": this.font_size,
            "color": this.color_set.Text.Base,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
        });

        this.rows.css({
            "width": d.Size.ColumnWidth,
            "z-index": 10,
            "overflow": "hidden",
            "height": 0,
            "overflow": "hidden",
            "border-radius": 3,
        });

        var selected_obj = null;

        if (this.option_list.length > 0) {
            selected_obj = this.option_list[0];
        };

        for (var x in this.option_list) {
            if (this.option_list[x]["id"] == this.selected_option_id) {
                selected_obj = this.option_list[x];
                break;
            };
        };

        if (selected_obj) {
            this.on_selection(selected_obj);
        }
        else {
            this.label.text("No Options");
        };

    };

    this.GetActiveID = function(){
        return this.selected_option_id;
    };

    this.SetModeOff = function(){
        var cmd_options = {"command": "TurnModeOff", "mindtwin_id": "markiplier", "mode": ""};
        this.link.tab_view.send_trigger("json_command", cmd_options);
    };

    this.Update = function(label_list, selected){

        // If the same item is selected, don't fire the callback on updating the list
        var ignore_callback = (selected["id"] == this.selected_option_id);

        this.option_list = label_list;
        this.selected_option_id = selected;

        // this.setup_label_list();
        this.on_selection(this.selected_option_id, ignore_callback);

    };

    this.setup_load_dots = function(){

        this.load_dots = new LoadDots(d.Size.ButtonHeight-Dash.Size.Padding);
        this.load_dots.SetOrientation("vertical");

        this.load_dots.SetColor("rgba(0, 0, 0, 0.7)");

        this.html.append(this.load_dots.html);

        if (this.text_alignment == "right") {
            this.load_dots.html.css({
                "position": "absolute",
                "top": Dash.Size.Padding*0.5,
                "right": -(d.Size.ButtonHeight-Dash.Size.Padding*1.5),
            });
        }
        else {
            this.load_dots.html.css({
                "position": "absolute",
                "top": Dash.Size.Padding*0.5,
                "left": -(d.Size.ButtonHeight-Dash.Size.Padding*1.5),
            });
        };

    };

    this.Request = function(api, server_data, on_complete_callback, bind_to){

        if (!this.load_dots) {
            this.setup_load_dots();
        };

        if (this.load_dots.IsActive()) {
            console.log("Request active...");
            return;
        };

        this.load_dots.Start();
        this.on_request_response_callback = null;
        var binder = bind_to || this.binder;
        if (binder && on_complete_callback) {
            this.on_request_response_callback = on_complete_callback.bind(binder)
        };

        (function(self){

            $.post(api, server_data, function(response) {

                self.load_dots.Stop();

                var response_json = $.parseJSON(response);

                if (self.on_request_response_callback) {
                    self.on_request_response_callback(response_json);
                };

            });

        })(this);

    };

    this.setup_label_list = function(){

        this.rows.css({
            "background": this.color_set.Background.Base,
        });

        this.rows.empty();
        this.row_buttons = [];

        for (var i in this.option_list) {

            var content = this.option_list[i];
            var button = new DashGuiComboRow(this, this.option_list[i]);
            this.rows.append(button.html);
            this.row_buttons.push(button);

        };

    };

    this.on_click = function(){

        if (this.expanded) {
            this.hide();
        }
        else {
            this.show();
        };

    };

    this.SetLabel = function(content){
        this.label.text(content["label"]);
    };

    this.SetID = function(combo_id){
        this.selected_option_id = ComboUtils.GetDataFromID(this.option_list, combo_id);
        this.on_selection(this.selected_option_id, true);
        this.flash();
    };

    this.flash = function(){
        this.click.stop().css({"opacity": 1});
        this.click.stop().animate({"opacity": 0}, 2000);
    };

    this.on_selection = function(selected_option, ignore_callback){
        // Called when a selection in the combo is made

        var label_text = selected_option["label_text"];

        if (!label_text) {
            console.log("label_text == null");
            console.log("this.initialized: " + this.initialized);
            this.label.text("ERROR");
            return;
        };

        this.hide();
        this.label.text(label_text);
        this.selected_option_id = selected_option;

        if (this.initialized && !ignore_callback && this.callback) {
            this.callback(selected_option);
        };

        this.initialized = true;

    };

    this.pre_show_size_set = function(){
        // Prior to showing, set the width of rows
        this.setup_label_list();

        this.width = this.html.width();
        this.width = this.width;

        this.rows.css({
            "width": this.width,
        });

        for (var i in this.row_buttons) {
            this.row_buttons[i].SetWidth(this.width);
        };

    };

    this.show = function(){

        this.pre_show_size_set();

        this.rows.detach();
        this.html.append(this.rows);

        this.expanded = true;
        this.rows.stop();
        var start_height = this.rows.height();

        this.rows.css({
            "height": "auto",
        });

        var end_height = this.rows.height();

        this.rows.css({
            "height": start_height,
            "z-index": 2000,
        });

        this.rows.animate({"height": end_height}, 150);

    };

    this.SetWidth = function(width){
        this.html.css({"width": width});
        this.rows.css({"width": width});
    };

    this.hide = function(){
        this.expanded = false;
        this.rows.stop();
        this.rows.animate({"height": 0}, 250, function(){$(this).css({"z-index": 10})});
    };

    this.setup_connections = function(){

        (function(self){

            $(window).click(function(event) {
                if (!self.expanded) {return;};
                if (!self.html.is(":visible")) {return;};

                if (!$(event.target).hasClass("Combo")) {
                    self.hide();

                    event.preventDefault();

                    if (event.originalEvent) {
                        event.originalEvent.preventDefault();
                    };

                    return false;

                };

            });

            self.html.mouseenter(function(){
                self.highlight.stop().css({"opacity": 1});
            });

            self.html.mouseleave(function(){
                self.highlight.stop().animate({"opacity": 0}, 200);
            });

            self.html.click(function(e){

                self.flash();

                if ($(e.target).hasClass("ComboLabel")) {
                    self.on_click();
                    e.preventDefault();
                    return false;
                };

            });

        })(this);

    };

    this.setup_styles();
    this.setup_connections();


};
