/**@member DashLayoutToolbar */

function DashLayoutToolbarInterface () {
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

    this.AddIconButton = function (icon_name, callback, width=null, data=null) {
        var obj_index = this.objects.length;
        var button = null;

        (function (self, obj_index, data) {
            button = new Dash.Gui.IconButton(
                icon_name,
                function () {
                    self.on_button_clicked(obj_index, data);
                },
                self,
                null,
                {"style": "toolbar"}
            );

            self.html.append(button.html);

            self.objects.push({
                "html": button,
                "html_elem": button.html,
                "callback": callback.bind(self.binder),
                "index": obj_index
            });
        })(this, obj_index, data);

        if (width) {
            button.SetIconSize(width);
        }

        this.refactor_item_padding();

        return button;
    };

    this.AddButton = function (label_text, callback, width=null, data=null) {
        var obj_index = this.objects.length;
        var button = null;

        (function (self, obj_index, data) {
            button = new Dash.Gui.Button(
                label_text,
                function () {
                    self.on_button_clicked(obj_index, data);
                },
                self,
                null,
                {"style": "toolbar"}
            );

            self.html.append(button.html);

            self.objects.push({
                "html": button,
                "html_elem": button.html,
                "callback": callback.bind(self.binder),
                "index": obj_index
            });
        })(this, obj_index, data);

        this.refactor_item_padding();

        return button;
    };

    this.AddHTML = function (html) {
        this.html.append(html);

        var obj_index = this.objects.length;
        this.objects.push({
            "html_elem": html,
            "index": obj_index
        });

        this.refactor_item_padding();
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
    this.AddLabel = function (text, add_end_border=true, color=null) {
        var header = new Dash.Gui.Header(text, color);

        header.html.css({
            "padding-left": Dash.Size.Padding * 0.5,
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
            "left": -Dash.Size.Padding*0.25,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding*0.5,
            "background": this.color.AccentGood,
        });

        this.html.append(end_border);

        var obj_index = this.objects.length;
        this.objects.push({
            "html_elem": end_border,
            "callback": null,
            "index": obj_index
        });

        this.refactor_item_padding();

        return header;
    };

    this.AddText = function (text, color=null) {
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

        this.html.append(label.html);

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

    this.AddTransparentInput = function (placeholder_label, callback, options={}, additional_data={}) {
        var input = this.AddInput(placeholder_label, callback, options, additional_data);

        input.EnableAutosave();

        var height = options["height"] || Dash.Size.ButtonHeight - Dash.Size.Padding;
        var width = options["width"] || Dash.Size.ColumnWidth;
        var text_align = "left";

        if (options["center"]) {
            text_align = "center";
        }

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
            "text-align": text_align
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

    this.AddInput = function (placeholder_label, callback, options={}, additional_data={}) {
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
            obj["on_enter_callback"] = options["on_enter"].bind(this.binder);
        }

        this.objects.push(obj);

        (function (self, input, obj_index, obj) {
            input.SetOnChange(
                function () {
                    self.on_input_changed(obj_index);
                },
                self
            );

            if (obj["on_enter_callback"]) {
                input.SetOnSubmit(
                    function () {
                        self.on_input_submitted(obj_index);
                    },
                    self
                );
            }

            input.input.on("dblclick", function () {
                input.SetText("");

                self.on_input_changed(obj_index);
            });
        })(this, input, obj_index, obj);

        this.html.append(input.html);

        this.refactor_item_padding();

        return input;
    };

    this.AddCombo = function (label_text, combo_options, selected_id, callback, return_full_option=false, additional_data={}) {
        var obj_index = this.objects.length;

        if (callback) {
            callback = callback.bind(this.binder);
        }

        (function (self, selected_id, combo_options, callback, return_full_option, additional_data) {
            var _callback = function (selected_option, previous_selected_option, additional_data) {
                self.on_combo_updated(
                    callback,
                    return_full_option ? selected_option : selected_option["id"],
                    return_full_option ? previous_selected_option : previous_selected_option["id"],
                    additional_data
                );
            };

            var combo = new Dash.Gui.Combo (
                selected_id,      // Label
                _callback,        // Callback
                self,             // Binder
                combo_options,    // Option List
                selected_id,      // Selected
                self.color,             // Color set
                {"style": "row", "additional_data": additional_data}
            );

            self.html.append(combo.html);

            combo.html.css({
                "margin-top": Dash.Size.Padding*0.5,
                "margin-right": Dash.Size.Padding*0.5,
                "height": Dash.Size.RowHeight,
            });

            combo.label.css({
                "height": Dash.Size.RowHeight,
                "line-height": Dash.Size.RowHeight + "px",
            });

            self.objects.push({
                "html": combo,
                "html_elem": combo.html,
                "callback": callback.bind(self.binder),
                "index": obj_index
            });
        })(this, selected_id, combo_options, callback, return_full_option, additional_data);

        var obj = this.objects[obj_index];

        this.refactor_item_padding();

        return obj["html"];
    };
}
