function DashGuiContext2DEditorPanelLayers (panel) {
    this.panel = panel;

    this.layers = {};
    this.header = null;
    this.toolbar = null;
    this.redrawing = false;
    this.legacy_precomps = {};
    this.html = $("<div></div>");
    this.color = this.panel.color;
    this.editor = this.panel.editor;
    this.layers_box = $("<div></div>");
    this.can_edit = this.panel.can_edit;
    this.preview_mode = this.panel.preview_mode;

    this.icon_map = {
        // Layer type: icon name
        "text": "font",
        "image": "image",
        "video": "film",
        "color": "color_palette",
        "context": "project_diagram"
    };

    this.setup_styles = function () {
        if (!this.preview_mode) {
            this.html.css({
                "position": "absolute",
                "inset": 0,
                "padding": Dash.Size.Padding,
                "padding-top": Dash.Size.Padding * 0.5,
                "box-sizing": "border-box",
                "background": this.color.Background,
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

            this.setup_connections();
        }

        (function (self) {
            requestAnimationFrame(function () {
                self.redraw_layers();  // Wait for canvas to be fully drawn first
            });
        })(this);
    };

    this.InputInFocus = function () {
        for (var id in this.layers) {
            if (this.layers[id].InputInFocus()) {
                return true;
            }
        }

        return false;
    };

    this.AddLayer = function (id, select=true, parent_id="") {
        this.layers[id] = new DashGuiContext2DEditorPanelLayer(this, id, parent_id);

        var data = this.layers[id].GetData();

        if (data["type"] === "context") {
            var imported_layers = data["imported_context"]["layers"]["data"];

            // If imported context is *this* context, then the layer ids will be the same, which will
            // be a problem (same applies to primitives, since they also rely on layer IDs), but as of
            // writing, importing a context into itself is disabled in DashGuiContext2DEditorPanelContentNew
            for (var imported_id of this.layers[id].GetChildrenLayerOrder()) {
                if (imported_layers[imported_id]["type"] === "context") {
                    alert(
                        "A context has been imported that has its own imported context(s).\n" +
                        "Importing nested contexts within contexts is complex and not yet supported.\n" +
                        "The nested context(s) within the imported context will be ignored."
                    );

                    // We probably need to add support for this, it's just very complicated because of
                    // the need to handle overrides recursively and it's not needed/important for now
                    continue;
                }

                this.AddLayer(imported_id, false, id);
            }
        }

        if (!this.preview_mode) {
            this.layers_box.prepend(this.layers[id].html);

            if (select) {
                this.layers[id].Select();
            }
        }

        this.editor.AddCanvasPrimitive(
            this.layers[id],
            this.preview_mode ? false : select
        );
    };

    this.Duplicate = function () {
        // Should never happen, but just in case
        if (this.editor.preview_mode || this.editor.override_mode) {
            return;
        }

        var id = this.GetSelectedID();

        if (!id) {
            return;
        }

        (function (self) {
            Dash.Request(
                this,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.OnNewLayer(response);
                },
                self.editor.api,
                {
                    "f": "duplicate_layer",
                    "c2d_id": self.editor.c2d_id,
                    "layer_id": id
                }
            );
        })(this);
    };

    this.Delete = function () {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            return;
        }

        var id = layer.GetID();
        var parent_id = layer.GetParentID();
        var parent_layer_order = layer.GetParentLayerOrder();
        var order = [...(parent_id ? parent_layer_order : this.get_data()["order"])];

        order.Remove(id);

        (function (self) {
            if (parent_id) {
                self.set_layer_property(
                    "layer_order",
                    order,
                    id,
                    parent_id,
                    function () {
                        self.on_delete(id);

                        if (self.editor.linked_preview) {
                            self.editor.linked_preview.editor_panel.layers_box.on_delete(id);
                        }
                    }
                );
            }

            else {
                self.set_layer_order(
                    order,
                    function () {
                        self.on_delete(id);

                        if (self.editor.linked_preview) {
                            self.editor.linked_preview.editor_panel.layers_box.on_delete(id);
                        }
                    }
                );
            }
        })(this);
    };

    this.Download = function (callback=null) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            if (callback) {
                callback();
            }

            alert("Can't download, no selected layer found");

            return;
        }

        var data = layer.GetData()["file"];

        if (!data) {
            if (callback) {
                callback();
            }

            alert("Can't download, selected layer data not found");

            return;
        }

        var url = (data["url"] || data["orig_url"] || data["thumb_png_url"] || data["thumb_jpg_url"] || "");

        if (!url) {
            if (callback) {
                callback();
            }

            alert("Can't download, url not found");

            return;
        }

        Dash.Gui.OpenFileURLDownloadDialog(url, "", callback);
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
            this.toolbar.ReEnableToggle("hidden");

            return;
        }

        layer.ToggleHidden(hidden);
    };

    this.ToggleLocked = function (locked) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            this.toolbar.ReEnableToggle("locked");

            return;
        }

        layer.ToggleLocked(locked);
    };

    this.ToggleContained = function (contained) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            this.toolbar.ReEnableToggle("contained");

            return;
        }

        layer.ToggleContained(contained);
    };

    this.ToggleLinked = function (linked) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            this.toolbar.ReEnableToggle("linked");

            return;
        }

        layer.ToggleLinked(linked);
    };

    this.GetSelectedID = function () {
        var layer = this.GetSelectedLayer();

        if (layer) {
            return layer.GetID();
        }

        return "";
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

        this.UpdateToolbarIconStates();

        this.panel.UpdatePropertyBoxToolSlider();
    };

    this.UpdatePreCompColors = function () {
        for (var id in this.layers) {
            this.layers[id].UpdatePreCompColor();
        }
    };

    this.UpdateToolbarIconStates = function () {
        this.toolbar.UpdateIconStates();
    };

    this.Select = function (id, from_canvas=true, focus=true) {
        this.layers[id].Select(from_canvas, focus);
    };

    this.SetProperty = function (key, value, id, callback=null) {
        this.set_layer_property(key, value, id, "", callback);
    };

    this.OnNewLayer = function (response) {
        this.on_data(response, true, true);
    };

    this.Redraw = function (select=false, redraw_primitives=false) {
        this.redraw_layers(select, redraw_primitives);
    };

    this.on_move = function (up=true) {
        var layer = this.GetSelectedLayer();

        if (!layer) {
            return;
        }

        var id = layer.GetID();
        var parent_id = layer.GetParentID();
        var parent_layer_order = layer.GetParentLayerOrder();
        var order = [...(parent_id ? parent_layer_order : this.get_data()["order"])];
        var index = parent_id ? parent_layer_order.indexOf(id) : layer.GetIndex();

        if (index < 0 || order.length < 2 || (up && index === (order.length - 1)) || (!up && index === 0)) {
            return;
        }

        var additional_params = {};
        var next_index = up ? index + 1 : index - 1;
        var next_layer = this.layers[order[next_index]];

        if (
               (layer.get_value("precomp_tag_explicitly_set") || next_layer.get_value("precomp_tag_explicitly_set"))
            && (layer.get_value("precomp_tag") !== next_layer.get_value("precomp_tag"))
        ) {
            if (!window.confirm("This move will change the current Pre-Comp flow.\n\nProceed?")) {
                // In the future, we may want to give more choices, such as removing
                // pre-comp tag, changing it, etc. For now, the backend handles it.
                // If we want to change it later, use Dash.Gui.Prompt instead of this.
                return;
            }

            additional_params["moved_layer_id"] = id;
        }

        delete this.layers[id];

        order.Remove(id);

        order.splice((up ? index + 1 : index - 1), 0, id);

        (function (self) {
            if (parent_id) {
                self.set_layer_property(
                    "layer_order",
                    order,
                    id,
                    parent_id,
                    function () {
                        self._on_move(id);

                        if (self.editor.linked_preview) {
                            self.editor.linked_preview.editor_panel.layers_box._on_move(id);
                        }
                    }
                );
            }

            else {
                self.set_layer_order(
                    order,
                    function () {
                        self._on_move(id);

                        if (self.editor.linked_preview) {
                            self.editor.linked_preview.editor_panel.layers_box._on_move(id);
                        }
                    },
                    additional_params
                );
            }
        })(this);
    };

    this.on_delete = function (id) {
        this.redraw_layers();

        this.editor.RemoveCanvasPrimitive(id);

        if (!this.preview_mode) {
            this.panel.SwitchContentToNewTab();
        }
    };

    this.get_data = function (parent_id="") {
        var layers = this.editor.data["layers"];

        if (parent_id) {
            return layers["data"][parent_id]["imported_context"]["layers"];
        }

        return layers;
    };

    this.on_data = function (response, redraw=false, select=false) {
        this.editor.data = response;

        if (redraw) {
            this.redraw_layers(select);
        }
    };

    this.set_layer_order = function (order, callback=null, additional_params={}) {
        this.editor.set_data("layer_order", order, callback, additional_params);
    };

    this.set_layer_property = function (key, value, id="", parent_id="", callback=null, additional_params={}) {
        // Should never happen, but just in case
        if (this.editor.preview_mode) {
            return;
        }

        if (!id) {
            id = this.GetSelectedID();
        }

        if (!id) {  // Shouldn't happen, unless there are no layers, in which case, this shouldn't have been called
            console.error("Failed to get current layer ID");

            this.toolbar.ReEnableToggle(key);

            return;
        }

        if (typeof value === "object") {
            value = JSON.stringify(value);
        }

        var params = {
            "c2d_id": this.editor.c2d_id,
            "layer_id": parent_id || id,
            ...this.editor.extra_request_params,
            ...additional_params
        };

        if (key === "font_id") {
            var font_url = "";

            if (value) {
                for (var option of this.editor.ComboOptions["fonts"]) {
                    if (option["id"] !== value) {
                        continue;
                    }

                    font_url = option["url"];

                    break;
                }
            }

            params["f"] = "set_layer_properties";

            params["properties"] = {
                "font_id": value,
                "font_url": font_url
            };
        }

        else {
            params["f"] = "set_layer_property";
            params["key"] = key;
            params["value"] = value;
        }

        if (parent_id && key !== "layer_order") {
            params["imported_context_layer_id"] = id;
        }

        if (this.editor.override_mode) {
            if (params["properties"]) {
                var renamed = {};

                for (var k in params["properties"]) {
                    renamed[k + "_override"] = params["properties"][k];
                }

                params["properties"] = renamed;
            }

            if (params["key"]) {
                params["key"] += "_override";
            }
        }

        if (params["properties"]) {
            params["properties"] = JSON.stringify(params["properties"]);
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_set_layer_property(response, key, value, id, parent_id);

                    if (self.editor.linked_preview) {
                        self.editor.linked_preview.editor_panel.layers_box.on_set_layer_property(
                            response, key, value, id, parent_id
                        );
                    }

                    if (callback) {
                        callback();
                    }
                },
                self.editor.api,
                params
            );
        })(this);
    };

    this.on_set_layer_property = function (response, key, value, id, parent_id="") {
        if (!Dash.Validate.Response(response)) {
            if (!this.preview_mode) {
                this.toolbar.ReEnableToggle(key);
            }

            return;
        }

        this.on_data(response);

        if (key === "display_name" || key === "text_value") {
            this.layers[id].UpdateLabel();
        }

        else if (key === "tint_color") {
            this.layers[id].UpdateTintColor();
        }

        else if (key === "precomp_tag") {
            for (var layer_id in this.layers) {
                this.layers[layer_id].UpdatePreCompColor();
            }
        }

        var display_name;

        if (parent_id) {
            var imported_context = this.editor.data["layers"]["data"][parent_id]["imported_context"];
            var overrides = imported_context["layer_overrides"][id] || {};
            var layer_data = imported_context["layers"]["data"][id];
            var linked = "linked" in overrides ? overrides["linked"] : layer_data["linked"];

            display_name = linked ? (overrides["display_name"] || layer_data["display_name"]) : layer_data["display_name"];
        }

        else {
            display_name = this.get_data()["data"][id]["display_name"];
        }

        if (key !== "layer_order") {
            this.editor.AddToLog("[" + display_name + "] Set " + "'" + key + "' to '" + value + "'");
            this.editor.UpdateCanvasPrimitive(key, value, id);
        }

        if (!this.preview_mode) {
            this.toolbar.ReEnableToggle(key);

            if (key === "hidden" || key === "locked") {
                this.panel.RedrawCurrentContentTab();
            }
        }
    };

    this.redraw_layers = function (select=false, redraw_primitives=false) {
        this.redrawing = true;

        if (redraw_primitives) {
            this.editor.RemoveAllCanvasPrimitives();
        }

        this.layers = {};

        this.layers_box.empty();

        var precomps_log = [];

        for (var id of this.get_data()["order"]) {
            this.AddLayer(id, select);

            precomps_log.push(
                  this.layers[id].get_value("display_name")
                + ": "
                + this.layers[id].get_value("precomp_tag")
            );
        }

        // console.log("Pre-Comps:", precomps_log.reverse());

        this.redrawing = false;
    };

    this.add_header = function () {
        this.header = new Dash.Gui.Header("Layers");

        this.header.ReplaceBorderWithIcon("layers");

        this.header.html.css({
            "margin-left": -Dash.Size.Padding,
            "margin-top": -Dash.Size.Padding * 0.5,
            "padding-top": Dash.Size.Padding * 0.5,
            "margin-right": -Dash.Size.Padding,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "background": this.color.Tab.Background.BaseHover,
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

    this._on_move = function (id) {
        this.redraw_layers();

        this.editor.UpdateCanvasPrimitiveZIndexes();

        this.layers[id].Select();

        Dash.Gui.ScrollToElement(this.layers_box, this.layers[id].html);
    };

    this.setup_styles();
}
