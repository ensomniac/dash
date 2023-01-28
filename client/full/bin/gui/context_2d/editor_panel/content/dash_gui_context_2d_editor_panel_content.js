function DashGuiContext2DEditorPanelContent (panel) {
    this.panel = panel;

    this.html = null;
    this.header = null;
    this.layout = null;
    this.new_box = null;
    this.edit_box = null;
    this.edit_tab_index = null;
    this.color = this.panel.color;
    this.can_edit = this.panel.can_edit;  // TODO: propagate
    this.min_height = Dash.Size.ButtonHeight * 10;  // TODO?

    this.PrimitiveTypes = [
        "text",
        "image"
        // Add to this list as support for more primitives are added
    ];

    this.setup_styles = function () {
        this.layout = new Dash.Layout.Tabs.Top(this);

        this.layout.OnTabChanged(this.on_tab_changed);
        this.layout.AlwaysStartOnFirstTab();

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

    this.add_edit_box = function () {
        this.edit_box = new DashGuiContext2DEditorPanelContentEdit(this);

        this.layout.Prepend("Edit", this.edit_box);

        this.edit_tab_index = this.layout.all_content.length - 1;
    };

    this.add_new_box = function () {
        this.new_box = new DashGuiContext2DEditorPanelContentNew(this);

        this.layout.Prepend("New", this.new_box);
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

        this.layout.AppendHTML(this.header.html);
    };

    this.on_tab_changed = function (selected_content_data) {
        this.remove_tab_backgrounds(selected_content_data);

        if (selected_content_data["content_div_html_class"] === this.edit_box) {
            this.edit_box.Redraw();
        }
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
            "margin-right": tabs_width + (Dash.Size.Padding * (this.layout.all_content.length + 1))
        });
    };

    this.remove_tab_backgrounds = function (selected_content_data) {
        for (var content_data of this.layout.all_content) {
            if (selected_content_data["button"] === content_data["button"]) {
                continue;
            }

            content_data["button"].html.css({
                "background": "none"
            });
        }
    };

    this.setup_styles();
}
