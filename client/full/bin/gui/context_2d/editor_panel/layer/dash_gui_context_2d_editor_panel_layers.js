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

    this.AddLayer = function (_index=null) {
        var new_layer = false;

        if (_index === null) {
            _index = this.layers.length;
            new_layer = true;
        }

        var layer = new DashGuiContext2DEditorPanelLayer(this, _index);

        this.layers.push(layer);

        this.layers_box.prepend(layer.html);

        this.editor.AddCanvasLayer(_index);

        if (!new_layer) {
            return;
        }

        if (!("layers" in this.data)) {
            this.data["layers"] = [];
        }

        this.data["layers"].push({"display_name": "New Layer"});

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

        this.editor.RemoveCanvasLayer(index);

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
            this.editor.MoveCanvasLayerUp(index);
        }

        else {
            this.editor.MoveCanvasLayerDown(index);
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
        // TODO: something like this
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

        this.save_data();
    };

    this.save_data = function () {
        // TODO: something like this
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
            "top": Dash.Size.ButtonHeight + Dash.Size.Padding,
            "overflow-y": "auto"
        });

        var layers = this.get_data();

        if (layers.length) {
            for (var i in layers) {
                this.AddLayer(i);
            }

            this.layers.Last().Select();
        }

        else {
            this.AddLayer();
        }

        this.html.append(this.layers_box);
    };

    this.add_header = function () {
        this.header = new Dash.Gui.Header("Layers");

        this.header.ReplaceBorderWithIcon("layers");

        this.header.html.css({
            "padding-bottom": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

        this.header.html.append(new Dash.Gui.GetFlexSpacer());

        this.html.append(this.header.html);
    };

    this.setup_connections = function () {
        (function (self) {
            self.layers_box.on("click", function () {
                self.DeselectLayers();
            });
        })(this);
    };

    this.setup_styles();
}
