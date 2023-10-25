function DashGuiContext2D (
    c2d_id, can_edit=true, color=null, api="Context2D", preview_mode=false,
    override_mode=false, extra_request_params={}, data=null, combo_options=null
) {
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
     *         - "get_precomp":            Set rendered precomp data (must include "url" key) for provided object ID
     *         - "set_property":           Set property with a key/value for provided object ID
     *         - "render_all_precomps":    Render all precomps for provided object ID
     *         - "set_precomp_property":   Set precomp property with a key/value/num for provided object ID
     *         - "set_layer_property":     Set layer property with a key/value for provided object ID
     *         - "set_layer_properties":   Set multiple layer properties with a single dict for provided object ID
     *         - "add_text_layer":         Add new text layer to provided object ID
     *         - "add_color_layer":        Add new color layer to provided object ID
     *         - "add_media_layer":        Add new media layer to provided object ID via media upload
     *         - "import_another_context": Import another context (layers) into provided object ID
     *         - "upload_layer_mask":      Upload a mask image to a layer for provided object ID
     *         - "duplicate":              Duplicate the provided object ID as a new context (not tethered to the original) - backend function
     *                                     should call Dash.LocalStorage.Duplicate, unless there's a special need for a custom function
     *         - "duplicate_layer":        Duplicate the provided layer ID as a new layer (not tethered to the original)
     *         - "get_pil_preview":        Get PIL preview image URL of current state of provided object ID
     *         - "get_combo_options":      Get dict with keys for different combo option types, such as "fonts", with values being lists
     *                                     containing dicts that match the standard combo option format, such as {"id": "font_1", "label_text": "Font 1"}
     *
     *                                     Required/expected combo option type keys:
     *                                       - fonts (make sure 'url' and 'filename' are included in each option, alongside the usual 'id' and 'label_text')
     *                                       - contexts (all Context2D objects)
     *
     * @param {string} c2d_id - Object (context) ID (this will be included in requests as 'c2d_id')
     * @param {boolean} can_edit - Determines whether buttons, inputs, etc will be enabled (default=true)
     * @param {DashColorSet} color - DashColorSet instance (default=null)
     * @param {string} api - API name for requests (default="Context2D")
     * @param {boolean} preview_mode - When enabled, only shows a read-only "preview" of the context, hiding all the gui/tools (default=false)
     * @param {boolean} override_mode - When enabled, hides some gui/tools (default=false)
     * @param {Object} extra_request_params - Extra params to send on requests (default={})
     * @param {Object} data - C2D data to start with, like when using a bulk request with a bunch of previews (default=null)
     * @param {Array} combo_options - Combo options to start with, like when using a bulk request with a bunch of previews (default=null)
     */

    this.c2d_id = c2d_id;
    this.api = api;
    this.color = color || Dash.Color.Light;
    this.can_edit = preview_mode ? false : can_edit;
    this.preview_mode = preview_mode;

    // As of writing, any changes made in this mode will have to be explicitly
    // handled on the backend by the custom abstraction of Dash.Context2D. In
    // the future, this can be baked into the core code if it makes sense to do so.
    this.override_mode = override_mode;

    this.extra_request_params = extra_request_params;
    this.data = data;
    this.ComboOptions = combo_options;

    this.canvas = null;
    this.log_bar = null;
    this.toolbar = null;
    this.initialized = false;
    this.editor_panel = null;
    this.full_res_mode = false;
    this.linked_preview = null;
    this.on_duplicate_cb = null;
    this.loading_overlay = null;
    this.html = $("<div></div>");
    this.left_pane_slider = null;
    this.right_pane_slider = null;
    this.middle_pane_slider = null;
    this.min_width_extensions = {};
    this.min_height_extensions = {};
    this.highlight_color = "#16f0ec";  // Arbitrary obvious color that is readable on light and dark backgrounds
    this.left_html = $("<div></div>");
    this.middle_html = $("<div></div>");
    this.refresh_ms = this.preview_mode ? 60000 : 10000;
    this.editor_panel_property_box_custom_fields_cb = null;
    this.opposite_color = Dash.Color.GetOpposite(this.color);
    this.refresh_data_request_failure_id = "dash_gui_context_2d_on_data";

    this.setup_styles = function () {
        var css = {
            "position": "absolute",
            "inset": 0
        };

        if (this.preview_mode) {
            css["user-select"] = "none";
            css["pointer-events"] = "none";
        }

        this.html.css(css);

        this.loading_overlay = new Dash.Gui.LoadingOverlay(this.color, "none", "Loading", this.html);

        if (this.data) {
            (function (self) {
                setTimeout(
                    function () {
                        Dash.SetInterval(self, self.refresh_data, self.refresh_ms);
                    },
                    self.refresh_ms
                );
            })(this);

            this._on_data();
        }

        else {
            Dash.SetInterval(this, this.refresh_data, this.refresh_ms);
        }

        this.get_combo_options();
    };

    this.SetEditorPanelLayerProperty = function (key, value, id, callback=null) {
        this.editor_panel.SetLayerProperty(key, value, id, callback);
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

    this.SetCanvasActivePrimitive = function (id, focus=true) {
        if (this.canvas) {
            this.canvas.SetActivePrimitive(id, focus);
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

    this.SelectLayer = function (id, from_canvas=true, focus=true) {
        if (this.editor_panel) {
            this.editor_panel.SelectLayer(id, from_canvas, focus);
        }
    };

    this.GetSelectedLayer = function () {
        if (this.editor_panel) {
            return this.editor_panel.GetSelectedLayer();
        }

        return null;
    };

    this.DeselectAllLayers = function () {
        this.editor_panel.layers_box.DeselectLayers();

        this.editor_panel.SwitchContentToNewTab();

        this.DeselectAllCanvasPrimitives();
    };

    this.SetOnDuplicateCallback = function (callback, binder=null) {
        this.on_duplicate_cb = binder ? callback.bind(binder) : callback;
    };

    this.SetLinkedPreview = function (preview) {
        if (!this.override_mode) {
            console.warn("Warning: SetLinkedPreview only works in Override Mode");

            return;
        }

        this.linked_preview = preview;
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
        built_in_function_name="", built_in_function_params=[], callback_that_returns_html=null, binder=null, callback_to_receive_element=null
    ) {
        if (!this.editor_panel) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddCustomElementToEditorPanelContentNewTab(
                            built_in_function_name,
                            built_in_function_params,
                            callback_that_returns_html,
                            binder,
                            callback_to_receive_element
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
            binder,
            callback_to_receive_element
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

    this.ToggleFullResMode = function () {
        if (!this.initialized) {
            (function (self) {
                setTimeout(
                    function () {
                        self.ToggleFullResMode();
                    },
                    100
                );
            })(this);

            return;
        }

        this.full_res_mode = !this.full_res_mode;

        this.RedrawLayers(false, true);
    };

    this.initialize = function () {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        var abs_css = {
            "position": "absolute",
            "inset": 0
        };

        this.html.css({
            "box-sizing": "border-box",
            "background": this.color.Tab.Background.BaseHover,
            "border": this.preview_mode ? "" : ("2px solid " + this.color.StrokeLight),
            ...abs_css
        });

        this.canvas = new DashGuiContext2DCanvas(this);

        if (this.preview_mode) {
            this.editor_panel = new DashGuiContext2DEditorPanel(this);

            this.html.append(this.canvas.html);

            (function (self) {
                requestAnimationFrame(function () {
                    self.ResizeCanvas();
                });
            })(this);
        }

        else {
            this.log_bar = new DashGuiContext2DLogBar(this);
            this.toolbar = new DashGuiContext2DToolbar(this);
            this.editor_panel = new DashGuiContext2DEditorPanel(this);

            this.middle_pane_slider = new Dash.Layout.PaneSlider(
                this,
                true,
                this.log_bar.min_height,
                "dash_gui_context_2d_middle" + (this.override_mode ? "_override" : "")
            );

            this.left_pane_slider = new Dash.Layout.PaneSlider(
                this,
                false,
                this.toolbar.min_width,
                "dash_gui_context_2d_left" + (this.override_mode ? "_override" : ""),
                true
            );

            this.right_pane_slider = new Dash.Layout.PaneSlider(
                this,
                false,
                this.editor_panel.min_width,
                "dash_gui_context_2d_right" + (this.override_mode ? "_override" : "")
            );

            this.right_pane_slider.SetPaneContentA(this.left_html);
            this.right_pane_slider.SetPaneContentB(this.editor_panel.html);

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
        }

        this.loading_overlay.Stop();
        this.loading_overlay.Hide();
    };

    this.refresh_data = function () {
        Dash.Request(
            this,
            this.on_data,
            this.api,
            {
                "f": "get_data",
                "c2d_id": this.c2d_id,
                ...this.extra_request_params
            }
        );
    };

    this.on_data = function (response) {
        if (!Dash.Validate.Response(response)) {
            Dash.Requests.TrackRequestFailureForID(
                this.refresh_data_request_failure_id,
                parseInt(30 / (this.refresh_ms / 1000))
            );

            return;
        }

        Dash.Requests.ResetRequestFailuresForID(this.refresh_data_request_failure_id);

        this.data = response;

        this._on_data();
    };

    this.get_combo_options = function (extra_params={}, callback=null) {
        if (this.ComboOptions) {
            this.on_combo_options(callback);

            return;
        }

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

                    self.on_combo_options(callback);
                },
                self.api,
                {
                    "f": "get_combo_options",
                    "c2d_id": self.c2d_id,
                    ...extra_params
                }
            );
        })(this);
    };

    this.on_combo_options = function (callback=null) {
        if (this.data && !this.initialized) {
            this.initialize();
        }

        if (this.initialized && this.editor_panel && !this.preview_mode) {
            this.editor_panel.UpdateContentBoxComboOptions();
        }

        if (callback) {
            callback();
        }
    };

    this.get_data = function () {
        return this.data;
    };

    this.set_data = function (key, value, callback=null, additional_params={}) {
        // Should never happen, but just in case
        if (this.preview_mode) {
            return;
        }

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

                    self.on_set_data(response, key, value, callback);

                    if (self.linked_preview) {
                        self.linked_preview.on_set_data(response, key, value);  // Don't pass callback here
                    }
                },
                self.api,
                {
                    "f": "set_property",
                    "c2d_id": self.c2d_id,
                    "key": key + (self.override_mode ? "_override" : ""),
                    "value": value,
                    ...self.extra_request_params,
                    ...additional_params
                }
            );
        })(this);
    };

    this.on_set_data = function (response, key, value, callback=null) {
        this.data = response;

        // Aspect ratio change logging happens on canvas resize
        if (key !== "aspect_ratio_w" && key !== "aspect_ratio_h" && key !== "layer_order") {
            this.AddToLog(key.Title() + " set to: " + value);
        }

        if (this.editor_panel) {
            this.editor_panel.UpdatePropertyBox();
        }

        if (callback) {
            callback();
        }
    };

    this._on_data = function () {
        if (this.ComboOptions && !this.initialized) {
            this.initialize();
        }

        if (!this.preview_mode) {
            console.log("Context2D data:", this.data);
        }

        if (this.initialized && this.editor_panel && !this.preview_mode) {
            this.editor_panel.UpdatePropertyBox();
        }
    };

    this.setup_styles();
}
