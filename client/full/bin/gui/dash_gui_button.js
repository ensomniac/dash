
function DashGuiButton(Label, Callback, Bind, color_set){

    this.label = Label;
    this.callback = Callback;
    this.bind = Bind;

    this.color_set = color_set || Dash.Color.Light.Button;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.click_highlight = $("<div></div>");
    this.load_bar = $("<div></div>");
    this.label = $("<div>" + this.label + "</div>");
    this.load_dots = null;
    this.right_label = null;
    this.label_shown = null;
    this.last_right_label_text = null;
    this.is_selected = false;

    this.setup_styles = function(){

        this.html.append(this.highlight);
        this.html.append(this.load_bar);
        this.html.append(this.click_highlight);
        this.html.append(this.label);

        this.html.css({
            "background": this.color_set.Background.Base,
            "cursor": "pointer",
            "height": d.Size.ButtonHeight,
            "border-radius": d.Size.BorderRadius,
            "padding-left": d.Size.Padding,
            "padding-right": d.Size.Padding,
            "padding": 0,
            "margin": 0,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": this.color_set.Background.BaseHover,
            // "background": "pink",
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });

        this.load_bar.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": 0,
            "background": d.Color.Primary,
            "border-radius": d.Size.BorderRadius,
        });

        this.click_highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": "rgba(255, 255, 255, 0.5)",
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });

        this.label.css({
            "position": "absolute",
            "left": d.Size.Padding,
            "top": 0,
            "right": d.Size.Padding,
            "bottom": 0,
            "line-height": (d.Size.ButtonHeight) + "px",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "text-align": "center",
            "color": this.color_set.Text.Base,
        });
    };

    this.SetBorderRadius = function(border_radius){

        this.html.css({
            "border-radius": border_radius,
        });

        this.highlight.css({
            "border-radius": border_radius,
        });

        this.load_bar.css({
            "border-radius": border_radius,
        });

        this.click_highlight.css({
            "border-radius": border_radius,
        });

    };

    this.SetTextAlign = function(text_alignment){

        this.label.css({
            "text-align": text_alignment,
        });

    };

    this.SetFontSize = function(font_size){

        this.label.css({
            "font-size": font_size,
        });

    };

    this.SetSelected = function(is_selected){

        if (is_selected == this.is_selected) {
            return;
        };

        this.is_selected = is_selected;

        if (this.is_selected) {
            this.html.css({"background": this.color_set.Background.Selected});
            this.highlight.css({"background": this.color_set.Background.SelectedHover});
        }
        else {
            this.html.css({"background": this.color_set.Background.Base});
            this.highlight.css({"background": this.color_set.Background.BaseHover});
        };

        this.on_hover_out();

    };

    this.on_hover_in = function(){
        this.highlight.stop().animate({"opacity": 1}, 50);

        if (this.is_selected) {
            this.label.css("color", this.color_set.Text.SelectedHover);
        }
        else {
            this.label.css("color", this.color_set.Text.BaseHover);
        };

    };

    this.on_hover_out = function(){
        this.highlight.stop().animate({"opacity": 0}, 100);

        if (this.is_selected) {
            this.label.css("color", this.color_set.Text.Selected);
        }
        else {
            this.label.css("color", this.color_set.Text.Base);
        };

    };

    this.SetButtonVisibility = function(button_visible){

        if (button_visible) {
            this.html.css({"opacity": 1, "pointer-events": "auto"});
        }
        else {
            this.html.css({"opacity": 0, "pointer-events": "none"});
        };

    };

    this.SetLoadBar = function(t){
        this.load_bar.css({"width": this.html.width()*t});
    };

    this.IsLoading = function(){
        if (this.load_dots) {
            return true;
        }
        else {
            return false;
        };
    };

    this.SetLoading = function(is_loading){
        if (is_loading && this.load_dots) {
            return;
        };

        if (!is_loading && !this.load_dots) {
            return;
        };

        if (!is_loading && this.load_dots) {
            this.load_dots.Stop();
            this.load_dots = null;
            return;
        };

        this.load_dots = new d.Gui.LoadDots(this.html.outerHeight()-d.Size.Padding);
        this.load_dots.SetOrientation("vertical");
        this.html.append(this.load_dots.html);

        var height = this.html.css("height");
        var padding = this.html.css("padding");

        this.load_dots.html.css({
            "position": "absolute",
            "top": d.Size.Padding*0.5,
            "bottom": 0,
            "right": 0,

        });

        this.load_dots.Start();

    };

    this.SetFileUploader = function(api, params, optional_on_start_callback){

        this.file_upload_type = "file";
        this.file_upload_api = api;
        this.file_upload_params = params;

        if (this.file_uploader) {
            this.file_uploader.html.remove();
        };

        if (optional_on_start_callback) {
            this.on_file_upload_start_callback = optional_on_start_callback.bind(this.bind);
        }
        else {
            this.on_file_upload_start_callback = null;
        };

        this.file_uploader = null;

        (function(self){
            self.file_uploader = new GuiButtonFileUploader(self, api, params, function(response){
                self.on_file_upload_response(response);
            }, function(){

                if (self.on_file_upload_start_callback) {
                    self.on_file_upload_start_callback();
                };

            });
        })(this);

        this.html.append(this.file_uploader.html);

    };

    this.on_file_upload_response = function(response){

        if (this.file_uploader.html) {
            this.file_uploader.html.remove();
        };

        if (this.file_upload_api) {
            this.SetFileUploader(this.file_upload_api, this.file_upload_params);
        };

        if (this.callback && this.bind) {
            this.callback.bind(this.bind)(response);
        };

    };

    this.Request = function(api, server_data, on_complete_callback, bind_to){

        if (this.load_dots) {
            return;
        };

        this.on_request_response_callback = null;
        var binder = bind_to || this.bind;
        if (binder && on_complete_callback) {
            this.on_request_response_callback = on_complete_callback.bind(binder)
        };

        this.SetLoading(true);
        server_data = server_data || {};
        server_data["token"] = d.Local.Get("token");

        (function(self){

            $.post(api, server_data, function(response) {

                self.SetLoading(false);

                var response_json = $.parseJSON(response);

                if (self.on_request_response_callback) {
                    self.on_request_response_callback(response_json);
                };

            });

        })(this);

    };

    this.on_click = function(event){

        if (this.callback && this.bind) {
            this.callback.bind(this.bind)(event, this);
        };

    };

    this.setup_connections = function(){

        (function(self){

            self.html.mouseenter(function(){
                self.on_hover_in();
            });

            self.html.mouseleave(function(){
                self.on_hover_out();
            });

            self.html.click(function(event){
                self.highlight.stop().animate({"opacity": 0}, 50);
                self.click_highlight.stop().css({"opacity": 1});
                self.click_highlight.stop().animate({"opacity": 0}, 150);
                self.on_click(event);
            });

        })(this);

    };

    this.SetRightLabelText = function(label_text){

        if (!this.right_label) {
            this.setup_right_label();
        };

        if (label_text == this.last_right_label_text && this.label_shown) {
            return;
        };

        if (this.label_shown) {
            // Was visible

            (function(self){

                self.right_label.animate({"opacity": 0}, 200, function(){
                    self.set_right_label_text(label_text);
                    self.right_label.animate({"opacity": 1}, 600);
                });

            })(this);

        }
        else {
            // Was never visible
            this.set_right_label_text(label_text);

            this.right_label.animate({"opacity": 1}, 200, function(){
            });

        }

        this.label_shown = true;

    };

    this.set_right_label_text = function(label_text) {
        // Called when the icon is not visible

        if (!label_text && label_text != 0 || label_text == this.last_right_label_text) {
            return;
        };

        this.right_label.text(label_text);
        this.last_right_label_text = label_text;

    };

    this.setup_right_label = function(){

        this.right_label = $("<div>--</div>");

        this.html.append(this.right_label);

        var size = Math.round(d.Size.RowHeight-d.Size.Padding);

        this.right_label.css({
            "position": "absolute",
            "right": d.Size.Padding*0.5,
            "top": d.Size.Padding*0.5,
            "width": size,
            "height": size,
            "line-height": size + "px",
            "background": d.Color.Dark,
            "border-radius": 4,
            "font-size": (size*0.5) + "px",
            "text-align": "center",
            "opacity": 0,
        });

    };

    this.setup_styles();
    this.setup_connections();

};
