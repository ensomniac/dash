/**@member DashGuiPropertyBox*/

function DashGuiPropertyBoxInterface () {
    this.Update = function () {
        this.update_inputs();
        this.update_combos();
        this.update_headers();
        this.update_tool_rows();
    };

    this.Disable = function () {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "opacity": 0.5,
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

    this.InputInFocus = function () {
        var data_key;

        for (data_key in this.inputs) {
            var input_row = this.inputs[data_key];

            if (input_row && input_row.InFocus()) {
                return true;
            }
        }

        for (data_key in this.combos) {
            if (data_key === "") {
                continue;
            }

            var combo = this.combos[data_key];

            if (combo && combo.InFocus(true)) {
                return true;
            }
        }

        for (var tool_row of this.tool_rows) {
            if (tool_row.InputInFocus()) {
                return true;
            }
        }

        return false;
    };

    this.SetIndentPx = function (px) {
        this.indent_px = px;
    };
    
    this.SetTopRightLabel = function (label_text) {
        if (!this.top_right_label) {
            this.add_top_right_label();
        }

        this.top_right_label.text(label_text);
    };

    this.Flatten = function () {
        Dash.Gui.Flatten(this.html);
    };

    // Intended for Flattened boxes
    this.AddBottomDivider = function () {
        if (this.bottom_divider) {
            return;
        }

        this.html.css({
            "margin-bottom": 0
        });

        this.bottom_divider = Dash.Gui.GetBottomDivider(this.color);

        this.html.append(this.bottom_divider);

        return this.bottom_divider;
    };

    // This is intended to nicely format a prop box that only uses locked rows for displaying data, therefore,
    // it's only been implemented in input-related areas for now (there may be other areas it should be added)
    this.SetGetFormattedDataCallback = function (callback, binder=null) {
        this.get_formatted_data_cb = (
            binder || this.binder ? callback.bind(binder ? binder : this.binder) : callback
        );
    };

    this.AddTopRightIconButton = function (callback, data_key, additional_data=null, icon_id="trash") {
        if (this.top_right_delete_button) {
            return;
        }

        if (!this.buttons) {
            this.buttons = [];
        }

        this.top_right_delete_button = Dash.Gui.GetTopRightIconButton(
            this.binder,
            callback,
            icon_id,
            data_key,
            additional_data,
            this.top_right_label
        );

        this.html.append(this.top_right_delete_button.html);

        return this.top_right_delete_button;
    };

    this.AddHTML = function (html) {
        this.html.append(html);

        return html;
    };

    this.AddLineBreak = function () {
        return this.AddHTML($("<br>"));
    };

    this.AddExpander = function () {
        var expander = Dash.Gui.GetFlexSpacer();

        this.html.css({
            "display": "flex",
            "flex-direction": "column"
        });

        this.html.append(expander);

        return expander;
    };

    this.AddHeader = function (label_text, update_key=null) {
        var header_obj = new Dash.Gui.Header(label_text, this.color);

        if (this.num_headers > 0) {
            // header.css("margin-top", Dash.Size.Padding * 0.5);

            header_obj.html.css({
                "margin-top": Dash.Size.Padding * 1.5
            });
        }

        // Ryan, I made these margin changes on 2/1/22 because I do it with every property box,
        // so it felt right to adjust the default - please let me know if you feel otherwise!

        header_obj.html.css({
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        this.html.append(header_obj.html);

        this.num_headers += 1;

        if (update_key != null && this.get_data_cb) {
            this.headers.push({
                "obj": header_obj,
                "update_key": update_key
            });
        }

        return header_obj;
    };

    this.AddButtonBar = function (style="default", indent=false) {
        var bar = new Dash.Gui.ButtonBar(this.binder, this.color, style);

        bar.html.css({
            "margin-top": Dash.Size.Padding,
            "margin-left": indent ? (Dash.Size.Padding * 2) : 0
        });

        this.AddHTML(bar.html);

        return bar;
    };

    this.AddToolRow = function (set_data_cb=null, highlight_row=true) {
        var tool_row = new Dash.Gui.ToolRow(
            this.binder,
            this.get_formatted_data_cb ? this.get_formatted_data_cb : this.get_data_cb,
            set_data_cb ? set_data_cb.bind(this.binder) : this.set_data_cb,
            this.color
        );

        if (this.get_formatted_data_cb) {
            tool_row.SetGetFormattedDataCallback(this.get_formatted_data_cb);
        }

        this.AddHTML(tool_row.html);
        this.indent_row(tool_row);
        this.track_row(tool_row);

        if (highlight_row) {
            this.add_hover_highlight(tool_row.html);
        }

        this.tool_rows.push(tool_row);

        return tool_row;
    };

    this.AddButton = function (label_text, callback=null, options={}, wrap_cb=true) {  // See comments
        if (!this.buttons) {
            this.buttons = [];
        }

        var button = (function (self) {
            return new Dash.Gui.Button(
                label_text,

                // Andrew 1/17/23 - For some reason, the original code here wraps the provided
                // callback in an empty function, which suppresses the button's actual callback
                // return values. I can't understand why it was written this way, but I've added
                // an extra param, 'wrap_cb', to circumvent this behavior and actually pass the
                // provided callback directly to the button, as it should be. I've done it this
                // way to make sure nothing else will break, but this is a strange one.
                wrap_cb ? function () {
                    if (callback) {
                        callback.bind(self.binder)(button);
                    }
                } : callback ? callback.bind(self.binder) : null,

                self,
                self.color,
                options
            );
        })(this);

        this.buttons.push(button);

        var css = {"margin-top": Dash.Size.Padding};

        if (Dash.Validate.Object(options) && options["style"] === "toolbar") {
            css["margin-right"] = 0;
        }

        button.html.css(css);

        this.html.append(button.html);

        return button;
    };

    this.AddDeleteButton = function (callback, faint=true) {
        var button = this.AddButton("Delete", callback);

        button.StyleAsDeleteButton(Dash.Size.ColumnWidth, faint);

        button.html.css({
            "margin-left": Dash.Size.Padding * 2,
            "margin-right": "auto"
        });

        return button;
    };

    this.AddCombo = function (
        label_text, combo_options, property_key="", default_value=null, bool=false, options={}
    ) {
        var indent_px = options["indent_px"] || (Dash.Size.Padding * 2);
        var indent_row = false;

        if (this.num_headers > 0) {
            indent_row = true;
        }

        var row = new Dash.Gui.InputRow(
            label_text,
            "",
            "",
            "",
            function (row_input) {
                // Do nothing, dummy row
            },
            this
        );

        row.input.input.css("pointer-events", "none");

        if (indent_row) {
            row.html.css("margin-left", indent_px);
        }

        this.html.append(row.html);

        var selected_key = default_value || this.get_data_cb()[property_key];

        var combo = (function (self) {
            return new Dash.Gui.Combo(
                selected_key,
                options["callback"] ? function (selected_option) {
                    options["callback"](property_key, selected_option["id"]);
                } : function (selected_option) {
                    self.on_combo_updated(property_key, selected_option["id"]);
                },
                self,
                combo_options,
                default_value !== null ? default_value : selected_key,
                self.color,
                {
                    "style": "row",
                    ...options
                },
                bool
            );
        })(this);

        combo.html.css({
            "position": "absolute",
            "left": Dash.Size.Padding * 0.5,
            "top": 0,
            "height": Dash.Size.RowHeight
        });

        combo.label.css({
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px"
        });

        row.input.html.append(combo.html);

        row.property_box_input_combo = combo;

        this.combos[property_key] = combo;

        this.track_row(row);

        return row;
    };

    this.AddInput = function (
        data_key, label_text="", default_value="", combo_options=null, can_edit=false, options={}
    ) {
        this.data = this.get_data_cb ? this.get_data_cb() : {};

        var value = this.get_formatted_data_cb ? this.get_formatted_data_cb(data_key) : this.data[data_key];

        if (!label_text) {
            label_text = data_key ? data_key.Title() : "[MISSING LABEL]";
        }

        var row_details = {
            "key": data_key,
            "label_text": label_text,
            "default_value": default_value,
            "combo_options": combo_options,
            "value": value !== null && value !== undefined ? value : default_value,  // Keep 'false' intact
            "can_edit": can_edit
        };

        var row = (function (self) {
            return new Dash.Gui.InputRow(
                label_text,
                row_details["value"],
                options["placeholder_text"] || default_value || label_text,
                combo_options || "Save",
                options["callback"] ? function (row_input) {
                    options["callback"](data_key, row_input.Text());
                } : function (row_input) {
                    self.on_row_updated(row_input, row_details);
                },
                self,
                self.color,
                data_key
            );
        })(this);

        this.inputs[data_key] = row;

        this.indent_row(row);

        if (!can_edit) {
            row.SetLocked(true);
        }

        if (options["add_combo"]) {
            row = this.add_combo(
                row,
                options["add_combo"],
                false,
                !!options["on_delete"]
            );
        }

        if (options["on_delete"]) {
            row = this.add_delete_button(row, options["on_delete"], data_key);
        }

        this.html.append(row.html);

        this.track_row(row);

        return row;
    };

    this.AddLabel = function (text, color=null) {
        var header = new Dash.Gui.Header(text, color || this.color);

        header.html.css({
            "margin-left": Dash.Size.Padding * 2
        });

        this.html.append(header.html);

        return header;
    };

    this.AddText = function (text, color=null) {
        var label = this.AddLabel(text, false, color || this.color);

        label.border.remove();

        label.label.css({
            "font-family": "sans_serif_normal",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "padding-left": 0
        });

        this.html.append(label.html);

        return label;
    };

    // TODO: this should've originally been setup to be directly
    //  connected to this property box's set_data function
    this.AddCheckbox = function (
        local_storage_key="", default_state=true, color=null, hover_hint="Toggle",
        binder=null, callback=null, label_text="", label_first=true,
        include_border=false, read_only=false, icon_redraw_styling=null, highlight_row=true
    ) {
        label_text = label_text.trim();

        if (label_text && !label_text.endsWith(":")) {
            label_text += ":";  // To ensure conformity with property box row styling
        }

        var checkbox = new Dash.Gui.Checkbox(
            local_storage_key,
            default_state,
            color || this.color,
            hover_hint,
            binder,
            callback && highlight_row ? (function (self) {
                return function (checkbox) {
                    callback.bind(binder)(checkbox);

                    self.add_hover_highlight(checkbox.html);
                };
            })(this) : callback,
            label_text,
            label_first,
            include_border
        );

        this.indent_row(checkbox);

        checkbox.html.css({
            "border-bottom": this.bottom_border
        });

        checkbox.label.label.css({
            "font-family": "sans_serif_bold",
            "font-size": "80%"
        });

        checkbox.SetIconSize(125);

        if (read_only) {
            checkbox.SetReadOnly(true);
        }

        if (icon_redraw_styling) {
            icon_redraw_styling["margin-top"] = Dash.Size.Padding * 0.1;
        }

        else {
            icon_redraw_styling = {"margin-top": 0.1};
        }

        checkbox.AddIconButtonRedrawStyling(icon_redraw_styling);

        if (highlight_row) {
            this.add_hover_highlight(checkbox.html);
        }

        this.AddHTML(checkbox.html);
        this.track_row(checkbox);

        return checkbox;
    };

    this.AddDatePicker = function (
        key="", label_text="", can_edit=false, on_submit_cb=null,
        on_autosave_cb=null, on_change_cb=null, min="", max=""
    ) {
        this.inputs[key] = new Dash.Gui.DatePicker(
            label_text || key.Title() || "[Date]",
            this.binder,
            on_submit_cb,
            on_autosave_cb,
            on_change_cb,
            this.color,
            min,
            max
        );

        this.inputs[key].html.css({
            "border-bottom": this.bottom_border
        });

        return this.on_input_added(key, can_edit);
    };

    this.AddTimePicker = function (
        key="", label_text="", can_edit=false, on_submit_cb=null,
        on_autosave_cb=null, on_change_cb=null, min="", max="", include_seconds=false
    ) {
        this.inputs[key] = (function (self) {
            return new Dash.Gui.TimePicker(
                label_text || key.Title() || "[Time]",
                self.binder,
                on_submit_cb,
                on_autosave_cb,
                on_change_cb,
                self.color,
                min,
                max,
                include_seconds
            );
        })(this);

        this.inputs[key].html.css({
            "border-bottom": this.bottom_border
        });

        return this.on_input_added(key, can_edit);
    };

    // To visually break up rows when readability is getting tough due to too much stuff on the screen etc
    this.HighlightEveryOtherRow = function (odd_rows=false, color="") {
        this.every_other_row_hightlight = {
            "color": color || this.color.Pinstripe,
            "highlight": odd_rows
        };

        for (var row of this.rows) {
            this.highlight_row_if_applicable(row);
        }
    };

    this.Load = function () {
        Dash.Request(
            this,
            this.on_server_property_set,
            this.endpoint,
            {
                "f": "get_property_set",
                "obj_id": this.dash_obj_id
            }
        );
    };
}
