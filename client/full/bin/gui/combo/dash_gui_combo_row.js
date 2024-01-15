function DashGuiComboRow (combo, option) {
    this.combo = combo;
    this.option = option;

    this.checkbox = null;
    this.user_icon = null;
    this.id = this.option["id"];
    this.color = this.combo.color;
    this.color_set = this.combo.color_set;
    this.is_user_list = this.combo.is_user_list;
    this.multi_select = this.combo.multi_select;
    this.height = this.combo.height || Dash.Size.ButtonHeight;
    this.label_text = this.option["label_text"] || this.option["display_name"];

    this.html = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.label = $("<div class='Combo'>" + this.label_text + "</div>");

    this.setup_styles = function () {
        this.html.css({
            "border-bottom": this.multi_select ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
            "height": this.height
        });

        this.highlight.css({
            "position": "absolute",
            "inset": 0,
            "background": "rgba(255, 255, 255, 0.2)",
            "opacity": 0
        });

        this.label.css({
            "border-bottom": this.multi_select ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            "text-align": this.combo.text_alignment,
            "height": this.height,
            "line-height": this.height + "px",
            "white-space": "nowrap",
            "color": this.color_set.Text.Base,
            "font-size": (parseInt(this.combo.font_size) - 25) + "%"
        });

        this.html.append(this.highlight);
        this.html.append(this.label);

        this.add_user_icon();
        this.add_checkbox();
        this.setup_connections();
    };

    this.IsMultiSelected = function () {
        if (!this.multi_select || !this.checkbox) {
            return false;
        }

        return this.checkbox.IsChecked();
    };

    // Prior to showing, set the width of rows to fit the content
    this.SetWidthToFit = function (label_width=null) {
        if (!label_width) {
            label_width = "fit-content";
        }

        else if (!isNaN(parseInt(label_width))) {
            if (this.multi_select) {
                label_width -= this.height;
            }

            if (this.is_user_list) {
                label_width -= this.height;
            }
        }

        this.html.css({
            "width": "fit-content"
        });

        this.label.css({
            "width": label_width,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.6
        });
    };

    // Prior to showing, set the width of rows
    this.SetWidth = function (width) {
        this.html.css({
            "width": width
        });

        this.label.css({
            "width": width - Dash.Size.Padding,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5
        });
    };

    this.SetSearchResultActive = function (is_active) {
        this.set_highlight_active(is_active);
    };

    this.add_user_icon = function () {
        if (!this.is_user_list) {
            return;
        }

        this.html.css({
            "padding-left": this.height
        });

        this.label.css({
            "text-align": "left"
        });

        if (!this.option["id"] || this.option["id"] === "none") {
            return;
        }

        this.user_icon = $("<div></div>");

        var icon_size = (this.height * 0.9) - (Dash.Size.Stroke * 1.5);
        var img = Dash.User.GetImageByEmail(this.option["id"]);

        this.user_icon.css({
            "position": "absolute",
            "top": this.height * 0.1,
            "left": this.height * 0.1,
            "width": icon_size,
            "height": icon_size,
            "border-radius": icon_size * 0.75,
            "border": (Dash.Size.Stroke * 0.25) + "px solid " + this.color.AccentGood,
            "background-image": "url(" + img["thumb_url"] + ")",
            "background-size": "cover"
        });

        this.html.append(this.user_icon);
    };

    this.add_checkbox = function () {
        if (!this.multi_select) {
            return;
        }

        this.html.css({
            "padding-right": this.height
        });

        this.checkbox = new Dash.Gui.Checkbox(
            "dash_gui_combo_row_" + this.id + "_" + this.label_text + "_checkbox",
            false,
            this.color
        );

        // Always start unchecked
        if (!this.combo.init_labels_drawn) {
            this.checkbox.SetChecked(false);
        }

        // Make sure the tray doesn't close when selecting a checkbox
        this.checkbox.html.on("click", function (event) {
            event.stopPropagation();
        });

        (function (self) {
            self.checkbox.html.on("mouseenter", function () {
                self.set_highlight_active(true);
            });
        })(this);

        this.checkbox.html.css({
            "position": "absolute",
            "top": this.height * 0.2,
            "right": this.height * 0.2,
            "z-index": this.combo.rows.css("z-index") + 1
        });

        this.checkbox.SetIconColor(this.color_set.Text.Base);

        this.html.append(this.checkbox.html);
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
                if (self.multi_select) {
                    self.checkbox.Toggle();
                }

                else {
                    self.combo.on_selection(self.option);
                }

                e.preventDefault();

                return false;
            });
        })(this);
    };

    this.setup_styles();
}
