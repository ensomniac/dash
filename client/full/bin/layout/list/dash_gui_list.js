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

    this.Clear = function () {
        this.html.empty();

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

    this.setup_styles();
}
