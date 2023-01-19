function DashGuiContext2DEditorPanel (editor) {
    this.editor = editor;

    this.button_bars = [];
    this.layers_box = null;
    this.content_box = null;
    this.property_box = null;
    this.api = this.editor.api;
    this.aspect_tool_row = null;
    this.html = $("<div></div>");
    this.first_pane_slider = null;
    this.color = this.editor.color;
    this.second_pane_slider = null;
    this.top_html = $("<div></div>");
    this.aspect_tool_row_inputs = {};
    this.obj_id = this.editor.obj_id;
    this.can_edit = this.editor.can_edit;
    this.min_width = Dash.Size.ColumnWidth * 2;

    // Update if things are added to the box
    this.property_box_height = (
         Dash.Size.ButtonHeight   +  // Header
        (Dash.Size.RowHeight * 5) +  // Rows (including empty/blank rows) and toolbar-style-buttons
        (Dash.Size.Padding   * 2)    // Top and bottom padding
    );

    // Wrappers
    this.get_data = this.editor.get_data.bind(this.editor);
    this.set_data = this.editor.set_data.bind(this.editor);

    this.setup_styles = function () {
        this.layers_box = new DashGuiContext2DEditorPanelLayers(this);
        this.content_box = new DashGuiContext2DEditorPanelContent(this);
        this.property_box = new Dash.Gui.PropertyBox(this, this.get_data, this.set_data);
        this.first_pane_slider = new Dash.Layout.PaneSlider(this, true, this.property_box_height, "dash_gui_context_2d_editor_panel_first", true);
        this.second_pane_slider = new Dash.Layout.PaneSlider(this, true, this.get_top_html_size(), "dash_gui_context_2d_editor_panel_second", true);

        var abs_css = {
            "position": "absolute",
            "inset": 0
        };

        this.second_pane_slider.SetPaneContentA(this.top_html);
        this.second_pane_slider.SetPaneContentB(this.layers_box.html);

        this.html.css({
            "box-sizing": "border-box",
            "border-left": "1px solid " + this.color.StrokeLight,
            ...abs_css
        });

        // TODO: this pane slider won't move...
        this.html.append(this.second_pane_slider.html);

        this.first_pane_slider.SetPaneContentA(this.property_box.html);
        this.first_pane_slider.SetPaneContentB(this.content_box.html);

        this.top_html.css(abs_css);
        this.top_html.append(this.first_pane_slider.html);

        this.setup_property_box();
    };

    this.InputInFocus = function () {
        return (
               (this.property_box && this.property_box.InputInFocus())
            || (this.layers_box   && this.layers_box.InputInFocus())
            || (this.content_box  && this.content_box.InputInFocus())
        );
    };

    this.GetAspectRatio = function () {
        if (!this.aspect_tool_row) {
            return [1, 1];
        }

        return [
            parseFloat(this.aspect_tool_row_inputs["w"].Text() || 1) || 1,
            parseFloat(this.aspect_tool_row_inputs["h"].Text() || 1) || 1
        ];
    };

    this.UpdatePropertyBox = function () {
        if (!this.property_box) {
            return;
        }

        this.property_box.Update();

        this.editor.ResizeCanvas();
    };

    this.get_top_html_size = function () {
        return (this.content_box.min_height + this.property_box_height + this.first_pane_slider.divider_size);
    };

    this.setup_property_box = function () {
        this.property_box.Flatten();
        this.property_box.SetIndentPx(Dash.Size.Padding);

        this.property_box.html.css({
            "position": "absolute",
            "inset": 0,
            "margin-bottom": 0,
            "box-sizing": "border-box",
            "border-bottom": "1px solid " + this.color.StrokeLight
        });

        this.property_box.AddHeader(
            this.get_data()["display_name"] || "Properties",
            "display_name"
        ).ReplaceBorderWithIcon("gear");

        this.property_box.AddInput("id", "ID", "", null, false).RemoveSaveButton();
        this.property_box.AddInput("display_name", "Display Name", "", null, this.can_edit).RemoveSaveButton();

        this.add_aspect_tool_row();

        var button_bar = this.property_box.AddButtonBar("toolbar");

        if (!this.can_edit) {
            button_bar.Disable();
        }

        button_bar.html.css({
            "margin-top": Dash.Size.Padding * 2,
            "margin-left": Dash.Size.Padding
        });

        button_bar.AddButton("Duplicate Context", this.duplicate_context);

        this.button_bars.push(button_bar);
    };

    this.duplicate_context = function () {
        if (!window.confirm("Duplicate this context?\n\n(Duplicates are not tethered to the original)")) {
            return;
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    if (self.editor.on_duplicate_cb) {
                        self.editor.on_duplicate_cb(response);
                    }
                },
                self.api,
                {
                    "f": "duplicate",
                    "obj_id": self.obj_id
                }
            );
        })(this);
    };

    this.add_aspect_tool_row = function () {
        this.aspect_tool_row = this.property_box.AddToolRow();

        this.get_aspect_tool_row_input("w");

        var label = this.aspect_tool_row.AddLabel("x", Dash.Size.Padding * 0.7, null, null, false);

        label.label.css({
            "padding-left": 0
        });

        this.get_aspect_tool_row_input("h");
    };

    this.get_aspect_tool_row_input = function (key) {
        this.aspect_tool_row_inputs[key] = (function (self) {
            return self.aspect_tool_row.AddInput(
                key.Title(),
                "aspect_ratio_" + key,
                Dash.Size.ColumnWidth * 0.25,
                false,
                function (value, input, additional_data) {
                    if (isNaN(value)) {
                        alert("Aspect ratio values must be numbers");

                        return;
                    }

                    self.set_data(additional_data["data_key"], value);

                    self.editor.ResizeCanvas();
                },
                null,
                self.can_edit,
                key === "w",
                key === "w" ? "Aspect Ratio:" : "",
                false,
                false
            );
        })(this);

        this.aspect_tool_row_inputs[key].input.css({
            "text-align": "center"
        });

        return this.aspect_tool_row_inputs[key];
    };

    this.setup_styles();
}
