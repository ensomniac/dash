function DashGuiInput (placeholder_text, color) {
    this.placeholder = placeholder_text;
    this.column_width = window.ColumnWidth || (d.Size.RowHeight*5);
    this.color = color || Dash.Color.Light;
    this.html = $("<div></div>");

    if (this.placeholder.toString().toLowerCase().includes("password")) {
        this.input = $("<input type=password placeholder='" + this.placeholder + "'>");
    }
    else {
        this.input = $("<input placeholder='" + this.placeholder + "'>");
    };

    this.setup_styles = function(){

        this.html.append(this.input);

        this.html.css({
            "height": d.Size.RowHeight,
            "background": this.color.Input.Background.Base,
            "border-radius": 2,
            "padding-right": d.Size.Padding,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "padding": 0,
            "margin": 0,
        });

        this.input.css({
            "background": "rgba(0, 0, 0, 0)",
            "line-height": d.Size.RowHeight + "px",
            "width": "100%",
            "height": "100%",
            "padding-left": d.Size.Padding,
            "color": this.color.Input.Text.Base,
        });

    };

    // this.SetHeight = function(height, optional_font_size){

    //     this.row_height = height;

    //     var font_size = optional_font_size || "100%";

    //     this.html.css({
    //         "height": this.row_height,
    //         "font-size": font_size,
    //     });

    //     this.input.css({
    //         "line-height": this.row_height + "px",
    //         "font-size": font_size,
    //     });

    // };

    this.SetLocked = function(is_locked){
        if (is_locked) {
            this.input.css({"pointer-events": "none"});
            // this.html.css({"background": "rgba(255, 255, 255, 0.1)"});

            // prevent navigating to locked box via tab
            this.input[0].tabIndex = "-1";
        }
        else {
            this.input.css({"pointer-events": "auto"});
            // this.html.css({"background": "rgba(255, 255, 255, 0.7)"});
        };
    };

    this.SetDarkMode = function(dark_mode_on){

        if (dark_mode_on) {

            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });

            this.input.css({
                "color": "rgba(255, 255, 255, 0.9)",
            });

        };

    };

    this.SetTransparent = function(is_transparent){

        if (is_transparent) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });
        };

        return this;
    };

    this.Text = function(){
        return this.input.val();
    };

    this.SetText = function(text){
        this.last_val = text;
        return this.input.val(text);
    };

    this.OnChange = function(callback, bind_to){
        this.on_change_callback = callback.bind(bind_to);
    };

    this.OnSubmit = function(callback, bind_to){
        this.on_submit_callback = callback.bind(bind_to);
    };

    this.on_change = function(){
        // Fired if the box is clicked on or the user is typing

        var changed = this.input.val() != this.last_val;
        this.last_val = this.input.val();

        if (changed && this.on_change_callback) {
            this.on_change_callback();
        };

    };

    this.on_submit = function(){
        // Fired on 'enter' or 'paste'

        if (this.on_submit_callback) {
            this.on_submit_callback();
        };

    };

    this.setup_connections = function(){

        (function(self){

            self.input.on('keypress',function(e) {
                if (e.which == 13) {
                    self.on_submit();
                };
            });

            self.input.change(function(){
                self.on_change();
            });

            self.input.on("paste", function(){
                self.on_change();
            });

            self.input.on("keyup click", function(){
                self.on_change();
            });

        })(this);

    };

    this.setup_styles();
    this.setup_connections();

};
