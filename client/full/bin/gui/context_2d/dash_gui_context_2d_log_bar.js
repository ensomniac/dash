function DashGuiContext2DLogBar (editor) {
    this.editor = editor;

    this.list = null;
    this.messages = [];
    this.min_height = null;
    this.html = $("<div></div>");
    this.color = this.editor.color;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    // This won't be super useful at first, but lays the groundwork for a history/undo system that can come later

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "box-sizing": "border-box",
            "background": this.color.Stroke,
            "border-top": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 0.5
        });

        this.add_list();
    };

    this.Add = function (message) {
        this.messages.push(message);

        this.list.AddRow(this.messages.length, true);
        this.list.ScrollToBottom();
    };

    this.add_list = function () {
        this.list = new Dash.Layout.RevolvingList(this, this.get_column_config(), this.color, false);

        this.list.DisableRowEvents();

        this.min_height = this.list.full_row_height + 1;

        this.html.append(this.list.html);
    };

    this.get_column_config = function () {
        var config = new Dash.Layout.List.ColumnConfig();

        config.AddFlexText(
            "message",
            "",
            0.25,
            {"color": this.opposite_color.Stroke}
        );

        return config;
    };

    this.GetDataForKey = function (row_id) {
        return this.messages[row_id - 1];
    };

    this.setup_styles();
}
