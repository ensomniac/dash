function DashGuiContext2DEditorPanelLayers (panel) {
    this.panel = panel;

    this.layers = {};
    this.header = null;
    this.toolbar = null;
    this.redrawing = false;
    this.html = $("<div></div>");
    this.color = this.panel.color;
    this.editor = this.panel.editor;
    this.layers_box = $("<div></div>");
    this.can_edit = this.panel.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "padding-top": Dash.Size.Padding * 0.5,
            "box-sizing": "border-box",
            "border-top": "1px solid " + this.color.StrokeLight
        });

        this.add_header();

        this.layers_box.css({
            "position": "absolute",
            "inset": 0,
            "top": Dash.Size.ButtonHeight + (Dash.Size.Padding * 0.5),
            "overflow-y": "auto"
        });

        this.html.append(this.layers_box);

        this.redraw_layers();
        this.setup_connections();
    };

    this.InputInFocus = function () {
        for (var id in this.layers) {
            if (this.layers[id].InputInFocus()) {
                return true;
            }
        }

        return false;
    };

    this.ImportContext = function (context_data) {
        console.debug("TEST import context", context_data);

        // TODO: see trello notes
    };

    this.AddLayer = function (id) {
        this.layers[id] = new DashGuiContext2DEditorPanelLayer(this, id);

        this.layers_box.prepend(this.layers[id].html);

        this.editor.AddCanvasPrimitive(this.layers[id]);
    };

    this.Delete = function () {
        var id = this.GetSelectedID();

        if (!id) {
            return;
        }

        var order = [...this.get_data()["order"]];

        order.Remove(id);

        (function (self) {
            self.set_layer_order(
                order,
                function () {
                    self.redraw_layers();

                    self.editor.RemoveCanvasPrimitive(id);

                    self.panel.SwitchContentToNewTab();
                }
            );
        })(this);
    };

    this.MoveUp = function () {
        this.on_move();
    };

    this.MoveDown = function () {
        this.on_move(false);
    };

    this.ToggleHidden = function (hidden) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            return;
        }

        layer.ToggleHidden(hidden);
    };

    this.ToggleLocked = function (locked) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            return;
        }

        layer.ToggleLocked(locked);
    };

    this.GetSelectedID = function () {
        var layer = this.GetSelectedLayer();

        if (layer) {
            return layer.GetID();
        }

        return "";
    };

    this.GetSelectedData = function () {
        var layer = this.GetSelectedLayer();

        if (layer) {
            return layer.GetData();
        }

        return null;
    };

    this.GetSelectedLayer = function () {
        for (var id in this.layers) {
            if (this.layers[id].IsSelected()) {
                return this.layers[id];
            }
        }

        return null;
    };

    this.DeselectLayers = function () {
        for (var id in this.layers) {
            this.layers[id].Deselect();
        }
    };

    this.UpdateToolbarIconStates = function () {
        this.toolbar.UpdateIconStates();
    };

    this.Select = function (id, from_canvas=true) {
        this.layers[id].Select(from_canvas);
    };

    this.SetProperty = function (key, value, id, primitive_previous_value=null) {
        var current = this.get_data()["data"][id][key];

        if (primitive_previous_value && key === "display_name" && current && current !== primitive_previous_value) {
            // If the layer's name has already been set manually by the user,
            // then don't auto-set the name based on the primitive's text change
            return;
        }

        this.set_layer_property(key, value, id);
    };

    this.OnNewLayer = function (response) {
        this.on_data(response, true);
    };

    this.on_move = function (up=true) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            return;
        }

        var id = layer.GetID();
        var index = layer.GetIndex();
        var order = [...this.get_data()["order"]];

        if (order.length < 2 || (up && index === (order.length - 1)) || (!up && index === 0)) {
            return;
        }

        delete this.layers[id];

        order.Remove(id);

        order.splice((up ? index + 1 : index - 1), 0, id);

        (function (self) {
            self.set_layer_order(
                order,
                function () {
                    self.redraw_layers();

                    self.editor.UpdateCanvasPrimitiveZIndexes();
                }
            );
        })(this);
    };

    this.get_data = function () {
        return this.editor.data["layers"];
    };

    this.on_data = function (response, redraw=false) {
        this.editor.data = response;

        // TODO: is this necessary when the layer order didn't change?
        if (redraw) {
            this.redraw_layers();
        }
    };

    this.set_layer_order = function (order, callback=null) {
        this.editor.set_data("layer_order", order, callback);
    };

    this.set_layer_property = function (key, value, id="") {
        if (!id) {
            id = this.GetSelectedID();
        }

        if (!id) {  // Shouldn't happen, unless there are no layers, in which case, this shouldn't have been called
            console.error("Failed to get current layer ID");

            return;
        }

        if (typeof value === "object") {
            value = JSON.stringify(value);
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.on_data(response);

                    self.editor.AddToLog("(" + self.get_data()["data"][id]["display_name"] + ") Set " + "'" + key + "' to '" + value + "'");
                    self.editor.UpdateCanvasPrimitive(key, value, id);
                },
                self.editor.api,
                {
                    "f": "set_layer_property",
                    "obj_id": self.editor.obj_id,
                    "layer_id": id,
                    "key": key,
                    "value": value
                }
            );
        })(this);
    };

    this.redraw_layers = function () {
        this.redrawing = true;

        this.layers = {};

        this.layers_box.empty();

        for (var id of this.get_data()["order"]) {
            this.AddLayer(id);
        }

        this.redrawing = false;
    };

    this.add_header = function () {
        this.header = new Dash.Gui.Header("Layers");

        this.header.ReplaceBorderWithIcon("layers");

        this.header.html.css({
            "margin-left": -Dash.Size.Padding * 0.5,
            "margin-right": -Dash.Size.Padding * 0.5,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

        this.header.label.css({
            "padding-left": Dash.Size.Padding * 0.5
        });

        this.header.html.append(new Dash.Gui.GetFlexSpacer());

        this.toolbar = new DashGuiContext2DEditorPanelLayersToolbar(this);

        this.header.html.append(this.toolbar.html);

        this.html.append(this.header.html);
    };

    this.setup_connections = function () {
        (function (self) {
            self.layers_box.on("click", function () {
                self.editor.DeselectAllLayers();
            });
        })(this);
    };

    this.setup_styles();
}
