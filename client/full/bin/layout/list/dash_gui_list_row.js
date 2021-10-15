function DashGuiListRow (list, arbitrary_id) {
    this.list = list;
    this.id = arbitrary_id;

    this.columns = {};
    this.is_shown = true;
    this.is_expanded = false;
    this.color = this.list.color;
    this.expanded_highlight = null;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.column_box = $("<div></div>");
    this.expanded_content = $("<div></div>");
    this.selected_highlight = $("<div></div>");
    this.is_header = this.id === "_top_header_row";

    this.setup_styles = function () {
        if (this.is_header) {
            this.column_box.css({
                "background": this.color.AccentGood,
                "pointer-events": "none",
                "left": 0,
                "right": 0,
                "padding-left": Dash.Size.Padding,
                "padding-right": Dash.Size.Padding,
            });
        }

        else {
            this.html.append(this.highlight);
            this.html.append(this.selected_highlight);
            this.html.append(this.expanded_content);

            this.expanded_content.css({
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
            });

            this.column_box.css({
                "left": Dash.Size.Padding,
                "right": Dash.Size.Padding,
                "cursor": "pointer",
            });
        }

        this.html.append(this.column_box);

        this.column_box.css({
            "position": "absolute",
            "top": 0,
            "height": Dash.Size.RowHeight,
            "display": "flex",
        });

        this.html.css({
            "background": this.color.Background,
            "border-bottom": "1px solid rgb(200, 200, 200)",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "min-height": Dash.Size.RowHeight,
        });

        this.setup_columns();
        this.setup_connections();
    };

    this.IsExpanded = function () {
        return this.is_expanded;
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
        var i;

        for (var type in this.columns) {
            if (!this.columns[type] || this.columns[type].length < 1) {
                continue;
            }

            if (type === "default") {
                for (i in this.columns[type]) {
                    var column = this.columns[type][i];

                    column["obj"].Update();
                }
            }

            else if (type === "inputs") {
                for (i in this.columns[type]) {
                    var input = this.columns[type][i];
                    var new_value = this.get_data_for_key(input["column_config_data"]);

                    if (new_value) {
                        input["obj"].SetText(new_value);
                    }
                }
            }
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

        var size_now = parseInt(this.expanded_content.css("height").replace("px", ""));

        this.expanded_content.stop().css({
            "overflow-y": "auto",
            "opacity": 1,
            "height": "auto",
            "padding-top": Dash.Size.RowHeight,
        });

        this.expanded_content.append(html);

        var target_size = parseInt(this.expanded_content.css("height").replace("px", ""));

        this.expanded_content.stop().css({
            "height": size_now,
            "overflow-y": "hidden",
        });

        (function (self) {
            self.expanded_content.animate({"height": target_size}, 180, function () {
                self.expanded_content.css({"overflow-y": "visible"});  // This MUST be set to visible so that combo skirts don't get clipped
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

        this.expanded_content.stop().css({
            "overflow-y": "hidden",
        });

        (function (self) {
            self.expanded_content.animate({"height": 0}, 180, function () {
                self.expanded_content.stop().css({
                    "overflow-y": "hidden",
                    "opacity": 0,
                });
                self.expanded_highlight.stop().animate({"opacity": 0}, 135);
                self.expanded_content.empty();
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

    this.create_expand_highlight = function () {
        this.expanded_highlight = Dash.Gui.GetHTMLAbsContext();

        this.expanded_highlight.css({
            "background": this.color.BackgroundRaised,
            "pointer-events": "none",
            "opacity": 0,
            "top": -1,
            "bottom": -1,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.15)",
        });

        this.html.prepend(this.expanded_highlight);
    };

    // Helper/handler for external GetDataForKey functions
    this.get_data_for_key = function (column_config_data, default_value=null, third_param=null) {
        if (this.is_header) {
            return column_config_data["display_name"] || column_config_data["data_key"].Title();
        }

        if (third_param !== null) {
            return this.list.binder.GetDataForKey(this.id, column_config_data["data_key"], third_param) || default_value;
        }

        return this.list.binder.GetDataForKey(this.id, column_config_data["data_key"]) || default_value;
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

                if (!this.columns["spacers"]) {
                    this.columns["spacers"] = [];
                }

                this.columns["spacers"].push({
                    "obj": spacer,
                    "column_config_data": column_config_data
                });

                left_aligned = false;
            }

            else if (column_config_data["type"] === "divider") {
                var divider = this.get_divider(column_config_data);

                this.column_box.append(divider);

                if (!this.columns["dividers"]) {
                    this.columns["dividers"] = [];
                }

                this.columns["dividers"].push({
                    "obj": divider,
                    "column_config_data": column_config_data
                });

                left_aligned = false;
            }

            else if (column_config_data["type"] === "combo") {
                var combo = this.get_combo(column_config_data);

                this.column_box.append(combo.html);

                if (!this.columns["combos"]) {
                    this.columns["combos"] = [];
                }

                this.columns["combos"].push({
                    "obj": combo,
                    "column_config_data": column_config_data
                });
            }

            else if (column_config_data["type"] === "input") {
                var input = this.get_input(column_config_data);

                this.column_box.append(input.html);

                if (!this.columns["inputs"]) {
                    this.columns["inputs"] = [];
                }

                this.columns["inputs"].push({
                    "obj": input,
                    "column_config_data": column_config_data
                });
            }

            else if (column_config_data["type"] === "icon_button") {
                var icon_button = this.get_icon_button(column_config_data);

                this.column_box.append(icon_button.html);

                if (!this.columns["icon_buttons"]) {
                    this.columns["icon_buttons"] = [];
                }

                this.columns["icon_buttons"].push({
                    "obj": icon_button,
                    "column_config_data": column_config_data
                });
            }

            else {
                column_config_data["left_aligned"] = left_aligned;

                var column = new DashGuiListRowColumn(this, column_config_data);

                this.column_box.append(column.html);

                if (!this.columns["default"]) {
                    this.columns["default"] = [];
                }

                this.columns["default"].push({
                    "obj": column,
                    "column_config_data": column_config_data
                });
            }
        }
    };

    this.ChangeColumnEnabled = function (type, index, enabled=true) {
        if (!this.columns || !this.columns[type]) {
            return;
        }

        if (index === -1) {
            index = this.columns[type].length - 1;
        }

        if ((index + 1) > this.columns[type].length) {
            return;
        }

        if (!this.columns[type][index] || !this.columns[type][index]["obj"]) {
            return;
        }

        if (type === "icon_buttons") {
            if (enabled) {
                this.columns[type][index]["obj"].Enable();
            }

            else {
                this.columns[type][index]["obj"].Disable();
            }
        }

        // Add conditions for the other types as needed
    };

    // TODO: Move all the stuff below into DashGuiListRowColumn and adjust the conditions in this.setup_columns accordingly
    this.get_spacer = function () {
        var spacer = $("<div></div>");

        spacer.css({
            "height": Dash.Size.RowHeight,
            "flex-grow": 2,
        });

        return spacer;
    };

    this.get_divider = function (column_config_data) {
        var divider_line = new Dash.Gui.Header("");

        divider_line.html.css({
            "margin-left": Dash.Size.Padding * 0.7,
        });

        divider_line.border.css({
            "width": Dash.Size.Padding * 0.25
        });

        if (column_config_data["css"]) {
            if (column_config_data["css"]["html"]) {
                divider_line.html.css(column_config_data["css"]["html"]);
            }

            if (column_config_data["css"]["border"]) {
                divider_line.border.css(column_config_data["css"]["border"]);
            }
        }

        if (this.is_header) {
            // Keep the container so the header stays properly aligned, but don't show the divider
            divider_line.html.css({
                "opacity": 0
            });
        }

        return divider_line.html;
    };

    this.get_combo = function (column_config_data) {
        var combo = new Dash.Gui.Combo (
            column_config_data["options"]["label_text"] || "",                                             // Label
            column_config_data["options"]["callback"] || column_config_data["on_click_callback"] || null,  // Callback
            column_config_data["options"]["binder"] || null,                                               // Binder
            column_config_data["options"]["combo_options"] || null,                                        // Option List
            this.get_data_for_key(column_config_data, "", true),           // Selected ID
            this.color,                                                                                    // Color set
            {"style": "row", "additional_data": {"row_id": this.id}}                                       // Options
        );

        combo.html.css({
            "height": Dash.Size.RowHeight
        });

        combo.label.css({
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px"
        });

        if (column_config_data["css"]) {
            combo.html.css(column_config_data["css"]);
        }

        return combo;
    };

    this.get_input = function (column_config_data) {
        var input = new Dash.Gui.Input(
            column_config_data["options"]["placeholder_label"] || "",
            column_config_data["options"]["color"] || this.color
        );

        input.html.css({
            "height": Dash.Size.RowHeight * 0.9,
            "margin-top": Dash.Size.Padding * 0.1,
            "box-shadow": "0px 0px 4px 1px rgba(0, 0, 0, 0.2)"
        });

        if (column_config_data["width"]) {
            input.html.css({
                "width": column_config_data["width"]
            });
        }

        input.input.css({
            "height": Dash.Size.RowHeight * 0.9,
            "line-height": (Dash.Size.RowHeight * 0.9) + "px",
            "padding-left": Dash.Size.Padding * 0.35
        });

        var starting_value = this.get_data_for_key(column_config_data);

        if (starting_value) {
            input.SetText(starting_value.toString());
        }

        if (column_config_data["options"]["callback"] && column_config_data["options"]["binder"]) {
            var row_id = this.id;

            (function (self, column_config_data, row_id, input) {
                input.OnSubmit(
                    function () {
                        var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                        callback(row_id, input.Text());
                    },
                    column_config_data["options"]["binder"]
                );

                input.EnableAutosave();
            })(this, column_config_data, row_id, input);
        }

        return input;
    };

    this.get_icon_button = function (column_config_data) {
        var row_id = this.id;

        var icon_button = new Dash.Gui.IconButton(
            column_config_data["options"]["icon_name"],
            function () {
                var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                callback(row_id);
            },
            column_config_data["options"]["binder"],
            column_config_data["options"]["color"] || this.color,
            column_config_data["options"]["options"] || {}
        );

        if (column_config_data["css"]) {
            for (var key in column_config_data["css"]) {
                icon_button.html.css(key, column_config_data["css"][key]);
            }
        }

        if (column_config_data["options"]["hover_text"]) {
            icon_button.SetHoverHint(column_config_data["options"]["hover_text"]);
        }

        if (this.is_header) {
            // Keep the container so the header stays properly aligned, but don't add an icon
            icon_button.icon.icon_html.remove();
        }

        return icon_button;
    };

    this.setup_styles();
}
