function DashGuiContext2DEditorPanel (editor) {
    this.editor = editor;

    this.layers_box = null;
    this.content_box = null;
    this.property_box = null;
    this.html = $("<div></div>");
    this.first_pane_slider = null;
    this.second_pane_slider = null;
    this.top_html = $("<div></div>");
    this.min_width = Dash.Size.ColumnWidth * 2;
    this.property_box_height = Dash.Size.ButtonHeight * 5;  // TODO

    this.setup_styles = function () {
        this.layers_box = new DashGuiContext2DEditorPanelLayers(this);
        this.content_box = new DashGuiContext2DEditorPanelContent(this);
        this.property_box = new Dash.Gui.PropertyBox(this.editor, this.editor.get_data, this.editor.set_data);
        this.first_pane_slider = new Dash.Layout.PaneSlider(this, true, this.property_box_height, "dash_gui_context_2d_editor_panel_first", true);
        this.second_pane_slider = new Dash.Layout.PaneSlider(this, true, this.get_top_html_size(), "dash_gui_context_2d_editor_panel_second", true);

        var abs_css = {
            "position": "absolute",
            "inset": 0
        };

        this.second_pane_slider.SetPaneContentA(this.top_html);
        this.second_pane_slider.SetPaneContentB(this.layers_box.html);
        this.second_pane_slider.SetMinSize(this.get_top_html_size());

        this.html.css(abs_css);
        this.html.append(this.second_pane_slider.html);

        this.first_pane_slider.SetPaneContentA(this.property_box.html);
        this.first_pane_slider.SetPaneContentB(this.content_box.html);
        this.first_pane_slider.SetMinSize(this.property_box_height);

        this.top_html.css(abs_css);
        this.top_html.append(this.first_pane_slider.html);

        this.setup_property_box();
    };

    this.get_top_html_size = function () {
        return (this.content_box.min_height + this.property_box_height + this.first_pane_slider.divider_size);
    };

    this.setup_property_box = function () {
        this.property_box.Flatten();

        this.property_box.html.css({
            "background": "pink",
            "position": "absolute",
            "inset": 0,
            "margin-bottom": 0
        });

        this.property_box.AddHeader(
            this.editor.get_data()["display_name"] || "Properties",
            "display_name"
        ).ReplaceBorderWithIcon("pencil_ruler");

        this.property_box.AddInput("id", "ID", "", null, false);
        this.property_box.AddInput("display_name", "Display Name", "", null, true);

        // TODO
    };

    this.setup_styles();
}
