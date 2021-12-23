function DashGuiListRow (list, row_id) {
    this.list = list;
    this.id = row_id;

    this.is_shown = true;
    this.tmp_css_cache = [];
    this.sublist_queue = [];
    this.is_expanded = false;
    this.cached_preview = null;  // Intended for sublists only
    this.color = this.list.color;
    this.expanded_highlight = null;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.column_box = $("<div></div>");
    this.expanded_content = $("<div></div>");
    this.is_header = this.list.hasOwnProperty("header_row_tag") ? this.id.startsWith(this.list.header_row_tag) : false;
    this.is_sublist = this.list.hasOwnProperty("sublist_row_tag") ? this.id.startsWith(this.list.sublist_row_tag) : false;

    this.columns = {
        "combos": [],
        "inputs": [],
        "default": [],
        "spacers": [],
        "dividers": [],
        "icon_buttons": []
    };

    this.anim_delay = {
        "highlight_show": 100,
        "highlight_hide": 250,
        "expanded_content": 180,
        "expanded_highlight": 270
    };

    DashGuiListRowElements.call(this);

    this.setup_styles = function () {
        if (this.is_header) {
            this.column_box.css({
                "background": this.color.AccentGood,
                "pointer-events": "none",
                "left": 0,
                "right": 0,
                "padding-left": Dash.Size.Padding,
                "padding-right": Dash.Size.Padding
            });
        }

        else {
            this.html.append(this.highlight);
            this.html.append(this.expanded_content);

            this.expanded_content.css({
                "margin-left": Dash.Size.Padding * (this.is_sublist ? 1 : -1),
                "margin-right": -Dash.Size.Padding,
                "overflow-y": "hidden",
                "height": 0
            });

            this.highlight.css({
                "position": "absolute",
                "left": 0,
                "top": 0,
                "right": 0,
                "height": Dash.Size.RowHeight,
                "background": this.color.AccentGood, // Not correct
                "pointer-events": "none",
                "opacity": 0
            });

            this.column_box.css({
                "left": Dash.Size.Padding,
                "right": Dash.Size.Padding,
                "cursor": "pointer"
            });
        }

        this.html.append(this.column_box);

        this.column_box.css({
            "position": "absolute",
            "top": 0,
            "height": Dash.Size.RowHeight,
            "display": "flex"
        });

        this.html.css({
            // "background": this.color.Background,
            "color": this.color.Text,
            "border-bottom": "1px solid rgb(200, 200, 200)",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "min-height": Dash.Size.RowHeight
        });

        this.setup_columns();
        this.setup_connections();
    };

    this.DisableAnimation = function () {
        this.anim_delay = {
            "highlight_show": 0,
            "highlight_hide": 0,
            "expanded_content": 0,
            "expanded_highlight": 0
        };
    };

    this.AddToSublistQueue = function (row_id, css=null) {
        if (!this.is_sublist || !row_id) {
            return;
        }

        var item = {"row_id": row_id, "css": css};

        if (!(JSON.stringify(this.sublist_queue).includes(JSON.stringify(item)))) {
            this.sublist_queue.push(item);
        }

        return this.sublist_queue;
    };

    this.GetSublistQueue = function () {
        if (!this.is_sublist) {
            return;
        }

        return this.sublist_queue;
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

    this.ID = function () {
        return this.id;
    };

    this.Remove = function () {
        this.list.RemoveRow(this.id);
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
        this.SetCachedPreview(null);  // Reset this to force a redraw next time it's expanded

        for (var type in this.columns) {
            if (!Dash.IsValidObject(this.columns[type])) {
                continue;
            }

            if (type === "default") {
                for (var column of this.columns[type]) {
                    column["obj"].Update();
                }
            }

            else if (type === "inputs") {
                for (var input of this.columns[type]) {
                    var new_value = this.get_data_for_key(input["column_config_data"]);

                    if (new_value) {
                        input["obj"].SetText(new_value);
                    }
                }
            }
        }

        // Probably need to recursively go through sublists and update
        // those as well, but that functionality isn't needed right now
    };

    this.SetExpandedSubListParentHeight = function (height_change) {
        if (!this.list.hasOwnProperty("GetParentRow")) {
            return;  // RevolvingList style
        }

        var row = this.list.GetParentRow();

        if (!row || !row.is_sublist || !row.is_expanded) {
            return;
        }

        var size_now = parseInt(row.expanded_content.css("height").replace("px", ""));

        row.expanded_content.stop().animate({"height": size_now + height_change}, this.anim_delay["expanded_content"]);

        // This will recursively continue up the stack
        row.SetExpandedSubListParentHeight(height_change);
    };

    this.Expand = function (html, sublist_rows=null, remove_hover_tip=false) {
        if (this.is_expanded) {
            this.Collapse();

            return;
        }

        // Optional param so that we can hide hover tips that are intended for the collapsed row element only.
        // Once removed, the managing code needs to re-assign the hover tip on hover in (mouse enter).
        if (remove_hover_tip && this.html.attr("title")) {
            this.html.removeAttr("title");
        }

        if (sublist_rows) {
            this.store_css_on_expansion(sublist_rows.Last());
        }

        if (this.is_sublist) {
            this.store_css_on_expansion(this.list.rows.Last());
        }

        if (!this.expanded_highlight) {
            this.create_expand_highlight();
        }

        this.expanded_highlight.stop().animate({"opacity": 1}, this.anim_delay["expanded_highlight"]);

        var size_now = parseInt(this.expanded_content.css("height").replace("px", ""));

        this.expanded_content.stop().css({
            "overflow-y": "auto",
            "opacity": 1,
            "height": "auto",
            "padding-top": Dash.Size.RowHeight,
        });

        html.css({
            "border-bottom": "1px solid rgb(200, 200, 200)"
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
                self.anim_delay["expanded_content"],
                function () {
                    self.expanded_content.css({
                        "overflow-y": "visible"  // This MUST be set to visible so that combo skirts don't get clipped
                    });

                    self.is_expanded = true;
                }
            );
        })(this);

        this.SetExpandedSubListParentHeight(target_size);

        return target_size;
    };

    this.Collapse = function () {
        if (!this.is_expanded) {
            return;
        }

        if (Dash.IsValidObject(this.tmp_css_cache)) {
            this.tmp_css_cache.forEach(
                function (entry) {
                    if (entry && entry["row"] && entry["row"].html && entry["css"]) {
                        entry["row"].html.css(entry["css"]);
                    }
                }
            );

            this.tmp_css_cache = [];
        }

        this.expanded_content.stop().css({
            "overflow-y": "hidden",
        });

        var expanded_height = parseInt(this.expanded_content.css("height").replace("px", ""));

        (function (self) {
            self.expanded_content.animate(
                {"height": 0},
                self.anim_delay["expanded_content"],
                function () {
                    self.expanded_content.stop().css({
                        "overflow-y": "hidden",
                        "opacity": 0,
                    });

                    if (self.expanded_highlight) {
                        self.expanded_highlight.stop().css({
                            "opacity": 0
                        });
                    }

                    self.expanded_content.empty();

                    self.is_expanded = false;
                }
            );
        })(this);

        this.SetExpandedSubListParentHeight(-expanded_height);

        return expanded_height;
    };

    this.ChangeColumnEnabled = function (type, index, enabled=true) {
        if (!this.columns || !Dash.IsValidObject(this.columns[type])) {
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

    this.SetHoverPreview = function (content="") {
        if (this.is_expanded || !content) {
            if (this.html.attr("title")) {
                this.html.removeAttr("title");
            }

            return;
        }

        this.html.attr("title", content);
    };

    this.RefreshConnections = function () {
        this.html.off("mouseenter");
        this.html.off("mouseleave");
        this.column_box.off("click");

        this.setup_connections();
    };

    this.RedrawColumns = function () {
        this.column_box.empty();

        this.setup_columns();
    };

    this.store_css_on_expansion = function (row) {
        var border_bottom = row.html.css("border-bottom");

        if (!border_bottom || border_bottom === "none") {
            return;
        }

        row.html.css({
            "border-bottom": "none"
        });

        this.tmp_css_cache.push({
            "row": row,
            "css": {"border-bottom": border_bottom}
        });
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
                if (self.is_header) {
                    return;
                }

                self.highlight.stop().animate({"opacity": 1}, self.anim_delay["highlight_show"]);

                if (self.list.allow_row_divider_color_change_on_hover === false) {
                    return;
                }

                for (var divider of self.columns["dividers"]) {
                    divider["obj"].css({"background": self.color.Button.Background.Base});
                }
            });

            self.html.on("mouseleave", function () {
                if (self.is_expanded || self.is_header) {
                    return;
                }

                self.highlight.stop().animate({"opacity": 0}, self.anim_delay["highlight_hide"]);

                if (self.list.allow_row_divider_color_change_on_hover === false) {
                    return;
                }

                for (var divider of self.columns["dividers"]) {
                    divider["obj"].css({"background": self.color.AccentGood});
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

    this.setup_styles();
}
