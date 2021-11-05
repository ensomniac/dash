function DashGuiList (binder, selected_callback, column_config, color) {
    this.binder = binder;
    this.selected_callback = selected_callback.bind(this.binder);
    this.column_config = column_config;
    this.color = color || Dash.Color.Light;

    if (!(column_config instanceof DashGuiListColumnConfig)) {
        console.error("Error: Required second parameter 'column_config' is not of the correct class, DashGuiListColumnConfig!");

        return;
    }

    if (!this.binder.GetDataForKey) {
        console.error("Error: Calling class must contain a function named GetDataForKey()");

        return;
    }

    this.rows = [];
    this.parent_row= null;  // Intended for cases where this is a sublist
    this.header_row = null;
    this.header_row_css = null;
    this.html = $("<div></div>");
    this.last_selection_id = null;
    this.sublist_row_tag = "_sublist_row_";
    this.header_row_tag = "_top_header_row";
    this.recall_id = "dash_list_" + (this.binder.constructor + "").replace(/[^A-Za-z]/g, "");
    this.recall_id = this.recall_id.slice(0, 100).trim().toLowerCase();

    this.setup_styles = function () {
        this.html.css({
            "background": Dash.Color.Light.Background
        });
    };

    this.AddRow = function (row_id) {
        var row = new DashGuiListRow(this, row_id);

        this.rows.push(row);

        this.html.append(row.html);

        return row;
    };

    this.AddHeaderRow = function (html_css, column_box_css) {
        if (this.header_row) {
            console.error("Error: This list already has a header row, can't add another.");

            return;
        }

        this.header_row_css = {
            "html": html_css,
            "column_box": column_box_css
        };

        this.add_header_row();

        return this.header_row;
    };

    this.AddSubList = function (sublist_name, highlight_color=null, init_list=false) {
        var row = this.AddRow(this.sublist_row_tag + sublist_name);

        if (highlight_color) {
            row.highlight.css({
                "background": highlight_color
            });
        }

        // Always update it by default - can still update later in the code that calls this
        row.Update();

        if (init_list) {
            row.SetCachedPreview(this.get_sublist());
        }

        return row;
    };

    this.RemoveRow = function (row_id) {
        var row = this.GetRow(row_id);

        if (!row) {
            return;
        }

        row.Collapse();
        row.Hide();

        row.html.remove();

        var index = this.rows.indexOf(row);

        if (index === null || index === undefined || index < 0) {
            return;
        }

        this.rows.splice(index, 1);
    };

    this.DisableColumn = function (type, type_index) {
        if (!this.rows) {
            return;
        }

        for (var i in this.rows) {
            this.rows[i].ChangeColumnEnabled(type, type_index, false);
        }
    };

    this.EnableColumn = function (type, type_index) {
        if (!this.rows) {
            return;
        }

        for (var i in this.rows) {
            this.rows[i].ChangeColumnEnabled(type, type_index, true);
        }
    };

    this.Update = function () {
        for (var i in this.rows) {
            this.rows[i].Update();
        }
    };

    this.Clear = function () {
        this.html.empty();

        // Always keep the header row, even when clearing the list
        if (this.header_row) {
            this.add_header_row();
        }

        // This step must happen after re-adding the header row above, since we don't track that row
        this.rows = [];
    };

    this.SetColumnConfig = function (column_config, clear=true) {
        if (!(column_config instanceof DashGuiListColumnConfig)) {
            console.error("Error: New 'column_config' is not of the correct class, DashGuiListColumnConfig!");

            return;
        }

        this.column_config = column_config;

        if (clear) {
            this.Clear();
        }
    };

    this.SetSelection = function (row) {
        var is_selected = !(this.last_selection_id && row.id.toString() === this.last_selection_id.toString());

        if (row.is_sublist) {
            this.expand_sublist(row, is_selected);
        }

        else {
            this.selected_callback(row.id, is_selected, row);
        }

        this.last_selection_id = is_selected ? row.id : null;
    };

    this.GetRow = function (row_id, is_sublist=false) {
        if (!this.rows) {
            return;
        }

        for (var i in this.rows) {
            var row = this.rows[i];

            if (row.id === (is_sublist ? (this.sublist_row_tag + row_id) : row_id)) {
                return row;
            }
        }
    };

    // This is handy so you can re-expand previously expanded rows after a list clear or list refresh
    this.GetExpandedRowIDs = function () {
        if (!this.rows) {
            return;
        }

        var expanded_rows_ids = [];

        for (var i in this.rows) {
            var row = this.rows[i];

            if (row.IsExpanded()) {
                expanded_rows_ids.push(row.ID());
            }
        }

        return expanded_rows_ids;
    };

    // Intended for cases where this is a sublist
    this.GetParentRow = function () {
        return this.parent_row;
    };

    // Intended for cases where this is a sublist
    this.SetParentRow = function (row) {
        this.parent_row = row;
    };

    this.add_header_row = function () {
        this.header_row = new DashGuiListRow(this, this.header_row_tag);

        if (this.header_row_css) {
            if (this.header_row_css["html"]) {
                this.header_row.html.css(this.header_row_css["html"]);
            }

            if (this.header_row_css["column_box"]) {
                this.header_row.column_box.css(this.header_row_css["column_box"]);
            }
        }

        this.html.prepend(this.header_row.html);

        // Always update it by default - can still update later in the code that calls this
        this.header_row.Update();
    };

    this.get_sublist = function () {
        return new Dash.Gui.Layout.List(this.binder, this.selected_callback, this.column_config);
    };

    this.expand_sublist = function (row, is_selected) {
        if (is_selected) {
            row.Collapse();
        }

        var refresh_connections = true;

        // Since lists can get big, we only want to draw this once, but we'll reset it to null on Update to force a redraw
        // (we may also want to follow this pattern for all row previews in the future, but it'd be harder to manage)
        var preview = row.GetCachedPreview();

        if (!(preview instanceof DashGuiList)) {
            preview = row.SetCachedPreview(this.get_sublist());
            refresh_connections = false;
        }

        preview.SetParentRow(row);

        var queue = row.GetSublistQueue();

        if (Dash.IsValidObject(queue)) {
            queue.forEach(
                function (entry) {
                    var added_row = preview.GetRow(entry["row_id"]);

                    if (!added_row) {
                        added_row = preview.AddRow(entry["row_id"]);
                    }

                    if (entry["css"]) {
                        added_row.html.css(entry["css"]);
                    }

                    added_row.Update();
                }
            );
        }

        if (preview.rows.length > 0) {
            if (refresh_connections) {
                // When re-using a cached preview, need to refresh the connections
                preview.rows.forEach(
                    function (sublist_row) {
                        sublist_row.refresh_connections();
                    }
                );
            }

            row.Expand(preview.html, preview.rows);
        }

        else {
            preview = $("<div></div>");

            preview.css({
                "padding-left": Dash.Size.Padding,
                "padding-top": Dash.Size.Padding * 0.5,
                "height": Dash.Size.RowHeight,
                "color": this.color.Text,
                "font-family": "sans_serif_italic"
            });

            preview.text("No content (empty folder)");

            row.Expand(preview);
        }
    };

    this.setup_styles();
}
