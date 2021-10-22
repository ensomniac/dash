function DashGuiList (binder, selected_callback, column_config, color) {
    this.binder = binder;
    this.selected_callback = selected_callback.bind(this.binder);
    this.column_config = column_config;
    this.color = color || Dash.Color.Light;

    if (!(column_config instanceof DashGuiListColumnConfig)) {
        console.log("Error: Required second parameter 'column_config' is not of the correct class, DashGuiListColumnConfig!");

        return;
    }

    if (!this.binder.GetDataForKey) {
        console.log("Error: Calling class must contain a function named GetDataForKey()");

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
            console.log("Error: This list already has a header row, can't add another.");

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
            console.log("Error: New 'column_config' is not of the correct class, DashGuiListColumnConfig!");

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

    this.GetParentRow = function () {
        // Intended for cases where this is a sublist

        return this.parent_row;
    };

    this.SetParentRow = function (row) {
        // Intended for cases where this is a sublist

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
        // May need to add more here
        return new Dash.Gui.Layout.List(this.binder, this.selected_callback, this.column_config);
    };

    this.expand_sublist = function (row, is_selected) {
        if (is_selected) {
            row.Collapse();
        }

        // TODO: expand another list with the same column config - will need to work out how we then add rows
        //  to it (maybe pass an array of ids to AddSubList and immediately "add" rows to it, or save them to ref here)

        // Since lists can get big, we only want to draw this once, but we'll reset it to null on Update to force a redraw
        // (we may also want to follow this pattern for all row previews in the future, but it'd be harder to manage)
        var preview = row.GetCachedPreview();

        if (!(preview instanceof DashGuiList)) {
            preview = row.SetCachedPreview(this.get_sublist(row));

            // TEST
            // var test_row = row.cached_preview.AddRow("2021102122424482130");
            // test_row.Update();
        }

        preview.SetParentRow(row);

        if (preview.rows.length > 0) {
            row.Expand(preview.html);

            return;
        }

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
    };

    this.setup_styles();
}
