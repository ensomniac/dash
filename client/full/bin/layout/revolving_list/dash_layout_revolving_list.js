// This is an alternate to DashLayoutList that is ideal for lists with high row counts
function DashLayoutRevolvingList (
    binder, column_config, color=null, include_header_row=false,
    row_options={}, get_data_for_key=null, include_footer_row=false
) {
    this.binder = binder;
    this.column_config = column_config;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.include_header_row = include_header_row;
    this.include_footer_row = include_footer_row;

    // This is useful if there is more than one list in the same
    // script, which each need their own GetDataForKey function
    this.get_data_for_key = get_data_for_key ? get_data_for_key.bind(binder) : (
        binder.GetDataForKey ? binder.GetDataForKey.bind(binder) : null
    );

    if (!(column_config instanceof DashLayoutListColumnConfig)) {
        console.error(
            "Error: Required second parameter 'column_config' is " +
            "not of the correct class, DashLayoutListColumnConfig"
        );

        return;
    }

    if (!this.get_data_for_key) {
        console.error("Error: Calling class must contain a function named GetDataForKey()");

        return;
    }

    this.data = null;
    this.parent = null;
    this.recall_id = "";
    this.row_objects = [];
    this.header_row = null;
    this.footer_row = null;
    this.expanded_ids = {};
    this.initial_draw = false;
    this.row_count_buffer = 6;
    this.included_row_ids = [];
    this.html = $("<div></div>");
    this.get_expand_preview = null;
    this.header_row_backing = null;
    this.footer_row_backing = null;
    this.last_column_config = null;
    this.last_selected_row_id = "";
    this.row_events_disabled = false;
    this.row_clicks_disabled = false;
    this.container = $("<div></div>");
    this.non_expanding_click_cb = null;
    this.divider_row_tag = "__divider__";
    this.get_hover_preview_content = null;
    this.header_row_tag = "_top_header_row";
    this.footer_row_tag = "_bottom_footer_row";
    this.non_expanding_click_highlight_color = null;
    this.row_html_css = row_options["row_html_css"];
    this.row_column_box_css = row_options["row_column_box_css"];
    this.row_highlight_color = row_options["row_highlight_color"];
    this.row_height = row_options["row_height"] || Dash.Size.RowHeight;
    this.header_background_color = row_options["header_background_color"];
    this.footer_background_color = row_options["footer_background_color"];

    // For calculations - ensures the bottom border (1px) of rows are visible (they get overlapped otherwise)
    this.full_row_height = this.row_height + 1;

    DashLayoutRevolvingListScrolling.call(this);

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0
        });

        this.container.css({
            "position": "absolute",
            "inset": 0,
            "top": this.include_header_row ? this.full_row_height : 0,
            "bottom": this.include_footer_row ? this.full_row_height : 0,
            "overflow-y": "auto"
        });

        this.add_header_row();
        this.add_footer_row();

        this.html.append(this.container);

        this.setup_scroll_connections();
    };

    this.ScrollToBottom = function () {
        Dash.Gui.ScrollToBottom(this.container);
    };

    this.SetHoverPreviewGetter = function (getter, binder=null) {
        if (!getter) {
            return;
        }

        this.get_hover_preview_content = binder ? getter.bind(binder) : getter;
    };

    this.SetExpandPreviewGetter = function (getter, binder=null) {
        if (!getter) {
            return;
        }

        this.get_expand_preview = binder ? getter.bind(binder) : getter;
    };

    this.SetNonExpandingClickCallback = function (callback, binder=null, click_highlight_color=null) {
        if (!callback) {
            return;
        }

        if (click_highlight_color) {
            this.non_expanding_click_highlight_color = click_highlight_color;

            this.select_row("");
        }

        this.non_expanding_click_cb = binder ? callback.bind(binder) : callback;
    };

    this.SetColumnConfig = function (column_config, row_ids_to_include=null) {
        if (!(column_config instanceof DashLayoutListColumnConfig)) {
            console.error("Error: New 'column_config' is not of the correct class, DashLayoutListColumnConfig!");

            return;
        }

        this.last_column_config = this.column_config;
        this.column_config = column_config;

        if (Array.isArray(row_ids_to_include)) {
            this.Draw(row_ids_to_include);
        }
    };

    this.RemoveRow = function (row_id) {
        if (!Dash.Validate.Object(this.included_row_ids) || !row_id) {
            return;
        }

        this.included_row_ids.Remove(row_id);

        this.Draw(this.included_row_ids);
    };

    this.AddRow = function (row_id, top=false) {
        if (!row_id) {
            return;
        }

        if (top) {
            this.included_row_ids.push(row_id);
        }

        else {
            this.included_row_ids.unshift(row_id);
        }

        this.Draw(this.included_row_ids);
    };

    this.UpdateRow = function (row_id) {
        var row = this.get_row(row_id);

        if (!row) {
            return;
        }

        row.Update();
    };

    // This shouldn't be used in most situations, since Draw handles it all
    this.Clear = function (clear_expanded_ids=true) {
        if (clear_expanded_ids) {
            this.expanded_ids = {};
        }

        this.included_row_ids = [];

        this.cleanup_rows();
    };

    this.Draw = function (row_ids_to_include=[]) {
        this.Clear(false);

        this.included_row_ids = row_ids_to_include;

        this.create_filler_space();

        for (var row of this.row_objects) {
            this.container.append(row.html);
        }

        this.on_view_scrolled();

        this.initial_draw = true;
    };

    // Intended to be used when custom CSS is used on divider elements
    this.DisableDividerColorChangeOnHover = function () {
        this.allow_row_divider_color_change_on_hover = false;
    };

    this.BubbleStyle = function () {
        this.html.css({
            "border-radius": Dash.Size.Padding,
            "background": this.color.Pinstripe,
            "border": "2px solid " + this.color.StrokeLight
        });

        if (this.include_header_row) {
            var header_css = {
                "border-top-left-radius": Dash.Size.Padding,
                "border-top-right-radius": Dash.Size.Padding
            };

            this.header_row.html.css(header_css);

            this.header_row.column_box.css(header_css);

            this.header_row_backing.css(header_css);
        }

        if (this.include_footer_row) {
            var footer_css = {
                "border-bottom-left-radius": Dash.Size.Padding,
                "border-bottom-right-radius": Dash.Size.Padding
            };

            this.footer_row.html.css(footer_css);

            this.footer_row.column_box.css(footer_css);

            this.footer_row_backing.css(footer_css);
        }
    };

    this.SetRecallID = function (recall_id) {
        if (!this.initial_draw) {
            (function (self) {
                setTimeout(
                    function () {
                        self.SetRecallID(recall_id);
                    },
                    100
                );
            })(this);

            return;
        }

        this.recall_id = recall_id;

        var last_loaded_id = Dash.Local.Get(this.recall_id);

        if (!last_loaded_id) {
            return;
        }

        this.SelectRow(last_loaded_id);
    };

    this.SelectRow = function (row_id) {
        this.last_selected_row_id = row_id;

        var scroll_top = this.get_row_top(this.included_row_ids.indexOf(this.last_selected_row_id));
        var current_top = this.container.scrollTop();
        var current_bottom = current_top + this.html.height();

        if (scroll_top > current_bottom || scroll_top < current_top) {
            this.container.scrollTop(scroll_top);  // Scrolling will trigger this.select_row as well
        }

        else {
            this.select_row(this.last_selected_row_id, false);
        }
    };

    this.CollapseExpandedRows = function () {
        for (var row_id in this.expanded_ids) {
            for (var row of this.row_objects) {
                if (row.ID().toString() !== row_id.toString()) {
                    continue;
                }

                row.Collapse();
            }
        }
    };

    this.DisableRowEvents = function () {
        this.row_events_disabled = true;

        for (var row of this.row_objects) {
            row.FullyDisable();
        }
    };

    this.DisableRowClickEvents = function () {
        this.row_clicks_disabled = true;

        for (var row of this.row_objects) {
            row.column_box.off("click");
        }
    };

    this.RefreshConnections = function () {
        this.setup_scroll_connections();
    };

    // Not needed in most cases - only needed if manually breaking/altering a particular row's connections
    this.RefreshRowConnections = function (row) {
        this.setup_row_connections(row);
    };

    this.ReExpandRows = function () {
        for (var row_id in this.expanded_ids) {
            for (var row of this.row_objects) {
                if (row.ID().toString() !== row_id.toString()) {
                    continue;
                }

                this.ReExpandRow(row);
            }
        }
    };

    this.ReExpandRow = function (row) {
        if (!row.IsExpanded()) {
            this.on_row_selected(row);

            return;
        }

        this.on_row_selected(row);

        (function (self) {
            setTimeout(
                function () {
                    self.on_row_selected(row);
                },
                row.anim_delay["expanded_content"] + 100
            );
        })(this);
    };

    this.select_row = function (row_id="", default_to_first_row=true) {
        if (row_id && !this.initial_draw) {
            (function (self) {
                setTimeout(
                    function () {
                        self.select_row(row_id, default_to_first_row);
                    },
                    100
                );
            })(this);

            return;
        }

        var row = row_id ? this.get_row(row_id) : null;

        if (!row) {
            if (default_to_first_row && this.row_objects.length) {
                row = this.row_objects[0];
            }

            else {
                return;
            }
        }

        this.on_row_selected(row, true);
    };

    this.get_row = function (row_id) {
        if (!Dash.Validate.Object(this.row_objects) || !row_id) {
            return;
        }

        for (var row of this.row_objects) {
            if (row.ID().toString() === row_id.toString()) {
                return row;
            }
        }

        return null;
    };

    this.add_header_row = function () {
        if (!this.include_header_row) {
            return;
        }

        this.header_row = this.get_new_row(true);

        if (!this.header_row_backing) {
            this.add_header_row_backing();
        }

        this.set_header_scrollbar_offset();

        this.html.append(this.header_row.html);

        this.header_row.Update();
    };

    this.add_header_row_backing = function () {
        this.header_row_backing = this.get_new_row(false, true);

        this.header_row_backing.css({
            "height": this.full_row_height,
            "background": this.header_row.column_box.css("background-color")
        });

        this.html.append(this.header_row_backing);
    };

    this.add_footer_row = function () {
        if (!this.include_footer_row) {
            return;
        }

        this.footer_row = this.get_new_row(false, false, true);

        if (!this.footer_row_backing) {
            this.add_footer_row_backing();
        }

        this.set_footer_scrollbar_offset();

        this.html.append(this.footer_row.html);

        this.footer_row.Update();
    };

    this.add_footer_row_backing = function () {
        this.footer_row_backing = this.get_new_row(false, true, false, true);

        this.footer_row_backing.css({
            "height": this.full_row_height,
            "background": this.footer_row.column_box.css("background-color")
        });

        this.html.append(this.footer_row_backing);
    };

    this.create_filler_space = function () {
        var height = 0;
        var filler_html = $("<div></div>");

        for (var i in this.included_row_ids) {
            height += (this.row_height * (
                this.included_row_ids[i].toString().startsWith(this.divider_row_tag) ? 0.5 : 1
            )) + 1;
        }

        filler_html.css({
            "text-align": "left",
            "overflow": "hidden",
            "text-overflow": "clip",
            "white-space": "nowrap",
            "max-height": height,
            "height": height,
            "width": Dash.Size.ColumnWidth,  // Arbitrary
            "opacity": 0
        });

        this.container.append(filler_html);

        this.set_header_scrollbar_offset();
        this.set_footer_scrollbar_offset();
    };

    this.cleanup_rows = function () {
        var config_changed = this.column_config !== this.last_column_config;

        this.last_column_config = this.column_config;

        for (var row of this.row_objects) {
            if (config_changed) {
                row.RedrawColumns();
            }

            this.hide_row(row);

            row.html.detach();
        }

        if (this.header_row) {
            if (config_changed) {
                this.header_row.RedrawColumns();
            }

            this.header_row.Update();
        }

        if (this.footer_row) {
            if (config_changed) {
                this.footer_row.RedrawColumns();
            }

            this.footer_row.Update();
        }

        this.container.empty();
    };

    this.get_new_row = function (header=false, placeholder=false, footer=false, footer_placeholder=false) {
        var row;

        var css = {
            "position": "absolute",
            "left": 0,
            "right": 0
        };

        if (footer || footer_placeholder) {
            css["bottom"] = 0;
        }

        else {
            css["top"] = 0;
        }

        if (placeholder) {
            row = $("<div></div>");

            row.css(css);
        }

        else {
            row = new DashLayoutListRow(
                this,
                header ? this.header_row_tag : footer ? this.footer_row_tag : "",
                this.row_height
            );

            row.html.css(css);

            if (header) {
                if (this.header_background_color) {
                    row.column_box.css({
                        "background": this.header_background_color
                    });
                }
            }

            else if (footer) {
                if (this.footer_background_color) {
                    row.column_box.css({
                        "background": this.footer_background_color
                    });
                }
            }

            else {
                if (this.row_html_css) {
                    row.html.css(this.row_html_css);
                }

                if (this.row_column_box_css) {
                    row.column_box.css(this.row_column_box_css);
                }
            }

            // The on-scroll revolving row system used in this style doesn't work when the rows
            // are animated to expand/collapse. That anim delay breaks the revolving system when a
            // row is left expanded and the view gets scrolled. Delaying the revolving system doesn't
            // work to solve that, because the scroll events keep coming, causing further breakage.
            row.DisableAnimation();

            if (this.row_highlight_color) {
                row.SetHighlightColor(this.row_highlight_color);
            }
        }

        return row;
    };

    this.create_row_objects = function (total_needed) {
        for (var i = 0; i < total_needed; i++) {
            var row = this.get_new_row();

            this.hide_row(row);

            this.container.append(row.html);

            this.row_objects.push(row);
        }
    };

    this.show_row = function (row, row_index) {
        row.Collapse();
        row.HideHighlight();

        // Original ID's expanded data (before moving row)
        var expanded_data = this.expanded_ids[row.ID()];

        if (Dash.Validate.Object(expanded_data) && row.index === expanded_data["row_index"]) {
            var preview_height = parseInt(expanded_data["preview_content"].css("height"));

            this.adjust_row_tops(row, preview_height, false);

            this.expanded_ids[row.ID()]["row_index"] = -1;
        }

        row.index = row_index;
        row.id = this.included_row_ids[row_index];
        row.is_divider = row.id.toString().startsWith(this.divider_row_tag);

        row.SetHeight(this.row_height * (row.is_divider ? 0.5 : 1));

        row.html.css({
            "top": this.get_row_top(row_index),
            "display": "initial",
            "pointer-events": "auto"
        });

        row.Update();

        this.setup_row_connections(row);
    };

    this.get_row_top = function (row_index, for_scroll=true) {
        var i;
        var top = 0;

        if (for_scroll) {
            for (i in this.included_row_ids) {
                if (parseInt(i) === parseInt(row_index)) {
                    break;
                }

                var id = this.included_row_ids[i];

                top += (this.row_height * (id.toString().startsWith(this.divider_row_tag) ? 0.5 : 1)) + 1;
            }
        }

        else {
            for (i in this.row_objects) {
                var row = this.row_objects[i];

                if (parseInt(i) === parseInt(row_index)) {
                    break;
                }

                top += row.height + 1;
            }
        }

        return top;
    };

    this.on_row_selected = function (row, force_expand=false) {
        if (!row || row.is_divider) {
            return;
        }

        if (row.ID()) {
            this.last_selected_row_id = row.ID();

            if (this.recall_id) {
                Dash.Local.Set(this.recall_id, row.ID());
            }
        }

        if (this.non_expanding_click_cb) {
            if (this.non_expanding_click_highlight_color && !row.IsHighlighted()) {
                for (var other_row of this.row_objects) {
                    other_row.HideHighlight();
                }

                row.ShowHighlight(this.non_expanding_click_highlight_color);
            }

            this.non_expanding_click_cb(row, this);

            return;
        }

        if (!this.get_expand_preview) {
            return;
        }

        if (!force_expand && row.IsExpanded()) {
            this.adjust_row_tops(row, row.Collapse(), false);

            delete this.expanded_ids[row.ID()];

            this.setup_row_connections(row);

            return;
        }

        // Always redraw this content, otherwise, the connections won't work
        var preview_content = this.get_expand_preview(row);

        if (!preview_content) {
            return;
        }

        this.adjust_row_tops(row, row.Expand(preview_content, null, true), true);
        this.set_expanded_id(row, preview_content);
    };

    this.set_expanded_id = function (row, preview_content) {
        var row_id = row.ID();

        if (!(row_id in this.expanded_ids)) {
            this.expanded_ids[row_id] = {};
        }

        this.expanded_ids[row_id]["row_index"] = row.index;
        this.expanded_ids[row_id]["preview_content"] = preview_content;
    };

    // The 'expanded' param exists just in case row.IsExpanded() isn't immediately ready when this is called
    this.adjust_row_tops = function (row, height_adj, expanded=true) {
        var row_buffer = Math.ceil(height_adj / this.full_row_height);

        if (row_buffer > this.row_count_buffer) {
            this.row_count_buffer = row_buffer;
        }

        for (var other_row of this.row_objects) {
            if (other_row.index <= row.index || other_row.ID().toString() === row.ID().toString()) {
                continue;
            }

            var top_pos = parseInt(other_row.html.css("top"));
            var default_top_pos = this.get_row_top(other_row.index);

            if (expanded || top_pos > default_top_pos) {
                var new_top = expanded ? top_pos + height_adj : top_pos - height_adj;

                if (new_top < default_top_pos) {
                    new_top = default_top_pos;
                }

                other_row.html.css({
                    "top": new_top
                });
            }
        }
    };

    this.hide_row = function (row) {
        row.Collapse();
        row.HideHighlight();

        row.index = -1;

        row.html.css({
            "top": 0,
            "display": "none",
            "pointer-events": "none"
        });
    };

    this.set_hover_preview = function (row) {
        if (this.row_events_disabled) {
            return;
        }

        (function (self) {
            row.html.on("mouseenter", function () {
                if (!self.get_hover_preview_content) {
                    return;
                }

                row.SetHoverPreview(self.get_hover_preview_content(row.ID()) || "");
            });
        })(this);
    };

    // Replace the DashLayoutList-driven click behavior
    this.set_on_row_click = function (row) {
        if (this.row_events_disabled || this.row_clicks_disabled) {
            return;
        }

        row.column_box.off("click");

        (function (self) {
            row.column_box.on("click", function (e) {
                if (e.target && e.target.className.includes(" fa-")) {
                    // Don't set selection if it was an icon button that was clicked
                    return;
                }

                self.on_row_selected(row);
            });
        })(this);
    };

    this.setup_row_connections = function (row) {
        if (this.row_events_disabled) {
            return;
        }

        row.RefreshConnections();

        if (this.row_clicks_disabled) {
            row.column_box.off("click");
        }

        this.set_on_row_click(row);
        this.set_hover_preview(row);
    };

    this.setup_styles();
}
