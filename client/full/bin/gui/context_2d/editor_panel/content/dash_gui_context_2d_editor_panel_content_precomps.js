function DashGuiContext2DEditorPanelContentPreComps (content) {
    this.content = content;

    this.rows = [];
    this.html = $("<div></div>");
    this.color = this.content.color;
    this.panel = this.content.panel;
    this.editor = this.panel.editor;
    this.can_edit = this.content.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "overflow-x": "hidden"
        });

        this.redraw_rows();
    };

    this.InputInFocus = function () {
        for (var row of this.rows) {
            if (row["input"].InFocus()) {
                return true;
            }
        }

        return false;
    };

    this.redraw_rows = function () {
        this.html.empty();

        this.rows = [];

        for (var num of Dash.Math.Range(7)) {  // As of writing, 7 is max
            this.draw_row(num);
        }
    };

    this.draw_row = function (num) {
        var row = {};

        row["toolbar"] = new Dash.Layout.Toolbar(this);

        row["toolbar"].DisablePaddingRefactoring();
        row["toolbar"].RemoveStrokeSep();

        row["toolbar"].html.css({
            "background": "",
            "padding": 0,
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        var on_input_changed = (function (self) {
            return function (value) {
                self.set_data("display_name", value, num);
            };
        })(this);

        row["input"] = row["toolbar"].AddInput(
            "Pre-Comp #" + (num + 1),
            on_input_changed,
            {
                "on_enter": on_input_changed,
                "on_autosave": on_input_changed
            },
            {},
            false
        );

        if (this.get_data()["display_name"]) {
            row["input"].SetText(this.get_data()["display_name"]);
        }

        row["input"].html.css({
            "box-shadow": "none",
            "flex": 2,
            "border": "1px solid " + this.color.Stroke
        });

        // This is broken by default somehow, doing this workaround for now
        row["input"].input.css({
            "color": this.color.Text
        });

        row["color_picker"] = (function (self) {
            return Dash.Gui.GetColorPicker(
                self,
                function (color_val) {
                    if (!color_val) {
                        return;
                    }

                    self.set_data("color", color_val, num);
                },
                "",
                self.color,
                self.get_data()["color"] || "#000000",
                true,
                function () {
                    self.set_data("color", "", num);
                }
            );
        })(this);


        row["toolbar"].AddHTML(row["color_picker"].html);

        this.rows.push(row);

        this.html.append(row["toolbar"].html);
    };

    this.get_data = function () {
        return {};  // TODO
    };

    this.set_data = function (key, value, num) {
        if (this.get_data()[key] === value) {
            return;
        }

        console.debug("TEST set data", key, value, num);
        // TODO
    };

    this.setup_styles();
}
