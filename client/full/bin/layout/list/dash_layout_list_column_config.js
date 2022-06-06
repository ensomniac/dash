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

    this.AddCombo = function (label_text, combo_options, binder, callback, data_key="", width_mult=1, css={}, header_css={}) {
        this.AddColumn(
            label_text,
            data_key,
            true,
            !width_mult ? null : Dash.Size.ColumnWidth * width_mult,
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

    this.AddIconButton = function (icon_name, binder, callback, hover_text="", size_mult=1, width_mult=0.25, css={}, header_css={}) {
        css["flex"] = "none";
        header_css["flex"] = "none";

        this.AddColumn(
            "",
            "",
            true,
            !width_mult ? null : Dash.Size.ColumnWidth * width_mult,
            {
                "type": "icon_button",
                "options": {
                    "icon_name": icon_name,
                    "callback": callback,
                    "binder": binder,
                    "color": binder.color || Dash.Color.Light,
                    "hover_text": hover_text,
                    "options": {
                        "size_mult": size_mult
                    }
                },
                "css": css,
                "header_css": header_css
            }
        );
    };

    this.AddInput = function (label_text, binder=null, callback=null, data_key="", width_mult=1, css={}, header_css={}, placeholder_label="") {
        this.AddColumn(
            label_text,
            data_key,
            true,
            !width_mult ? null : Dash.Size.ColumnWidth * width_mult,
            {
                "type": "input",
                "options": {
                    "placeholder_label": placeholder_label || label_text,
                    "callback" : callback,
                    "binder": binder,
                    "color": binder ? (binder.color || Dash.Color.Light) : Dash.Color.Light
                },
                "css": css,
                "header_css": header_css
            }
        );
    };

    // Abstraction to simplify AddColumn when just using a simple text value
    this.AddText = function (data_key, width_mult=1, label_text="", css={}, header_css={}) {
        css["flex"] = "none";
        header_css["flex"] = "none";

        this.AddColumn(
            label_text || data_key.Title(),
            data_key,
            false,
            Dash.Size.ColumnWidth * width_mult,
            {
                "css": css,
                "header_css": header_css
            }
        );
    };

    // Abstraction to simplify AddColumn when just using a flex text value
    this.AddFlexText = function (data_key, label_text="", min_width_mult=0.25, css={}, header_css={}) {
        var min_width = Dash.Size.ColumnWidth * min_width_mult;

        css["flex-grow"] = 2;
        css["flex-shrink"] = 2;
        css["min-width"] = min_width;

        header_css["flex-grow"] = 2;
        header_css["flex-shrink"] = 2;
        header_css["min-width"] = min_width;

        this.AddColumn(
            label_text || data_key.Title(),
            data_key,
            false,
            null,
            {
                "css": css,
                "header_css": header_css
            }
        );
    };
}
