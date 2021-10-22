function DashGuiListRow (list, arbitrary_id) {
    this.list = list;
    this.id = arbitrary_id;

    this.columns = {};
    this.is_shown = true;
    this.is_expanded = false;
    this.cached_preview = null;  // Intended for sublists only
    this.color = this.list.color;
    this.expanded_highlight = null;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.column_box = $("<div></div>");
    this.expanded_content = $("<div></div>");
    this.selected_highlight = $("<div></div>");
    this.is_header = this.id === this.list.header_row_tag;
    this.is_sublist = this.id.startsWith(this.list.sublist_row_tag);

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
                "margin-left": Dash.Size.Padding * (this.is_sublist ? 1 : -1),
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

    this.SetCachedPreview = function (preview_obj) {
        if (!this.is_sublist) {
            return;
        }

        this.cached_preview = preview_obj;

        return this.cached_preview;
    };

    this.GetCachedPreview = function () {
        if (!this.is_sublist) {
            return;
        }

        return this.cached_preview;
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

        // Reset this to force a redraw next time it's expanded
        this.SetCachedPreview(null);

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

    // TODO: Needs to also be implemented on Collapse
    this.SetExpandedSubListParentHeight = function (height_change) {
        if (!this.is_sublist || !this.list) {
            return;
        }

        var row = this.list.GetParentRow();

        if (!row || !row.is_sublist || !row.is_expanded) {
            return;
        }

        var size_now = parseInt(row.expanded_content.css("height").replace("px", ""));

        row.expanded_content.stop().animate({"height": size_now + height_change}, 180);

        // This will recursively continue up the stack
        row.SetExpandedSubListParentHeight(height_change);
    };

    // Expand an html element below this row
    this.Expand = function (html) {
        if (this.is_expanded) {
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
            self.expanded_content.animate(
                {"height": target_size},
                180,
                function () {
                    self.expanded_content.css({
                        "overflow-y": "visible"  // This MUST be set to visible so that combo skirts don't get clipped
                    });

                    self.is_expanded = true;
                }
            );
        })(this);

        this.SetExpandedSubListParentHeight(target_size);
    };

    this.Collapse = function () {
        if (!this.is_expanded) {
            return;
        }

        this.html.css("z-index", "initial");

        this.expanded_content.stop().css({
            "overflow-y": "hidden",
        });

        var expanded_height = parseInt(this.expanded_content.css("height").replace("px", ""));

        (function (self) {
            self.expanded_content.animate(
                {"height": 0},
                180,
                function () {
                    self.expanded_content.stop().css({
                        "overflow-y": "hidden",
                        "opacity": 0,
                    });

                    if (self.expanded_highlight) {
                        self.expanded_highlight.css({
                            "opacity": 0
                        });
                    }

                    self.expanded_content.empty();

                    self.is_expanded = false;
                }
            );
        })(this);

        this.SetExpandedSubListParentHeight(-expanded_height);
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

    this.create_expand_highlight = function () {
        this.expanded_highlight = Dash.Gui.GetHTMLAbsContext();

        this.expanded_highlight.css({
            "background": this.is_sublist ? "none" : this.color.BackgroundRaised,
            "pointer-events": "none",
            "opacity": 0,
            "top": -1,
            "bottom": -1,
            "box-shadow": this.is_sublist ? "none" : "0px 0px 10px 1px rgba(0, 0, 0, 0.15)",
        });

        if (this.is_sublist) {
            this.expanded_highlight.css({
                "margin-left": Dash.Size.Padding * 2
            });
        }

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

            self.column_box.on("click", function (e) {
                if (e.target && e.target.className.includes(" fa-")) {
                    // Don't set selection if it was an icon button that was clicked
                    return;
                }

                self.list.SetSelection(self);
            });
        })(this);
    };

    this.setup_columns = function () {
        for (var i in this.list.column_config.columns) {
            var column_config_data = this.list.column_config.columns[i];

            if (column_config_data["type"] === "spacer") {
                this.add_spacer_column(column_config_data);
            }

            else if (column_config_data["type"] === "divider") {
                this.add_divider_column(column_config_data);
            }

            else if (column_config_data["type"] === "combo") {
                this.add_combo_column(column_config_data);
            }

            else if (column_config_data["type"] === "input") {
                this.add_input_column(column_config_data);
            }

            else if (column_config_data["type"] === "icon_button") {
                this.add_icon_button_column(column_config_data);
            }

            else {
                this.add_default_column(column_config_data, i);
            }
        }
    };

    // TODO: Move all the stuff below into DashGuiListRowColumn and adjust the conditions in this.setup_columns accordingly
    this.add_spacer_column = function (column_config_data) {
        if (column_config_data["header_only"] && !this.is_header) {
            return;
        }

        var spacer = this.get_spacer();

        this.column_box.append(spacer);

        if (!this.columns["spacers"]) {
            this.columns["spacers"] = [];
        }

        this.columns["spacers"].push({
            "obj": spacer,
            "column_config_data": column_config_data
        });
    };

    this.add_divider_column = function (column_config_data) {
        var divider = this.get_divider(column_config_data);

        this.column_box.append(divider);

        if (!this.columns["dividers"]) {
            this.columns["dividers"] = [];
        }

        this.columns["dividers"].push({
            "obj": divider,
            "column_config_data": column_config_data
        });
    };

    this.add_combo_column = function (column_config_data) {
        var combo = this.get_combo(column_config_data);

        this.column_box.append(combo.html);

        if (!this.columns["combos"]) {
            this.columns["combos"] = [];
        }

        this.columns["combos"].push({
            "obj": combo,
            "column_config_data": column_config_data
        });
    };

    this.add_input_column = function (column_config_data) {
        var input = this.get_input(column_config_data);

        this.column_box.append(input.html);

        if (!this.columns["inputs"]) {
            this.columns["inputs"] = [];
        }

        this.columns["inputs"].push({
            "obj": input,
            "column_config_data": column_config_data
        });
    };

    this.add_icon_button_column = function (column_config_data) {
        var icon_button = this.get_icon_button(column_config_data);

        this.column_box.append(icon_button.html);

        if (!this.columns["icon_buttons"]) {
            this.columns["icon_buttons"] = [];
        }

        this.columns["icon_buttons"].push({
            "obj": icon_button,
            "column_config_data": column_config_data
        });
    };

    this.add_default_column = function (column_config_data, index) {
        column_config_data["left_aligned"] = true;

        var column = new DashGuiListRowColumn(this, column_config_data, index);

        this.column_box.append(column.html);

        if (!this.columns["default"]) {
            this.columns["default"] = [];
        }

        this.columns["default"].push({
            "obj": column,
            "column_config_data": column_config_data
        });
    };

    this.get_spacer = function () {
        var spacer = $("<div></div>");

        spacer.css({
            "height": Dash.Size.RowHeight,
            "flex-grow": 2,
        });

        return spacer;
    };

    this.get_divider = function (column_config_data) {
        var divider_line = $("<div></div>");

        divider_line.css({
            "background": this.color.AccentGood,
            "width": Dash.Size.Padding * 0.3,
            "margin": "none",
            "flex": "none"
        });

        if (column_config_data["css"]) {
            divider_line.css(column_config_data["css"]);
        }

        return divider_line;
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

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't show the actual element
            combo.html.css({
                "opacity": 0
            });
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

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            input.input.remove();

            return input;
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

        icon_button.html.css({
            "height": Dash.Size.RowHeight
        });

        if (column_config_data["css"]) {
            icon_button.html.css(column_config_data["css"]);
        }

        if (this.is_header || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            icon_button.icon.icon_html.remove();

            return icon_button;
        }

        if (column_config_data["options"]["hover_text"]) {
            icon_button.SetHoverHint(column_config_data["options"]["hover_text"]);
        }

        return icon_button;
    };

    this.setup_styles();
}
