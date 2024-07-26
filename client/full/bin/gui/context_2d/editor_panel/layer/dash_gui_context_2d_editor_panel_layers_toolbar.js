function DashGuiContext2DEditorPanelLayersToolbar (layers) {
    this.layers = layers;

    this.icon_size = 120;
    this.icon_buttons = {};
    this.icon_toggles = {};
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.editor = this.layers.editor;
    this.can_edit = this.layers.can_edit;

    // Skipping folders/grouping in V1 of this system, as it's nice to
    // have but not necessary and can come later when it's needed/desired

    this.setup_styles = function () {
        this.html.css({
            "display": "flex"
        });

        this.add_icon_buttons();
        this.add_icon_toggles();
    };

    this.UpdateIconStates = function () {
        var selected_layer = this.layers.GetSelectedLayer();
        var revert = !selected_layer;
        var parent_id = selected_layer ? selected_layer.GetParentID() : "";
        var type = selected_layer ? selected_layer.GetData()["type"] : null;

        if (this.icon_buttons["download"]) {
            if (type === "image" || type === "video") {
                this.icon_buttons["download"].Enable();
            }

            else {
                this.icon_buttons["download"].Disable();
            }
        }

        for (var key in this.icon_toggles) {
            if (revert) {
                this.icon_toggles[key].RevertToDefaultState(true, revert);

                continue;
            }

            if (!parent_id && key === "linked") {
                this.icon_toggles[key].Disable();
            }

            else {
                this.icon_toggles[key].Enable();
            }

            if (selected_layer.GetValue(key) !== this.icon_toggles[key].IsChecked()) {
                this.icon_toggles[key].Toggle(true);
            }
        }
    };

    this.ReEnableToggle = function (key) {
        if (!this.icon_toggles[key]) {
            return;
        }

        this.icon_toggles[key].SetLoading(false);
        this.icon_toggles[key].Enable();
    };

    this.add_icon_toggle = function (selected_layer, key, true_icon_name, false_icon_name, default_state=false) {
        this.icon_toggles[key] = (function (self) {
            return new Dash.Gui.Checkbox(
                "",
                selected_layer ? selected_layer.GetValue(key, default_state) : default_state,
                self.color,
                "Toggle " + key.Title(),
                self,
                function (checkbox) {
                    checkbox.SetLoading(true);
                    checkbox.Disable();

                    if (key === "hidden") {
                        self.layers.ToggleHidden(checkbox.IsChecked());
                    }

                    else if (key === "locked") {
                        self.layers.ToggleLocked(checkbox.IsChecked());
                    }

                    else if (key === "contained") {
                        self.layers.ToggleContained(checkbox.IsChecked());
                    }

                    else if (key === "linked") {
                        self.layers.ToggleLinked(checkbox.IsChecked());
                    }

                    else {
                        console.error("Unhandled key:", key);
                    }
                }
            );
        })(this);

        this.icon_toggles[key].html.css({
            "position": "relative",
            "right": -Dash.Size.Padding * 0.5,
            "top": -Dash.Size.Padding * 0.5,
            "padding": Dash.Size.Padding * 0.5,
            "border-radius": Dash.Size.BorderRadius
        });

        this.icon_toggles[key].SetIconSize(this.icon_size);
        this.icon_toggles[key].SetTrueIconName(true_icon_name);
        this.icon_toggles[key].SetFalseIconName(false_icon_name);
        this.icon_toggles[key].SetAbleToToggleCallback(this.layer_is_selected, this);

        if (this.can_edit) {
            this.add_on_hover(this.icon_toggles[key].html);
        }

        else {
            this.icon_toggles[key].SetReadOnly();

            this.icon_toggles[key].html.css({
                "opacity": 0.5
            });
        }

        this.html.append(this.icon_toggles[key].html);
    };

    this.layer_is_selected = function () {
        return this.layers.GetSelectedLayer() !== null;
    };

    this.add_icon_button = function (key, icon_name, callback) {
        this.icon_buttons[key] = new Dash.Gui.IconButton(icon_name, callback, this, this.color);

        this.icon_buttons[key].html.css({
            "position": "relative",
            "right": -Dash.Size.Padding * 0.5,
            "top": -Dash.Size.Padding * 0.5,
            "padding": Dash.Size.Padding * 0.5,
            "margin-top": Dash.Size.Padding * 0.1
        });

        this.icon_buttons[key].SetIconSize(this.icon_size);
        this.icon_buttons[key].SetHoverHint(key.Title());

        if (this.can_edit) {
            this.add_on_hover(this.icon_buttons[key].html);
        }

        else {
            this.icon_buttons[key].Disable();
        }

        this.html.append(this.icon_buttons[key].html);
    };

    this.add_on_hover = function (html) {
        (function (self) {
            html.on("mouseenter", function () {
                html.css({
                    "background": self.color.Pinstripe
                });
            });
        })(this);

        html.on("mouseleave", function () {
            html.css({
                "background": ""
            });
        });
    };

    this.add_icon_toggles = function () {
        var selected_layer = this.layers.GetSelectedLayer();

        this.add_icon_toggle(selected_layer, "hidden", "visible", "hidden");
        this.add_icon_toggle(selected_layer, "locked", "unlock_alt", "lock");

        // Hiding these because they're not ever used. "Contained" was never implemented
        // in the pre-comps/CPE, but was intended to indicate whether a layer was contained
        // to the bounds of the canvas once rendered. "Linked" applies to layers within
        // a context that was imported into another context, determining if their properties
        // are linked to their parent or the context to which they were imported.
        // this.add_icon_toggle(selected_layer, "contained", "box_open", "box", true);
        // this.add_icon_toggle(selected_layer, "linked", "unlink", "linked", true);
    };

    this.add_icon_buttons = function () {
        if (this.editor.override_mode) {
            return;
        }

        (function (self) {
            self.add_icon_button(
                "download",
                "download",
                function () {
                    self.icon_buttons["download"].Disable();
                    self.icon_buttons["download"].SetLoading(true);

                    self.layers.Download(function () {
                        self.icon_buttons["download"].SetLoading(false);
                        self.icon_buttons["download"].Enable();
                    });
                }
            );

            self.add_icon_button(
                "duplicate",
                "clone",
                function () {
                    self.layers.Duplicate();
                }
            );

            self.add_icon_button(
                "delete",
                "trash_alt",
                function () {
                    self.layers.Delete();
                }
            );

            self.add_icon_button(
                "move_up",
                "arrow_up_alt",
                function () {
                    self.layers.MoveUp();
                }
            );

            self.add_icon_button(
                "move_down",
                "arrow_down_alt",
                function () {
                    self.layers.MoveDown();
                }
            );

            self.add_icon_button(
                "links",
                "linked",
                function () {
                    self.editor.ShowLayerLinks();
                }
            );
        })(this);

        this.icon_buttons["download"].Disable();
    };

    this.setup_styles();
}
