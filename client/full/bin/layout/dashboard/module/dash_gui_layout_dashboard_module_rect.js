/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleRect () {
    this.styles = ["list"];
    this.list_rows = [];

    this.list_data = {
        "SetListData() - Key1": "Value1",
        "SetListData() - Key2": "Value2",
        "SetListData() - Key3": "Value3",
    };

    // TODO: Update all uses of VH

    this.setup_styles = function () {
        this.html.css({
            "aspect-ratio": "2 / 1"
        });

        if (this.sub_style === "list") {
            this.setup_list_style();
        }
    };

    this.setup_list_style = function () {
        if (!Dash.ValidateObject(this.list_data)) {
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

        this.redraw_list_rows();
    };

    this.redraw_list_rows = function () {
        this.html.empty();

        this.add_header();

        for (var i in this.list_rows) {
            this.html.append(this.list_rows[i]);
        }
    };

    this.get_list_row = function (key, value) {
        var list_row = $("<div></div>");
        var content = $("<div></div>");
        var line = $("<div></div>");
        var key_text = $("<div>" + key + "</div>");
        var value_text = $("<div>" + value + "</div>");

        var dot_icon = new Dash.Gui.Icon(
            this.color,
            "circle_dot",
            Dash.Size.ButtonHeight
        );

        list_row.css({
            "width": "95%",
            "margin-top": "3%",
            "margin-bottom": "3%",

            // TODO
            "height": "2.75vh"  // TEMP
        });

        content.css({
            "display": "flex",

            // TODO
            "height": "2.75vh"  // TEMP
        });

        dot_icon.icon_html.css({
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "color": this.primary_color,
            // "background": "red",

            // TODO
            "font-size": "1.25vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "line-height": "2.75vh"  // TEMP
        });

        key_text.css({
            ...this.text_css,
            "color": this.primary_color,
            // "background": "blue",

            // TODO
            "font-size": "1.5vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "line-height": "2.75vh"  // TEMP
        });

        value_text.css({
            ...this.text_css,
            "color": this.primary_color,
            // "background": "green",

            // TODO
            "font-size": "2.25vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "line-height": "2.75vh"  // TEMP
        });

        line.css({
            "background": this.secondary_color,

            // TODO
            "height": "0.1vh"  // TEMP
        });

        content.append(dot_icon.html);
        content.append(key_text);
        content.append(Dash.Gui.GetFlexSpacer());
        content.append(value_text);

        list_row.append(content);
        list_row.append(line);

        return list_row;
    };

    // Expects dict with key/value pairs (value should be a string), where the key
    // displays on the left side of the list, and value displays on the right side
    this.SetListData = function (data) {
        if (this.sub_style !== "list") {
            console.log("ERROR: SetListData() only applies to Rect-List Modules");

            return;
        }

        if (!Dash.ValidateObject(data)) {
            console.log("ERROR: SetListData() requires a dictionary to be passed in");

            return;
        }

        this.list_data = data;

        this.setup_list_style();
    };
}
