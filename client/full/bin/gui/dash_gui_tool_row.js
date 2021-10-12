function DashGuiToolRow (binder, get_data_cb=null, set_data_cb=null, color=null) {
    this.binder = binder;
    this.get_data_cb = get_data_cb ? get_data_cb.bind(binder) : null;
    this.set_data_cb = set_data_cb ? set_data_cb.bind(binder) : null;
    this.color = color || Dash.Color.Light;

    this.html = null;
    this.elements = [];
    this.toolbar = null;
    this.height = Dash.Size.RowHeight;

    this.setup_styles = function () {
        this.toolbar = new Dash.Gui.Layout.Toolbar(this, this.color);

        this.toolbar.stroke_sep.remove();

        this.toolbar.html.css({
            "padding-left": Dash.Size.Padding * 0.1,
            "padding-right": 0,
            "height": this.height,
            "margin-left": Dash.Size.Padding * 2,
            "border-bottom": "1px dotted rgba(0, 0, 0, 0.2)"
        });

        this.html = this.toolbar.html;
    };

    this.AddExpander = function () {
        return this.toolbar.AddExpander();
    };

    this.AddCombo = function (combo_options, default_value, callback, additional_data=null) {
        var combo = this.toolbar.AddCombo(
            "",
            combo_options,
            default_value,
            callback.bind(this.binder),
            true,
            additional_data
        );

        combo.html.css({
            "line-height": this.height,
            "margin-top": 0
        });

        this.elements.push(combo);

        return combo;
    };

    this.AddText = function (text, color=null) {
        this.toolbar.AddText(text, color);
    };

    this.AddLabel = function (text, right_margin=null, icon_name=null, left_label_margin=null, border=true) {
        var label = this.toolbar.AddLabel(text, false);

        if (right_margin !== null) {
            label.html.css({
                "margin-right": right_margin
            });
        }

        label.html.css({
            "line-height": this.height,
            "margin-top": 0,
            "margin-left": left_label_margin !== null ? left_label_margin : Dash.Size.Padding * 0.1
        });

        label.label.css({
            "white-space": "nowrap",
            "font-size": "80%",
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

    this.AddInput = function (text, data_key, width=null, flex=false, on_submit_cb=null, on_change_cb=null) {
        if (!this.get_data_cb) {
            console.log("Error: AddInput requires ToolRow to have been provided a 'get_data_cb'");

            return;
        }

        var input = this.toolbar.AddTransparentInput(
            text,
            on_change_cb ? on_change_cb.bind(this.binder) : this.on_input_keystroke,
            {
                "width": width || Dash.Size.ColumnWidth * 0.6,
                "on_enter": on_submit_cb ? on_submit_cb.bind(this.binder) : this.on_input_submit
            },
            {
                "data_key": data_key
            }
        );

        input.html.css({
            "margin-right": 0,
            "height": this.height * 0.65,
            "margin-top": Dash.Size.Padding * 0.25
        });

        input.input.css({
            "top": 0,
            "height": this.height * 0.8
        });

        if (flex) {
            input.html.css({
                "flex-grow": 2
            });

            input.input.css({
                "flex-grow": 2,
                "width": "100%"
            });
        }

        var value = this.get_data_cb()[data_key];

        if (value) {
            input.SetText(value);
        }

        this.elements.push(input);

        return input;
    };

    this.AddIconButton = function (icon_name, callback, hover_hint="", additional_data=null) {
        var button = this.toolbar.AddIconButton(icon_name, callback.bind(this.binder), null, additional_data);

        button.html.css({
            "margin-top": Dash.Size.Padding * 0.15
        });

        if (hover_hint) {
            button.SetHoverHint(hover_hint);
        }

        return button;
    };

    this.AddCheckbox = function (label_text, default_state, callback, identifier, hover_hint="Toggle", checkbox_redraw_styling=null, label_border=true) {
        var checkbox = new Dash.Gui.Checkbox(
            label_text,                                             // Label text
            this,                                                   // Binder
            callback.bind(this.binder),                             // Callback
            "dash_gui_tool_row_toggle_" + label_text + identifier,  // Local storage key
            default_state,                                          // Default state
            true,                                                   // Label first
            label_border,                                           // Include border
            this.color                                              // Color
        );

        checkbox.html.css({
            "margin-top": 0
        });

        // May need to add this to the other public functions as well
        if (this.elements.length > 0 && label_border) {
            checkbox.html.css({
                "margin-left": Dash.Size.Padding
            });
        }

        checkbox.label.html.css({
            "margin-left": Dash.Size.Padding * 0.1
        });

        checkbox.label.label.css({
            "margin-left": Dash.Size.Padding * 1.5,
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

        checkbox.icon_button.SetHoverHint(hover_hint);

        if (checkbox_redraw_styling) {
            checkbox.AddIconButtonRedrawStyling(checkbox_redraw_styling);
        }

        this.toolbar.AddHTML(checkbox.html);

        return checkbox;
    };

    this.AddHTML = function (html) {
        this.toolbar.AddHTML(html);
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
