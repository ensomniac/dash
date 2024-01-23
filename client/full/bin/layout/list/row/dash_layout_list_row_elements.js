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

    this.add_text_area_column = function (column_config_data) {
        var text_area = this.get_text_area(column_config_data);

        this.column_box.append(text_area.html);

        this.columns["text_areas"].push({
            "obj": text_area,
            "column_config_data": column_config_data
        });
    };

    this.add_icon_button_column = function (column_config_data, index) {
        if (this.is_header && column_config_data["display_name"]) {
            this.add_default_column(column_config_data, index);

            return;
        }

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

        if (
               (this.is_header && !column_config_data["show_for_header"])
            || (this.is_footer && !column_config_data["show_for_footer"])
        ) {
            css["opacity"] = 0;
        }

        divider_line.css(css);

        return divider_line;
    };

    this.get_combo = function (column_config_data) {
        var options = column_config_data["options"] || {};
        var color = options["color"] || this.color;
        var read_only = this.is_header || this.is_footer || this.is_sublist;
        var label = options["label_text"] || options["display_name"] || "";

        var combo = new Dash.Gui.Combo (
            label,
            options["callback"] || column_config_data["on_click_callback"] || null,
            options["binder"] || null,
            (this.is_header) && label ? [{"id": label, "label_text": label}] : options["combo_options"] || null,
            this.get_data_for_key(column_config_data, "", true),
            color,
            {
                "style": "row",
                "read_only": read_only || column_config_data["can_edit"] === false,
                "additional_data": {
                    "row_id": this.id,
                    "row": this,  // For revolving lists, use this instead of relying on row_id
                    "column_index": this.columns["combos"].length,
                    "data_key": column_config_data["data_key"]
                },
                "is_user_list": options["is_user_list"] || false,
                "multi_select": options["multi_select"] || false
            }
        );

        var css = {
            "height": this.height,
            "width": column_config_data["width"]
        };

        if (column_config_data["css"]) {
            if (
                   column_config_data["css"]["border"]
                && column_config_data["css"]["border"] !== "none"
                && !this.is_header
                && !this.is_footer
            ) {
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

        if (read_only && options["hover_text"]) {
            css["cursor"] = "help";

            combo.html.attr("title", options["hover_text"]);
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
                    "color": column_config_data["header_css"]["color"] || color.Stroke
                });
            }

            else if (this.is_footer && label) {
                // TODO: need a title thing up here, use default column element?
                combo.label.css({
                    "font-family": column_config_data["footer_css"]["font-family"] || "sans_serif_bold",
                    "color": column_config_data["footer_css"]["color"] || color.Stroke
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
                options["hover_text"]
            );
        }

        return combo;
    };

    this.get_input = function (column_config_data) {
        var options = column_config_data["options"] || {};
        var color = options["color"] || this.color;
        var placeholder_label = options["placeholder_label"] || "";
        var input = new Dash.Gui.Input(placeholder_label === "none" ? "" : placeholder_label, color);

        if (!this.init_input(input, column_config_data, placeholder_label)) {
            return input;
        }

        input.input.css({
            "height": this.height * 0.9,
            "line-height": (this.height * 0.9) + "px",
            "padding-left": Dash.Size.Padding * 0.35
        });

        var starting_value = options["default_value"] || this.get_data_for_key(column_config_data);

        if (starting_value) {
            input.SetText(starting_value.toString());
        }

        if (options["callback"] && options["binder"]) {
            (function (self) {
                input.SetOnSubmit(
                    function () {
                        options["callback"].bind(options["binder"])(
                            self.id,
                            input.Text(),
                            column_config_data,
                            self,
                            input
                        );
                    },
                    options["binder"]
                );

                input.EnableAutosave();
            })(this);
        }

        if (options["disable_autosave"]) {
            input.DisableAutosave();
        }

        if (column_config_data["can_edit"] === false) {
            input.SetLocked(true);
        }

        return input;
    };

    this.get_text_area = function (column_config_data) {
        var options = column_config_data["options"] || {};
        var color = options["color"] || this.color;
        var callback = options["binder"] ? options["callback"].bind(options["binder"]) : options["callback"];
        var placeholder_label = options["placeholder_label"] === "none" ? "" : (options["placeholder_label"] || "");

        var text_area = (function (self) {
            return new Dash.Gui.TextArea(
                color,
                placeholder_label,
                options["binder"],
                callback ? function (value, text_area) {
                    callback(
                        // This is a lot of things to return, but just copying the input cb for now
                        self.id,
                        value,
                        column_config_data,
                        self,
                        text_area
                    );
                } : null,
                true
            );
        })(this);

        if (!this.init_input(text_area, column_config_data, placeholder_label, true)) {
            return text_area;
        }

        if (options["disable_autosave"]) {
            text_area.DisableAutoSubmit();
        }

        text_area.EnableAutoHeight(
            (options["default_value"] || this.get_data_for_key(column_config_data) || "").toString(),
            this.height * 0.9,
            this.height * 0.9
        );

        if (!options["allow_new_lines"]) {
            // Makes the enter key submit instead of breaking to the next line, which
            // will typically be preferable in this context, since the row will auto-size
            text_area.DisableNewLines();
        }

        if (column_config_data["can_edit"] === false) {
            text_area.Lock(false);
        }

        text_area.textarea.css({
            "border": text_area.border_size + "px solid " + color.Pinstripe
        });

        // Make the row accommodate the fluid size of the textarea
        this.html.css({
            "height": "fit-content"
        });

        this.highlight.css({
            "height": "100%"
        });

        this.column_box.css({
            "height": "fit-content",
            "position": ""
        });

        return text_area;
    };

    this.get_icon_button = function (column_config_data) {
        var options = column_config_data["options"] || {};

        var icon_button = (function (self) {
            return new Dash.Gui.IconButton(
                options["icon_name"],
                function (event, button) {
                    options["callback"].bind(options["binder"])(self, button);
                },
                options["binder"],
                options["color"] || self.color,
                options["options"] || {}
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

        if (options["hover_text"]) {
            icon_button.SetHoverHint(options["hover_text"]);
        }

        if (options["icon_color"]) {
            icon_button.SetIconColor(options["icon_color"]);
        }

        icon_button.AddHighlight();

        return icon_button;
    };

    this.get_copy_button = function (column_config_data) {
        var options = column_config_data["options"] || {};

        var copy_button = (function (self) {
            return new Dash.Gui.CopyButton(
                options["binder"],
                function () {
                    return options["getter_cb"].bind(options["binder"])(self);
                },
                options["size_mult"],
                null,
                "default",
                options["icon_name"],
                options["color"] || self.color
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

        if (options["hover_text"]) {
            copy_button.button.SetHoverHint(options["hover_text"]);
        }

        copy_button.button.AddHighlight();

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

    this.init_input = function (element, column_config_data, placeholder_label, is_text_area=false) {
        var options = column_config_data["options"] || {};
        var color = options["color"] || this.color;

        var css = {
            "background": "none",
            "height": is_text_area ? (
                (this.is_header || this.is_footer) ? this.height : "fit-content"
            ) : (this.height * ((this.is_header || this.is_footer) ? 1 : 0.9)),
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

            css["border"] = "1px solid " + color.Pinstripe;
            css["margin-top"] = Dash.Size.Padding * 0.1;

            if (is_text_area) {
                css["margin-bottom"] = Dash.Size.Padding * 0.1;
            }

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

        element.html.css(css);

        if (this.is_header || this.is_footer || this.is_sublist) {
            // Keep the container so the row stays properly aligned, but don't add the actual element
            if (is_text_area) {
                element.textarea.remove();
            }

            else {
                element.input.remove();
            }

            element.html.text(
                placeholder_label && this.is_header && options["use_placeholder_label_for_header"] ? placeholder_label : (
                    this.is_footer ? this.get_data_for_key(column_config_data) : ""
                ) || column_config_data["display_name"]
            );

            this.prevent_events_for_placeholder(element.html);

            return false;
        }

        return true;
    };
}
