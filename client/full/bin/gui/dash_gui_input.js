function DashGuiInput (placeholder_text, color) {
    this.placeholder = placeholder_text;
    this.column_width = window.ColumnWidth || (Dash.Size.RowHeight*5);
    this.color = color || Dash.Color.Light;
    this.html = $("<div></div>");
    this.last_submitted_text = "";

    if (this.placeholder.toString().toLowerCase().includes("password")) {
        this.input = $("<input class='" + this.color.PlaceholderClass + "' type=password placeholder='" + this.placeholder + "'>");
    }
    else {
        this.input = $("<input class='" + this.color.PlaceholderClass + "' placeholder='" + this.placeholder + "'>");
    };

    this.setup_styles = function () {

        this.html.append(this.input);

        this.html.css({
            "height": Dash.Size.RowHeight,
            "background": this.color.Input.Background.Base,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "padding-right": Dash.Size.Padding,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "padding": 0,
            "margin": 0,
        });

        this.input.css({
            "background": "rgba(0, 0, 0, 0)",
            "line-height": Dash.Size.RowHeight + "px",
            "width": "100%",
            "height": "100%",
            "padding-left": Dash.Size.Padding,
            "color": this.color.Text,
        });

    };

    this.SetLocked = function (is_locked) {
        if (is_locked) {
            this.input.css({"pointer-events": "none"});
            // this.html.css({"background": "rgba(255, 255, 255, 0.1)"});

            // prevent navigating to locked box via tab
            this.input[0].tabIndex = "-1";
        }
        else {
            this.input.css({"pointer-events": "auto"});
            // this.html.css({"background": "rgba(255, 255, 255, 0.7)"});
        }
    };

    this.SetDarkMode = function (dark_mode_on) {

        if (dark_mode_on) {

            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });

            this.input.css({
                "color": "rgba(255, 255, 255, 0.9)",
            });

        }

    };

    this.SetTransparent = function (is_transparent) {

        if (is_transparent) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });
        }

        return this;
    };

    this.Text = function () {
        return this.input.val();
    };

    this.SetText = function (text) {
        this.last_val = text;
        this.last_submitted_text = text;
        return this.input.val(text);
    };

    this.OnChange = function (callback, bind_to) {
        this.on_change_callback = callback.bind(bind_to);
    };

    this.OnSubmit = function (callback, bind_to) {
        this.on_submit_callback = callback.bind(bind_to);
    };

    this.on_change = function () {
        // Fired if the box is clicked on or the user is typing

        var changed = this.input.val() != this.last_val;
        this.last_val = this.input.val();

        if (changed && this.on_change_callback) {
            this.on_change_callback();
        };

    };

    this.on_submit = function () {
        // Fired on 'enter' or 'paste'

        if (this.on_submit_callback) {
            this.on_submit_callback();
            this.last_submitted_text = this.input.val();
        }

    };

    this.setup_connections = function () {

        (function (self) {

            self.input.on("click", function (event) {
                event.preventDefault();
                return false;
            });

            self.input.on("keypress",function (e) {
                if (e.which == 13) {
                    self.on_submit();
                }
            });

            self.input.on("change", function () {
                self.on_change();
            });

            self.input.on("paste", function () {
                self.on_change();
            });

            self.input.on("keyup click", function () {
                self.on_change();
            });

            self.input.on("blur", function () {

                var changed = self.input.val() != self.last_submitted_text;

                if (changed) {
                    self.on_submit();
                };

            });

        })(this);

    };

    this.Focus = function () {
        this.input.focus();
    };

    this.setup_styles();
    this.setup_connections();

}
