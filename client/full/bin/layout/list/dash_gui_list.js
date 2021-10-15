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
    this.header_row = null;
    this.header_row_css = null;
    this.html = $("<div></div>");
    this.last_selection_id = null;
    this.recall_id = "dash_list_" + (this.binder.constructor + "").replace(/[^A-Za-z]/g, "");
    this.recall_id = this.recall_id.slice(0, 100).trim().toLowerCase();

    this.setup_styles = function () {
        this.html.css({
            "background": Dash.Color.Light.Background
        });
    };

    this.AddRow = function (arbitrary_id) {
        var row = new DashGuiListRow(this, arbitrary_id);

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

    this.SetSelection = function (row_id) {
        var is_selected = true;
        var cb_id = row_id;

        if (row_id == this.last_selection_id) {
            row_id = null;
            is_selected = false;
        }

        for (var i in this.rows) {
            var row = this.rows[i];

            if (row.id == row_id) {
                row.SetSelected(true);
            }

            else {
                row.SetSelected(false);
            }
        }

        this.selected_callback(cb_id, is_selected);
        this.last_selection_id = row_id;
    };

    this.GetRow = function (row_id) {
        if (!this.rows) {
            return;
        }

        for (var i in this.rows) {
            var row = this.rows[i];

            if (row.id === row_id) {
                return row;
            }
        }
    };

    this.add_header_row = function () {
        this.header_row = new DashGuiListRow(this, "_top_header_row");

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

    this.setup_styles();
}
