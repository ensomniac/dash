function DashGuiContext2DEditorPanelContentNew (content) {
    this.content = content;

    this.import_combo = null;
    this.floating_combos = [];
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

        this.draw_types();
        this.add_import_combo();

        (function (self) {
            requestAnimationFrame(function () {
                self.content.FloatCombos(self);
            });
        })(this);
    };

    // Called by DashGuiContext2D when combo options are received
    this.UpdateImportComboOptions = function () {
        if (!this.import_combo) {
            return;
        }

        this.import_combo.Update(
            this.editor.ComboOptions["contexts"] ? this.editor.ComboOptions["contexts"] : [{"id": "", "label_text": "ERROR"}],
            "",
            true
        );
    };

    this.draw_types = function () {
        for (var primitive_type of this.content.PrimitiveTypes) {
            if (primitive_type === "text") {
                (function (self) {
                    self.html.append(self.get_button(
                        "New Text Layer",
                        function (event, button) {
                            button.SetLoading(true);
                            button.Disable();

                            Dash.Request(
                                self,
                                function (response) {
                                    self.on_new_layer(response, button);
                                },
                                self.editor.api,
                                {
                                    "f": "add_text_layer",
                                    "obj_id": self.editor.obj_id
                                }
                            );
                        }
                    ).html);
                })(this);
            }

            else if (primitive_type === "image") {
                this.html.append(this.get_upload_button(primitive_type, "New Image Layer").html);
            }

            else {
                console.warn("Warning: Unhandled primitive type in 'New' tab:", primitive_type);
            }
        }
    };

    this.get_button = function (label_text, callback) {
        var button = new Dash.Gui.Button(label_text, callback, this, this.color, {"style": "toolbar"});

        button.html.css({
            "margin-top": 0,
            "margin-right": 0,
            "margin-bottom": Dash.Size.Padding
        });

        if (!this.can_edit) {
            button.Disable();
        }

        return button;
    };

    this.on_new_layer = function (response, element) {
        if (!Dash.Validate.Response(response)) {
            element.SetLoading(false);
            element.Enable();

            return;
        }

        this.panel.OnNewLayer(response);

        element.SetLoading(false);
        element.Enable();
    };

    this.get_upload_button = function (primitive_type, label_text) {
        var button = this.get_button(label_text + " (Upload)", this.on_new_layer);

        button.SetFileUploader(
            this.editor.api,
            {
                "f": "add_" + primitive_type + "_layer",
                "obj_id": this.editor.obj_id
            },
            function () {
                button.SetLoading(true);
                button.Disable();
            },
            {},
            true
        );

        return button;
    };

    this.add_import_combo = function () {
        this.import_combo = (function (self) {
            return self.add_combo(
                "Import Another Context",
                "contexts",
                function (selected_option) {
                    if (!selected_option["id"]) {
                        return;
                    }
                    
                    if (selected_option["id"] === self.editor.obj_id) {
                        alert("Importing a context into itself is not yet supported.");

                        return;
                    }

                    self.import_combo.SetLoading(true, true);
                    self.import_combo.Disable();

                    Dash.Request(
                        self,
                        function (response) {
                            self.on_new_layer(response, self.import_combo);
                        },
                        self.editor.api,
                        {
                            "f": "import_another_context",
                            "obj_id": self.editor.obj_id,
                            "obj_id_to_import": selected_option["id"]
                        }
                    );
                }
            );
        })(this);
    };

    this.add_combo = function (label_text, options_key, callback) {
        var tool_row = this.content.GetCombo(
            label_text,
            this.editor.ComboOptions ? (
                this.editor.ComboOptions["contexts"] ? this.editor.ComboOptions["contexts"] : [{"id": "", "label_text": "ERROR"}]
            ) : [{"id": "", "label_text": "Loading..."}],
            callback
        );

        this.floating_combos.push({
            "tool_row": tool_row,
            "extra_top": Dash.Size.RowHeight
        });

        this.html.append(tool_row.html);

        return tool_row.elements.Last().combo;
    };

    this.setup_styles();
}
