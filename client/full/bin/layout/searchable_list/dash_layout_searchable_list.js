function DashLayoutSearchableList (binder, on_selection_callback, get_data_callback, on_row_draw_callback=null) {
    this.binder = binder;
    this.on_selection_callback = on_selection_callback.bind(this.binder);
    this.get_data_callback = get_data_callback.bind(this.binder);
    this.on_row_draw_callback = on_row_draw_callback ? on_row_draw_callback.bind(this.binder) : null;

    this.rows = {};
    this.id_list = [];
    this.RowContent = {};
    this.filter_text = "";
    this.search_terms = [];
    this.init_scroll = false;
    this.html = $("<div></div>");
    this.row_content_classes = {};
    this.auto_select_disabled = false;
    this.row_selection_disabled = false;
    this.current_selected_row_id = null;
    this.list_container = $("<div></div>");
    this.row_height = Dash.Size.ButtonHeight;
    this.color = this.binder.color || Dash.Color.Light;
    this.input = new DashLayoutSearchableListSearchInput(this);
    this.recall_id = (this.binder.constructor + "").replace(/[^A-Za-z]/g, "").slice(0, 100).trim().toLowerCase();

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": Dash.Color.Lighten(this.color.Background, 5)
        });

        this.list_container.css({
            "position": "absolute",
            "left": 0,
            "top": this.row_height + 1, // Include search pinstripe
            "right": 0,
            "bottom": 0,
            "overflow-y": "auto"
        });

        this.html.append(this.list_container);
        this.html.append(this.input.html);
    };

    this.DisableAutomaticSelection = function () {
        this.auto_select_disabled = true;
    };

    this.DisableRowSelection = function () {
        this.row_selection_disabled = true;
    };

    this.SetRowContent = function (row_id, html, class_with_update_function=null) {
        if (class_with_update_function && class_with_update_function.hasOwnProperty("Update")) {
            this.row_content_classes[row_id] = class_with_update_function;
        }

        this.RowContent[row_id] = html;

        this.rows[row_id].SetContent(html);
    };

    // Use this to set a unique ID that allows the last loaded selection to be applied
    this.SetRecallID = function (recall_id) {
        this.recall_id = recall_id;
    };

    this.SetSearchTerm = function (search_term) {
        search_term = search_term.trim().toLowerCase();

        if (search_term === this.filter_text) {
            return;
        }

        this.filter_text = search_term;

        this.filter_rows();
    };

    this.UpdateRows = function (order, data) {
        /**
         * @param {Array} order - IDs that correspond to data's keys
         * @param {Object} data - Data objects whose keys correspond to order
         */

        this.id_list = order;
        this.search_terms = [];  // Reset each time

        var id;

        for (id in this.rows) {
            this.rows[id].html.detach();
        }

        for (var row_id of order) {
            var row_data = data[row_id];

            if (!this.rows[row_id] || !this.rows[row_id].html.parent) {
                this.rows[row_id] = new DashLayoutSearchableListRow(this, row_id, row_data);
            }

            if (this.row_content_classes[row_id]) {
                this.row_content_classes[row_id].Update(row_data);
            }

            else if (this.on_row_draw_callback) {
                this.on_row_draw_callback(row_id);

                if (this.row_content_classes[row_id]) {
                    this.row_content_classes[row_id].Update(row_data);
                }
            }

            var search_text = this.rows[row_id].Update(row_data);

            if (search_text) {
                search_text = search_text.trim().toLowerCase();

                // Unidecode
                search_text = search_text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            }

            else {
                console.warn("Warning: Dash.Layout.SearchableList > row update callback must return a search term. Ignoring row", row_id);
            }

            this.search_terms.push(search_text);

            this.list_container.append(this.rows[row_id].html);
        }

        if (this.filter_text.length > 0) {
            this.filter_rows();
        }

        if (!this.auto_select_disabled) {
            var last_loaded = Dash.Local.Get(this.recall_id);

            if (last_loaded && order.includes(last_loaded)) {
                this.SetActiveRowID(last_loaded);
            }
        }
    };

    this.GetSelectedID = function () {
        var selected = this.current_selected_row_id || Dash.Local.Get(this.recall_id);

        if (this.id_list.includes(selected)) {
            return selected;
        }

        else {
            return null;
        }
    };

    this.SetActiveRowID = function (row_id) {
        if (this.row_selection_disabled) {
            return;
        }

        if (this.current_selected_row_id === row_id) {
            return;
        }

        this.current_selected_row_id = row_id;

        Dash.Local.Set(this.recall_id, row_id);

        for (var id in this.rows) {
            if (id === row_id) {
                this.rows[id].SetActive(true);

                if (!this.init_scroll) {
                    if (!this.rows[id].IsVisible()) {
                        try {
                            this.rows[id].html[0].scrollIntoView();
                        }

                        catch {
                            // Pass
                        }
                    }

                    this.init_scroll = true;
                }
            }

            else {
                this.rows[id].SetActive(false);
            }
        }

        this.on_selection_callback(this.current_selected_row_id);
    };

    this.filter_rows = function () {
        for (var id in this.rows) {
            this.rows[id].html.detach();
        }

        for (var i in this.id_list) {
            var row_id = this.id_list[i];
            var search_text = this.search_terms[i];

            if (!search_text || !this.filter_text || search_text.includes(this.filter_text) || this.filter_text === row_id) {
                this.list_container.append(this.rows[row_id].html);
            }
        }
    };

    this.setup_styles();
}
