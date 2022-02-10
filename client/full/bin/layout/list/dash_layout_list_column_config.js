function DashLayoutListColumnConfig () {
    this.columns = [];

    this.AddColumn = function (display_name, data_key, can_edit, width, options) {
        if (typeof can_edit !== "boolean") {
            can_edit = true;
        }

        var column_details = {
            "width": width,
            "data_key": data_key,
            "can_edit": can_edit,
            "display_name": display_name,
            "type": options && options["type"] ? options["type"] : "",
            "css": options && options["css"] ? options["css"] : null,
            "header_css": options && options["header_css"] ? options["header_css"] : null,
            "options": options && options["options"] ? options["options"] : {},
            "on_click_callback": options && options["on_click_callback"] ? options["on_click_callback"] : null
        };

        this.columns.push(column_details);
    };

    this.AddSpacer = function (header_only=false) {
        this.columns.push({
            "type": "spacer",
            "header_only": header_only
        });
    };

    this.AddDivider = function (css=null) {
        this.columns.push({
            "type": "divider",
            "css": css
        });
    };
}