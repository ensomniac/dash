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

    this.AddCombo = function (label_text, combo_options, binder, callback, width=null, data_key="", can_edit=true, css=null, header_css=null) {
        this.AddColumn(
            label_text,
            data_key,
            can_edit,
            width,
            {
                "type": "combo",
                "options": {
                    "label_text": label_text,
                    "callback": callback,
                    "binder": binder,
                    "combo_options": combo_options
                },
                "css": css,
                "header_css": header_css
            }
        );
    };

    this.AddIconButton = function (display_name, icon_name, binder, callback, size_mult=1.0, width=null, data_key="", can_edit=true, css=null, header_css=null) {
        this.AddColumn(
            display_name,
            data_key,
            can_edit,
            width,
            {
                "type": "icon_button",
                "options": {
                    "icon_name": icon_name,
                    "callback": callback,
                    "binder": binder,
                    "color": binder.color || Dash.Color.Light,
                    "options": {
                        "size_mult": size_mult
                    }
                },
                "css": css,
                "header_css": header_css
            }
        );
    };

    this.AddInput = function (label_text, binder, callback, width=null, data_key="", can_edit=true, css=null, header_css=null) {
        this.AddColumn(
            label_text,
            data_key,
            can_edit,
            width,
            {
                "type": "input",
                "options": {
                    "placeholder_label": label_text,
                    "callback" : callback,
                    "binder": binder,
                    "color": binder.color || Dash.Color.Light
                },
                "css": css,
                "header_css": header_css
            }
        );
    };
}
