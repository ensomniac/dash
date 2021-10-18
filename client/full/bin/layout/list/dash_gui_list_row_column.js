function DashGuiListRowColumn (list_row, column_config_data, index) {
    this.list_row = list_row;
    this.column_config_data = column_config_data;
    this.index = parseInt(index);

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
            "text-overflow": "ellipsis"
        };

        if (this.width > 0) {
            css["width"] = this.width;
        }

        var previous_column = this.list.column_config.columns[this.index - 1];

        if (previous_column && previous_column["type"] === "divider") {
            if (this.index < (this.list.column_config.columns.length - 1)) {
                css["margin-right"] = Dash.Size.Padding;
            }

            css["margin-left"] = Dash.Size.Padding;
        }

        else {
            if (this.column_config_data["left_aligned"]) {
                if (this.index < (this.list.column_config.columns.length - 1)) {
                    css["margin-right"] = Dash.Size.Padding;
                }
            }

            else {
                css["margin-left"] = Dash.Size.Padding;
            }
        }

        if (this.column_config_data["css"]) {
            for (var key in this.column_config_data["css"]) {
                if (!key.includes("width") && this.list_row.is_header) {
                    continue;
                }

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

        if (this.list_row.is_header) {
            if (this.list.color === Dash.Color.Dark) {
                css["color"] = Dash.Color.Light.BackgroundRaised;
            }

            else if (this.list.color === Dash.Color.Light) {
                css["color"] = Dash.Color.Dark.BackgroundRaised;
            }
        }

        this.html.css(css);

        if (this.list_row.is_header && this.column_config_data["header_css"]) {
            this.html.css(this.column_config_data["header_css"]);
        }
    };

    this.Update = function () {
        var column_value;
        var font_family;

        if (this.list_row.is_header) {
            column_value = this.column_config_data["display_name"] || this.column_config_data["data_key"].Title();
        }

        else {
            column_value = this.list.binder.GetDataForKey(
                this.list_row.id,
                this.column_config_data["data_key"]
            );
        }

        if (this.list_row.is_header) {
            font_family = "sans_serif_bold";
        }

        else if (column_value && column_value.length > 0) {
            font_family = "sans_serif_normal";
        }

        if (!column_value) {
            var options = this.column_config_data["options"];

            if (options && "default_to_display_name" in options && options["default_to_display_name"]) {
                column_value = this.column_config_data["display_name"];
            }

            font_family = "sans_serif_italic";
        }

        this.html.css({
            "font-family": font_family
        });

        this.html.text(column_value);
    };

    this.setup_styles();
}
