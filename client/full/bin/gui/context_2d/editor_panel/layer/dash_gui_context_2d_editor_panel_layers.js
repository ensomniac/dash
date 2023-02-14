function DashGuiContext2DEditorPanelLayers (panel) {
    this.panel = panel;

    this.data = {};
    this.layers = [];
    this.header = null;
    this.toolbar = null;
    this.initialized = false;
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
        this.add_layers_box();

        this.toolbar = new DashGuiContext2DEditorPanelLayersToolbar(this);

        this.header.html.append(this.toolbar.html);

        // TODO: load layers list data

        this.setup_connections();

        this.initialized = true;
    };

    this.InputInFocus = function () {
        for (var layer of this.layers) {
            if (layer.InputInFocus()) {
                return true;
            }
        }

        return false;
    };

    this.ImportContext = function (context_data) {
        console.debug("TEST import context", context_data);

        // TODO: see trello notes
    };

    this.AddLayer = function (primitive_type="", primitive_file_data=null, _index=null) {
        var primitive_data;
        var new_layer = false;

        if (_index === null) {
            _index = this.layers.length;
            new_layer = true;
        }

        var layer = new DashGuiContext2DEditorPanelLayer(this, _index, primitive_type, primitive_file_data);

        this.layers.push(layer);

        this.layers_box.prepend(layer.html);

        if (new_layer) {
            primitive_data = {
                "type": primitive_type,  // image, text, etc
                "file_data": primitive_file_data,  // data for image, etc
                "anchor_norm_x": 0.5,  // normalized x value for the center point of the element in relation to the canvas
                "anchor_norm_y": 0.5,  // normalized y value for the center point of the element in relation to the canvas
                "width_norm": 0.5,  // normalized width for the width of the element in relation to the width of the canvas
                "rot_deg": 0  // -180 to 180 (or is it -179 to 179?)
            };
        }

        else {
            primitive_data = layer.GetPrimitiveData();
        }

        this.editor.AddCanvasPrimitive(_index, primitive_data);

        if (!new_layer) {
            if (primitive_data["hidden"]) {
                layer.ToggleHidden(primitive_data["hidden"]);
            }

            if (primitive_data["locked"]) {
                layer.ToggleLocked(primitive_data["locked"]);
            }

            return;
        }

        if (!("layers" in this.data)) {
            this.data["layers"] = [];
        }

        this.data["layers"].push({
            "display_name": "New Layer",
            "primitive": primitive_data
        });

        layer.Select();

        this.save_data();
    };

    this.Delete = function () {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        var is_top_layer = index === this.layers.length - 1;

        this.layers.Pop(index).html.remove();

        if (!is_top_layer) {
            for (var other_layer of this.layers) {
                if (other_layer.index <= index) {
                    continue;
                }

                other_layer.index -= 1;
            }
        }

        this.data["layers"].Pop(index);

        this.editor.RemoveCanvasPrimitive(index);

        this.panel.SwitchContentToNewTab();

        this.save_data();
    };

    this.MoveUp = function () {
        this.on_move();
    };

    this.MoveDown = function () {
        this.on_move(false);
    };

    this.ToggleHidden = function (hidden) {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        this.set_data("hidden", hidden, index);

        this.layers[index].ToggleHidden(hidden);
    };

    this.ToggleLocked = function (locked) {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        this.set_data("locked", locked, index);

        this.layers[index].ToggleLocked(locked);
    };

    this.GetSelectedIndex = function () {
        var layer = this.GetSelectedLayer();

        if (layer) {
            return layer.GetIndex();
        }

        return null;
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

    this.SetProperty = function (key, value, index, primitive_previous_value=null) {
        if (
               primitive_previous_value
            && key === "display_name"
            && this.data["layers"][index][key]
            && this.data["layers"][index][key] !== primitive_previous_value
        ) {
            // If the layer's name has already been set manually by the user,
            // then don't auto-set the name based on the primitive's text change
            return;
        }

        this.set_data(key, value, index);

        if (key === "display_name") {
            this.layers[index].SetLabel(value);
        }
    };

    this.on_move = function (up=true) {
        var index = this.GetSelectedIndex();

        if (index === null || this.layers.length < 2 || (up && index === (this.layers.length - 1)) || (!up && index === 0)) {
            return;
        }

        var layer = this.layers.Pop(index);
        var new_index = up ? parseInt(index) + 1 : parseInt(index) - 1;

        if (up) {
            layer.index += 1;
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

        this.save_data();
    };

    this.redraw_layers_box = function () {
        this.layers_box.empty();

        for (var layer of this.layers) {
            this.layers_box.prepend(layer.html);

            layer.RefreshConnections();
        }
    };

    this.get_data = function () {
        // TODO: data - something like this
        return this.data["layers"] || [];
    };


    this.set_data = function (key, value, index=null) {
        if (index === null) {
            index = this.GetSelectedIndex();
        }

        // Shouldn't happen, unless there are no layers, in which case, this shouldn't have been called
        if (index === null) {
            console.error("Failed to get current layer index");

            return;
        }

        if (!("layers" in this.data)) {
            this.data["layers"] = [];
        }

        this.data["layers"][index][key] = value;

        this.editor.AddToLog("(" + this.data["layers"][index]["display_name"] + ") Set " + "'" + key + "' to '" + value + "'");

        this.editor.SetCanvasPrimitiveProperty(key, value, index);

        this.save_data();
    };

    this.save_data = function () {
        // TODO: data - something like this
        // Dash.Request(
        //     this,
        //     function (response) {
        //         if (!Dash.Validate.Response(response)) {
        //             return;
        //         }
        //     },
        //     this.editor.api,
        //     {
        //         // If the layers will be stored separately from the main data, then this isn't the right approach
        //         "f": "set_data",
        //         "key": "layers",
        //         "value": JSON.stringify(this.get_data()["layers"] || [])
        //     }
        // );
    };

    this.add_layers_box = function () {
        this.layers_box.css({
            "position": "absolute",
            "inset": 0,
            "top": Dash.Size.ButtonHeight + (Dash.Size.Padding * 0.5),
            "overflow-y": "auto"
        });

        var layers = this.get_data();

        if (layers.length) {
            for (var i in layers) {
                this.AddLayer("", null, i);
            }

            this.layers.Last().Select();
        }

        this.html.append(this.layers_box);
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
