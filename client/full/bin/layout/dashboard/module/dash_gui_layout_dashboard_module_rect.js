/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleRect () {
    this.styles = ["list"];
    this.list_rows = [];
    this.list_data = [];

    // Expects list of dicts with a single key/value pair (value should be a string), where
    // the key displays on the left side of the list, and value displays on the right side
    this.SetListData = function (data_list) {
        if (this.sub_style !== "list") {
            console.error("Error: SetListData() only applies to Rect-List Modules");

            return;
        }

        if (!Array.isArray(data_list)) {
            console.error("Error: SetListData() requires a list of dicts to be passed in");

            return;
        }

        this.list_data = data_list;

        this.redraw_list_rows();
    };

    this.setup_styles = function () {
        this.html.css({
            "aspect-ratio": this.rect_aspect_ratio
        });

        if (this.sub_style === "list") {
            this.setup_list_style();
        }
    };

    this.setup_list_style = function () {
        // Only draw the default placeholder view if it hasn't been set after the first second
        (function (self) {
            setTimeout(
                function () {
                    if (self.list_rows.length < 1) {
                        self.redraw_list_rows();
                    }
                },
                1000
            );
        })(this);
    };

    this.get_list_rows = function () {
        this.list_rows = [];

        if (this.list_data.length < 1) {
            this.list_data = [
                {"-": "--"},
                {"--": "--"},
                {"---": "--"},
            ];
        }

        for (var i in this.list_data) {
            if (this.list_rows.length >= 3) {
                console.warn("Warning: Rect List Module will only display 3 key/value pairs from list data");

                break;
            }

            var data = this.list_data[i];

            if (!Dash.Validate.Object(data)) {
                console.error("Error: Rect List Module data expects a list of dicts");

                return;
            }

            var key = Object.keys(data)[0];

            this.list_rows.push(this.get_list_row(key, data[key]));
        }
    };

    this.redraw_list_rows = function () {
        this.get_list_rows();

        this.html.empty();

        this.add_header();

        for (var i in this.list_rows) {
            this.html.append(this.list_rows[i]);

            this.list_rows[i].stop().animate({"opacity": 1}, 1000);
        }
    };

    this.get_list_row = function (key, value) {
        var list_row = $("<div></div>");
        var content = $("<div></div>");
        var key_text = $("<div>" + key + "</div>");
        var value_text = $("<div>" + value + "</div>");

        list_row.css({
            "width": "98%",
            "margin-top": "3%",
            "margin-bottom": "3%",
            "opacity": 0,  // For animation
            "height": "2.75vh"  // TEMP
        });

        content.css({
            "display": "flex",
            "height": "2.75vh"  // TEMP
        });

        key_text.css({
            ...this.text_css,
            "color": this.primary_color,
            "font-size": "1.5vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "width": "17vh",  // TEMP
            "line-height": "2.75vh"  // TEMP
        });

        value_text.css({
            ...this.text_css,
            "color": this.primary_color,
            "text-align": "right",
            "font-size": "2.25vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "width": "4vh",  // TEMP
            "line-height": "2.75vh"  // TEMP
        });

        content.append(this.get_dot_icon().html);
        content.append(key_text);
        content.append(Dash.Gui.GetFlexSpacer());
        content.append(value_text);

        list_row.append(content);
        list_row.append(this.get_divider_line());

        return list_row;
    };

    this.get_dot_icon = function () {
        var dot_icon = new Dash.Gui.Icon(
            this.color,
            "circle_dot",
            Dash.Size.ButtonHeight
        );

        dot_icon.icon_html.css({
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "color": this.primary_color,
            "font-size": "1.25vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "line-height": "2.75vh"  // TEMP
        });

        return dot_icon;
    };

    this.get_divider_line = function () {
        var line = $("<div></div>");

        line.css({
            "background": this.secondary_color,
            "height": "0.1vh"  // TEMP
        });

        return line;
    };
}
