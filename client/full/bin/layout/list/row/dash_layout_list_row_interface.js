/**@member DashLayoutListRow*/

function DashLayoutListRowInterface () {
    // Sometimes, you may want the row to be a certain height, but not have all the elements fill that height
    this.AddTopAndBottomPadding = function (pad) {
        this.column_box.css({
            "padding-top": pad,
            "left": 0,
            "right": 0
        });

        this.html.css({
            "padding-top": pad,
            "padding-bottom": pad
        });

        this.highlight.css({
            "height": this.height + (pad * 2)
        });
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

    this.IsHighlighted = function () {
        return this.is_highlighted;
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

    // Use this if a sublist is not going to be updating (it's only generated once and that's it)
    this.DisableSublistClearOnUpdate = function () {
        this.clear_sublist_preview_on_update = false;
    };

    this.Update = function () {
        if (this.clear_sublist_preview_on_update) {
            this.SetCachedPreview(null);  // Reset this to force a redraw next time it's expanded
        }

        for (var type in this.columns) {
            if (!Dash.Validate.Object(this.columns[type])) {
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

                    if (new_value || new_value !== input["obj"].Text()) {
                        input["obj"].SetText(new_value);
                    }
                }
            }

            else if (type === "combos") {
                for (var combo of this.columns[type]) {
                    var value = this.get_data_for_key(combo["column_config_data"], "", true);

                    if (value) {
                        if (this.is_header || this.is_footer) {
                            // TODO
                        }

                        else {
                            combo["obj"].Update(null, value, true);
                        }
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
        if (this.is_header || this.is_footer) {
            return;
        }

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

        this.ShowHighlight();

        var size_now = parseInt(this.expanded_content.css("height").replace("px", ""));

        this.expanded_content.stop().css({
            "overflow-y": "auto",
            "opacity": 1,
            "height": "auto",
            "padding-top": this.height,
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
        if (!this.is_expanded || this.is_header || this.is_footer) {
            return;
        }

        if (Dash.Validate.Object(this.tmp_css_cache)) {
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

                    self.HideHighlight();

                    self.expanded_content.empty();

                    self.is_expanded = false;
                }
            );
        })(this);

        this.SetExpandedSubListParentHeight(-expanded_height);

        return expanded_height;
    };

    this.ShowHighlight = function (highlight_color=null) {
        if (this.is_highlighted) {
            return;
        }

        if (!this.expanded_highlight) {
            this.create_expand_highlight(highlight_color);
        }

        this.expanded_highlight.stop().animate(
            {"opacity": 1},
            this.anim_delay["expanded_highlight"]
        );

        this.is_highlighted = true;
    };

    this.HideHighlight = function () {
        if (!this.expanded_highlight || !this.is_highlighted) {
            return;
        }

        this.expanded_highlight.stop().css({
            "opacity": 0
        });

        this.is_highlighted = false;
    };

    // For disabling all columns
    this.Disable = function () {
        if (!this.columns) {
            return;
        }

        for (var type in this.columns) {
            if (!Dash.Validate.Object(this.columns[type])) {
                continue;
            }

            for (var column of this.columns[type]) {
                var obj = column["obj"];

                if (type === "default") {
                    obj.html.css({
                        "user-select": "none",
                        "pointer-events": "none"
                    });
                }

                else if (type === "copy_buttons") {
                    obj.button.Disable();
                }

                else if (type.includes("button")) {
                    obj.Disable();
                }

                else if (type === "combos") {
                    obj.SetReadOnly(true);
                    obj.Disable(false, true);
                }

                else if (type === "inputs") {
                    obj.SetLocked(true);
                }
            }
        }
    };

    // TODO: this.Enable

    // For extreme cases
    this.FullyDisable = function () {
        this.BreakConnections();
        this.DisableAnimation();
        this.Disable();

        this.html.css({
            "pointer-events": "none",
            "user-select": "none",
            "cursor": "default"
        });

        this.fully_disabled = true;
    };

    // For disabling individual columns
    this.ChangeColumnEnabled = function (type, index, enabled=true) {
        if (!this.columns || !Dash.Validate.Object(this.columns[type])) {
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

        else if (type === "copy_buttons") {
            if (enabled) {
                this.columns[type][index]["obj"].button.Enable();
            }

            else {
                this.columns[type][index]["obj"].button.Disable();
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

    this.BreakConnections = function () {
        this.html.off("mouseenter");
        this.html.off("mouseleave");

        this.column_box.off("click");
    };

    this.RefreshConnections = function () {
        this.BreakConnections();
        this.setup_connections();

        for (var icon_button of this.columns["icon_buttons"]) {
            icon_button["obj"].RefreshConnections();
        }

        for (var copy_button of this.columns["copy_buttons"]) {
            copy_button["obj"].button.RefreshConnections();
        }
    };

    this.RedrawColumns = function () {
        this.column_box.empty();

        this.setup_columns();
    };

    this.SetHighlightColor = function (color) {
        this.highlight.css({
            "background": color
        });
    };
}
