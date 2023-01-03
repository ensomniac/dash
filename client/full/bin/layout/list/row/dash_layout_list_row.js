function DashLayoutListRow (list, row_id, height=null) {
    this.list = list;
    this.id = row_id;
    this.height = height || Dash.Size.RowHeight;

    this.columns = {};
    this.is_shown = true;
    this.tmp_css_cache = [];
    this.sublist_queue = [];
    this.is_expanded = false;
    this.cached_preview = null;  // Intended for sublists only
    this.is_highlighted = false;
    this.color = this.list.color;
    this.expanded_highlight = null;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.column_box = $("<div></div>");
    this.expanded_content = $("<div></div>");
    this.clear_sublist_preview_on_update = true;
    this.is_header = this.list.hasOwnProperty("header_row_tag") ? this.id.startsWith(this.list.header_row_tag) : false;
    this.is_sublist = this.list.hasOwnProperty("sublist_row_tag") ? this.id.startsWith(this.list.sublist_row_tag) : false;

    this.anim_delay = {
        "highlight_show": 100,
        "highlight_hide": 250,
        "expanded_content": 180,
        "expanded_highlight": 270
    };

    DashLayoutListRowElements.call(this);
    DashLayoutListRowInterface.call(this);

    this.setup_styles = function () {
        if (this.is_header) {
            this.column_box.css({
                "background": this.color.AccentGood,
                "left": 0,
                "right": 0,
                "padding-left": Dash.Size.Padding,
                "padding-right": Dash.Size.Padding
            });
        }

        else {
            this.html.append(this.highlight);
            this.html.append(this.expanded_content);

            this.expanded_content.css({
                "margin-left": Dash.Size.Padding * (this.is_sublist ? 1 : -1),
                "margin-right": -Dash.Size.Padding,
                "overflow-y": "hidden",
                "height": 0
            });

            this.highlight.css({
                "position": "absolute",
                "left": 0,
                "top": 0,
                "right": 0,
                "height": this.height,
                "background": Dash.Color.GetTransparent(Dash.IsMobile ? Dash.Color.Mobile.AccentSecondary : this.color.AccentGood, 0.5),
                "pointer-events": "none",
                "opacity": 0
            });

            this.column_box.css({
                "left": Dash.Size.Padding,
                "right": Dash.Size.Padding
            });
        }

        this.html.append(this.column_box);

        this.column_box.css({
            "position": "absolute",
            "top": 0,
            "height": this.height,
            "display": "flex"
        });

        this.html.css({
            "color": this.color.Text,
            "border-bottom": "1px solid rgb(200, 200, 200)",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "min-height": this.height,
            "cursor": "pointer"  // This is changed in setup_columns(), if relevant
        });

        this.setup_columns();
        this.setup_connections();
    };

    this.store_css_on_expansion = function (row) {
        var border_bottom = row.html.css("border-bottom");

        if (!border_bottom || border_bottom === "none") {
            return;
        }

        row.html.css({
            "border-bottom": "none"
        });

        this.tmp_css_cache.push({
            "row": row,
            "css": {"border-bottom": border_bottom}
        });
    };

    this.create_expand_highlight = function (highlight_color=null) {
        this.expanded_highlight = Dash.Gui.GetHTMLAbsContext();

        this.expanded_highlight.css({
            "background": highlight_color || (this.is_sublist ? "none" : this.color.BackgroundRaised),
            "pointer-events": "none",
            "opacity": 0,
            "top": -1,
            "bottom": -1,
            "box-shadow": this.is_sublist ? "none" : "0px 0px 10px 1px rgba(0, 0, 0, 0.15)",
        });

        if (this.is_sublist) {
            this.expanded_highlight.css({
                "margin-left": Dash.Size.Padding * 2
            });
        }

        this.html.prepend(this.expanded_highlight);
    };

    this.get_data_for_key = function (column_config_data, default_value=null, third_param=null) {
        if (this.is_header) {
            return column_config_data["display_name"] || column_config_data["data_key"].Title();
        }

        if (third_param !== null) {
            return this.list.get_data_for_key(this.id, column_config_data["data_key"], third_param) || default_value;
        }

        return this.list.get_data_for_key(this.id, column_config_data["data_key"]) || default_value;
    };

    this.setup_connections = function () {
        (function (self) {
            self.html.on("mouseenter", function () {
                if (self.is_header) {
                    return;
                }

                self.highlight.stop().animate({"opacity": 1}, self.anim_delay["highlight_show"]);

                if (self.list.allow_row_divider_color_change_on_hover === false) {
                    return;
                }

                for (var divider of self.columns["dividers"]) {
                    divider["obj"].css({"background": self.color.Button.Background.Base});
                }
            });

            self.html.on("mouseleave", function () {
                if (self.is_expanded || self.is_header) {
                    return;
                }

                self.highlight.stop().animate({"opacity": 0}, self.anim_delay["highlight_hide"]);

                if (self.list.allow_row_divider_color_change_on_hover === false) {
                    return;
                }

                for (var divider of self.columns["dividers"]) {
                    divider["obj"].css({"background": self.color.AccentGood});
                }
            });

            self.column_box.on("click", function (e) {
                if (e.target && e.target.className.includes(" fa-")) {
                    // Don't set selection if it was an icon button that was clicked
                    return;
                }

                if (self.is_header) {
                    return;
                }

                self.list.SetSelection(self);
            });
        })(this);
    };

    this.setup_columns = function () {
        this.columns = {  // Make sure this gets reset if redrawn
            "default": [],
            "inputs": [],
            "combos": [],
            "spacers": [],
            "dividers": [],
            "copy_buttons": [],
            "icon_buttons": []
        };

        var default_columns_only = true;

        for (var i in this.list.column_config.columns) {
            var column_config_data = this.list.column_config.columns[i];

            if (column_config_data["type"] === "spacer") {
                this.add_spacer_column(column_config_data);
            }

            else if (column_config_data["type"] === "divider") {
                this.add_divider_column(column_config_data);
            }

            else if (column_config_data["type"] === "combo") {
                default_columns_only = false;

                this.add_combo_column(column_config_data);
            }

            else if (column_config_data["type"] === "input") {
                default_columns_only = false;

                this.add_input_column(column_config_data);
            }

            else if (column_config_data["type"] === "icon_button") {
                default_columns_only = false;

                this.add_icon_button_column(column_config_data);
            }

            else if (column_config_data["type"] === "copy_button") {
                default_columns_only = false;

                this.add_copy_button_column(column_config_data);
            }

            else {
                if (column_config_data["on_click_callback"]) {
                    default_columns_only = false;
                }

                this.add_default_column(column_config_data, i);
            }
        }

        this.html.css({
            // This helps differentiate elements on more complex lists, rather than having a pointer for everything.
            // The change only pertains to the row itself, and then each element controls their own cursor behavior.
            "cursor": this.is_header ? "auto" :
                this.is_sublist ? "context-menu" :
                default_columns_only ? "pointer" :
                this.list.hasOwnProperty("selected_callback") && !this.list.selected_callback ? "default" :
                this.list.hasOwnProperty("get_expand_preview") && !this.list.get_expand_preview ? (this.list.non_expanding_click_cb ? "pointer" : "default") :
                "cell"
        });
    };

    this.setup_styles();
}
