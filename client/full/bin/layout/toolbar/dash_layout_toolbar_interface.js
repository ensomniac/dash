/**@member DashLayoutToolbar */

function DashLayoutToolbarInterface () {
    this.RemoveStrokeSep = function () {
        this.stroke_sep.remove();

        this.height -= this.stroke_height;

        this.html.css({
            "height": this.height
        });
    };

    this.DisablePaddingRefactoring = function () {
        this.allow_padding_refactoring = false;
    };

    this.AddExpander = function () {
        var expander = $("<div></div>");

        expander.css({
            "flex-grow": 2,
        });

        this.html.append(expander);

        var obj_index = this.objects.length;
        this.objects.push({
            "html_elem": expander,
            "index": obj_index
        });

        this.refactor_item_padding();

        return expander;
    };

    this.GetHeight = function () {
        return this.height;
    };

    this.AddSpace = function (width) {
        var space = $("<div></div>");

        space.css({
            "width": width,
        });

        var obj_index = this.objects.length;
        this.objects.push({
            "html_elem": space,
            "index": obj_index
        });

        this.refactor_item_padding();

        this.html.append(space);
    };

    // TODO: These params are a mess
    this.AddIconButton = function (
        icon_name, callback, size_percent_num=null, data=null,
        container_size=null, size_mult=1.0, for_uploader=false
    ) {
        // When 'for_uploader' is true, 'callback' should be the
        // respective 'on_upload' function, and 'SetFileUploader'
        // should be called on this button after instantiated

        var obj_index = this.objects.length;

        callback = callback.bind(this.binder);

        var button = (function (self, obj_index, data) {
            return new Dash.Gui.IconButton(
                icon_name,
                for_uploader ? callback : function () {
                    self.on_button_clicked(obj_index, data);
                },
                self,
                self.color,
                {
                    "style": "toolbar",
                    "container_size": container_size || self.height,
                    "size_mult": size_mult
                }
            );
        })(this, obj_index, data);

        button.html.css({
            "margin-top": 0
        });

        this.html.append(button.html);

        this.objects.push({
            "html": button,
            "html_elem": button.html,
            "callback": callback,
            "index": obj_index
        });

        if (size_percent_num) {
            button.SetIconSize(size_percent_num);
        }

        this.refactor_item_padding();

        return button;
    };

    this.AddButton = function (label_text, callback, width=null, data=null, style="toolbar") {
        (function (self, obj_index, data) {
            var button = new Dash.Gui.Button(
                label_text,
                function () {
                    self.on_button_clicked(obj_index, data);
                },
                self,
                self.color,
                {"style": style}
            );

            if (width) {
                button.html.css({
                    "width": width
                });
            }

            self.html.append(button.html);

            self.objects.push({
                "html": button,
                "html_elem": button.html,
                "callback": callback.bind(self.binder),
                "index": obj_index
            });
        })(this, this.objects.length, data);

        this.refactor_item_padding();

        return this.objects.Last()["html"];
    };

    this.AddHTML = function (html) {
        this.html.append(html);

        var obj_index = this.objects.length;

        this.objects.push({
            "html_elem": html,
            "index": obj_index
        });

        this.refactor_item_padding();

        return html;
    };

    this.AddUploadButton = function (label_text, callback, bind, api, params) {
        var button = new Dash.Gui.Button(
            label_text,
            callback,
            bind,
            null,
            {"style": "toolbar"}
        );

        button.SetFileUploader(api, params);

        this.html.append(button.html);

        var obj_index = this.objects.length;
        this.objects.push({
            "html": button,
            "html_elem": button.html,
            "callback": callback,
            "index": obj_index
        });

        this.refactor_item_padding();

        return button;
    };

    this.AddDivider = function () {
        var divider_line = this.AddLabel("", false);

        divider_line.html.css({
            "padding-left": 0,
            "margin-left": Dash.Size.Padding * 0.7,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * 0.2,
        });

        var obj_index = this.objects.length;

        this.objects.push({
            "html": divider_line,
            "html_elem": divider_line.html,
            "index": obj_index
        });

        this.refactor_item_padding();

        return divider_line;
    };

    // Intended to be the first item, if you want a header-style label starting the toolbar
    this.AddLabel = function (text, add_end_border=true, color=null, include_start_border=true) {
        var header = new Dash.Gui.Header(text, color || this.color, include_start_border);

        if (!include_start_border) {
            header.label.css({
                "padding-left": 0
            });
        }

        header.html.css({
            "padding-left": include_start_border ? Dash.Size.Padding * 0.5 : 0,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding,
        });

        this.html.append(header.html);

        if (!add_end_border) {
            return header;
        }

        var end_border = $("<div></div>");

        end_border.css({
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-bottom": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding,
            "margin-left": Dash.Size.Padding * 0.5,
            "left": -Dash.Size.Padding * 0.25,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding * 0.5,
            "background": this.color.AccentGood,
        });

        this.html.append(end_border);

        header._end_border = end_border;

        this.objects.push({
            "html_elem": end_border,
            "callback": null,
            "index": this.objects.length
        });

        this.refactor_item_padding();

        return header;
    };

    this.AddText = function (text, color=null, centered=false) {  // should default to true
        var label = this.AddLabel(text, false, color);

        label.border.remove();

        label.html.css({
            "padding-left": 0,
            "margin-top": 0
        });

        label.label.css({
            "font-family": "sans_serif_normal",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "padding-left": 0
        });

        if (centered) {
            label.html.css({
                "margin-bottom": 0
            });

            label.label.css({
                "height": this.height,
                "line-height": this.height + "px"
            });
        }

        var obj_index = this.objects.length;

        this.objects.push({
            "html": label,
            "html_elem": label.html,
            "callback": null,
            "index": obj_index
        });

        this.refactor_item_padding();

        return label;
    };

    this.AddTransparentInput = function (
        placeholder_label, callback, options={}, additional_data={}, double_click_clear=true
    ) {
        var input = this.AddInput(placeholder_label, callback, options, additional_data, double_click_clear);

        input.EnableAutosave();

        var height = options["height"] || Dash.Size.ButtonHeight - Dash.Size.Padding;
        var width = options["width"] || Dash.Size.ColumnWidth;

        input.Flatten();

        input.html.css({
            "padding": 0,
            "margin": 0,
            "margin-top": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid rgba(0, 0, 0, 0.2)",
            "height": height,
            "width": width
        });

        input.input.css({
            "color": "rgb(20, 20, 20)",
            "height": height,
            "margin": 0,
            "padding": 0,
            "line-height": height + "px",
            "top": -Dash.Size.Padding * 0.5,
            "width": width,
            "text-align": options["center"] ? "center" : "left"
        });

        this.objects.push({
            "html": input,
            "html_elem": input.html,
            "callback": null,
            "index": this.objects.length
        });

        this.refactor_item_padding();

        return input;
    };

    this.AddInput = function (
        placeholder_label, callback, options={}, additional_data={}, double_click_clear=true
    ) {
        var obj_index = this.objects.length;
        var input = new Dash.Gui.Input(placeholder_label, this.color);

        input.html.css({
            "background": this.color.BackgroundRaised,
            "padding-left": Dash.Size.Padding * 0.5,
            "margin-top": Dash.Size.Padding * 0.5
        });

        input.input.css({
            "padding-left": 0,
            "color": this.color.Input.Text.Base
        });

        var obj = {
            "html": input,
            "html_elem": input.html,
            "callback": callback.bind(this.binder),
            "index": obj_index,
            "additional_data": additional_data
        };

        if (options["on_enter"]) {
            obj["on_enter"] = options["on_enter"].bind(this.binder);
        }

        if (options["on_autosave"]) {
            obj["on_autosave"] = options["on_autosave"].bind(this.binder);
        }

        this.objects.push(obj);

        (function (self, input, obj_index, obj) {
            input.SetOnChange(
                function () {
                    self.on_input_changed(obj_index);
                },
                self
            );

            if (obj["on_enter"]) {
                input.SetOnSubmit(
                    function () {
                        self.on_input_submitted(obj_index);
                    },
                    self
                );
            }

            if (obj["on_autosave"]) {
                input.EnableAutosave();

                input.SetOnAutosave(
                    function () {
                        self.on_input_submitted(obj_index);
                    },
                    self
                );
            }

            // This really shouldn't be default behavior, but leaving
            // the default as true to ensure nothing breaks
            if (double_click_clear) {
                input.EnableDoubleClickClear();
            }
        })(this, input, obj_index, obj);

        this.html.append(input.html);

        this.refactor_item_padding();

        return input;
    };

    this.AddCombo = function (
        label_text, combo_options, selected_id, callback,
        return_full_option=false, additional_data={}, extra_options={}
    ) {
        var obj_index = this.objects.length;

        callback = callback ? callback.bind(this.binder) : function (selected) {
            Dash.Log.Warn("No callback provided, selected:", selected);
        };

        var options = {
            "style": "row",
            "additional_data": additional_data,
            ...extra_options
        };

        var combo = new Dash.Gui.Combo (
            label_text,
            extra_options["multi_select"] ? function (selected_ids, additional_data) {
                callback(selected_ids, null, this, additional_data);
            } : function (selected_option, previous_selected_option, additional_data) {
                callback(
                    return_full_option ? selected_option : selected_option["id"],
                    return_full_option ? previous_selected_option : previous_selected_option["id"],
                    this,
                    additional_data
                );
            },
            this,
            combo_options,
            selected_id,
            this.color,
            options
        );

        this.html.append(combo.html);

        if (options["style"] === "row") {
            combo.html.css({
                "margin-top": Dash.Size.Padding * 0.5,
                "margin-right": Dash.Size.Padding * 0.5,
                "height": Dash.Size.RowHeight
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px"
            });
        }

        this.objects.push({
            "html": combo,
            "html_elem": combo.html,
            "callback": callback,
            "index": obj_index
        });

        this.refactor_item_padding();

        return this.objects[obj_index]["html"];
    };

    this.AddCheckbox = function (
        label_text="", default_state=false, callback=null, identifier="", hover_hint="Toggle",
        checkbox_redraw_styling=null, label_border=true, strict_identifier=false
    ) {
        var checkbox = new Dash.Gui.Checkbox(
            strict_identifier ? identifier : "dash_gui_toolbar_toggle_" + label_text + identifier,  // This is a mess
            default_state,
            this.color,
            hover_hint,
            this,
            callback ? callback.bind(this.binder) : callback,
            label_text,
            true,
            label_border
        );

        checkbox.html.css({
            "margin-top": Dash.Size.Padding * 0.5
        });

        if (checkbox_redraw_styling) {
            checkbox.AddIconButtonRedrawStyling(checkbox_redraw_styling);
        }

        this.AddHTML(checkbox.html);

        return checkbox;
    };

    this.AddDatePicker = function (
        label_text="", can_edit=false, on_submit_cb=null,
        on_autosave_cb=null, on_change_cb=null, min="", max=""
    ) {
        var picker = new Dash.Gui.DatePicker(
            label_text,
            this.binder,
            on_submit_cb,
            on_autosave_cb,
            on_change_cb,
            this.color,
            min,
            max
        );

        if (!can_edit) {
            picker.SetLocked(true);
        }

        picker.height = this.height - (Dash.Size.Padding * 0.1);

        picker.html.css({
            "height": picker.height,
            "line-height": picker.height + "px",
            "margin-left": this.objects.length ? Dash.Size.Padding : 0
        });

        this.objects.push({
            "html": picker,
            "html_elem": picker.html,
            "index": this.objects.length
        });

        this.AddHTML(picker.html);

        return picker;
    };
}
