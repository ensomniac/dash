function DashGuiContext2DEditorPanelLayersToolbar (layers) {
    this.layers = layers;

    this.icon_size = 120;
    this.icon_buttons = {};
    this.icon_toggles = {};
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.can_edit = this.layers.can_edit;

    // Skipping folders/grouping in V1 of this system, as it's nice to
    // have but not necessary and can come later when it's needed/desired

    this.setup_styles = function () {
        this.html.css({
            "display": "flex"
        });

        this.add_icons();
    };

    this.add_icon_toggle = function (data, key, true_icon_name, false_icon_name, default_state=false) {
        this.icon_toggles[key] = (function (self) {
            return new Dash.Gui.Checkbox(
                "",
                key in data ? data[key] : default_state,
                self.color,
                "Toggle " + key.Title(),
                self,
                function (checkbox) {
                    if (key === "hidden") {
                        self.layers.ToggleHidden(checkbox.IsChecked());
                    }

                    else if (key === "locked") {
                        self.layers.ToggleLocked(checkbox.IsChecked());
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

        if (this.can_edit) {
            this.add_on_hover(this.icon_toggles[key].html);
        }

        else {
            this.icon_toggles[key].SetReadOnly();
        }

        this.html.append(this.icon_toggles[key].html);
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

    this.add_icons = function () {
        (function (self) {
            self.add_icon_button(
                "new_layer",
                "add_layer",
                function () {
                    self.layers.AddLayer();
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
        })(this);

        var selected_layer_data = this.layers.get_data()[this.layers.GetSelectedIndex()] || {};

        this.add_icon_toggle(selected_layer_data, "hidden", "visible", "hidden");
        this.add_icon_toggle(selected_layer_data, "locked", "unlock_alt", "lock");
    };

    this.setup_styles();
}
