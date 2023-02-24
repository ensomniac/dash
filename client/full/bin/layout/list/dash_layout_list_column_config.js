function DashLayoutListColumnConfig () {
    this.columns = [];

    this.AddColumn = function (display_name, data_key, can_edit, width, options) {
        this.columns.push({
            "width": width,
            "data_key": data_key,
            "can_edit": typeof can_edit !== "boolean" ? true : can_edit,
            "display_name": display_name,
            "type": options && options["type"] ? options["type"] : "",
            "css": options && options["css"] ? options["css"] : null,
            "header_css": options && options["header_css"] ? options["header_css"] : null,
            "footer_css": options && options["footer_css"] ? options["footer_css"] : null,
            "options": options && options["options"] ? options["options"] : {},
            "on_click_callback": options && options["on_click_callback"] ? options["on_click_callback"] : null
        });
    };

    this.AddSpacer = function (header_only=false, footer_only=false) {
        if (this.columns.length && this.columns.Last()["type"] === "spacer") {
            return;
        }

        this.columns.push({
            "type": "spacer",
            "header_only": header_only,
            "footer_only": footer_only
        });
    };

    this.AddDivider = function (css=null, show_for_header=false, show_for_footer=false, header_css={}, footer_css={}) {
        this.columns.push({
            "type": "divider",
            "css": css,
            "header_css": header_css,
            "footer_css": footer_css,
            "show_for_header": show_for_header,
            "show_for_footer": show_for_footer
        });
    };

    // This has not yet been tested for support with header/footer rows
    this.AddLabel = function (text, css={}, header_css={}, footer_css={}) {
        this.AddColumn(
            text,
            "",
            false,
            null,
            {
                "type": "label",
                "css": css,
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };

    this.AddCombo = function (
        label_text, combo_options, binder, callback, data_key="", width_mult=null,
        css={}, header_css={}, is_user_list=false, multi_select=false, footer_css={}
    ) {
        this.AddColumn(
            label_text,
            data_key,
            true,
            width_mult ? Dash.Size.ColumnWidth * width_mult : null,
            {
                "type": "combo",
                "options": {
                    "label_text": label_text,
                    "callback": callback,
                    "binder": binder,
                    "combo_options": combo_options,
                    "is_user_list": is_user_list,
                    "multi_select": multi_select
                },
                "css": css,
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };

    this.AddIconButton = function (icon_name, binder, callback, hover_text="", size_mult=1, width_mult=0.25, css={}, header_css={}, footer_css={}) {
        css["flex"] = "none";
        header_css["flex"] = "none";
        footer_css["flex"] = "none";

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
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };

    this.AddCopyButton = function (binder, getter_cb, hover_text="Copy", width_mult=0.25, css={}, header_css={}, size_mult=0.8, icon_name="copy", footer_css={}) {
        css["flex"] = "none";
        header_css["flex"] = "none";
        footer_css["flex"] = "none";

        this.AddColumn(
            "",
            "",
            true,
            !width_mult ? null : Dash.Size.ColumnWidth * width_mult,
            {
                "type": "copy_button",
                "options": {
                    "binder": binder,
                    "getter_cb": getter_cb,
                    "size_mult": size_mult,
                    "icon_name": icon_name,
                    "color": binder.color || Dash.Color.Light,
                    "hover_text": hover_text
                },
                "css": css,
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };

    this.AddInput = function (
        label_text="", binder=null, callback=null, data_key="", width_mult=1, css={},
        header_css={}, placeholder_label="", default_value="", disable_autosave=false,
        can_edit=true, use_placeholder_label_for_header=true, footer_css={}
    ) {
        this.AddColumn(
            label_text,
            data_key,
            can_edit,
            !width_mult ? null : Dash.Size.ColumnWidth * width_mult,
            {
                "type": "input",
                "options": {
                    "placeholder_label": placeholder_label || label_text,
                    "use_placeholder_label_for_header": use_placeholder_label_for_header,
                    "callback" : callback,
                    "binder": binder,
                    "color": binder ? (binder.color || Dash.Color.Light) : Dash.Color.Light,
                    "default_value": default_value,
                    "disable_autosave": disable_autosave
                },
                "css": css,
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };

    // Abstraction to simplify AddColumn when just using a flex text value
    this.AddFlexText = function (data_key, label_text="", min_width_mult=0.25, css={}, header_css={}, footer_css={}) {
        var min_width = Dash.Size.ColumnWidth * min_width_mult;

        css["flex-grow"] = 2;
        css["flex-shrink"] = 2;
        css["min-width"] = min_width;

        header_css["flex-grow"] = 2;
        header_css["flex-shrink"] = 2;
        header_css["min-width"] = min_width;

        footer_css["flex-grow"] = 2;
        footer_css["flex-shrink"] = 2;
        footer_css["min-width"] = min_width;

        this.AddColumn(
            label_text || data_key.Title(),
            data_key,
            false,
            null,
            {
                "css": css,
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };

    // Abstraction to simplify AddColumn when just using a simple text value
    this.AddText = function (data_key, width_mult=1, label_text="", css={}, header_css={}, footer_css={}) {
        css["flex"] = "none";
        header_css["flex"] = "none";
        footer_css["flex"] = "none";

        this.AddColumn(
            label_text || data_key.Title(),
            data_key,
            false,
            Dash.Size.ColumnWidth * width_mult,
            {
                "css": css,
                "header_css": header_css,
                "footer_css": footer_css
            }
        );
    };
}
