function DashLayoutList (binder, selected_callback, column_config, color=null, get_data_for_key=null, row_height=null) {
    this.binder = binder;
    this.selected_callback = selected_callback && binder ? selected_callback.bind(this.binder) : null;
    this.column_config = column_config;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.row_height = row_height || Dash.Size.RowHeight;

    // This is useful if there is more than one list in the same script, which each need their own GetDataForKey function
    this.get_data_for_key = get_data_for_key ? get_data_for_key.bind(binder) : binder.GetDataForKey ? binder.GetDataForKey.bind(binder) : null;

    if (!(column_config instanceof DashLayoutListColumnConfig)) {
        console.error("Error: Required second parameter 'column_config' is not of the correct class, DashLayoutListColumnConfig");

        return;
    }

    if (!this.get_data_for_key) {
        console.error("Error: If optional 'get_data_for_key' param is not provided, calling class must contain a function named GetDataForKey()");

        return;
    }

    this.rows = [];
    this.parent_row= null;  // Intended for cases where this is a sublist
    this.header_row = null;
    this.footer_row = null;
    this.header_row_css = null;
    this.footer_row_css = null;
    this.html = $("<div></div>");
    this.last_selection_id = null;
    this.highlight_active_row = false;
    this.sublist_row_tag = "_sublist_row_";
    this.header_row_tag = "_top_header_row";
    this.footer_row_tag = "_bottom_footer_row";
    this.allow_row_divider_color_change_on_hover = true;
    this.recall_id = "dash_list_" + (this.binder.constructor + "").replace(/[^A-Za-z]/g, "");
    this.recall_id = this.recall_id.slice(0, 100).trim().toLowerCase();

    this.setup_styles = function () {
        // Placeholder
    };

    this.AddRow = function (row_id) {
        var row = new DashLayoutListRow(this, row_id, this.row_height);

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

    // This has only been tested with Dash.Layout.RevolvingList, but it
    // should work as expected in this basic list as well, just unconfirmed
    this.AddFooterRow = function (html_css, column_box_css) {
        if (this.footer_row) {
            console.error("Error: This list already has a footer row, can't add another.");

            return;
        }

        this.footer_row_css = {
            "html": html_css,
            "column_box": column_box_css
        };

        this.add_footer_row();

        return this.footer_row;
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

    this.RemoveRow = function (row_id, could_be_in_sublist=false) {
        var row;
        var list;
        var nested_in_sublist = false;

        if (could_be_in_sublist) {
            [row, list] = this.get_row_nested_in_sublist(row_id, true);

            if (row) {
                nested_in_sublist = true;
            }
        }

        if (!row) {
            row = this.GetRow(row_id);

            if (!row) {
                return;
            }

            list = this;
        }

        row.Collapse();
        row.Hide();

        row.html.remove();

        if (nested_in_sublist && list.parent_row) {
            for (var i in list.parent_row.sublist_queue) {
                if (list.parent_row.sublist_queue[i]["row_id"] === row_id) {
                    list.parent_row.sublist_queue.Pop(i);

                    break;
                }
            }

            row.SetExpandedSubListParentHeight(-this.row_height);
        }

        var index = list.rows.indexOf(row);

        if (index === null || index === undefined || index < 0) {
            return;
        }

        list.rows.Pop(index);
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
        for (var row of this.rows) {
            row.Update();
        }

        if (this.header_row) {
            this.header_row.Update();
        }

        if (this.footer_row) {
            this.footer_row.Update();
        }
    };

    this.Clear = function () {
        this.html.empty();

        // Always keep the header row, even when clearing the list
        if (this.header_row) {
            this.add_header_row();
        }

        // Always keep the footer row, even when clearing the list
        if (this.footer_row) {
            this.add_footer_row();
        }

        // This step must happen after re-adding the header/footer rows above, since we don't track those rows
        this.rows = [];
    };

    this.SetColumnConfig = function (column_config, clear=true) {
        if (!(column_config instanceof DashLayoutListColumnConfig)) {
            console.error("Error: New 'column_config' is not of the correct class, DashLayoutListColumnConfig!");

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
            if (this.selected_callback) {
                this.selected_callback(row.id, is_selected, row);
            }
        }

        this.update_rows_highlighting(row, is_selected);

        this.last_selection_id = is_selected ? row.id : null;
    };

    this.EnableActiveRowHighlighting = function () {
        this.highlight_active_row = true;
    };

    this.GetRow = function (row_id, is_sublist=false, nested_in_sublist=false) {
        if (!this.rows) {
            return;
        }

        if (nested_in_sublist) {
            return this.get_row_nested_in_sublist(row_id);
        }

        for (var i in this.rows) {
            var row = this.rows[i];

            if (row.id === (is_sublist ? (this.sublist_row_tag + row_id) : row_id)) {
                return row;
            }
        }
    };

    // This is handy, so you can re-expand previously expanded rows after a list clear or list refresh
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

    // Intended to be used when custom CSS is used on divider elements
    this.DisableDividerColorChangeOnHover = function () {
        this.allow_row_divider_color_change_on_hover = false;
    };

    this.get_row_nested_in_sublist = function (row_id, return_sublist=false, _rows=null) {
        if (_rows === null) {
            _rows = this.rows;
        }

        for (var top_row of _rows) {
            if (!top_row.is_sublist) {
                continue;
            }

            var sublist = top_row.GetCachedPreview();

            if (!sublist) {
                continue;
            }

            for (var sub_row of sublist.rows) {
                if (sub_row.id === row_id) {
                    return (return_sublist ? [sub_row, sublist] : sub_row);
                }
            }


            if (return_sublist) {
                var [row, list] = this.get_row_nested_in_sublist(row_id, return_sublist, sublist.rows);
            }

            else {
                row = this.get_row_nested_in_sublist(row_id, return_sublist, sublist.rows);
            }

            if (row) {
                return (return_sublist ? [row, list] : row);
            }
        }

        return (return_sublist ? [null, null] : null);
    };

    this.update_rows_highlighting = function (row, is_selected) {
        if (!this.highlight_active_row) {
            return;
        }

        this.update_row_highlighting(row, is_selected);

        if (is_selected) {
            for (var other_row of this.rows) {
                if (other_row === row) {
                    continue;
                }

                this.update_row_highlighting(other_row, false);
            }
        }
    };

    this.update_row_highlighting = function (row, is_selected) {
        try {
            var row_bg = row.html.css("background-color");
            var highlight_bg = row.highlight ? row.highlight.css("background-color") : null;

            if (is_selected) {
                if ((!row_bg || row_bg === "rgba(0, 0, 0, 0)") && highlight_bg) {
                    row.html.css({
                        "background": row.highlight.css("background-color")
                    });
                }
            }

            else {
                if (highlight_bg === row_bg) {
                    row.html.css({
                        "background": "none"
                    });
                }
            }
        }

        catch {
            // Pass
        }
    };

    this.add_header_row = function () {
        this.header_row = new DashLayoutListRow(this, this.header_row_tag);

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

    this.add_footer_row = function () {
        this.footer_row = new DashLayoutListRow(this, this.footer_row_tag);

        if (this.footer_row_css) {
            if (this.footer_row_css["html"]) {
                this.footer_row.html.css(this.footer_row_css["html"]);
            }

            if (this.footer_row_css["column_box"]) {
                this.footer_row.column_box.css(this.footer_row_css["column_box"]);
            }
        }

        this.html.append(this.footer_row.html);

        // Always update it by default - can still update later in the code that calls this
        this.footer_row.Update();
    };

    this.get_sublist = function () {
        var sublist = new Dash.Layout.List(this.binder, this.selected_callback, this.column_config);

        // Any changes to the list like this one should be re-applied to the sublist here
        if (!this.allow_row_divider_color_change_on_hover) {
            sublist.DisableDividerColorChangeOnHover();
        }

        return sublist;
    };

    this.expand_sublist = function (row, is_selected) {
        if (is_selected) {
            row.Collapse();
        }

        var refresh_connections = true;

        // Since lists can get big, we only want to draw this once, but we'll reset it to null on Update to force a redraw
        // (we may also want to follow this pattern for all row previews in the future, but it'd be harder to manage)
        var preview = row.GetCachedPreview();

        if (!(preview instanceof DashLayoutList)) {
            preview = row.SetCachedPreview(this.get_sublist());
            refresh_connections = false;
        }

        preview.SetParentRow(row);

        var queue = row.GetSublistQueue();

        if (Dash.Validate.Object(queue)) {
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
                        sublist_row.RefreshConnections();
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
                "height": this.row_height,
                "color": this.color.Text,
                "font-family": "sans_serif_italic"
            });

            preview.text("No content (empty folder)");

            row.Expand(preview);
        }
    };

    this.setup_styles();
}
