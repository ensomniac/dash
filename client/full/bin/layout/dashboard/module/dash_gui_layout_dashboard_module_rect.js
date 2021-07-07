/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleRect () {
    this.styles = ["list"];
    this.list_data = null;
    this.list_rows = null;

    this.setup_styles = function () {
        this.html.css({
            "margin": this.padding,
            "aspect-ratio": "2 / 1"
        });

        if (this.sub_style === "list") {
            this.setup_list_style();
        }
    };

    this.setup_list_style = function () {
        this.list_data = {
            "SetListData() - Key1": "Value1",
            "SetListData() - Key2": "Value2",
            "SetListData() - Key3": "Value3",
        };

        this.setup_list_rows();
    };

    this.setup_list_rows = function () {
        if (!this.list_data) {
            console.log("ERROR: No list data for Rect List Module - use SetListData()");

            return;
        }

        this.list_rows = [];

        for (var key in this.list_data) {
            if (this.list_rows.length >= 3) {
                console.log("WARNING: Rect List Module will only display 3 key/value pairs from list data");

                break;
            }

            this.list_rows.push(this.get_list_row(key, this.list_data[key]));
        }

        this.redraw();
    };

    this.redraw = function () {
        this.html.empty();

        this.add_header();

        for (var i in this.list_rows) {
            this.html.append(this.list_rows[i]);
        }
    };

    this.get_list_row = function (key, value) {
        var list_row = $("<div></div>");

        list_row.css({
            "display": "flex"
        });

        var dot_icon = new Dash.Gui.Icon(
            this.color,
            "circle_dot",
            Dash.Size.ButtonHeight,
            0.5,
        );

        dot_icon.icon_html.css({
            "color": this.primary_color
        });

        var key_text = $("<div>" + key + "</div>");
        var value_text = $("<div>" + value + "</div>");

        var text_css = {
            ...this.text_css,
            "color": this.primary_color
        };

        key_text.css(text_css);
        value_text.css(text_css);

        list_row.append(dot_icon.html);
        list_row.append(key_text);
        list_row.append(Dash.Gui.GetFlexSpacer());
        list_row.append(value_text);

        return list_row;
    };

    // Expects dict with key/value pairs (value should be a string), where the key
    // displays on the left side of the list, and value displays on the right side
    this.SetListData = function (data) {
        if (this.sub_style !== "list") {
            console.log("ERROR: SetListData() only applies to Rect-List Modules");

            return;
        }

        this.list_data = data;
    };
}
