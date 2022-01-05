function DashGuiButton (label, callback, bind, color=null, options={}) {
    this.label      = label;
    this.callback   = callback;
    this.bind       = bind;
    this.color      = color || Dash.Color.Light;
    this.options    = options;

    this.html            = $("<div></div>");
    this.highlight       = $("<div></div>");
    this.click_highlight = $("<div></div>");
    this.load_bar        = $("<div></div>");
    this.label           = $("<div>" + this.label + "</div>");

    this.load_dots             = null;
    this.color_set             = null;
    this.right_label           = null;
    this.label_shown           = null;
    this.last_right_label_text = null;
    this.is_selected           = false;
    this.style                 = this.options["style"] || "default";
    this.in_toolbar            = this.style === "toolbar";

    DashGuiButtonInterface.call(this);

    this.initialize_style = function () {
        // Toss a warning if this isn't a known style, so we don't fail silently
        this.styles = ["default", "toolbar", "tab_top", "tab_side"];

        if (!this.styles.includes(this.style)) {
            console.error("Error: Unknown Dash Button Style: " + this.style);

            this.style = "default";
        }

        if (this.style === "toolbar") {
            this.color_set = this.color.Button;

            DashGuiButtonStyleToolbar.call(this);
        }

        else if (this.style === "tab_top") {
            this.color_set = this.color.Tab;

            DashGuiButtonStyleTabTop.call(this);
        }

        else if (this.style === "tab_side") {
            this.color_set = this.color.Tab;

            DashGuiButtonStyleTabSide.call(this);
        }

        else {
            this.color_set = this.color.Button;

            DashGuiButtonStyleDefault.call(this);
        }

        if (!this.color instanceof DashColorSet) {
            console.warn("Warning: DashGuiButton() now accepts a DashColorSet, but you are using DashColorButtonSet");
        }

        this.setup_styles();
    };

    this.reset_background_colors = function () {
        this.html.css({
            "background": this.default_html_background
        });

        this.highlight.css({
            "background": this.default_highlight_background
        });

        this.load_bar.css({
            "background": this.default_load_bar_background
        });

        this.click_highlight.css({
            "background": this.default_click_highlight_background
        });
    };

    this.on_hover_in = function () {
        this.highlight.stop().animate({"opacity": 1}, 50);

        if (this.is_selected) {
            this.label.css("color", this.color_set.Text.SelectedHover);
        }

        else {
            this.label.css("color", this.color_set.Text.BaseHover);
        }
    };

    this.on_hover_out = function () {
        this.highlight.stop().animate({"opacity": 0}, 100);

        if (this.is_selected) {
            this.label.css("color", this.color_set.Text.Selected);
        }

        else {
            this.label.css("color", this.color_set.Text.Base);
        }
    };

    this.on_file_upload_response = function (response) {
        if (this.file_uploader.html) {
            this.file_uploader.html.remove();
        }

        if (this.file_upload_api) {
            this.SetFileUploader(this.file_upload_api, this.file_upload_params);
        }

        if (this.callback && this.bind) {
            this.callback.bind(this.bind)(response);
        }
    };

    this.on_click = function (event) {
        if (this.callback && this.bind) {
            this.callback.bind(this.bind)(event, this);
        }
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mouseenter", function () {
                self.on_hover_in();
            });

            self.html.on("mouseleave", function () {
                self.on_hover_out();
            });

            self.html.on("click", function (event) {
                self.manage_style_on_click();
                self.on_click(event);
            });
        })(this);
    };

    this.manage_style_on_click = function () {
        // Overridden in DashGuiButtonStyleTabTop

        this.highlight.stop().animate({"opacity": 0}, 50);
        this.click_highlight.stop().css({"opacity": 1});
        this.click_highlight.stop().animate({"opacity": 0}, 150);
    };

    this.set_right_label_text = function (label_text) {
        // Called when the icon is not visible

        if (!label_text && label_text != 0 || label_text === this.last_right_label_text) {
            return;
        }

        this.right_label.text(label_text);
        this.last_right_label_text = label_text;
    };

    this.setup_right_label = function () {
        this.right_label = $("<div>--</div>");

        this.html.append(this.right_label);

        var size = Math.round(Dash.Size.RowHeight-Dash.Size.Padding);

        this.right_label.css({
            "position": "absolute",
            "right": Dash.Size.Padding*0.5,
            "top": Dash.Size.Padding*0.5,
            "width": size,
            "height": size,
            "line-height": size + "px",
            "background": Dash.Color.Dark,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "font-size": (size*0.5) + "px",
            "text-align": "center",
            "opacity": 0,
        });
    };

    this.initialize_style();
    this.setup_connections();
}
