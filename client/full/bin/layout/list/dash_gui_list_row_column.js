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

        if (this.column_config_data["css"] && !this.list_row.is_header) {
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

        if (this.list_row.is_header) {
            var color;

            if (this.list.color === Dash.Color.Dark) {
                color = Dash.Color.Light.BackgroundRaised;
            }

            else if (this.list.color === Dash.Color.Light) {
                color = Dash.Color.Dark.BackgroundRaised;
            }

            css["color"] = color;
        }

        this.html.css(css);
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
