function DashGuiContext2DEditorPanelContentPreComps (content) {
    this.content = content;

    this.rows = [];
    this.html = $("<div></div>");
    this.color = this.content.color;
    this.panel = this.content.panel;
    this.editor = this.panel.editor;
    this.can_edit = this.content.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "overflow-x": "hidden"
        });

        this.redraw();
    };

    this.InputInFocus = function () {
        for (var row of this.rows) {
            if (row["input"].InFocus()) {
                return true;
            }
        }

        return false;
    };

    this.redraw = function () {
        this.html.empty();

        this.rows = [];

        for (var letter in this.get_data()) {
            this.draw_row(letter);
        }
    };

    this.draw_row = function (letter) {
        var row = {
            "container": $("<div></div>"),
            "toolbar": new Dash.Layout.Toolbar(this)
        };

        var data = this.get_data()[letter];

        row["container"].append(row["toolbar"].html);

        row["toolbar"].DisablePaddingRefactoring();
        row["toolbar"].RemoveStrokeSep();

        row["toolbar"].html.css({
            "background": "",
            "padding": 0,
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        var on_input_changed = (function (self) {
            var checkbox = row["toolbar"].AddCheckbox(
                "",
                false,
                function (checkbox) {
                    self.on_expand_toggled(letter, checkbox.IsChecked(), row);
                },
                "",
                "Expand/Collapse",
                null,
                false,
                true
            );

            checkbox.SetTrueIconName("caret_down");
            checkbox.SetFalseIconName("caret_right");

            return function (value) {
                self.set_data("display_name", value, letter);
            };
        })(this);

        row["input"] = row["toolbar"].AddInput(
            data["display_name"],
            on_input_changed,
            {
                "on_enter": on_input_changed,
                "on_autosave": on_input_changed
            },
            {},
            false
        );

        if (data["display_name"]) {
            row["input"].SetText(data["display_name"]);
        }

        row["input"].html.css({
            "flex": 2,
            "box-shadow": "none",
            "border": "1px solid " + this.color.Stroke
        });

        // This is broken by default somehow, doing this workaround for now
        row["input"].input.css({
            "color": this.color.Text
        });

        row["color_picker"] = (function (self) {
            return Dash.Gui.GetColorPicker(
                self,
                function (color_val) {
                    if (!color_val) {
                        return;
                    }

                    self.set_data("color", color_val, letter);
                },
                "",
                self.color,
                data["color"] || "#000000",
                true,
                function () {
                    self.set_data("color", "", letter);
                }
            );
        })(this);


        row["toolbar"].AddHTML(row["color_picker"].html);

        row["download_button"] = (function (self) {
            return row["toolbar"].AddIconButton(
                "download",
                function () {
                    self.download(letter);
                },
                null,
                null,
                Dash.Size.ButtonHeight,
                0.65
            );
        })(this);

        this.rows.push(row);

        this.html.append(row["container"]);
    };

    this.on_expand_toggled = function (letter, expanded, row) {
        if (!expanded) {
            if (row["expanded_content"]) {
                row["expanded_content"].hide();
            }

            return;
        }

        if (!row["expanded_content"]) {
            row["expanded_content"] = $("<div></div>");

            row["expanded_content"].css({
                "margin-left": Dash.Size.Padding * 2,
                "margin-right": Dash.Size.Padding,
                "margin-bottom": Dash.Size.Padding,
                "margin-top": -Dash.Size.Padding * 0.5,
                "padding": Dash.Size.Padding,
                "border-left": "1px solid " + this.color.PinstripeDark,
                "border-right": "1px solid " + this.color.PinstripeDark,
                "border-bottom": "1px solid " + this.color.PinstripeDark,
                "border-bottom-left-radius": Dash.Size.BorderRadius,
                "border-bottom-right-radius": Dash.Size.BorderRadius
            });

            row["container"].append(row["expanded_content"]);

            this.add_slider_to_expanded_content(letter, row, "parallax", 0.5);
        }

        row["expanded_content"].show();
    };

    this.add_slider_to_expanded_content = function (
        letter, row, data_key, default_value=null, start_range=0, end_range=1.0, label_text="", reset_value=null
    ) {
        var value = this.get_data()[letter][data_key];

        default_value = default_value !== null ? default_value : start_range;

        (function (self) {
            var slider = new Dash.Gui.Slider(
                self.color,
                (label_text || data_key.Title()) + ":",
                function (value) {
                    self.set_data(data_key, value, letter);
                },
                start_range,
                end_range,
                (value || value === 0) ? value : default_value,
                Dash.Size.ColumnWidth
            );

            row["expanded_content"].append(slider.html);

            requestAnimationFrame(function () {
                self.style_slider(
                    slider,
                    reset_value !== null ? reset_value : default_value
                );
            });
        })(this);
    };

    // Copied from DashGuiContext2DEditorPanelContentEdit
    this.style_slider = function (slider, default_value) {
        slider.FireCallbackOnUpInsteadOfMove();
        slider.SetMaxValueLabelLength(5);
        slider.StyleForPropertyBox(0);
        slider.AddResetToDefaultButton(default_value, "Reset");

        if (!this.can_edit) {
            slider.Disable();
        }

        // Ideally, we use this instead of the below slop, but it's not fully worked out yet
        // slider.FlexInsteadOfAbsolute();

        slider.label.css({
            "padding-left": 0
        });

        slider.reset_button.label.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5
        });

        slider.slider.css({
            "left": parseInt(slider.slider.css("left")) - (Dash.Size.Padding * 0.5)
        });

        slider.value_label.html.css({
            "left": parseInt(slider.value_label.html.css("left")) - (Dash.Size.Padding * 1.5)
        });

        slider.reset_button.html.css({
            "left": parseInt(slider.reset_button.html.css("left")) - (Dash.Size.Padding * 2.5)
        });

        slider.html.css({
            "margin-left": 0,
            "background": ""
        });
    };

    this.download = function (letter) {
        this.rows[letter]["download_button"].SetLoading(true);
        this.rows[letter]["download_button"].Disable();

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response) || !response["url"]) {
                        if (!response["url"]) {
                            alert("No rendered Pre-Comp found");
                        }

                        self.rows[letter]["download_button"].SetLoading(false);
                        self.rows[letter]["download_button"].Enable();

                        return;
                    }

                    Dash.Gui.OpenFileURLDownloadDialog(
                        response["url"],
                        "",
                        function () {
                            self.rows[letter]["download_button"].SetLoading(false);
                            self.rows[letter]["download_button"].Enable();
                        }
                    );
                },
                self.editor.api,
                {
                    "f": "get_precomp",
                    "c2d_id": self.editor.c2d_id,
                    "letter": letter
                }
            );
        })(this);
    };

    this.get_data = function () {
        return this.editor.get_data()["precomps"];
    };

    this.set_data = function (key, value, letter) {
        if (this.get_data()[letter][key] === value) {
            return;
        }

        (function (self) {
            Dash.Request(
                this,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.editor.data = response;

                    if (key === "color" && !value) {
                        self.rows[letter]["color_picker"].input.val(self.get_data()[letter]["color"]);
                    }

                    self.panel.layers_box.UpdatePreCompColors();
                },
                self.editor.api,
                {
                    "f": "set_precomp_property",
                    "c2d_id": self.editor.c2d_id,
                    "key": key,
                    "value": value,
                    "letter": letter
                }
            );
        })(this);
    };

    this.setup_styles();
}
