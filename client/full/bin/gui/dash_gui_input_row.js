
function DashGuiInputRow(label_text, initial_value, placeholder_text, button_text, on_click, on_click_bind, color, data_key=""){

    this.label_text = label_text;
    this.initial_value = initial_value;
    this.placeholder_text = placeholder_text;
    this.button_text = button_text;
    this.on_click = on_click;
    this.on_click_bind = on_click_bind;
    this.data_key = data_key;

    this.html = $("<div></div>");
    this.flash_save = $("<div></div>");
    this.highlight = $("<div></div>");
    this.invalid_input_highlight = $("<div></div>");
    this.save_button_visible = false;
    this.autosave_timeout = null;

    this.color = color || Dash.Color.Light;

    this.setup_styles = function () {
        this.html.append(this.invalid_input_highlight);
        this.html.append(this.highlight);
        this.html.append(this.flash_save);
        this.label = $("<div>" + this.label_text + ": </div>");

        this.input = new Dash.Gui.Input(this.placeholder_text, this.color);
        this.input.SetTransparent(true);

        this.set_initial_text();

        this.input.input.css({"padding-left": Dash.Size.Padding*0.5});
        this.input.OnChange(this.input_changed, this);

        this.html.append(this.label);
        this.html.append(this.input.html);

        var highlight_color = this.color.AccentGood;
        if (this.on_click) {
            this.input.OnSubmit(this.on_submit, this);
            this.create_save_button();
        }
        else {
            this.input.SetLocked(true);
            highlight_color = this.color.AccentBad;
        }

        this.html.css({
            "cursor": "pointer",
            "height": Dash.Size.RowHeight,
            "display": "flex",
            "border-bottom": "1px dotted rgba(0, 0, 0, 0.2)",
        });

        this.invalid_input_highlight.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding*0.5,
            "background": this.color.AccentBad,
            "opacity": 0,
        });

        this.highlight.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": highlight_color,
            "opacity": 0,
        });

        this.flash_save.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": Dash.Color.SaveHighlight,
            "opacity": 0,
        });

        this.input.html.css({
            "flex-grow": 2,
            "margin-right": Dash.Size.Padding,
        });

        this.label.css({
            "height": Dash.Size.RowHeight,
            "line-height": (Dash.Size.RowHeight) + "px",
            "text-align": "left",
            "color": this.color.Text,
            "font-family": "sans_serif_bold",
            "font-size": "80%",
        });

        if (Array.isArray(this.button_text)) {
            this.SetupCombo(this.button_text);
        }

    };

    this.set_initial_text = function () {
        this.input.SetText(this.parse_value(this.initial_value));
    };

    this.parse_value = function (value) {
        if (!value) {
            return value;
        }

        // Initial value is a dict
        if (Object.keys(this.initial_value).length !== 0 && this.initial_value.constructor === Object) {
            value = JSON.stringify(value);
        }

        // Initial value is an array
        else if (this.initial_value.length && Array.isArray(this.initial_value)) {
            value = JSON.stringify(value);
        }

        // Initial value is ISO datetime string
        if (Dash.IsServerIsoDate(value)) {
            value = Dash.ReadableDateTime(value);
        }

        // Initial value is team member email
        else if (Dash.IsValidEmail(value) && !(this.data_key.includes("email"))) {
            if ("team" in Dash.User.Init && value in Dash.User.Init["team"]) {
                if ("display_name" in Dash.User.Init["team"][value]) {
                    value = Dash.User.Init["team"][value]["display_name"];
                }
            }
        }

        return value;
    };

    this.create_save_button = function () {
        this.button = new Dash.Gui.Button(this.button_text, this.on_submit, this);
        this.html.append(this.button.html);

        this.button.html.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "margin": 0,
            "height": Dash.Size.RowHeight,
            "width": Dash.Size.ColumnWidth,
            "background": "none",
            "opacity": 0,
        });

        // console.log(Dash.Color.Text);

        this.button.highlight.css({
            "background": "none",
        });


        this.button.label.css({
            "text-align": "right",
            "line-height": Dash.Size.RowHeight + "px",
            // "color": Dash.Color.Dark.Text,
            "color": "rgba(0, 0, 0, 0.9)",
            // "position": "absolute",
            // "right": 0,
            // "top": 0,
            // "margin": 0,
            // "width": 200,
            // "width": Dash.Size.ColumnWidth,
            // "opacity": 0,
        });

    };

    this.SetInputValidity = function(input_is_valid){
        console.log("input_is_valid: " + input_is_valid);
        console.log(this.color);

        if (input_is_valid) {
            this.invalid_input_highlight.stop().animate({"opacity": 0}, 100);
        }
        else {
            this.invalid_input_highlight.stop().animate({"opacity": 1}, 100);
        }

    };

    this.FlashSave = function () {

        (function(self){

            self.flash_save.stop().animate({"opacity": 1}, 100, function () {
                self.flash_save.stop().animate({"opacity": 0}, 1000);
            });

        })(this);

    };

    this.SetupCombo = function(combo_options){

        this.initial_value = this.initial_value || combo_options[0]["id"];

        this.input.html.css({
            "opacity": 0,
            "user-select": "none",
            "pointer-events": "none",
            "position": "absolute",
            "left": 0,
            "top": 0,

        });

        var options = {};
        options["list"] = combo_options;
        options["selected"] = ComboUtils.GetDataFromID(combo_options, this.initial_value);
        options["thin_style"] = true;
        options["text_alignment"] = "left";
        options["label_style"] = "light";
        options["label_transparent"] = true;

        this.combo = new Combo(this, "", options, this.on_combo_changed, this);
        this.html.append(this.combo.html);

    };

    this.on_combo_changed = function(option){
        if (!this.combo) {return;}

        this.input.SetText(option["id"]);

        if (this.on_click) {
            this.on_submit();
        }

    };

    this.on_label_clicked = function () {
        var active_text = this.input.Text();

        if (active_text.slice(0, 8) === "https://") {
            window.open(active_text, "_blank");
        }

        if (Dash.IsValidEmail(active_text)) {
            window.open("mailto:" + active_text, "_blank");
        }
    };

    this.setup_connections = function () {

        (function(self){

            self.label.on("click", function () {
                self.on_label_clicked();
            });

            self.html.on("mouseenter", function () {
                self.highlight.stop().animate({"opacity": 0.5}, 50);
            });

            self.html.on("mouseleave", function () {
                self.highlight.stop().animate({"opacity": 0}, 250);
            });

        })(this);

    };

    this.SetAutosave = function(use_autosave){
        this.autosave = use_autosave;
        return this;
    };

    this.input_changed = function(ignore_save_button_show){
        if (!this.button) {return;}
        if (ignore_save_button_show) {return;}

        if (this.autosave) {

            if (this.autosave_timeout) {
                clearTimeout(this.autosave_timeout);
                this.autosave_timeout = null;
            }

            (function(self){
                self.autosave_timeout = setTimeout(function () {self.trigger_autosave();}, 500);
            })(this);

        }
        else {
            this.show_save_button();
        }

    };

    this.trigger_autosave = function () {

        if (!this.load_dots) {
            this.setup_load_dots();
        }

        if (this.load_dots.IsActive()) {
            this.input_changed();
            return;
        }

        this.on_submit();

    };

    this.setup_load_dots = function () {
        if (this.load_dots) {return;}
        this.load_dots = new LoadDots(this.height-Dash.Size.Padding);
        this.load_dots.SetOrientation("vertical");
        this.load_dots.SetColor("rgba(0, 0, 0, 0.8)");

        this.html.append(this.load_dots.html);

        this.load_dots.html.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "top": Dash.Size.Padding*0.5,
        });

    };

    this.CanAutoUpdate = function () {

        var highlight_opacity = parseFloat("" + this.highlight.css("opacity"));

        if (highlight_opacity > 0.2) {
            return false;
        }

        return !this.save_button_visible;

    };

    this.show_save_button = function () {
        if (this.save_button_visible || !this.button) {return;}
        this.button.html.stop().animate({"opacity": 1});
        this.save_button_visible = true;
    };

    this.hide_save_button = function () {
        if (!this.save_button_visible || !this.button) {return;}
        this.button.html.stop().animate({"opacity": 0});
        this.save_button_visible = false;
    };

    this.SetText = function(text){
        text = this.parse_value(text);

        this.input.SetText(text);
        this.input_changed(true);

        if (this.autosave_timeout) {
            clearTimeout(this.autosave_timeout);
            this.autosave_timeout = null;
        }

        if (this.load_dots) {
            this.load_dots.Stop();
        }

        this.hide_save_button();

    };

    this.Text = function () {
        return this.input.Text();
    };

    this.Request = function(api, server_data, callback, callback_binder){
        var request = null;

        this.request_callback = callback;
        this.request_callback_binder = callback_binder;

        if (!server_data["token"]) {
            server_data["token"] = Dash.Local.Get("token");
        }

        (function(self){
            request = self.button.Request(api, server_data, function(response_json){
                self.on_request_response(response_json);
            }, self);
        })(this);

        return request;
    };

    this.on_request_response = function(response_json){

        this.hide_save_button();

        if (this.load_dots) {
            this.load_dots.Stop();
        }

        this.request_callback.bind(this.request_callback_binder)(response_json);

    };

    this.SetLocked = function(is_locked){

        if (is_locked) {
            this.DisableSaveButton();
        }
        else {
            this.EnableSaveButton();
        }

    };

    this.EnableSaveButton = function () {
        if (!this.button) {return;}
        // this.button.SetButtonVisibility(true);
        this.input.SetLocked(false);
        this.input.SetTransparent(true);
    };

    this.DisableSaveButton = function () {
        if (!this.button) {return;}
        // this.button.SetButtonVisibility(false);
        this.input.SetLocked(true);
    };

    this.IsLoading = function () {
        if (this.button) {
            return this.button.IsLoading();
        }

        else {
            return false;
        }
    };

    this.SetAlignRight = function () {

        var spacer = $("<div></div>");
        this.html.prepend(spacer);

        spacer.css({
            "flex-grow": 1,
        });

        this.html.css({
            "padding-right": Dash.Size.Padding,
        });

        this.label.css({
            "width": "auto",
        });

    };

    this.on_submit = function () {
        this.hide_save_button();
        this.highlight.stop().animate({"opacity": 0}, 100);
        this.invalid_input_highlight.stop().animate({"opacity": 0}, 100);
        var response_callback = this.on_click.bind(this.on_click_bind);
        response_callback(this);
    };

    this.setup_styles();
    this.setup_connections();

}
