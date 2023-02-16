function DashGuiContext2D (obj_id, api, can_edit=true, color=null) {
    /**
     * Context2D editor element.
     * -------------------------
     *
     * IMPORTANT NOTE: <br>
     *     For consistency across Dash, this takes an API name and object ID, and uses predetermined names for function calls.
     *     For each context this is used in, make sure to add the correct function names to the respective API file as follows:
     *
     *         - "get_data":          Get data dict for provided object ID
     *         - "set_property":      Set property with a key/value for provided object ID
     *         - "upload_image":      Upload image (for new image layer) to provided object ID
     *         - "duplicate":         Duplicate the provided object ID as a new context (not tethered to the original) - backend function
     *                                should call Dash.LocalStorage.Duplicate, unless there's a special need for a custom function
     *         - "get_combo_options": Get dict with keys for different combo option types, such as "fonts", with values being lists
     *                                containing dicts that match the standard combo option format, such as {"id": "font_1", "label_text": "Font 1"}
     *
     *                                Required/expected combo option type keys:
     *                                  - fonts (make sure 'url' and 'filename' is included in each option, alongside the usual 'id' and 'label_text')
     *                                  - contexts (all Context2D objects)
     *
     * @param {string} obj_id - Object (context) ID (this will be included in requests as 'obj_id')
     * @param {string} api - API name for requests
     * @param {boolean} can_edit - Determines whether buttons, inputs, etc will be disabled
     * @param {DashColorSet} color - DashColorSet instance
     */

    this.obj_id = obj_id;
    this.api = api;
    this.color = color || Dash.Color.Light;
    this.can_edit = can_edit;

    this.data = {};
    this.canvas = null;
    this.log_bar = null;
    this.toolbar = null;
    this.editor_panel = null;
    this.ComboOptions = null;
    this.on_duplicate_cb = null;
    this.html = $("<div></div>");
    this.left_pane_slider = null;
    this.right_pane_slider = null;
    this.middle_pane_slider = null;
    this.left_html = $("<div></div>");
    this.middle_html = $("<div></div>");

    this.setup_styles = function () {
        Dash.SetInterval(this, this.refresh_data, 5000);

        this.get_combo_options();

        this.canvas = new DashGuiContext2DCanvas(this);
        this.log_bar = new DashGuiContext2DLogBar(this);
        this.toolbar = new DashGuiContext2DToolbar(this);
        this.editor_panel = new DashGuiContext2DEditorPanel(this);
        this.middle_pane_slider = new Dash.Layout.PaneSlider(this, true, this.log_bar.min_height, "dash_gui_context_2d_middle");
        this.left_pane_slider = new Dash.Layout.PaneSlider(this, false, this.toolbar.min_width, "dash_gui_context_2d_left", true);
        this.right_pane_slider = new Dash.Layout.PaneSlider(this, false, this.editor_panel.min_width, "dash_gui_context_2d_right");

        var abs_css = {
            "position": "absolute",
            "inset": 0
        };

        this.right_pane_slider.SetPaneContentA(this.left_html);
        this.right_pane_slider.SetPaneContentB(this.editor_panel.html);

        this.html.css({
            "box-sizing": "border-box",
            "background": this.color.Pinstripe,
            "border": "2px solid " + this.color.StrokeLight,
            ...abs_css
        });

        this.html.append(this.right_pane_slider.html);

        this.left_pane_slider.SetPaneContentA(this.toolbar.html);
        this.left_pane_slider.SetPaneContentB(this.middle_html);

        this.left_html.css({
            "border-right": "1px solid " + this.color.StrokeLight,
            ...abs_css
        });

        this.left_html.append(this.left_pane_slider.html);

        this.middle_pane_slider.SetPaneContentA(this.canvas.html);
        this.middle_pane_slider.SetPaneContentB(this.log_bar.html);

        this.middle_html.css({
            "border-left": "1px solid " + this.color.StrokeLight,
            ...abs_css
        });

        this.middle_html.append(this.middle_pane_slider.html);
    };

    // TODO: regarding all these public functions, some are intended to only be called
    //  by certain elements, so having them appear as public may be confusing later - rename?

    this.SetEditorPanelLayerProperty = function (key, value, index, primitive_previous_value=null) {
        this.editor_panel.SetLayerProperty(key, value, index, primitive_previous_value);
    };

    this.EditorPanelInputInFocus = function () {
        return this.editor_panel.InputInFocus();
    };

    this.CanvasInputInFocus = function () {
        return this.canvas.InputInFocus();
    };

    this.SetCanvasTool = function (name, cursor) {
        if (this.canvas) {
            this.canvas.SetTool(name, cursor);
        }
    };

    this.SetCanvasActivePrimitive = function (index) {
        if (this.canvas) {
            this.canvas.SetActivePrimitive(index);
        }
    };

    this.SetCanvasPrimitiveProperty = function (key, value, index=null) {
        if (this.canvas) {
            this.canvas.SetPrimitiveProperty(key, value, index);
        }
    };

    this.DeselectAllCanvasPrimitives = function () {
        if (this.canvas) {
            this.canvas.DeselectAllPrimitives();
        }
    };

    this.MoveCanvasPrimitiveUp = function (index) {
        if (this.canvas) {
            this.canvas.MovePrimitiveUp(index);
        }
    };

    this.MoveCanvasPrimitiveDown = function (index) {
        if (this.canvas) {
            this.canvas.MovePrimitiveDown(index);
        }
    };

    this.AddCanvasPrimitive = function (index, primitive_data) {
        if (this.canvas) {
            this.canvas.AddPrimitive(index, primitive_data);
        }
    };

    this.RemoveCanvasPrimitive = function (index) {
        if (this.canvas) {
            this.canvas.RemovePrimitive(index);
        }
    };

    this.CanvasSizeInitialized = function () {
        if (this.canvas) {
            return this.canvas.SizeInitialized();
        }
    };

    this.ResizeCanvas = function () {
        if (this.canvas) {
            this.canvas.Resize();
        }
    };

    this.SelectLayer = function (index, from_canvas=true) {
        if (this.editor_panel) {
            this.editor_panel.SelectLayer(index, from_canvas);
        }
    };

    this.DeselectAllLayers = function () {
        this.editor_panel.layers_box.DeselectLayers();

        this.editor_panel.SwitchContentToNewTab();

        this.DeselectAllCanvasPrimitives();
    };

    this.SetOnDuplicateCallback = function (callback, binder=null) {
        this.on_duplicate_cb = binder ? callback.bind(binder) : callback;
    };

    this.GetAspectRatio = function (calculated=false) {
        var aspect;

        if (this.editor_panel) {
            aspect = this.editor_panel.GetAspectRatio();
        }

        else {
            var data = this.get_data();

            aspect = [data["aspect_ratio_w"] || 1, data["aspect_ratio_h"] || 1];
        }

        if (calculated) {
            return aspect[0] / aspect[1];
        }

        return aspect;
    };

    this.AddToLog = function (message) {
        if (this.log_bar) {
            this.log_bar.Add(message);
        }
    };

    this.refresh_data = function () {
        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.data = response || {};

                    console.log("Context2D data:", self.data);

                    if (self.editor_panel) {
                        self.editor_panel.UpdatePropertyBox();
                    }
                },
                self.api,
                {
                    "f": "get_data",
                    "obj_id": self.obj_id
                }
            );
        })(this);
    };

    this.get_combo_options = function () {
        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    if ("error" in response) {
                        delete response["error"];
                    }

                    self.ComboOptions = response;

                    console.log("Context2D combo options:", self.ComboOptions);

                    if (self.editor_panel) {
                        self.editor_panel.UpdateContentBoxComboOptions();
                    }
                },
                self.api,
                {"f": "get_combo_options"}
            );
        })(this);
    };

    this.get_data = function () {
        return this.data;
    };

    this.set_data = function (key, value) {
        if (this.get_data(key) === value) {
            return;
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    // Aspect ratio change logging happens on canvas resize
                    if (key !== "aspect_ratio_w" && key !== "aspect_ratio_h") {
                        self.AddToLog(key.Title() + " set to: " + value);
                    }
                },
                self.api,
                {
                    "f": "set_property",
                    "obj_id": self.obj_id,
                    "key": key,
                    "value": value
                }
            );
        })(this);
    };

    this.setup_styles();
}
