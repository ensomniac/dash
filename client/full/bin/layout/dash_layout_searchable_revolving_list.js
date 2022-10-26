// This must be an abstraction to combine the two, since implementing the revolving list into the searchable list is not going to work favorably
function DashLayoutSearchableRevolvingList (binder, on_row_click_cb, label_css={}, row_highlight_color="", row_height=null, color=null) {
    this.binder = binder;
    this.on_row_click_cb = on_row_click_cb.bind(this.binder);
    this.label_css = label_css;
    this.row_highlight_color = row_highlight_color;
    this.row_height = row_height || Dash.Size.ButtonHeight;
    this.color = color || binder.color || Dash.Color.Light;

    this.data = null;
    this.list = null;
    this.input = null;
    this.text_formatter = null;
    this.last_search_text = "";
    this.html = $("<div></div>");
    this.get_data_for_key = null;
    this.label_key = "display_name";

    this.setup_styles = function () {
        var column_config = new Dash.Layout.List.ColumnConfig();

        column_config.AddFlexText(this.label_key, "", 0.25, this.label_css);

        this.list = new DashLayoutRevolvingList(
            this,
            column_config,
            this.color,
            false,
            {
                "row_height": this.row_height,
                "row_highlight_color": this.row_highlight_color
            }
        );

        this.list.html.css({
            "top": this.row_height + 1
        });

        this.list.SetNonExpandingClickCallback(this.on_row_click_cb, this.binder, this.color.AccentGood);

        this.input = (function (self) {
            return new DashLayoutSearchableListInput(
                self.list,
                function () {
                    self.on_search();  // Forego default parameters
                },
                function () {
                    var last_selected_id = self.LastSelectedRowID();

                    if (last_selected_id) {
                        self.SelectRow(last_selected_id);  // Force scroll
                    }
                }
            );
        })(this);

        this.html.append(this.input.html);
        this.html.append(this.list.html);
    };

    this.Update = function (data={"data": {}, "order": []}, on_search=true) {
        this.data = data;

        this.list.Draw(this.data["order"]);

        this.on_search(on_search);
    };

    this.SetRecallID = function (recall_id) {
        this.list.SetRecallID(recall_id);
    };

    this.SetTextFormatter = function (formatter_cb) {
        this.text_formatter = formatter_cb.bind(this.binder);
    };

    this.LastSelectedRowID = function () {
        return this.list.last_selected_row_id;
    };

    this.SelectRow = function (row_id) {
        this.list.SelectRow(row_id);
    };

    this.OverrideGetDataForKey = function (func) {
        this.get_data_for_key = func.bind(this.binder);
    };

    this.on_search = function (force=false) {
        var search_text = this.input.input.Text().trim().toLowerCase();

        if (!force && search_text === this.last_search_text) {
            return;
        }

        var matched_ids = [];

        for (var row_id of this.data["order"]) {
            var value = Dash.Utils.NormalizeSearchText(this.GetDataForKey(row_id, this.label_key));

            if (value.includes(search_text)) {
                matched_ids.push(row_id);
            }
        }

        this.list.Draw(matched_ids);

        this.last_search_text = search_text;
    };

    this.GetDataForKey = function (row_id, key) {
        if (this.get_data_for_key) {  // For some reason, simply overriding GetDataForKey wasn't successful...
            return this.get_data_for_key(row_id, key);
        }

        try {
            var value = this.data["data"][row_id][key] || "";

            if (this.text_formatter) {
                value = this.text_formatter(value);
            }

            return value;
        }

        catch {
            return "";
        }
    };

    this.setup_styles();
}
