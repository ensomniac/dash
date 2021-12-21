// This is an alternate to DashGuiList that is ideal for lists with high row counts
function DashGuiRevolvingList (binder, column_config, color=null, include_header_row=false) {
    this.binder = binder;
    this.column_config = column_config;
    this.color = color || Dash.Color.Light;
    this.include_header_row = include_header_row;

    if (!(column_config instanceof DashGuiListColumnConfig)) {
        console.error("Error: Required second parameter 'column_config' is not of the correct class, DashGuiListColumnConfig!");

        return;
    }

    if (!this.binder.GetDataForKey) {
        console.error("Error: Calling class must contain a function named GetDataForKey()");

        return;
    }

    this.data = null;
    this.parent = null;
    this.row_objects = [];
    this.header_row = null;
    this.expanded_ids = {};
    this.row_count_buffer = 6;
    this.included_row_ids = [];
    this.html = $("<div></div>");
    this.get_expand_preview = null;
    this.header_row_backing = null;
    this.container = $("<div></div>");
    this.last_column_config = null;
    this.get_hover_preview_content = null;
    this.header_row_tag = "_top_header_row";

    // Ensures the bottom border (1px) of rows are visible (they get overlapped otherwise)
    this.row_height = Dash.Size.RowHeight + 1;

    DashGuiRevolvingListScrolling.call(this);

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0
        });

        this.container.css({
            "position": "absolute",
            "inset": 0,
            "top": this.include_header_row ? this.row_height : 0,
            "overflow-y": "auto"
        });

        this.add_header_row();

        this.html.append(this.container);

        this.setup_scroll_connections();
    };

    this.SetHoverPreviewGetter = function (binder, getter) {
        if (!getter) {
            return;
        }

        this.get_hover_preview_content = binder ? getter.bind(binder) : getter;
    };

    this.SetExpandPreviewGetter = function (binder, getter) {
        if (!getter) {
            return;
        }

        this.get_expand_preview = binder ? getter.bind(binder) : getter;
    };

    this.SetColumnConfig = function (column_config, row_ids_to_include=[]) {
        if (!(column_config instanceof DashGuiListColumnConfig)) {
            console.error("Error: New 'column_config' is not of the correct class, DashGuiListColumnConfig!");

            return;
        }

        this.last_column_config = this.column_config;
        this.column_config = column_config;

        if (Dash.IsValidObject(row_ids_to_include)) {
            this.Draw(row_ids_to_include);
        }
    };

    this.Draw = function (row_ids_to_include=[]) {
        this.expanded_ids = {};
        this.included_row_ids = row_ids_to_include;

        this.cleanup_rows();
        this.create_filler_space();

        for (var row of this.row_objects) {
            this.container.append(row.html);
        }

        this.on_view_scrolled();
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
            "height": this.row_height,
            "background": this.header_row.column_box.css("background-color")
        });

        this.html.append(this.header_row_backing);
    };

    this.create_filler_space = function () {
        var filler_content = "";

        for (var row_id of this.included_row_ids) {
            filler_content += row_id + "<br>";
        }

        var filler_html = $("<div" + filler_content + "</div>");

        filler_html.css({
            "text-align": "left",
            "overflow": "hidden",
            "text-overflow": "clip",
            "white-space": "nowrap",
            "max-height": this.row_height,
            "height": this.row_height,
            "line-height": this.row_height + "px",
            "opacity": 0
        });

        this.container.append(filler_html);

        this.set_header_scrollbar_offset();
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

        if (config_changed && this.header_row) {
            this.header_row.RedrawColumns();
            this.header_row.Update();
        }

        this.container.empty();
    };

    this.get_new_row = function (header=false, placeholder=false) {
        var row;

        var css = {
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0
        };

        if (placeholder) {
            row = $("<div></div>");

            row.css(css);
        }

        else {
            row = new DashGuiListRow(this, header ? this.header_row_tag : "");

            row.html.css(css);

            // The on-scroll revolving row system used in this style doesn't work when the rows
            // are animated to expand/collapse. That anim delay breaks the revolving system when a
            // row is left expanded and the view gets scrolled. Delaying the revolving system doesn't
            // work to solve that, because the scroll events keep coming, causing further breakage.
            row.DisableAnimation();
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

        // Original ID's expanded data (before moving row)
        var expanded_data = this.expanded_ids[row.ID()];

        if (Dash.IsValidObject(expanded_data) && row.index === expanded_data["row_index"]) {
            var preview_height = parseInt(expanded_data["preview_content"].css("height"));

            this.adjust_row_tops(row, preview_height, false);

            this.expanded_ids[row.ID()]["row_index"] = -1;
        }

        row.index = row_index;
        row.id = this.included_row_ids[row_index];

        row.html.css({
            "top": row_index * this.row_height,
            "display": "initial",
            "pointer-events": "auto"
        });

        row.Update();

        this.setup_row_connections(row);
    };

    this.on_row_selected = function (row, preview_content=null, force_expand=false) {
        if (!row || (!preview_content && !this.get_expand_preview)) {
            return;
        }

        if (!force_expand && row.IsExpanded()) {
            this.adjust_row_tops(row, row.Collapse(), false);

            delete this.expanded_ids[row.ID()];

            this.setup_row_connections(row);

            return;
        }

        if (!preview_content) {
            preview_content = this.get_expand_preview(row);
        }

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
        var row_buffer = Math.ceil(height_adj / this.row_height);

        if (row_buffer > this.row_count_buffer) {
            this.row_count_buffer = row_buffer;
        }

        for (var other_row of this.row_objects) {
            if (other_row.index <= row.index || other_row.ID() === row.ID()) {
                continue;
            }

            var top_pos = parseInt(other_row.html.css("top"));
            var default_top_pos = other_row.index * this.row_height;

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

        row.index = -1;

        row.html.css({
            "top": 0,
            "display": "none",
            "pointer-events": "none"
        });
    };

    this.set_hover_preview = function (row) {
        (function (self) {
            row.html.on("mouseenter", function () {
                if (!self.get_hover_preview_content) {
                    return;
                }

                row.SetHoverPreview(self.get_hover_preview_content(row.ID()) || "");
            });
        })(this);
    };

    // Replace the DashGuiList-driven click behavior
    this.set_on_row_click = function (row) {
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
        row.RefreshConnections();

        this.set_on_row_click(row);
        this.set_hover_preview(row);
    };

    this.setup_styles();
}
