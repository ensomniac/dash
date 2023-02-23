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
                (function (self, primitive_type) {
                    self.html.append(self.get_button(
                        "New Text Layer",
                        function () {
                            self.panel.AddLayer(primitive_type);
                        }
                    ).html);
                })(this, primitive_type);
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

    this.get_upload_button = function (primitive_type, label_text) {
        var button = (function (self) {
            return self.get_button(
                label_text + " (Upload)",
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    if ("error" in response) {
                        delete response["error"];
                    }

                    self.panel.AddLayer(primitive_type, response);
                }
            );
        })(this);

        button.SetFileUploader(
            this.editor.api,
            {"f": "upload_" + primitive_type}
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

                    Dash.Request(
                        self,
                        function (response) {
                            if (!Dash.Validate.Response(response)) {
                                return;
                            }

                            if ("error" in response) {
                                delete response["error"];
                            }

                            self.panel.ImportContext(response);
                        },
                        self.api,
                        {
                            "f": "get_data",
                            "obj_id": selected_option["id"]
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
