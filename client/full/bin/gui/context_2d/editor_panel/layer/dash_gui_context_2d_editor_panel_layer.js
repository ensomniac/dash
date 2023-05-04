function DashGuiContext2DEditorPanelLayer (layers, id, parent_id="") {
    this.layers = layers;
    this.id = id;
    this.parent_id = parent_id;

    this.input = null;
    this.selected = false;
    this.hidden_icon = null;
    this.locked_icon = null;
    this.linked_icon = null;
    this.icon_size_mult = 0.8;
    this.contained_icon = null;
    this.color_border_size = 3;
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.panel = this.layers.panel;
    this.editor = this.layers.editor;
    this.icon_area = $("<div></div>");
    this.can_edit = this.layers.can_edit;
    this.icon_color = this.color.StrokeLight;
    this.child_left_margin = Dash.Size.Padding;
    this.preview_mode = this.layers.preview_mode;

    this.setup_styles = function () {
        if (this.preview_mode) {
            return;
        }

        this.html.css({
            "padding": Dash.Size.Padding - this.color_border_size,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "display": "flex",
            "cursor": "pointer",
            "box-sizing": "border-box"
        });

        this.UpdateTintColor();
        this.add_type_icon();
        this.add_input();

        this.html.append(Dash.Gui.GetFlexSpacer());

        this.add_icon_area();
        this.RefreshConnections();

        var hidden = this.get_value("hidden");
        var locked = this.get_value("locked");
        var linked = this.get_value("linked");
        var contained = this.get_value("contained");

        if (hidden) {
            this.ToggleHidden(hidden);
        }

        if (locked) {
            this.ToggleLocked(locked);
        }

        if (!linked) {
            this.ToggleLinked(linked);
        }

        if (!contained) {
            this.ToggleContained(contained);
        }
    };

    this.GetID = function () {
        return this.id;
    };

    this.GetParentID = function () {
        return this.parent_id;
    };

    this.IsSelected = function () {
        return this.selected;
    };

    this.GetIndex = function () {
        return this.layers.get_data()["order"].indexOf(this.id);
    };

    this.GetData = function () {
        return this.get_data();
    };

    this.GetValue = function (key, default_value=null) {
        return this.get_value(key, default_value);
    };

    this.GetParentData = function () {
        return this.get_parent_data();
    };

    this.GetParentIndex = function () {
        if (!this.parent_id) {
            return -1;
        }

        return this.layers.layers[this.parent_id].GetIndex();
    };

    this.GetParentLayerOrder = function () {
        if (!this.parent_id) {
            return [];
        }

        var imported_context = this.get_parent_data()["imported_context"];
        var default_order = imported_context["layers"]["order"];

        return (!this.get_value("linked") ? default_order : (imported_context["context_overrides"]["layer_order"] || default_order));
    };

    this.GetChildrenLayerOrder = function () {
        var data = this.get_data();

        if (data["type"] !== "context") {
            return [];
        }

        var default_order = data["imported_context"]["layers"]["order"];

        return (!this.get_value("linked") ? default_order : (data["imported_context"]["context_overrides"]["layer_order"] || default_order));
    };

    this.SetData = function (key, value, callback=null) {
        return this.set_data(key, value, callback);
    };

    this.InputInFocus = function () {
        return this.input.InFocus();
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        var primitive = this.editor.canvas.primitives[self.id];

        if (primitive && primitive.drag_active) {
            return;
        }

        this.selected = false;

        this.html.css({
            "background": "",
            "cursor": "pointer"
        });
    };

    this.Select = function (from_canvas=false) {
        if (this.selected) {
            return;
        }

        this.layers.DeselectLayers();

        this.selected = true;

        this.html.css({
            "background": this.color.PinstripeDark,
            "cursor": "auto"
        });

        if (!from_canvas) {
            this.editor.SetCanvasActivePrimitive(this.id);
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Selected layer: " + this.get_value("display_name"));

            this.layers.UpdateToolbarIconStates();

            this.panel.UpdatePropertyBoxToolSlider("", this);
        }

        this.panel.SwitchContentToEditTab();
    };

    this.ToggleHidden = function (hidden) {
        if (hidden) {
            this.hidden_icon.html.show();
        }

        else {
            this.hidden_icon.html.hide();
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Layer " + (hidden ? "hidden" : "shown") + ": " + this.get_value("display_name"));

            this.set_data("hidden", hidden);
        }
    };

    this.ToggleLocked = function (locked) {
        if (locked) {
            this.locked_icon.html.show();
        }

        else {
            this.locked_icon.html.hide();
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Layer " + (locked ? "locked" : "unlocked") + ": " + this.get_value("display_name"));

            this.set_data("locked", locked);
        }
    };

    this.ToggleLinked = function (linked) {
        if (linked) {
            this.linked_icon.html.hide();
        }

        else {
            this.linked_icon.html.show();
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Layer " + (linked ? "linked" : "unlinked") + ": " + this.get_value("display_name"));

            (function (self) {
                self.set_data(
                    "linked",
                    linked,
                    function () {
                        self.ToggleHidden(self.get_value("hidden"));
                        self.ToggleLocked(self.get_value("locked"));
                        self.UpdateLabel();
                    }
                );
            })(this);
        }
    };

    this.ToggleContained = function (contained) {
        if (contained) {
            this.contained_icon.html.hide();
        }

        else {
            this.contained_icon.html.show();
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog(
                "Layer " + (
                    contained ? "contained" : "no longer contained"
                ) + " (within canvas): " + this.get_value("display_name")
            );

            (function (self) {
                self.set_data("contained", contained);
            })(this);
        }
    };

    this.RefreshConnections = function () {
        (function (self) {
            if (self.can_edit) {
                self.html.on("click", function (e) {
                    self.Select();

                    e.stopPropagation();
                });
            }

            self.html.on("mouseenter", function () {
                var primitive = self.editor.canvas.primitives[self.id];

                if (!primitive.selected) {
                    var css = {"border": "1px solid " + primitive.hover_color};

                    if (primitive.hasOwnProperty("update_filter")) {
                        primitive.update_filter((primitive.get_value("brightness") || 1.0) + 0.1);
                    }

                    else {
                        css["filter"] = "brightness(" + ((self.get_value("brightness") || 1.0) + 0.1) + ")";
                    }

                    primitive.html.css(css);
                }

                if (!self.selected) {
                    self.html.css({
                        "background": self.color.Pinstripe
                    });
                }
            });

            self.html.on("mouseleave", function () {
                var primitive = self.editor.canvas.primitives[self.id];

                if (!primitive.selected) {
                    primitive.html.css({
                        "border": "1px solid rgba(0, 0, 0, 0)"
                    });

                    var css = {"border": "1px solid rgba(0, 0, 0, 0)"};

                    if (primitive.hasOwnProperty("update_filter")) {
                        primitive.update_filter(primitive.get_value("brightness"));
                    }

                    else {
                        css["filter"] = "brightness(" + (self.get_value("brightness") || 1.0) + ")";
                    }

                    primitive.html.css(css);
                }

                if (!self.selected) {
                    self.html.css({
                        "background": "none"
                    });
                }
            });
        })(this);
    };

    this.UpdateLabel = function () {
        this.input.SetText(this.get_value("display_name"));
    };

    this.UpdateTintColor = function () {
        var tint_color = this.get_value("tint_color");

        this.html.css({
            "border-left": this.color_border_size + "px solid " + (tint_color || "rgba(0, 0, 0, 0)")
        });
    };

    this.add_type_icon = function () {
        var type_icon = this.get_icon(this.get_type_icon_name());
        var css = {"margin-right": Dash.Size.Padding * 0.5};

        if (this.parent_id) {
            css["margin-left"] = this.child_left_margin;
            css["border-left"] = "1px solid " + this.color.PinstripeDark;

            type_icon.icon_html.css({
                "padding-left": Dash.Size.Padding * 0.3
            });
        }

        type_icon.html.css(css);

        this.html.append(type_icon.html);
    };

    this.add_input = function () {
        var display_name = this.get_value("display_name");

        this.input = new Dash.Gui.Input(display_name, this.color);

        this.input.html.css({
            // Allow some extra space to easily select the row, as well as showing icon toggles when applicable
            "width": (Dash.Size.ColumnWidth * 1.25) - (this.parent_id ? this.child_left_margin : 0),  // Match the ends
            "box-shadow": "none",
            "border": "1px solid " + this.color.PinstripeDark
        });

        this.input.input.css({
            "width": "calc(100% - " + Dash.Size.Padding + "px)"
        });

        if (display_name) {
            this.input.SetText(display_name);
        }

        if (this.can_edit) {
            this.input.SetOnSubmit(this.on_input_submit, this);
            this.input.SetOnAutosave(this.on_input_submit, this);
        }

        else {
            this.input.SetLocked(true);
        }

        (function (self) {
            self.input.html.attr(
                "title",
                function () {
                    return self.get_value("display_name") || "";
                }
            );
        })(this);

        this.html.append(this.input.html);
    };

    this.add_icon_area = function () {
        this.icon_area.css({
            "display": "flex"
        });

        this.hidden_icon = this.get_icon("hidden");
        this.locked_icon = this.get_icon("lock");
        this.contained_icon = this.get_icon("box_open");
        this.linked_icon = this.get_icon("unlink");

        this.hidden_icon.html.css({
            "margin-left": Dash.Size.Padding
        });

        this.locked_icon.html.css({
            "margin-left": Dash.Size.Padding
        });

        this.contained_icon.html.css({
            "margin-left": Dash.Size.Padding
        });

        this.linked_icon.html.css({
            "margin-left": Dash.Size.Padding
        });

        if (!this.get_value("hidden")) {
            this.hidden_icon.html.hide();
        }

        if (!this.get_value("locked")) {
            this.locked_icon.html.hide();
        }

        if (this.get_value("linked")) {
            this.linked_icon.html.hide();
        }

        if (this.get_value("contained")) {
            this.contained_icon.html.hide();
        }

        this.icon_area.append(this.hidden_icon.html);
        this.icon_area.append(this.locked_icon.html);
        this.icon_area.append(this.contained_icon.html);
        this.icon_area.append(this.linked_icon.html);

        this.html.append(this.icon_area);
    };

    this.get_icon = function (icon_name) {
        var icon = new Dash.Gui.Icon(this.color, icon_name, Dash.Size.RowHeight, this.icon_size_mult, this.icon_color);

        icon.html.css({
            "margin-top": Dash.Size.Padding * 0.1,
            "cursor": "default"
        });

        return icon;
    };

    this.get_type_icon_name = function () {
        var type = this.get_data()["type"];

        var icon_name = (
              type === "text" ? "font"
            : type === "image" ? type
            : type === "video" ? "film"
            : type === "context" ? "project_diagram"
            : "unknown"
        );

        if (icon_name === "unknown") {
            console.warn("Unhandled layer type, couldn't get layer icon:", type);
        }

        return icon_name;
    };

    this.on_input_submit = function () {
        this.set_data("display_name", this.input.Text().trim());
    };

    this.set_data = function (key, value, callback=null) {
        this.layers.set_layer_property(key, value, this.id, this.parent_id, callback);
    };

    this.get_data = function () {
        return this.layers.get_data(this.parent_id)["data"][this.id];
    };

    this.get_parent_data = function () {
        if (!this.parent_id) {
            return {};
        }

        return this.layers.get_data()["data"][this.parent_id];
    };

    this.get_value = function (key, default_value=null) {
        if (default_value === null) {
            default_value = (
                  key === "display_name" ? ""
                : key === "hidden" || key === "locked" ? false
                : key === "linked" ? true
                : default_value
            );
        }

        var data = this.get_data();
        var bool = typeof default_value === "boolean";
        var value = bool ? (key in data ? data[key] : default_value) : (data[key] || default_value);

        if (!this.parent_id) {
            return value;
        }

        if (key !== "linked" && !this.get_value("linked")) {
            return value;
        }

        var imported_context = this.get_parent_data()["imported_context"];
        var layer_overrides = imported_context["layer_overrides"][id] || {};

        return bool ? (key in layer_overrides ? layer_overrides[key] : value) : (layer_overrides[key] || value);
    };

    this.setup_styles();
}
