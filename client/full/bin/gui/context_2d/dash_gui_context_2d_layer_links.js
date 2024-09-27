class DashGuiContext2DLayerLinks {
    constructor (editor, layer) {
        this.editor = editor;
        this.layer = layer;

        this.combo = null;
        this.checkboxes = {};
        this.linked_ids = [];
        this.linked_keys = [];
        this.linked_color = "";
        this.save_button = null;
        this.color_picker = null;
        this.delete_button = null;
        this.color = this.editor.color;
        this.layer_id = this.layer.GetID();
        this.link_id = this.layer.GetValue("link_id");
        this.opposite_color = this.editor.opposite_color;
        this.layers_box = this.editor.editor_panel.layers_box;

        this.html = Dash.Gui.GetHTMLAbsContext(
            "",
            this.color,
            {
                "padding": Dash.Size.Padding,
                "border-radius": "inherit"
            }
        );

        this.setup_styles();
    }

    setup_styles () {
        this.set_linked_attrs();
        this.add_layer_combo();
        this.add_key_checkboxes();
        this.add_bottom_toolbar();
    }

    set_linked_attrs () {
        if (!this.link_id) {
            return;
        }

        var link_data = this.editor.get_data()["layer_links"]?.[this.link_id] || {};

        for (var id of (link_data["layer_ids"] || [])) {
            if (id !== this.layer_id) {
                this.linked_ids.push(id);
            }
        }

        this.linked_keys = link_data["keys"] || [];
        this.linked_color = link_data["color"] || "";
    }

    add_layer_combo () {
        var header = new Dash.Gui.Header(
            (
                  (this.link_id ? "Layers linked with" : "Select layers to link with")
                + ' "'
                + this.layer.GetValue("display_name")
                + '":'
            ),
            this.color
        );

        header.ReplaceBorderWithIcon("linked");

        if (this.link_id) {
            header.html.append(this.get_badge());
        }

        this.html.append(header.html);

        this.combo = new Dash.Gui.Combo(
            "",
            () => {
                // pass
            },
            this,
            this.get_layer_options(),
            "",
            null,
            {"multi_select": true}
        );

        this.combo.html.css({
            "margin-left": Dash.Size.Padding * 2
        });

        if (this.linked_ids.length) {
            this.combo.SetMultiSelections(this.linked_ids);
        }

        this.html.append(this.combo.html);
    }

    add_key_checkboxes () {
        var header = new Dash.Gui.Header(
            (this.link_id ? "Linked fields/properties:" : "Select fields/properties to link:"),
            this.color
        );

        header.ReplaceBorderWithIcon("linked");

        header.html.css({
            "margin-top": Dash.Size.Padding * 2
        });

        if (this.link_id) {
            header.html.append(this.get_badge());
        }

        this.html.append(header.html);

        var gap = Dash.Size.Padding;
        var checkbox_padding = Dash.Size.Padding * 0.5;
        var row_height = Dash.Size.RowHeight + (checkbox_padding * 2);
        var min_row_width = Dash.Size.ColumnWidth + (checkbox_padding * 2);
        var container = $("<div></div>");

        container.css({
            "background": this.color.Pinstripe,
            "border-radius": Dash.Size.BorderRadius,
            "margin-left": Dash.Size.Padding * 2,
            "padding": Dash.Size.Padding,
            "border": "1px solid " + this.color.Pinstripe,
            "display": "grid",
            "grid-template-columns": "repeat(auto-fit, minmax(" + min_row_width + "px, 1fr))",
            "grid-auto-rows": row_height,
            "gap": gap,
            "height": (7 * (row_height + gap)) - gap
        });

        var keys = {
            // Core keys
            "anchor_norm_x": "X-Position",
            "anchor_norm_y": "Y-Position",
            "width_norm": "Scale",
            "rot_deg": "Rotation",

            // Referenced from DashGuiContext2DEditorPanelContentEdit.initialize_general_context
            "opacity": "Opacity",
            "blend_mode": "Blend Mode",
            "invert": "Invert/Mirror",
            "fade_direction": "Fade Direction",
            "fade_norm_start": "Fade Start",
            "fade_norm_end": "Fade End",
            "fade_global": "Global Fade"

            // Add any others here
            // (and then update the num of rows in the container's css height above and the modal's height)
        };

        for (var key in keys) {
            this.checkboxes[key] = this.get_checkbox(key, keys[key], checkbox_padding);

            container.append(this.checkboxes[key].html);
        }

        this.html.append(container);
    }

    add_bottom_toolbar () {
        var toolbar = new Dash.Layout.Toolbar(this);

        toolbar.html.css({
            "background": "none",
            "padding": 0,
            "margin-top": Dash.Size.Padding * 2
        });

        toolbar.RemoveStrokeSep();
        toolbar.DisablePaddingRefactoring();

        var label = toolbar.AddLabel("Quick-Reference Color:", false);

        label.ReplaceBorderWithIcon("color_palette");

        label.html.css({
            "margin-right": 0
        });

        this.color_picker = Dash.Gui.GetColorPicker(
            null,
            null,
            "",
            this.color,
            this.linked_color,
            false,
            null,
            toolbar.height
        );

        toolbar.AddHTML(this.color_picker.html);
        toolbar.AddExpander();

        if (this.link_id) {
            this.delete_button = toolbar.AddButton(
                "Delete",
                this.delete,
                null,
                null,
                "default"
            );

            this.delete_button.html.css({
                "margin-right": Dash.Size.Padding
            });

            this.delete_button.SetColor(
                this.color.StrokeLight,
                this.color.AccentBad
            );

            this.delete_button.FitContent();
        }

        this.save_button = toolbar.AddButton(
            "Save" + (this.link_id ? " Changes" : ""),
            this.save,
            null,
            null,
            "default"
        );

        this.save_button.FitContent();

        this.html.append(toolbar.html);
    }

    delete () {
        new Dash.Gui.Confirm(
            (
                "Are you sure you want to unlink\nall the layers " +
                "linked with this one?\n\nThis cannot be undone."
            ),
            () => {
                this.delete_button.SetLoading(true);

                this.disable();

                Dash.Request(
                    this,
                    (response) => {
                        if (!Dash.Validate.Response(response)) {
                            this.delete_button.SetLoading(false);

                            this.enable();

                            return;
                        }

                        this.on_response(response);
                    },
                    this.editor.api,
                    {
                        "f": "delete_layer_link",
                        "c2d_id": this.editor.c2d_id,
                        "link_id": this.link_id,
                        ...this.editor.extra_request_params
                    }
                );
            },
            null,
            this.opposite_color
        );
    }

    on_response (response) {
        this.editor.data = response;

        this.editor._on_data();
        this.editor.RedrawLayers(false, true);

        this.editor.editor_panel.layers_box.UpdateLinkColors();

        this.editor.editor_panel.SelectLayer(this.layer_id, false);

        this.editor.modal.Hide();
    }

    disable () {
        this.html.css({
            "opacity": 0.5,
            "pointer-events": "none",
            "user-select": "none"
        });
    }

    enable () {
        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
    }

    save () {
        var keys = [];

        for (var key in this.checkboxes) {
            if (this.checkboxes[key].IsChecked()) {
                keys.push(key);
            }
        }

        if (!keys.length) {
            new Dash.Gui.Alert("You haven't selected any fields/properties to link", this.opposite_color);

            return;
        }

        var layer_ids = this.combo.GetMultiSelections(true);

        if (!layer_ids.length) {
            new Dash.Gui.Alert("You haven't selected any layers to link", this.opposite_color);

            return;
        }

        if (!layer_ids.includes(this.layer_id)) {
            layer_ids.push(this.layer_id);
        }

        this.save_button.SetLoading(true);

        this.disable();

        var color = this.color_picker.input.val();

        if (!this.linked_color && color === Dash.Color.PickerDefault) {
            color = "";  // If color not chosen, a random color will be assigned on the backend
        }

        Dash.Request(
            this,
            (response) => {
                if (!Dash.Validate.Response(response)) {
                    this.save_button.SetLoading(false);

                    this.enable();

                    return;
                }

                this.on_response(response);
            },
            this.editor.api,
            {
                "f": "save_layer_link",
                "c2d_id": this.editor.c2d_id,
                "initiating_layer_id": this.layer_id,
                "link_id": this.link_id,
                "layer_ids": JSON.stringify(layer_ids),
                "keys": JSON.stringify(keys),
                "color": color,
                ...this.editor.extra_request_params
            }
        );
    }

    get_checkbox (key, label_text, padding) {
        var checkbox = new Dash.Gui.Checkbox(
            "",
            (
                   this.linked_keys.includes(key)
                || ["width_norm", "anchor_norm_x", "anchor_norm_y", "rot_deg"].includes(key)
            ),
            this.color,
            "Toggle",
            null,
            null,
            label_text,
            false
        );

        checkbox.html.css({
            "background": this.color.Pinstripe,
            "border-radius": Dash.Size.BorderRadius,
            "padding": padding
        });

        checkbox.AddHighlight();

        return checkbox;
    }

    get_layer_options () {
        var options = [];
        var layers = this.layers_box.get_data();

        for (var id of layers["order"]) {
            if (id === this.layer_id) {
                continue;
            }

            var layer_data = layers["data"][id];

            // Don't list any layers that are already linked under another link ID
            if (this.link_id && layer_data["link_id"] && layer_data["link_id"] !== this.link_id) {
                continue;
            }

            options.push({
                "id": id,
                "label_text": layer_data["display_name"]
            });
        }

        return options;
    }

    get_badge () {
        var badge = $("<div>LINKS EXIST</div>");

        badge.css({
            "color": this.color.StrokeDark,
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "background": this.linked_color,
            "border-radius": Dash.Size.BorderRadius,
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px",
            "padding-left": Dash.Size.Padding * 0.75,
            "padding-right": Dash.Size.Padding * 0.75
        });

        return badge;
    }
}
