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

        (function (self) {
            requestAnimationFrame(function () {
                setTimeout(
                    function () {
                        self.draw_types();

                        // Hiding this to simplify the interface, since it ended up never getting used
                        // self.add_import_combo();

                        requestAnimationFrame(function () {
                            self.content.FloatCombos(self);
                        });
                    },
                    100
                );
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

    this.get_button_container = function () {
        var button_container = $("<div></div>");

        button_container.css({
            "display": "flex",
            "gap": Dash.Size.Padding * 0.5,
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        this.html.append(button_container);

        return button_container;
    };

    this.draw_types = function () {
        var button_tally = 0;
        var button_container = this.get_button_container();

        for (var primitive_type of this.content.PrimitiveTypes) {
            if (button_tally >= 2) {
                button_tally = 0;
                button_container = this.get_button_container();
            }

            if (["text", "color"].includes(primitive_type)) {
                (function (self, primitive_type) {
                    button_container.append(self.get_button(
                        primitive_type.Title() + " Layer",
                        function (event, button) {
                            // Should never happen, but just in case
                            if (self.editor.preview_mode || self.editor.override_mode) {
                                return;
                            }

                            button.SetLoading(true);
                            button.Disable();

                            Dash.Request(
                                self,
                                function (response) {
                                    self.on_new_layer(response, button);
                                },
                                self.editor.api,
                                {
                                    "f": "add_" + primitive_type + "_layer",
                                    "c2d_id": self.editor.c2d_id
                                }
                            );
                        }
                    ).html);
                })(this, primitive_type);
            }

            else if (["image", "video"].includes(primitive_type)) {
                button_container.append(this.get_upload_button(primitive_type, primitive_type.Title() + " Layer").html);
            }

            else {
                Dash.Log.Warn("Warning: Unhandled primitive type in 'New' tab:", primitive_type);

                continue;
            }

            button_tally += 1;
        }

        button_tally = 0;
        button_container = null;

        for (var element_config of this.content.new_tab_custom_element_configs) {
            if (element_config["callback"]) {
                this.html.append(element_config["callback"]());
            }

            else {
                if (element_config["function_name"] === "get_button" && (button_tally >= 2 || !button_container)) {
                    button_container = this.get_button_container();
                }

                var element = this[element_config["function_name"]](...element_config["function_params"]);

                if (element_config["return_element_callback"]) {
                    element_config["return_element_callback"](element);
                }

                if (element_config["function_name"] === "get_button" && button_container) {
                    button_container.append(element.hasOwnProperty("html") ? element.html : element);

                    button_tally += 1;
                }

                else {
                    this.html.append(element.hasOwnProperty("html") ? element.html : element);
                }
            }
        }

        if (button_container) {
            button_container.css({
                "margin-bottom": Dash.Size.Padding
            });
        }
    };

    this.get_button = function (label_text, callback) {
        var button = new Dash.Gui.Button(label_text, callback, this, this.color, {"style": "toolbar"});

        button.html.css({
            "margin-top": 0,
            "margin-right": 0,
            "flex": 2
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
        var media = ["image", "video"].includes(primitive_type);
        var button = this.get_button(label_text + " (Upload)", this.on_new_layer);

        var params = {
            "f": "add_" + (media ? "media" : primitive_type) + "_layer",
            "c2d_id": this.editor.c2d_id
        };

        if (media) {
            params["media_type"] = primitive_type;
        }

        button.SetFileUploader(
            this.editor.api,
            params,
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
                    // Should never happen, but just in case
                    if (self.editor.preview_mode || self.editor.override_mode) {
                        return;
                    }

                    if (!selected_option["id"]) {
                        return;
                    }
                    
                    if (selected_option["id"] === self.editor.c2d_id) {
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
                            "c2d_id": self.editor.c2d_id,
                            "c2d_id_to_import": selected_option["id"]
                        }
                    );
                }
            );
        })(this);
    };

    this.add_combo = function (label_text, options_key, callback, wrap_cb=false) {
        var tool_row = (function (self) {
            return self.content.GetCombo(
                label_text,
                self.editor.ComboOptions ? (
                    self.editor.ComboOptions[options_key] ? self.editor.ComboOptions[options_key] : [{"id": "", "label_text": "ERROR"}]
                ) : [{"id": "", "label_text": "Loading..."}],
                wrap_cb ? function (selected_option, previous_option, toolbar) {
                    callback(self, selected_option, toolbar.objects[0].html);
                } : callback
            );
        })(this);

        this.floating_combos.push({
            "tool_row": tool_row
        });

        this.html.append(tool_row.html);

        return tool_row.elements.Last().combo;
    };

    this.setup_styles();
}
