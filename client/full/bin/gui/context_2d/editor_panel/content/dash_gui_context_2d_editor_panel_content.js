function DashGuiContext2DEditorPanelContent (panel) {
    this.panel = panel;

    this.html = null;
    this.header = null;
    this.layout = null;
    this.new_tab_index = null;
    this.edit_tab_index = null;
    this.color = this.panel.color;
    this.last_instantiated_class = null;
    this.can_edit = this.panel.can_edit;
    this.min_height = Dash.Size.ButtonHeight * 5;  // Increase this when any other elements are added that would increase the overall height
    this.inactive_tab_bg_color = Dash.Color.GetTransparent(this.color.Text, 0.05);

    this.PrimitiveTypes = [
        "text",
        "image"
        // Add to this list as support for more primitives are added
    ];

    this.setup_styles = function () {
        this.layout = new Dash.Layout.Tabs.Top(this);

        this.layout.OnTabChanged(this.on_tab_changed);
        // this.layout.AlwaysStartOnFirstTab();  // TODO?

        this.html = this.layout.html;

        this.html.css({
            "background": "none",
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "box-sizing": "border-box",
            "border-top": "1px solid " + this.color.StrokeLight,
            "border-bottom": "1px solid " + this.color.StrokeLight
        });

        this.add_header();
        this.add_new_box();
        this.add_edit_box();
        this.set_header_right_margin();
    };

    this.InputInFocus = function () {
        var tab = this.layout.all_content[this.layout.GetCurrentIndex()]["content_div_html_class"];

        if (tab.hasOwnProperty("InputInFocus")) {
            return tab.InputInFocus();
        }

        return false;
    };

    this.SwitchToEditTab = function () {
        this.layout.LoadIndex(this.edit_tab_index);
    };

    this.SwitchToNewTab = function () {
        this.layout.LoadIndex(this.new_tab_index);
    };

    this.UpdateComboOptions = function () {
        if (!this.last_instantiated_class) {
            return;
        }

        if (this.layout.GetCurrentIndex() === this.edit_tab_index) {
            this.last_instantiated_class.UpdateFontComboOptions();
        }

        else if (this.layout.GetCurrentIndex() === this.new_tab_index) {
            this.last_instantiated_class.UpdateImportComboOptions();
        }
    };

    this.GetCombo = function (label_text, options, callback, default_value="") {
        var tool_row = new Dash.Gui.ToolRow(this);

        tool_row.html.css({
            "margin-left": 0,
            "margin-bottom": Dash.Size.Padding
        });

        (function (self) {
            tool_row.AddComboRow(
                label_text,
                options,
                default_value,
                callback,
                {},
                {"read_only": !self.can_edit}
            );
        })(this);

        return tool_row;
    };

    this.add_edit_box = function () {
        this.layout.Prepend("Edit", function () {
            return new DashGuiContext2DEditorPanelContentEdit(this);
        });

        this.edit_tab_index = this.layout.all_content.length - 1;
    };

    this.add_new_box = function () {
        this.layout.Prepend("New", function () {
            return new DashGuiContext2DEditorPanelContentNew(this);
        });

        this.new_tab_index = this.layout.all_content.length - 1;
    };

    this.add_header = function () {
        this.header = new Dash.Gui.Header("Content");

        this.header.ReplaceBorderWithIcon("pencil_paintbrush");

        this.header.html.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "margin-left": Dash.Size.Padding * 0.5,
            "margin-top": Dash.Size.Padding * 0.5,
            "padding-bottom": Dash.Size.Padding * 0.4,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "flex": 2
        });

        this.header.label.css({
            "padding-left": Dash.Size.Padding * 0.5
        });

        this.layout.AppendHTML(this.header.html);
    };

    this.on_tab_changed = function (selected_content_data, instantiated_class=null) {
        this.set_inactive_tabs_bg_color(selected_content_data);

        this.last_instantiated_class = instantiated_class;
    };

    this.set_header_right_margin = function () {
        var tabs_width = 0;

        for (var content_data of this.layout.all_content) {
            var width = content_data["button"].html.width();

            if (!width) {
                (function (self) {
                    setTimeout(
                        function () {
                            self.set_header_right_margin();
                        },
                        100
                    );
                })(this);

                return;
            }

            tabs_width += width;
        }

        this.header.html.css({
            "margin-right": tabs_width + (Dash.Size.Padding * (this.layout.all_content.length)) + (Dash.Size.Padding * 0.5)
        });
    };

    this.set_inactive_tabs_bg_color = function (selected_content_data) {
        for (var content_data of this.layout.all_content) {
            if (selected_content_data["button"] === content_data["button"]) {
                continue;
            }

            content_data["button"].html.css({
                "background": this.inactive_tab_bg_color
            });
        }
    };

    this.setup_styles();
}
