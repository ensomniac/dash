function DashGuiListRow (list, arbitrary_id) {
    this.list = list;
    this.is_shown = true;
    this.id = arbitrary_id;
    // this.is_selected = false;
    this.is_expanded = false;
    this.color = this.list.color;
    this.expanded_highlight = null;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.column_box = $("<div></div>");
    this.expand_content = $("<div></div>");
    this.selected_highlight = $("<div></div>");

    // TODO: These lists should really be consolidated into a columns dict, but don't want to break anything
    this.combos = [];
    this.columns = [];
    this.spacers = [];
    this.dividers = [];

    this.setup_styles = function () {
        // this.html.append(this.expand_content);
        this.html.append(this.highlight);
        this.html.append(this.selected_highlight);
        this.html.append(this.expand_content);
        this.html.append(this.column_box);

        this.column_box.css({
            "position": "absolute",
            "left": Dash.Size.Padding,
            "top": 0,
            "right": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "display": "flex",
            "cursor": "pointer",
        });

        this.expand_content.css({
            "margin-left": -Dash.Size.Padding,
            "margin-right": -Dash.Size.Padding,
            "overflow-y": "hidden",
            "height": 0,
        });

        this.selected_highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "height": Dash.Size.RowHeight,
            "background": "rgb(240, 240, 240)", // Not correct
            "pointer-events": "none",
            "opacity": 0,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "height": Dash.Size.RowHeight,
            "background": this.color.AccentGood, // Not correct
            "pointer-events": "none",
            "opacity": 0,
            // "cursor": "pointer",
        });

        this.html.css({
            "background": this.color.Background,
            "border-bottom": "1px solid rgb(200, 200, 200)",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            // "cursor": "pointer",
            "min-height": Dash.Size.RowHeight,
        });

        this.setup_columns();
        this.setup_connections();
    };

    this.create_expand_highlight = function () {
        this.expanded_highlight = Dash.Gui.GetHTMLAbsContext();

        this.expanded_highlight.css({
            "background": this.color.BackgroundRaised,
            "pointer-events": "none",
            "opacity": 0,
            "top": -1,
            "bottom": -1,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.15)",
            // "z-index": 2000,
        });

        this.html.css({
            // "border-bottom": "1px solid rgb(200, 200, 200)",
        });

        this.html.prepend(this.expanded_highlight);
    };

    this.Hide = function () {
        if (!this.is_shown) {
            return;
        }

        this.is_shown = false;
        this.html.css("display", "none");
    };

    this.Show = function () {
        if (this.is_shown) {
            return;
        }

        this.is_shown = true;
        this.html.css("display", "block");
    };

    this.Update = function () {
        for (var i in this.columns) {
            this.columns[i].Update();
        }
    };

    // Expand an html element below this row
    this.Expand = function (html) {
        if (this.is_expanded) {
            console.log("Already expanded");
            this.Collapse();
            return;
        }

        this.html.css("z-index", 2000);

        if (!this.expanded_highlight) {
            this.create_expand_highlight();
        }

        this.expanded_highlight.stop().animate({"opacity": 1}, 270);

        var size_now = parseInt(this.expand_content.css("height").replace("px", ""));

        this.expand_content.stop().css({
            "overflow-y": "auto",
            "opacity": 1,
            "height": "auto",
            "padding-top": Dash.Size.RowHeight,
        });

        this.expand_content.append(html);

        var target_size = parseInt(this.expand_content.css("height").replace("px", ""));

        this.expand_content.stop().css({
            "height": size_now,
            "overflow-y": "hidden",
        });

        (function(self){
            self.expand_content.animate({"height": target_size}, 180, function () {
                self.expand_content.css({"overflow-y": "auto"});
                self.is_expanded = true;
            });
        })(this);
    };

    this.Collapse = function () {
        if (!this.is_expanded) {
            return;
        }

        this.html.css("z-index", "initial");

        if (this.expanded_highlight) {
            this.expanded_highlight.stop().animate({"opacity": 0}, 270);
        }

        // var size_now = parseInt(this.expand_content.css("height").replace("px", ""));
        // var target_height = 0;

        this.expand_content.stop().css({
            "overflow-y": "hidden",
        });

        (function(self){
            self.expand_content.animate({"height": 0}, 180, function () {
                self.expand_content.stop().css({
                    "overflow-y": "hidden",
                    "opacity": 0,
                });
                self.expanded_highlight.stop().animate({"opacity": 0}, 135);
                self.expand_content.empty();
                self.is_expanded = false;
            });
        })(this);
    };

    this.SetSelected = function (is_selected) {
        // this.is_selected = is_selected;

        // if (this.is_selected) {
        //     this.selected_highlight.stop().animate({"opacity": 1}, 100);
        // }
        // else {
        //     this.selected_highlight.stop().animate({"opacity": 0}, 250);
        // };
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mouseenter", function () {
                self.highlight.stop().animate({"opacity": 1}, 100);
            });

            self.html.on("mouseleave", function () {
                if (!self.is_expanded) {
                    self.highlight.stop().animate({"opacity": 0}, 250);
                }
            });

            self.column_box.on("click", function () {
                self.list.SetSelection(self.id);
            });
        })(this);
    };

    this.setup_columns = function () {
        var left_aligned = true;

        for (var x in this.list.column_config.columns) {
            var column_config_data = this.list.column_config.columns[x];

            if (column_config_data["type"] === "spacer") {
                var spacer = this.get_spacer();

                this.column_box.append(spacer);

                this.spacers.push(spacer);

                left_aligned = false;
            }

            else if (column_config_data["type"] === "divider") {
                var divider = this.get_divider();

                this.column_box.append(divider);

                this.dividers.push(divider);

                left_aligned = false;
            }
            
            // TODO: This should be part of DashGuiListRowColumn, but I couldn't get it to work
            else if (column_config_data["type"] === "combo") {
                var combo = this.get_combo(column_config_data);

                this.column_box.append(combo);

                this.combos.push(combo);
            }

            else {
                column_config_data["left_aligned"] = left_aligned;

                var column = new DashGuiListRowColumn(this, column_config_data);

                this.column_box.append(column.html);

                this.columns.push(column);
            }
        }
    };

    this.get_spacer = function () {
        var spacer = $("<div></div>");

        spacer.css({
            "height": Dash.Size.RowHeight,
            "flex-grow": 2,
        });

        return spacer;
    };

    this.get_divider = function () {
        var divider_line = new Dash.Gui.Header("");

        divider_line.html.css({
            "margin-left": Dash.Size.Padding * 0.7,
        });

        divider_line.border.css({
            "width": Dash.Size.Padding * 0.25
        });

        return divider_line.html;
    };

    this.get_combo = function (column_config_data) {
        var combo = new Dash.Gui.Combo (
            column_config_data["options"]["label_text"] || "",                                             // Label
            column_config_data["options"]["callback"] || column_config_data["on_click_callback"] || null,  // Callback
            column_config_data["options"]["binder"] || null,                                               // Binder
            column_config_data["options"]["combo_options"] || null,                                        // Option List
            this.list.binder.GetDataForKey(this.id, column_config_data["data_key"]) || "",                 // Selected ID
            this.color,                                                                                    // Color set
            {"style": "row"}                                                                               // Options
        );

        combo.html.css({
            "height": Dash.Size.RowHeight
        });

        combo.label.css({
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px"
        });

        return combo.html;
    };

    this.setup_styles();
}
