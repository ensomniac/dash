function DashLayoutListRowColumn (list_row, column_config_data, index, color=null) {
    this.list_row = list_row;
    this.column_config_data = column_config_data;
    this.index = parseInt(index);
    this.color = color || list_row.color || Dash.Color.Light;

    this.disabled = false;
    this.html = $("<div></div>");
    this.list = this.list_row.list;
    this.height = this.list_row.height;
    this.width = this.column_config_data["width"] || -1;

    this.setup_styles = function () {
        this.set_click_callback();

        this.html.css(this.get_css());

        if (this.list_row.is_header && this.column_config_data["header_css"]) {
            this.html.css(this.column_config_data["header_css"]);
        }

        if (this.list_row.is_footer && this.column_config_data["footer_css"]) {
            this.html.css(this.column_config_data["footer_css"]);
        }

        if (!this.list.is_header && !this.list_row.is_footer && this.column_config_data["options"]["hover_text"]) {
            this.html.attr("title", this.column_config_data["options"]["hover_text"]);

            this.html.css({
                "cursor": "help"
            });
        }
    };

    this.Disable = function (opacity=0.5) {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "opacity": opacity,
            "pointer-events": "none",
            "user-select": "none"
        });
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
    };

    this.Update = function () {
        // In the case that the row's height attribute has been programmatically
        // changed, like in the RevolvingList code when using divider rows
        if (this.list_row.height !== this.height) {
            this.height = this.list_row.height;

            this.html.css({
                "height": this.height,
                "line-height": this.height.toString() + "px"
            });
        }

        var css = {};
        var column_value;

        if (this.list_row.is_header || this.column_config_data["type"] === "label") {
            column_value = (
                   this.column_config_data["display_name"]
                || this.column_config_data["data_key"].Title()
                || ""
            ).trim();

            if (this.column_config_data["type"] === "label" && !column_value.endsWith(":") && this.column_config_data["enforce_colon"]) {
                column_value += ":";
            }
        }

        else if (this.list_row.is_sublist) {
            if (this.index === 0) {
                column_value = this.list_row.id.toString().replace(this.list_row.list.sublist_row_tag, "");
            }

            else {
                column_value = "";
            }
        }

        else {
            column_value = this.list.get_data_for_key(
                this.list_row.id,
                this.column_config_data["data_key"],
                this
            );
        }

        if (
               this.list_row.is_header
            || this.list_row.is_footer
            || this.list_row.is_divider
            || this.column_config_data["type"] === "label"
        ) {
            css["font-family"] = "sans_serif_bold";
        }

        else if (this.list_row.is_sublist) {
            css["font-family"] = "sans_serif_italic";
        }

        else if (column_value && column_value.length > 0) {
            css["font-family"] = "sans_serif_normal";
        }

        if (!column_value) {
            var options = this.column_config_data["options"];

            if (options && "default_to_display_name" in options && options["default_to_display_name"]) {
                column_value = this.column_config_data["display_name"];
            }

            css["font-family"] = "sans_serif_italic";
        }

        css = this.get_font_size_css(css);
        css = this.get_text_color_css(css);

        for (var key in css) {
            css = this.get_preserved_css(css, key);
        }

        this.html.css(css);

        if (column_value && column_value.toString().includes("</")) {
            // jQuery's .text() escapes HTML tags, so this approach is required
            this.html[0].innerHTML = column_value;
        }

        else {
            this.html.text(column_value);
        }
    };

    this.get_css = function () {
        var css = {
            "height": this.height,
            "line-height": this.height.toString() + "px",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis"
        };

        if (this.list_row.is_sublist) {
            css["text-decoration"] = "underline";
        }

        if (this.width > 0) {
            css["width"] = this.width;
        }

        css = this.get_font_size_css(css);
        css = this.get_css_margins(css);
        css = this.get_column_config_css(css);
        css = this.get_text_color_css(css);

        return css;
    };

    this.get_font_size_css = function (css) {
        if (this.column_config_data["type"] === "label" || this.list_row.is_divider) {
            css["font-size"] = "80%";
        }

        else {
            css["font-size"] = "100%";
        }

        return css;
    };

    this.get_text_color_css = function (css) {
        if (this.list_row.is_header || this.list_row.is_footer || this.list_row.is_divider) {
            css["color"] = this.color.Stroke;
        }

        else {
            css["color"] = this.color.Text;
        }

        return css;
    };

    this.get_column_config_css = function (css) {
        if (!this.column_config_data["css"]) {
            return css;
        }

        for (var key in this.column_config_data["css"]) {
            if (!key.includes("width") && (this.list_row.is_header || this.list_row.is_footer)) {
                continue;
            }

            css[key] = this.column_config_data["css"][key];
        }

        return css;
    };

    this.get_css_margins = function (css) {
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

        if (this.column_config_data["type"] === "label") {
            css["margin-right"] = Dash.Size.Padding * 0.5;
        }

        return css;
    };

    this.set_click_callback = function () {
        if (!this.column_config_data["on_click_callback"]) {
            return;
        }

        this.html.css({
            "cursor": "pointer"
        });

        this.column_config_data["on_click_callback"] = this.column_config_data["on_click_callback"].bind(this.list.binder);

        (function (self) {
            self.html.on("click", function (e) {
                self.column_config_data["on_click_callback"](self.list_row.id);

                e.preventDefault();

                return false;
            });
        })(this);
    };

    this.get_preserved_css = function (css, key) {
        if (this.list_row.is_header) {
            if (this.column_config_data["header_css"] && this.column_config_data["header_css"][key]) {
                css[key] = this.column_config_data["header_css"][key];
            }
        }

        else if (this.list_row.is_footer) {
            if (this.column_config_data["footer_css"] && this.column_config_data["footer_css"][key]) {
                css[key] = this.column_config_data["footer_css"][key];
            }
        }

        else if (this.column_config_data["css"] && this.column_config_data["css"][key]) {
            css[key] = this.column_config_data["css"][key];
        }

        return css;
    };

    this.setup_styles();
}
