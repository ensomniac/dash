function DashGuiContext2D (obj_id, can_edit=true, color=null, api="Context2D") {
    /**
     * Context2D editor element.
     * -------------------------
     *
     * IMPORTANT NOTE: <br>
     *     For consistency across Dash, this takes an API name and object ID, and uses predetermined names
     *     for function calls. For each context this is used in, make sure to add the correct function names
     *     to the respective API file (which should be utilizing the Dash.Context2D module) as follows:
     *
     *         - "get_data":               Get data dict for provided object ID
     *         - "set_property":           Set property with a key/value for provided object ID
     *         - "set_layer_property":     Set layer property with a key/value for provided object ID
     *         - "set_layer_properties":   Set multiple layer properties with a single dict for provided object ID
     *         - "add_text_layer":         Add new text layer to provided object ID
     *         - "add_image_layer":        Add new image layer to provided object ID via image upload
     *         - "import_another_context": Import another context (layers) into provided object ID
     *         - "duplicate":              Duplicate the provided object ID as a new context (not tethered to the original) - backend function
     *                                     should call Dash.LocalStorage.Duplicate, unless there's a special need for a custom function
     *         - "duplicate_layer":        Duplicate the provided layer ID as a new layer (not tethered to the original)
     *         - "get_combo_options":      Get dict with keys for different combo option types, such as "fonts", with values being lists
     *                                     containing dicts that match the standard combo option format, such as {"id": "font_1", "label_text": "Font 1"}
     *
     *                                     Required/expected combo option type keys:
     *                                       - fonts (make sure 'url' and 'filename' are included in each option, alongside the usual 'id' and 'label_text')
     *                                       - contexts (all Context2D objects)
     *
     * @param {string} obj_id - Object (context) ID (this will be included in requests as 'obj_id')
     * @param {boolean} can_edit - Determines whether buttons, inputs, etc will be disabled (default=true)
     * @param {DashColorSet} color - DashColorSet instance (default=null)
     * @param {string} api - API name for requests (default="Context2D")
     */

    this.obj_id = obj_id;
    this.api = api;
    this.color = color || Dash.Color.Light;
    this.can_edit = can_edit;

    this.data = null;
    this.canvas = null;
    this.log_bar = null;
    this.toolbar = null;
    this.initialized = false;
    this.editor_panel = null;
    this.ComboOptions = null;
    this.on_duplicate_cb = null;
    this.loading_overlay = null;
    this.html = $("<div></div>");
    this.left_pane_slider = null;
    this.right_pane_slider = null;
    this.middle_pane_slider = null;
    this.min_width_extensions = {};
    this.min_height_extensions = {};
    this.left_html = $("<div></div>");
    this.middle_html = $("<div></div>");
    this.editor_panel_property_box_custom_fields_cb = null;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0
        });

        this.loading_overlay = new Dash.Gui.LoadingOverlay(this.color, "none", "Loading", this.html);

        Dash.SetInterval(this, this.refresh_data, 5000);

        this.get_combo_options();
    };

    // TODO: regarding all these public functions, some are intended to only be called
    //  by certain elements, so having them appear as public may be confusing later - rename?

    this.SetEditorPanelLayerProperty = function (key, value, id) {
        this.editor_panel.SetLayerProperty(key, value, id);
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

    this.SetCanvasActivePrimitive = function (id) {
        if (this.canvas) {
            this.canvas.SetActivePrimitive(id);
        }
    };

    this.UpdateCanvasPrimitive = function (key, value, id="") {
        if (this.canvas) {
            this.canvas.UpdatePrimitive(key, value, id);
        }
    };

    this.DeselectAllCanvasPrimitives = function () {
        if (this.canvas) {
            this.canvas.DeselectAllPrimitives();
        }
    };

    this.UpdateCanvasPrimitiveZIndexes = function () {
        if (this.canvas) {
            this.canvas.UpdatePrimitiveZIndexes();
        }
    };

    this.AddCanvasPrimitive = function (layer, select=true) {
        if (this.canvas) {
            this.canvas.AddPrimitive(layer, select);
        }
    };

    this.RemoveAllCanvasPrimitives = function () {
        if (this.canvas) {
            this.canvas.RemoveAllPrimitives();
        }
    };

    this.RemoveCanvasPrimitive = function (id) {
        if (this.canvas) {
            this.canvas.RemovePrimitive(id);
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

    this.SelectLayer = function (id, from_canvas=true) {
        if (this.editor_panel) {
            this.editor_panel.SelectLayer(id, from_canvas);
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

    this.RedrawLayers = function (select=false, redraw_primitives=false) {
        this.editor_panel.RedrawLayers(select, redraw_primitives);
    };

    // This is useful when adding custom elements. Replicate this pattern for other panels as needed.
    this.ExtendEditorPanelContentBoxMinHeight = function (number) {
        this.min_height_extensions["editor_panel_content_box"] = number;
    };

    // This is useful when adding custom elements. Replicate this pattern for other panels as needed.
    this.ExtendEditorPanelPropertyBoxMinHeight = function (number) {
        this.min_height_extensions["editor_panel_property_box"] = number;
    };

    // This is useful when custom elements added to the panels are extra wide.
    this.ExtendEditorPanelPanelMinWidth = function (number) {
        this.min_width_extensions["editor_panel"] = number;
    };

    // Use this to add custom fields to the main property box
    this.SetEditorPanelPropertyBoxCustomFieldsCallback = function (callback, binder=null) {
        this.editor_panel_property_box_custom_fields_cb = binder ? callback.bind(binder) : callback;
    };

    this.AddCustomElementToEditorPanelContentNewTab = function (
        built_in_function_name="", built_in_function_params=[], callback_that_returns_html=null, binder=null
    ) {
        if (!this.editor_panel) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomElementToEditorPanelContentNewTab(
                            built_in_function_name,
                            built_in_function_params,
                            callback_that_returns_html,
                            binder
                        );
                    },
                    1
                );
            })(this);

            return;
        }

        this.editor_panel.AddCustomElementToContentNewTab(
            built_in_function_name,
            built_in_function_params,
            callback_that_returns_html,
            binder
        );
    };

    this.AddCustomElementToEditorPanelContentEditTab = function (
        context_key, built_in_function_name="", built_in_function_params=[], callback_that_returns_html=null, binder=null
    ) {
        if (!this.editor_panel) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomElementToEditorPanelContentEditTab(
                            context_key,
                            built_in_function_name,
                            built_in_function_params,
                            callback_that_returns_html,
                            binder
                        );
                    },
                    10
                );
            })(this);

            return;
        }

        this.editor_panel.AddCustomElementToContentEditTab(
            context_key,
            built_in_function_name,
            built_in_function_params,
            callback_that_returns_html,
            binder
        );
    };

    this.AddCustomContextToEditorPanelContentEditTab = function (context_key, callback_that_returns_html=null, binder=null) {
        if (!this.editor_panel) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomContextToEditorPanelContentEditTab(context_key, callback_that_returns_html, binder);
                    },
                    10
                );
            })(this);

            return;
        }

        this.editor_panel.AddCustomContextToContentEditTab(context_key, callback_that_returns_html, binder);
    };

    // Intended for use by abstractions/extensions of this code
    this.SetCanvasOnPrimitiveUpdated = function (callback, binder=null) {
        if (!this.canvas) {
            (function (self) {
                setTimeout(
                    function () {
                        self.SetCanvasOnPrimitiveUpdated(callback, binder);
                    },
                    10
                );
            })(this);

            return;
        }

        this.canvas.OnPrimitiveUpdated = binder ? callback.bind(binder) : callback;
    };

    this.initialize = function () {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

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

        this.editor_panel.UpdatePropertyBox();
        this.editor_panel.UpdateContentBoxComboOptions();

        this.loading_overlay.Stop();
        this.loading_overlay.Hide();
    };

    this.refresh_data = function () {
        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.data = response;

                    if (self.ComboOptions && !self.initialized) {
                        self.initialize();
                    }

                    console.log("Context2D data:", self.data);

                    if (self.initialized) {
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

                    if (self.data && !self.initialized) {
                        self.initialize();
                    }

                    console.log("Context2D combo options:", self.ComboOptions);

                    if (self.initialized) {
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

    this.set_data = function (key, value, callback=null, additional_params={}) {
        if (this.get_data(key) === value) {
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

                    self.data = response;

                    // Aspect ratio change logging happens on canvas resize
                    if (key !== "aspect_ratio_w" && key !== "aspect_ratio_h" && key !== "layer_order") {
                        self.AddToLog(key.Title() + " set to: " + value);
                    }

                    self.editor_panel.UpdatePropertyBox();

                    if (callback) {
                        callback();
                    }
                },
                self.api,
                {
                    "f": "set_property",
                    "obj_id": self.obj_id,
                    "key": key,
                    "value": value,
                    ...additional_params
                }
            );
        })(this);
    };

    this.setup_styles();
}
