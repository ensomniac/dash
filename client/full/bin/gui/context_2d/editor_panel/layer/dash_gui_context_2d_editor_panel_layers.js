function DashGuiContext2DEditorPanelLayers (panel) {
    this.panel = panel;

    this.data = {};
    this.layers = [];
    this.header = null;
    this.toolbar = null;
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
    };

    this.InputInFocus = function () {
        for (var layer of this.layers) {
            if (layer.InputInFocus()) {
                return true;
            }
        }

        return false;
    };

    this.AddLayer = function (index=null) {
        var new_layer = false;

        if (index === null) {
            index = this.layers.length;
            new_layer = true;
        }

        var layer = new DashGuiContext2DEditorPanelLayer(this, index);

        this.layers.push(layer);

        this.layers_box.prepend(layer.html);

        this.editor.AddCanvasLayer(index);

        if (!new_layer) {
            return;
        }

        layer.Select();

        if (!("layers" in this.data)) {
            this.data["layers"] = [];
        }

        this.data["layers"].push({"display_name": "New Layer"});

        this.save_data();
    };

    this.Delete = function () {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        this.layers.Pop(index).html.remove();

        this.data["layers"].Pop(index);

        this.editor.RemoveCanvasLayer(index);

        this.save_data();
    };

    this.MoveUp = function () {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        var new_index = parseInt(index) + 1;
        var layer = this.layers.Pop(index);
        var layer_data = this.data["layers"].Pop(index);

        this.layers.splice(new_index, 0, layer);

        this.data["layers"].splice(new_index, 0, layer_data);

        this.redraw_layers_box();

        this.editor.MoveCanvasLayerUp(index);

        this.save_data();
    };

    this.MoveDown = function () {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        var new_index = parseInt(index) - 1;
        var layer = this.layers.Pop(index);
        var layer_data = this.data["layers"].Pop(index);

        this.layers.splice(new_index, 0, layer);

        this.data["layers"].splice(new_index, 0, layer_data);

        this.redraw_layers_box();

        this.editor.MoveCanvasLayerDown(index);

        this.save_data();
    };

    this.ToggleHidden = function (hidden) {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        this.set_data("hidden", hidden, index);

        this.layers[index].ToggleHidden(hidden);

        this.editor.ToggleCanvasLayerHidden(index, hidden);
    };

    this.ToggleLocked = function (locked) {
        var index = this.GetSelectedIndex();

        if (index === null) {
            return;
        }

        this.set_data("locked", locked, index);

        this.layers[index].ToggleLocked(locked);

        this.editor.ToggleCanvasLayerLocked(index, locked);
    };

    this.GetSelectedIndex = function () {
        for (var layer of this.layers) {
            if (layer.IsSelected()) {
                return layer.GetIndex();
            }
        }

        return null;
    };

    this.DeselectLayers = function () {
        for (var layer of this.layers) {
            layer.Deselect();
        }
    };

    this.redraw_layers_box = function () {
        this.layers_box.empty();

        for (var layer of this.layers) {
            this.layers_box.prepend(layer.html);
        }
    };

    this.get_data = function () {
        // TODO: toolbar will use this to determine if a layer is locked/unlocked, etc
        //  when changing layers, so this needs to return layer data or something like that
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
            "background": "teal",
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

    this.setup_styles();
}