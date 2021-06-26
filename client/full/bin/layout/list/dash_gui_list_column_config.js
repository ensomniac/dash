function DashGuiListColumnConfig () {
    this.columns = [];

    this.AddColumn = function (display_name, data_key, can_edit, width, options) {
        if (typeof can_edit != "boolean") {
            can_edit = true;
        }

        options = options || {};
        var optional_css = options["css"] || null;

        var column_details = {};
        column_details["type"] = options["type"] || "";
        column_details["display_name"] = display_name;
        column_details["data_key"] = data_key;
        column_details["can_edit"] = can_edit;
        column_details["width"] = width;
        column_details["css"] = optional_css;
        column_details["on_click_callback"] = options["on_click_callback"];
        column_details["options"] = options["options"] || {};

        this.columns.push(column_details);
    };

    this.AddSpacer = function () {
        this.columns.push({"type": "spacer"});
    };

    this.AddDivider = function () {
        this.columns.push({"type": "divider"});
    };
}
