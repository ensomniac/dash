function DashGuiListRowColumn (list_row, column_config_data) {
    this.list_row = list_row;
    this.column_config_data = column_config_data;

    this.list = this.list_row.list;
    this.html = $("<div></div>");
    this.width = this.column_config_data["width"] || -1;

    this.setup_styles = function () {
        var css = {
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px",
            "color": Dash.Color.Light.Text,
            "cursor": "pointer",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
        };

        if (this.width > 0) {
            css["width"] = this.width;
        }

        if (this.column_config_data["left_aligned"]) {
            css["margin-right"] = Dash.Size.Padding;
        }
        else {
            css["margin-left"] = Dash.Size.Padding;
        }

        if (this.column_config_data["css"]) {
            for (var key in this.column_config_data["css"]) {
                css[key] = this.column_config_data["css"][key];
            }
        }

        if (this.column_config_data["on_click_callback"]) {
            var binder = this.list.binder;

            this.column_config_data["on_click_callback"] = this.column_config_data["on_click_callback"].bind(binder);

            (function (self) {
                self.html.on("click", function (e) {

                    self.column_config_data["on_click_callback"](self.list_row.id);

                    e.preventDefault();

                    return false;
                });
            })(this);
        }

        this.html.css(css);
    };

    this.Update = function () {
        var column_value = this.list.binder.GetDataForKey(
            this.list_row.id,
            this.column_config_data["data_key"]
        );

        if (column_value && column_value.length > 0) {
            this.html.css({
                "font-family": "sans_serif_normal"
            });
        }

        else {
            this.html.css({
                "font-family": "sans_serif_italic"
            });
        }

        column_value = column_value || this.column_config_data["display_name"];

        this.html.text(column_value);
    };

    this.setup_styles();
}
