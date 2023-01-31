function DashGuiContext2DEditorPanelContentNew (content) {
    this.content = content;

    this.import_combo = null;
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
        this.add_import_combo();  // TODO: Anyway to have this combo display at a higher level so that it doesn't get cut off at the panel's bottom edge?
    };

    this.InputInFocus = function () {
        // TODO
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
                this.html.append(this.get_button("New Text Layer", this.on_new_text).html);
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
                function (event, button) {
                    console.debug("TEST on upload", event, button);

                    // self.on_new_upload(primitive_type);  // TODO
                }
            );
        })(this);

        button.SetFileUploader(
            this.editor.api,
            {
                // TODO
            }
        );

        return button;
    };

    this.add_import_combo = function () {
        var tool_row = this.content.GetCombo(
            "Import Another Context",
            this.editor.ComboOptions ? (
                this.editor.ComboOptions["contexts"] ? this.editor.ComboOptions["contexts"] : [{"id": "", "label_text": "ERROR"}]
            ) : [{"id": "", "label_text": "Loading..."}],
            this.on_import.bind(this)
        );

        this.import_combo = tool_row.elements.Last().combo;

        this.html.append(tool_row.html);
    };

    this.on_import = function (selected_option) {
        console.debug("TEST on import", selected_option);  // TODO
    };

    this.on_new_upload = function (primitive_type) {
        console.debug("TEST on new", primitive_type);  // TODO
    };

    this.on_new_text = function () {
        console.debug("TEST on new text");  // TODO
    };

    this.setup_styles();
}
