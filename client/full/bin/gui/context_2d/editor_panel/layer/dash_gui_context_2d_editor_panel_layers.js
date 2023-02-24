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

    // TODO: update external usages and also see if we can nix index reliance altogether
    this.AddLayer = function (id) {
        this.layers[id] = new DashGuiContext2DEditorPanelLayer(this, id);

        this.layers_box.prepend(this.layers[id].html);

        this.editor.AddCanvasPrimitive(this.layers[id].GetData());  // TODO
    };

    this.Delete = function () {
        var id = this.GetSelectedID();

        if (!id) {
            return;
        }

        var order = [];

        for (var layer_id of this.get_data()["order"]) {
            if (layer_id !== id) {
                order.push(layer_id);
            }
        }

        (function (self) {
            self.editor.set_data(
                "layer_order",
                order,
                function () {
                    self.editor.RemoveCanvasPrimitive(id);  // TODO

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
        var id = this.GetSelectedID();

        if (!id) {
            return;
        }

        this.set_data("hidden", hidden, id);

        this.layers[id].ToggleHidden(hidden);
    };

    this.ToggleLocked = function (locked) {
        var id = this.GetSelectedID();

        if (!id) {
            return;
        }

        this.set_data("locked", locked, id);

        this.layers[index].ToggleLocked(locked);
    };

    // TODO: can we nix this? what's depending on it?
    this.GetSelectedIndex = function () {
        var layer = this.GetSelectedLayer();

        if (layer) {
            return layer.GetIndex();
        }

        return null;
    };

    this.GetSelectedID = function () {
        var layer = this.GetSelectedLayer();

        if (layer) {
            return layer.GetID();
        }

        return "";
    };

    this.GetSelectedLayer = function () {
        for (var layer of this.layers) {
            if (layer.IsSelected()) {
                return layer;
            }
        }

        return null;
    };

    this.DeselectLayers = function () {
        for (var layer of this.layers) {
            layer.Deselect();
        }
    };

    this.UpdateToolbarIconStates = function () {
        this.toolbar.UpdateIconStates();
    };

    this.Select = function (index, from_canvas=true) {
        this.layers[index].Select(from_canvas);
    };

    // TODO
    this.SetProperty = function (key, value, index, primitive_previous_value=null) {
        if (
               primitive_previous_value
            && key === "display_name"
            && this.data["layers"][index][key]  // TODO
            && this.data["layers"][index][key] !== primitive_previous_value
        ) {
            // If the layer's name has already been set manually by the user,
            // then don't auto-set the name based on the primitive's text change
            return;
        }

        this.set_data(key, value, index);  // TODO: id not index

        // TODO: Shouldn't be necessary because everything's going to redraw
        // if (key === "display_name") {
        //     this.layers[index].SetLabel(value);
        // }
    };

    // TODO
    this.on_move = function (up=true) {
        var index = this.GetSelectedIndex();

        if (index === null || this.layers.length < 2 || (up && index === (this.layers.length - 1)) || (!up && index === 0)) {
            return;
        }

        var layer = this.layers.Pop(index);
        var new_index = up ? parseInt(index) + 1 : parseInt(index) - 1;

        if (up) {
            layer.index += 1;  // TODO
        }

        else {
            layer.index -= 1;
        }

        for (var other_layer of this.layers) {
            if (other_layer.index !== new_index) {
                continue;
            }

            if (up) {
                other_layer.index -= 1;
            }

            else {
                other_layer.index += 1;
            }
        }

        var layer_data = this.data["layers"].Pop(index);

        this.layers.splice(new_index, 0, layer);

        this.data["layers"].splice(new_index, 0, layer_data);

        this.redraw_layers_box();

        if (up) {
            this.editor.MoveCanvasPrimitiveUp(index);
        }

        else {
            this.editor.MoveCanvasPrimitiveDown(index);
        }

        this.save_layers_data();
    };

    this.redraw_layers_box = function () {
        this.layers_box.empty();

        for (var layer of this.layers) {
            this.layers_box.prepend(layer.html);

            layer.RefreshConnections();
        }
    };

    this.get_data = function () {
        return this.editor.data["layers"];
    };

    this.on_data = function (response) {
        this.editor.data = response;

        this.redraw_layers();
    };

    this.set_data = function (key, value, id="") {
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
                    self.editor.SetCanvasPrimitiveProperty(key, value, id);  // TODO
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

        this.layers = [];

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
