function DashGuiComboRow (combo, option) {
    this.combo = combo;
    this.option = option;

    this.color_set = this.combo.color_set;
    this.label_text = this.option["label_text"] || this.option["display_name"];
    this.height = this.combo.height || Dash.Size.ButtonHeight;
    this.html = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.label = $("<div class='Combo'>" + this.label_text + "</div>");

    this.setup_styles = function () {
        this.html.append(this.highlight);
        this.html.append(this.label);

        this.html.css({
            "height": this.height,
        });

        this.highlight.css({
            "position": "absolute",
            "inset": 0,
            "background": "rgba(255, 255, 255, 0.2)",
            "opacity": 0,
        });

        this.label.css({
            "text-align": this.combo.text_alignment,
            "height": this.height,
            "line-height": this.height + "px",
            "white-space": "nowrap",
            // "margin-right": Dash.Size.Padding * 0.1,
            "border-bottom": "1px solid rgba(255, 255, 255, 0.1)",
            "color": this.color_set.Text.Base,
        });
    };

    // Prior to showing, set the width of rows to fit the content
    this.SetWidthToFit = function (label_width=null) {
        if (!label_width) {
            label_width = "fit-content";
        }

        this.html.css({
            "width": "fit-content",
        });

        this.label.css({
            "width": label_width,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.6,
        });
    };

    // Prior to showing, set the width of rows
    this.SetWidth = function (width) {
        this.html.css({
            "width": width,
        });

        this.label.css({
            "width": width-Dash.Size.Padding,
            "padding-left": Dash.Size.Padding*0.5,
            "padding-right": Dash.Size.Padding*0.5,
        });
    };

    this.SetSearchResultActive = function (is_active) {
        this.set_highlight_active(is_active);
    };

    this.set_highlight_active = function (is_active) {
        if (is_active) {
            this.highlight.stop().animate({"opacity": 1}, 50);
        }

        else {
            this.highlight.stop().animate({"opacity": 0}, 100);
        }
    };

    this.setup_connections = function () {
        (function (self) {
            self.label.on("mouseenter", function () {
                self.set_highlight_active(true);
            });

            self.html.on("mouseleave", function () {
                self.set_highlight_active(false);
            });

            self.label.on("click", function (e) {
                self.combo.on_selection(self.option);

                e.preventDefault();

                return false;
            });
        })(this);
    };

    this.setup_styles();
    this.setup_connections();
}
