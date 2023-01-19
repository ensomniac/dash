function DashGuiContext2D (obj_id, api, can_edit=true, color=null) {
    /**
     * Context2D editor element.
     * -------------------------
     *
     * IMPORTANT NOTE: <br>
     *     For consistency across Dash, this takes an API name and object ID, and uses predetermined names for function calls.
     *     For each context this is used in, make sure to add the correct function names to the respective API file as follows:
     *
     *         - "get_data":     Get data dict for given object ID
     *         - "set_property": Set property with a key/value for given object ID
     *         - "duplicate":    Duplicate the given object ID as a new context (not tethered to the original) - backend function
     *                           should call Dash.LocalStorage.Duplicate, unless there's a special need for a custom function
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
    this.on_duplicate_cb = null;
    this.html = $("<div></div>");
    this.left_pane_slider = null;
    this.right_pane_slider = null;
    this.middle_pane_slider = null;
    this.left_html = $("<div></div>");
    this.middle_html = $("<div></div>");

    this.setup_styles = function () {
        Dash.SetInterval(this, this.refresh_data, 5000);

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

    this.EditorPanelInputInFocus = function () {
        return this.editor_panel.InputInFocus();
    };

    this.SetCanvasTool = function (name, cursor) {
        if (!this.canvas) {
            return;
        }

        this.canvas.SetTool(name, cursor);
    };

    this.SetOnDuplicateCallback = function (callback, binder=null) {
        this.on_duplicate_cb = binder ? callback.bind(binder) : callback;
    };

    this.GetAspectRatio = function () {
        if (!this.editor_panel) {
            return [1, 1];
        }

        return this.editor_panel.GetAspectRatio();
    };

    this.ResizeCanvas = function () {
        if (!this.canvas) {
            return;
        }

        this.canvas.Resize();
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

                    console.log("Context2D property '" + key + "' set to:", value);
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
