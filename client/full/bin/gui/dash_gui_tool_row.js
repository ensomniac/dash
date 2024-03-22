function DashGuiToolRow (binder, get_data_cb=null, set_data_cb=null, color=null) {
    this.binder = binder;
    this.get_data_cb = get_data_cb ? get_data_cb.bind(binder) : null;
    this.set_data_cb = set_data_cb ? set_data_cb.bind(binder) : null;
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);

    this.html = null;
    this.elements = [];
    this.toolbar = null;
    this.height = Dash.Size.RowHeight;
    this.get_formatted_data_cb = null;

    this.setup_styles = function () {
        this.toolbar = new Dash.Layout.Toolbar(this.binder, this.color);

        this.toolbar.height = this.height;

        this.toolbar.DisablePaddingRefactoring();

        this.toolbar.stroke_sep.remove();

        this.toolbar.html.css({
            "background": "none",
            "padding-left": 0,
            "padding-right": 0,
            "height": this.height,
            "margin-left": Dash.Size.Padding * 2,
            "border-bottom": "1px dotted " + this.color.PinstripeDark
        });

        this.html = this.toolbar.html;
    };

    this.InputInFocus = function () {
        for (var element of this.elements) {
            if ((element instanceof DashGuiInput || element instanceof DashGuiInputRow) && element.InFocus()) {
                return true;
            }

            if (element instanceof DashGuiCombo && element.InFocus(true)) {
                return true;
            }
        }

        return false;
    };

    this.AddExpander = function () {
        return this.toolbar.AddExpander();
    };

    this.AddDivider = function () {
        var divider = this.toolbar.AddDivider();

        divider.html.css({
            "height": this.height * 0.9,
            "margin-top": Dash.Size.Padding * 0.1,
            "padding-top": Dash.Size.Padding * 0.1
        });

        return divider;
    };

    this.AddComboRow = function (
        label_text, combo_options, default_value, callback,
        additional_data={}, extra_options={}, add_highlight=true
    ) {
        if (!label_text.endsWith(":")) {
            label_text += ":";
        }

        var container = $("<div></div>");
        var css = {"display": "flex"};

        if (this.elements.length) {
            css["margin-left"] = Dash.Size.Padding;
        }

        container.css(css);

        if (add_highlight) {
            var highlight = $("<div></div>");

            highlight.css({
                "position": "absolute",
                "inset": 0,
                "background": this.color.AccentGood,
                "border-radius": Dash.Size.BorderRadius,
                "opacity": 0
            });

            container.on("mouseenter", function () {
                highlight.stop().animate({"opacity": 0.5}, 50);
            });

            container.on("mouseleave", function () {
                highlight.stop().animate({"opacity": 0}, 250);
            });

            container.append(highlight);
        }

        var label = this.AddLabel(
            label_text, Dash.Size.Padding * 0.5, "", null, false
        );

        label.html.css({
            "padding-left": 0
        });

        label.label.css({
            "padding-left": 0
        });

        label.html.detach();

        container.append(label.html);

        var combo = this.AddCombo(combo_options, default_value, callback, additional_data, extra_options);

        combo.html.detach();

        container.append(combo.html);

        this.AddHTML(container);

        container.label = label;
        container.combo = combo;

        return container;
    };

    this.AddInputRow = function (
        data_key, label_text="", default_value=null, width=null,
        on_submit_cb=null, placeholder_text="", can_edit=true
    ) {
        if (!this.get_data_cb) {
            console.error("Error: AddInputRow requires ToolRow to have been provided a 'get_data_cb'");

            return;
        }

        var html_css = {
            "border-bottom": "",
            "margin-top": Dash.Size.Padding * 0.1
        };

        var value = this.get_formatted_data_cb ? this.get_formatted_data_cb(data_key) : this.get_data_cb()[data_key];

        var input_row = (function (self) {
            return new Dash.Gui.InputRow(
                label_text,
                value !== null && value !== undefined ? value : default_value,  // Keep 'false' intact
                placeholder_text || default_value || label_text,
                "Save",
                on_submit_cb ? function (input_row) {
                    on_submit_cb.bind(self.binder)(data_key, input_row.Text(), input_row);
                } : function (input_row) {
                    self.on_input_submit(input_row.Text(), null, {"data_key": data_key});
                },
                self,
                self.color,
                data_key
            );
        })(this);

        input_row.RemoveSaveButton();

        input_row.invalid_input_highlight.css({
            "left": 0
        });

        input_row.flash_save.css({
            "left": 0
        });

        if (width) {
            html_css["width"] = width;
        }

        else {
            html_css["flex-grow"] = 2;

            input_row.input.input.css({
                "flex-grow": 2,
                "width": "100%"
            });
        }

        if (this.elements.length) {
            html_css["margin-left"] = Dash.Size.Padding;
        }

        input_row.html.css(html_css);

        if (!can_edit) {
            input_row.SetLocked(true);
        }

        this.elements.push(input_row);

        this.AddHTML(input_row.html);

        return input_row;
    };

    this.AddIconButton = function (
        icon_name, callback, hover_hint="", additional_data=null,
        icon_size=null, size_mult=1.0, for_uploader=false
    ) {
        var button = this.toolbar.AddIconButton(
            icon_name, callback, icon_size, additional_data, this.height, size_mult, for_uploader
        );

        button.html.css({
            "margin-top": 0
        });

        if (hover_hint) {
            button.SetHoverHint(hover_hint);
        }

        this.elements.push(button);

        return button;
    };

    this.AddCheckbox = function (
        label_text, default_state, callback, identifier, hover_hint="Toggle",
        checkbox_redraw_styling=null, label_border=true, strict_identifier=false
    ) {
        var checkbox = this.toolbar.AddCheckbox(
            label_text,
            default_state,
            callback,
            identifier,
            hover_hint,
            checkbox_redraw_styling,
            label_border,
            strict_identifier
        );

        checkbox.SetIconSize(125).AddHighlight(0);

        checkbox.html.css({
            "margin-top": 0
        });

        // May need to add this to the other public functions as well
        if (this.elements.length > 0 && label_border) {
            checkbox.html.css({
                "margin-left": Dash.Size.Padding
            });
        }

        // TODO: The margins applied here need to be re-evaluated, but it may break the look of a few things
        if (checkbox.label) {
            checkbox.label.html.css({
                "margin-left": Dash.Size.Padding * 0.1
            });

            checkbox.label.label.css({
                "margin-left": this.elements.length > 0 ? Dash.Size.Padding * 1.5 : 0,
                "font-size": "80%",
                "font-family": "sans_serif_bold"
            });

            if (label_border) {
                checkbox.label.border.css({
                    "background": this.color.Button.Background.Base,
                    "height": this.height * 0.9,
                    "margin-top": Dash.Size.Padding * 0.1
                });
            }
        }

        this.elements.push(checkbox);

        return checkbox;
    };

    this.AddText = function (text, color=null) {
        var label = this.toolbar.AddText(text, color);

        this.elements.push(label);

        return label;
    };

    this.AddHTML = function (html) {
        this.toolbar.AddHTML(html);

        this.elements.push(html);

        return html;
    };

    // This is intended to nicely format a prop box that only uses locked rows for displaying data, therefore,
    // it's only been implemented in input-related areas for now (there may be other areas it should be added)
    this.SetGetFormattedDataCallback = function (callback, binder=null) {
        this.get_formatted_data_cb = binder || this.binder ? callback.bind(binder ? binder : this.binder) : callback;
    };

    // this.AddComboRow is a better option when combining this with a label
    this.AddCombo = function (combo_options, default_value, callback, additional_data={}, extra_options={}) {
        var combo = this.toolbar.AddCombo(
            "",
            combo_options,
            default_value,
            callback,
            true,
            additional_data,
            extra_options
        );

        combo.html.css({
            "line-height": this.height,
            "margin-top": 0
        });

        this.elements.push(combo);

        return combo;
    };

    // TODO: These params are a mess, fix it (globally)
    this.AddLabel = function (text, right_margin=null, icon_name="", left_label_margin=null, border=true) {
        var label = this.toolbar.AddLabel(text, false);

        if (right_margin !== null) {
            label.html.css({
                "margin-right": right_margin
            });
        }

        label.html.css({
            "line-height": this.height,
            "margin-top": 0,
            "margin-bottom": 0,
            "margin-left": left_label_margin !== null ? left_label_margin : 0  // Dash.Size.Padding * 0.1
        });

        label.label.css({
            "white-space": "nowrap",
            "font-size": Dash.Size.DesktopToMobileMode ? "60%" : "80%",
            "font-family": "sans_serif_bold"
        });

        if (border) {
            if (icon_name) {
                label.ReplaceBorderWithIcon(
                    icon_name,
                    null,
                    {"margin-top": Dash.Size.Padding * 0.2},
                    this.height * 0.8
                );

                label.html.css({
                    "padding-left": 0
                });
            }

            else {
                label.border.css({
                    "background": this.color.Button.Background.Base,
                    "height": this.height * 0.9,
                    "margin-top": Dash.Size.Padding * 0.1
                });
            }

            if (this.elements.length < 1) {
                this.html.css({
                    "padding-left": Dash.Size.Padding * 0.1
                });
            }
        }

        else {
            label.border.remove();

            label.label.css({
                "margin-left": 0
            });

            if (this.elements.length < 1) {
                label.html.css({
                    "padding-left": 0
                });

                label.label.css({
                    "padding-left": 0
                });
            }
        }

        this.elements.push(label);

        return label;
    };

    // this.AddInputRow is a better option when combining this with a label
    // TODO: These params are a mess, fix it (globally)
    this.AddInput = function (
        placeholder_text, data_key, width=null, flex=false, on_submit_cb=null, on_change_cb=null,
        can_edit=true, include_label=false, label_text="", double_click_clear=true, transparent=true,
        allow_update=true
    ) {
        if (!this.get_data_cb) {
            console.error("Error: AddInput requires ToolRow to have been provided a 'get_data_cb'");

            return;
        }

        if (include_label) {
            var label = this.AddLabel(
                label_text || placeholder_text,
                Dash.Size.Padding * 0.5,
                null,
                null,
                false
            );

            label.html.css({
                "margin-top": Dash.Size.Padding * 0.1
            });
        }

        var input = this.toolbar.AddTransparentInput(
            placeholder_text,
            on_change_cb || this.on_input_keystroke.bind(this),
            {
                "width": width || Dash.Size.ColumnWidth * 0.6,
                "on_enter": on_submit_cb || this.on_input_submit.bind(this)
            },
            {
                "data_key": data_key
            },
            can_edit ? double_click_clear : false
        );

        if (include_label) {
            input.label = label;
        }

        // Hack so that property boxes can update these
        if (allow_update) {
            input.data_key = data_key;
        }

        var html_css = {
            "margin-right": 0,
            "height": this.height * (transparent ? 0.65 : 0.75),
            "margin-top": Dash.Size.Padding * (transparent ? 0.25 : 0.15)
        };

        var input_css = {
            "top": 0,
            "height": this.height * (transparent ? 0.8 : 0.85)
        };

        if (transparent) {
            html_css["border-bottom"] = "";
        }

        else {
            html_css["border-radius"] = Dash.Size.BorderRadius;
            html_css["margin-top"] = Dash.Size.Padding * 0.1;
            html_css["padding-bottom"] = Dash.Size.Padding * 0.1;
            html_css["padding-left"] = Dash.Size.Padding * 0.5;
            html_css["padding-right"] = Dash.Size.Padding * 0.5;
            html_css["border"] = "1px solid " + this.color.PinstripeDark;
        }

        if (flex) {
            html_css["flex-grow"] = 2;

            input_css["flex-grow"] = 2;
            input_css["width"] = "100%";
        }

        input.html.css(html_css);

        input.input.css(input_css);

        var value = this.get_formatted_data_cb ? this.get_formatted_data_cb(data_key) : this.get_data_cb()[data_key];

        if (value) {
            input.SetText(value);
        }

        if (!can_edit) {
            input.SetLocked(true);
        }

        this.elements.push(input);

        return input;
    };

    this.AddDatePicker = function (
        label_text="", can_edit=false, on_submit_cb=null,
        on_autosave_cb=null, on_change_cb=null, min="", max=""
    ) {
        var picker = this.toolbar.AddDatePicker(
            label_text, can_edit, on_submit_cb, on_autosave_cb, on_change_cb, min, max
        );

        picker.input.css({
            "margin-top": Dash.Size.Padding * 0.1,
            "padding-left": Dash.Size.Padding * 0.5
        });

        picker.input.css({
            "border-radius": Dash.Size.BorderRadius,
            "border": "1px solid " + this.color.PinstripeDark
        });

        this.elements.push(picker);

        return picker;
    };

    // This can probably be moved to DashLayoutToolbar and be abstracted here
    this.AddAddress = function (
        data_key, can_edit=false, on_submit_cb=null, label_text="Address",
        placeholder_text="Start typing an address to search...", international=false
    ) {
        var address = new Dash.Gui.Address(
            label_text,
            null,
            (
                on_submit_cb ? on_submit_cb.bind(this.binder) : (
                    function (formatted_address) {
                        if (!this.set_data_cb) {
                            return;
                        }

                        this.set_data_cb(data_key, formatted_address);
                    }
                ).bind(this)
            ),
            this.color,
            international,
            placeholder_text,
            false
        );

        if (!can_edit) {
            address.SetLocked(true);
        }

        var value = this.get_formatted_data_cb ? this.get_formatted_data_cb(data_key) : this.get_data_cb()[data_key];

        if (value) {
            address.SetValue(value);
        }

        address.html.css({
            "flex": 2
        });

        address.input.css({
            "border": ""
        });

        address.map_link_button.SetIconSize(110);

        this.AddHTML(address.html);

        return address;
    };

    this.on_input_keystroke = function () {
        // Placeholder
    };

    this.on_input_submit = function (submitted_value, input_obj, additional_data) {
        if (!this.set_data_cb) {
            return;
        }

        this.set_data_cb(additional_data["data_key"], submitted_value);
    };

    this.setup_styles();
}
