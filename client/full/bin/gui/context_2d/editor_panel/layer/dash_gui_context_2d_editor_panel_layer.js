function DashGuiContext2DEditorPanelLayer (layers, id, parent_id="") {
    this.layers = layers;
    this.id = id;
    this.parent_id = parent_id;

    this.input = null;
    this.type_icon = null;
    this.selected = false;
    this.hidden_icon = null;
    this.locked_icon = null;
    this.linked_icon = null;
    this.icon_size_mult = 0.8;
    this.overrides_icon = null;
    this.contained_icon = null;
    this.color_border_size = 3;
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.panel = this.layers.panel;
    this.editor = this.layers.editor;
    this.icon_area = $("<div></div>");
    this.can_edit = this.editor.can_edit;
    this.icon_color = this.color.StrokeLight;
    this.child_left_margin = Dash.Size.Padding;
    this.preview_mode = this.editor.preview_mode;
    this.override_mode = this.editor.override_mode;

    this.setup_styles = function () {
        if (this.preview_mode) {
            return;
        }

        this.html.css({
            "padding": Dash.Size.Padding - (this.color_border_size * 2),
            "padding-left": 0,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "display": "flex",
            "cursor": "pointer",
            "box-sizing": "border-box",
            "opacity": this.can_edit ? 1 : 0.5
        });

        this.UpdateTintColor();
        this.UpdatePreCompColor();
        this.add_type_icon();
        this.add_input();
        this.UpdateLinkColor();
        this.add_override_icon();

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

    this.SetData = function (key, value, callback=null, additional_params={}) {
        return this.set_data(key, value, callback, additional_params);
    };

    this.InputInFocus = function () {
        return this.input.InFocus();
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        var primitive = this.editor.canvas.primitives[this.id];

        if (primitive && primitive.drag_active) {
            return;
        }

        this.selected = false;

        this.html.css({
            "background": "",
            "cursor": "pointer"
        });
    };

    this.Select = function (from_canvas=false, focus=true) {
        if (this.selected || this.preview_mode) {
            return;
        }

        this.layers.DeselectLayers();

        this.selected = true;

        this.html.css({
            "background": this.color.PinstripeDark,
            "cursor": "auto"
        });

        if (!from_canvas) {
            this.editor.SetCanvasActivePrimitive(this.id, focus);
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Selected layer: " + this.get_value("display_name"));

            this.layers.UpdateToolbarIconStates();

            this.panel.UpdatePropertyBoxToolSlider("", this);
        }

        this.panel.SwitchContentToEditTab();

        // TODO: Ryan didn't like this, re-enable after it's improved - what's wrong with it?
        // Dash.Gui.ScrollToElement(this.layers.layers_box, this.html);
    };

    this.SetOverrideIconVisibility = function () {
        if (!this.overrides_icon) {
            return;
        }

        if (this.get_value("has_overrides")) {
            this.overrides_icon.html.show();
        }

        else {
            this.overrides_icon.html.hide();
        }
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
                        var hidden = self.get_value("hidden");
                        var locked = self.get_value("locked");

                        self.ToggleHidden(hidden);
                        self.ToggleLocked(locked);
                        self.UpdateLabel();

                        if (self.editor.linked_preview) {
                            var layer = self.editor.linked_preview.editor_panel.layers_box.layers[self.id];

                            layer.ToggleHidden(hidden);
                            layer.ToggleLocked(locked);
                            layer.UpdateLabel();
                        }
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

                    Dash.Log.Log("Layer data:", self.get_data());

                    e.stopPropagation();
                });
            }

            self.html.on("mouseenter", function () {
                var primitive = self.editor.canvas.primitives[self.id];

                if (!primitive.selected) {
                    var css = {"border": "1px solid " + primitive.hover_color};
                    var brightness = primitive.get_value("brightness");

                    if (primitive.hasOwnProperty("update_filter")) {
                        primitive.update_filter(brightness + 0.05);
                    }

                    else {
                        css["filter"] = "brightness(" + (brightness + 0.1) + ")";
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
                    var css = {"border": "1px solid rgba(0, 0, 0, 0)"};
                    var brightness = primitive.get_value("brightness");

                    if (primitive.hasOwnProperty("update_filter")) {
                        primitive.update_filter(brightness);
                    }

                    else {
                        css["filter"] = "brightness(" + brightness + ")";
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
        if (this.preview_mode) {
            return;
        }

        this.input.SetText(this.get_value("display_name"));
    };

    this.UpdateLinkColor = function () {
        if (this.preview_mode) {
            return;
        }

        var link_id = this.get_value("link_id");
        var color = this.editor.get_data()["layer_links"][link_id]?.["color"];

        // This is a viable alternative so leaving it in case we want it instead
        // this.type_icon.html.css({
        //     "background": color || "none"
        // });

        this.type_icon.SetIconColor(color || this.icon_color);

        this.input.html.css({
            "border": "1px solid " + (color || this.color.PinstripeDark)
        });
    };

    this.UpdateTintColor = function () {
        if (this.preview_mode) {
            return;
        }

        var tint_color = this.get_value("tint_color");

        this.html.css({
            "border-left": this.color_border_size + "px solid " + (tint_color || "rgba(0, 0, 0, 0)")
        });
    };

    this.UpdatePreCompColor = function () {
        if (this.preview_mode) {
            return;
        }

        var precomp_color = "";
        var precomp_tag = this.get_value("precomp_tag");

        if (precomp_tag) {
            if (this.layers.legacy_precomps[precomp_tag]) {
                precomp_color = this.layers.legacy_precomps[precomp_tag];
            }

            else {
                precomp_color = this.get_precomp_color(precomp_tag);
            }
        }

        this.html.css({
            "border-right": this.color_border_size + "px solid " + (precomp_color || "rgba(0, 0, 0, 0)")
        });
    };

    this.get_precomp_color = function (precomp_tag) {
        var precomp_colors = [];
        var precomps = this.editor.get_data()["precomps"];

        for (var num in precomps) {
            var precomp = precomps[num];

            precomp_colors.push(precomp["color"]);

            if (precomp["asset_path"] === precomp_tag) {
                return precomp["color"];
            }
        }

        var legacy_colors = [];
        var dark = Dash.Color.IsDark(this.color);

        for (var tag in this.layers.legacy_precomps) {
            legacy_colors.push(this.layers.legacy_precomps[tag]);
        }

        for (var _ of Dash.Math.Range(100)) {
            var color = Dash.Color.Random();

            if (precomp_colors.includes(color) || legacy_colors.includes(color)) {
                continue;
            }

            if (
                   (dark && color.includes("black"))
                || (!dark && color.includes("white"))
            ) {
                continue;
            }

            this.layers.legacy_precomps[precomp_tag] = color;

            return color;
        }

        return "";
    };

    this.add_type_icon = function () {
        this.type_icon = (function (self) {
            return new Dash.Gui.CopyButton(
                self,
                function () {
                    return self.id;
                },
                self.icon_size_mult,
                Dash.Size.RowHeight,
                "default",
                self.get_type_icon_name(),
                self.color,
                "Copied Layer ID!"
            );
        })(this);

        this.type_icon.SetIconColor(this.icon_color);

        this.type_icon.html.css({
            "border-radius": Dash.Size.BorderRadius,
            "margin-top": Dash.Size.Padding * 0.1
        });

        this.type_icon.html.attr("title", "Copy Layer ID");

        var css = {"margin-right": Dash.Size.Padding * 0.3};

        if (this.parent_id) {
            css["margin-left"] = this.child_left_margin;
            css["border-left"] = "1px solid " + this.color.PinstripeDark;

            this.type_icon.button.icon.icon_html.css({
                "padding-left": Dash.Size.Padding * 0.3
            });
        }

        this.type_icon.html.css(css);

        this.html.append(this.type_icon.html);
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
            "width": "calc(100% - " + Dash.Size.Padding + "px)",
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5
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

    this.add_override_icon = function () {
        if (!this.override_mode) {
            return;
        }

        this.overrides_icon = this.get_icon(
            "dot_solid",
            "Layer has overrides at this level",
            this.icon_size_mult * 0.4,
            this.color.AccentBad
        );

        if (!this.get_value("has_overrides")) {
            this.overrides_icon.html.hide();
        }

        this.html.append(this.overrides_icon.html);
    };

    this.add_icon_area = function () {
        this.icon_area.css({
            "display": "flex",
            "gap": Dash.Size.Padding * 0.3
        });

        this.hidden_icon = this.get_icon("hidden", "Layer is hidden");
        this.locked_icon = this.get_icon("lock", "Layer is locked");

        this.contained_icon = this.get_icon(
            "box_open",
            "Layer is contained within the canvas bounds"
        );

        this.linked_icon = this.get_icon(
            "unlink",
            (
                "Layer is unlinked and will ignore values from its parent" +
                "\n\n(only applicable when layer is from an imported context)"
            )
        );

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

    this.get_icon = function (icon_name, hover_text="", size_mult=null, color=null) {
        var icon = new Dash.Gui.Icon(
            this.color,
            icon_name,
            Dash.Size.RowHeight,
            size_mult || this.icon_size_mult,
            color || this.icon_color
        );

        icon.html.css({
            "margin-top": Dash.Size.Padding * 0.1,
            "cursor": hover_text ? "help" : "default"
        });

        if (hover_text) {
            icon.html.attr("title", hover_text);
        }

        return icon;
    };

    this.get_type_icon_name = function () {
        var type = this.get_data()["type"];

        var icon_name = this.layers.icon_map[type] || "unknown";

        if (icon_name === "unknown") {
            Dash.Log.Warn("Unhandled layer type, couldn't get layer icon:", type);
        }

        return icon_name;
    };

    this.on_input_submit = function () {
        this.set_data("display_name", this.input.Text().trim());
    };

    this.set_data = function (key, value, callback=null, additional_params={}) {
        this.layers.set_layer_property(key, value, this.id, this.parent_id, callback, additional_params);
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
                : key === "has_overrides" ? false
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
