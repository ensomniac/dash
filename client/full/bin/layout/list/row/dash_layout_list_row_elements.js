/**@member DashLayoutListRow*/

function DashLayoutListRowElements () {
    this.add_default_column = function (column_config_data, index) {
        column_config_data["left_aligned"] = true;

        var column = new DashLayoutListRowColumn(this, column_config_data, index, this.color);

        this.column_box.append(column.html);

        this.columns["default"].push({
            "obj": column,
            "column_config_data": column_config_data
        });
    };

    this.add_spacer_column = function (column_config_data) {
        if (column_config_data["header_only"] && !this.is_header) {
            return;
        }

        if (column_config_data["footer_only"] && !this.is_footer) {
            return;
        }

        var spacer = this.get_spacer();

        this.column_box.append(spacer);

        this.columns["spacers"].push({
            "obj": spacer,
            "column_config_data": column_config_data
        });
    };

    this.add_divider_column = function (column_config_data) {
        var divider = this.get_divider(column_config_data);

        this.column_box.append(divider);

        this.columns["dividers"].push({
            "obj": divider,
            "column_config_data": column_config_data
        });
    };

    this.add_combo_column = function (column_config_data) {
        var combo = this.get_combo(column_config_data);

        this.column_box.append(combo.html);

        this.columns["combos"].push({
            "obj": combo,
            "column_config_data": column_config_data
        });
    };

    this.add_input_column = function (column_config_data) {
        var input = this.get_input(column_config_data);

        this.column_box.append(input.html);

        this.columns["inputs"].push({
            "obj": input,
            "column_config_data": column_config_data
        });
    };

    this.add_icon_button_column = function (column_config_data) {
        var icon_button = this.get_icon_button(column_config_data);

        this.column_box.append(icon_button.html);

        this.columns["icon_buttons"].push({
            "obj": icon_button,
            "column_config_data": column_config_data
        });
    };

    this.add_copy_button_column = function (column_config_data) {
        var copy_button = this.get_copy_button(column_config_data);

        this.column_box.append(copy_button.html);

        this.columns["copy_buttons"].push({
            "obj": copy_button,
            "column_config_data": column_config_data
        });
    };

    this.get_spacer = function () {
        var spacer = $("<div></div>");

        spacer.css({
            "height": this.height,
            "flex-grow": 2,
            "flex-shrink": 2
        });

        return spacer;
    };

    this.get_divider = function (column_config_data) {
        var divider_line = $("<div></div>");

        var css = {
            "background": this.color.AccentGood,
            "width": Dash.Size.Padding * 0.3,
            "margin": "none",
            "flex": "none"
        };

        if (column_config_data["css"]) {
            css = {
                ...css,
                ...column_config_data["css"]
            };
        }

        if (this.is_header && column_config_data["header_css"]) {
            css = {
                ...css,
                ...column_config_data["header_css"]
            };
        }

        if (this.is_footer && column_config_data["footer_css"]) {
            css = {
                ...css,
                ...column_config_data["footer_css"]
            };
        }

        if ((this.is_header && !column_config_data["show_for_header"]) || (this.is_footer && !column_config_data["show_for_footer"])) {
            css["opacity"] = 0;
        }

        divider_line.css(css);

        return divider_line;
    };

    this.get_combo = function (column_config_data) {
        var read_only = this.is_header || this.is_footer || this.is_sublist;
        var label = column_config_data["options"]["label_text"] || column_config_data["options"]["display_name"] || "";

        var combo = new Dash.Gui.Combo (
            label,
            column_config_data["options"]["callback"] || column_config_data["on_click_callback"] || null,
            column_config_data["options"]["binder"] || null,
            (this.is_header) && label ? [{"id": label, "label_text": label}] : column_config_data["options"]["combo_options"] || null,
            this.get_data_for_key(column_config_data, "", true),
            this.color,
            {
                "style": "row",
                "read_only": read_only || column_config_data["can_edit"] === false,
                "additional_data": {
                    "row_id": this.id,
                    "row": this,  // For revolving lists, use this instead of relying on row_id
                    "column_index": this.columns["combos"].length,
                    "data_key": column_config_data["data_key"]
                },
                "is_user_list": column_config_data["options"]["is_user_list"] || false,
                "multi_select": column_config_data["options"]["multi_select"] || false
            }
        );

        var css = {
            "height": this.height,
            "width": column_config_data["width"]
        };

        if (column_config_data["css"]) {
            if (column_config_data["css"]["border"] && column_config_data["css"]["border"] !== "none" && !this.is_header && !this.is_footer) {
                css["box-sizing"] = "border-box";
                css["padding-left"] = Dash.Size.Padding * 0.2;
            }

            css = {
                ...css,
                ...column_config_data["css"]
            };
        }

        if (this.is_header) {
            css["border"] = "none";

            if (column_config_data["header_css"]) {
                css = {
                    ...css,
                    ...column_config_data["header_css"]
                };
            }
        }

        else if (this.is_footer) {
            css["border"] = "none";

            if (column_config_data["footer_css"]) {
                css = {
                    ...css,
                    ...column_config_data["footer_css"]
                };
            }
        }

        if (read_only && column_config_data["options"]["hover_text"]) {
            css["cursor"] = "help";

            combo.html.attr("title", column_config_data["options"]["hover_text"]);
        }

        combo.html.css(css);

        combo.label.css({
            "height": this.height,
            "margin-top": -Dash.Size.Padding * 0.1,
            "line-height": this.height + "px"
        });

        if (read_only) {
            if (this.is_header && label) {
                // TODO: need a title thing up here, use default column element?
                combo.label.css({
                    "font-family": column_config_data["header_css"]["font-family"] || "sans_serif_bold",
                    "color": column_config_data["header_css"]["color"] || this.color.Stroke
                });
            }

            else if (this.is_footer && label) {
                // TODO: need a title thing up here, use default column element?
                combo.label.css({
                    "font-family": column_config_data["footer_css"]["font-family"] || "sans_serif_bold",
                    "color": column_config_data["footer_css"]["color"] || this.color.Stroke
                });
            }

            else {
                // Keep the container so the row stays properly aligned, but don't show the actual element
                combo.html.css({
                    "opacity": 0
                });
            }

            this.prevent_events_for_placeholder(
                combo.html,
                column_config_data["options"]["hover_text"]
            );
        }

        return combo;
    };

    this.get_input = function (column_config_data) {
        var color = column_config_data["options"]["color"] || this.color;
        var placeholder_label = column_config_data["options"]["placeholder_label"] || "";
        var input = new Dash.Gui.Input(placeholder_label === "none" ? "" : placeholder_label, color);

        var css = {
            "background": "none",
            "height": this.height * ((this.is_header || this.is_footer) ? 1 : 0.9),
            "box-shadow": "none"
        };

        if (column_config_data["width"]) {
            css["width"] = column_config_data["width"];
        }

        if (this.is_header || this.is_footer) {
            if (placeholder_label || this.is_footer) {
                css["color"] = color.Stroke;
                css["font-family"] = "sans_serif_bold";
            }

            css["border"] = "none";
            css["line-height"] = this.height + "px";
        }

        else {
            if (this.is_sublist && placeholder_label) {
                css["color"] = color.Stroke;
                css["font-family"] = "sans_serif_bold";
            }

            css["border"] = "1px solid " + this.color.Pinstripe;
            css["margin-top"] = Dash.Size.Padding * 0.1;

            if (column_config_data["css"]) {
                css = {
                    ...css,
                    ...column_config_data["css"]
                };
            }
        }

        if (this.is_header && column_config_data["header_css"]) {
            css = {
                ...css,
                ...column_config_data["header_css"]
            };
        }

        else if (this.is_footer && column_config_data["footer_css"]) {
            css = {
                ...css,
                ...column_config_data["footer_css"]
            };
        }

        input.html.css(css);

        if (this.is_header || this.is_footer || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            input.input.remove();

            input.html.text(
                placeholder_label && this.is_header && column_config_data["options"]["use_placeholder_label_for_header"] ?
                placeholder_label : (this.is_footer ? this.get_data_for_key(column_config_data) : "") || column_config_data["display_name"]
            );

            this.prevent_events_for_placeholder(input.html);

            return input;
        }

        input.input.css({
            "height": this.height * 0.9,
            "line-height": (this.height * 0.9) + "px",
            "padding-left": Dash.Size.Padding * 0.35
        });

        var starting_value = column_config_data["options"]["default_value"] || this.get_data_for_key(column_config_data);

        if (starting_value) {
            input.SetText(starting_value.toString());
        }

        if (column_config_data["options"]["callback"] && column_config_data["options"]["binder"]) {
            (function (self, column_config_data, input) {
                input.SetOnSubmit(
                    function () {
                        var callback = column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"]);

                        callback(self.id, input.Text(), column_config_data, self, input);
                    },
                    column_config_data["options"]["binder"]
                );

                input.EnableAutosave();
            })(this, column_config_data, input);
        }

        if (column_config_data["options"]["disable_autosave"]) {
            input.DisableAutosave();
        }

        if (column_config_data["can_edit"] === false) {
            input.SetLocked(true);
        }

        return input;
    };

    this.get_icon_button = function (column_config_data) {
        var icon_button = (function (self) {
            return new Dash.Gui.IconButton(
                column_config_data["options"]["icon_name"],
                function (event, button) {
                    column_config_data["options"]["callback"].bind(column_config_data["options"]["binder"])(self, button);
                },
                column_config_data["options"]["binder"],
                column_config_data["options"]["color"] || self.color,
                column_config_data["options"]["options"] || {}
            );
        })(this);

        icon_button.html.css({
            "height": this.height
        });

        if (column_config_data["css"]) {
            icon_button.html.css(column_config_data["css"]);
        }

        if (this.is_header || this.is_footer || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            icon_button.icon.icon_html.remove();

            this.prevent_events_for_placeholder(icon_button.html);

            return icon_button;
        }

        if (column_config_data["options"]["hover_text"]) {
            icon_button.SetHoverHint(column_config_data["options"]["hover_text"]);
        }

        if (column_config_data["options"]["icon_color"]) {
            icon_button.SetIconColor(column_config_data["options"]["icon_color"]);
        }

        return icon_button;
    };

    this.get_copy_button = function (column_config_data) {
        var copy_button = (function (self) {
            return new Dash.Gui.CopyButton(
                column_config_data["options"]["binder"],
                function () {
                    return column_config_data["options"]["getter_cb"].bind(column_config_data["options"]["binder"])(self);
                },
                column_config_data["options"]["size_mult"],
                null,
                "default",
                column_config_data["options"]["icon_name"],
                column_config_data["options"]["color"] || self.color
            );
        })(this);

        copy_button.html.css({
            "height": this.height
        });

        if (column_config_data["css"]) {
            copy_button.html.css(column_config_data["css"]);
        }

        if (this.is_header || this.is_footer || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            copy_button.button.icon.icon_html.remove();

            copy_button.label.remove();

            this.prevent_events_for_placeholder(copy_button.html);

            return copy_button;
        }

        if (column_config_data["options"]["hover_text"]) {
            copy_button.button.SetHoverHint(column_config_data["options"]["hover_text"]);
        }

        return copy_button;
    };

    this.prevent_events_for_placeholder = function (html, click_only=false) {
        if (!click_only) {
            html.css({
                "pointer-events": "none"
            });
        }

        html.off("click");
    };
}
