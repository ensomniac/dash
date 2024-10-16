/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerGUI () {
    this.add_header = function () {
        this.header = new Dash.Gui.Header(this.header_text, this.color);

        this.header.ReplaceBorderWithIcon("paperclip").AddShadow();

        this.header.html.css({
            "margin-bottom": 0
        });

        this.html.append(this.header.html);
    };

    this.add_subheader = function () {
        this.subheader = new Dash.Gui.Header("...", this.color);

        this.subheader.border.remove();

        this.subheader.html.css({
            "opacity": 0.6,
            "position": "absolute",
            "right": Dash.Size.Padding * 1.1,
            "top": Dash.Size.Padding * 4,
            "z-index": 10000,
            ...this.subheader_styling
        });

        this.subheader.label.css({
            "font-family": "sans_serif_italic"
        });

        this.html.append(this.subheader.html);
    };

    this.add_tool_row = function () {
        if (this.print_mode) {
            return;
        }

        this.tool_row = new Dash.Gui.ToolRow(this, null, null, this.color);

        this.add_combo_to_tool_row(
            "Sort By:",
            [
                {"id": "most_recent", "label_text": "Most Recent"},
                {"id": "alphabetical", "label_text": "Alphabetical"}
            ],
            this.on_sort_changed
        );

        if (this.supports_folders) {
            this.add_combo_to_tool_row(
                "Folders Display:",
                [
                    {"id": "top", "label_text": "Top"},
                    {"id": "bottom", "label_text": "Bottom"}
                ],
                this.on_folder_display_changed
            );
        }

        this.tool_row.html.css({
            "position": "absolute",
            "right": Dash.Size.Padding * 4.25,
            "top": Dash.Size.Padding,
            "border-bottom": "none"
        });

        this.html.append(this.tool_row.html);
    };

    this.add_combo_to_tool_row = function (label_text, combo_options, callback) {
        this.tool_row.AddLabel(label_text, null, null, null, false);

        var combo = this.tool_row.AddCombo(combo_options, combo_options[0], callback);

        combo.html.css({
            "margin-right": 0,
            "margin-top": -Dash.Size.Padding * 0.151,
            "border": "1px dotted " + Dash.Color.GetTransparent(this.color.Text, 0.25)
        });

        combo.label.css({
            "margin-left": Dash.Size.Padding * 0.5
        });
    };

    this.add_upload_button = function () {
        this.upload_button = Dash.Gui.GetTopRightIconButton(this, this.on_file_uploaded, "upload_file");

        this.upload_button.SetFileUploader(
            this.api,
            this.upload_button_params,
            this.on_file_upload_started
        );

        this.upload_button.html.css({
            "margin-right": Dash.Size.Padding * 0.1,
            "margin-top": Dash.Size.Padding * 0.25
        });

        this.upload_button.SetIconSize(150).SetHoverHint("Upload File").AddHighlight();

        this.html.append(this.upload_button.html);
    };

    this.add_row = function (row_id) {
        var row = this.list.AddRow(row_id);

        row.html.css({
            "margin-left": Dash.Size.Padding * 2,
            "border-bottom": "1px dotted " + this.color.PinstripeDark
        });

        row.Update();

        this.rows[row_id] = row;

        return row;
    };

    this.add_sublist = function (row_id, list) {
        var row = list.AddSubList(row_id, this.color.Pinstripe, true);

        row.html.css({
            "border-bottom": "1px dotted " + this.color.PinstripeDark
        });

        if (list === this.list) {
            row.html.css({
                "margin-left": Dash.Size.Padding * 2
            });
        }

        this.rows[row_id] = row;

        return row;
    };

    this.draw_subfolders = function () {
        if (!this.supports_folders) {
            return;
        }

        for (var file_id in this.files_data["data"]) {
            var parents = this.get_file_data(file_id)["parent_folders"];

            if (!Dash.Validate.Object(parents)) {
                continue;
            }

            var list = this.list;

            for (var i in parents) {
                var folder_name = parents[i];
                var row = list.GetRow(folder_name, true);

                if (!row) {
                    row = this.add_sublist(folder_name, list);
                }

                if (parseInt(i) === (parents.length - 1)) {
                    row.AddToSublistQueue(file_id, {"border-bottom": "1px dotted " + this.color.PinstripeDark});
                }

                list = row.GetCachedPreview();
            }
        }
    };

    this.get_column_config = function (force=false) {
        if (!force && this.column_config) {
            return this.column_config;
        }

        var border_css = {"background": this.color.Pinstripe};
        var column_config = new Dash.Layout.List.ColumnConfig();

        column_config.AddFlexText("filename");
        column_config.AddSpacer(true);

        if (this.include_uploaded_keys_columns || this.include_modified_keys_columns || this.buttons.length) {
            column_config.AddDivider(border_css);
        }

        if (this.include_modified_keys_columns) {
            column_config.AddText("modified_by", 0.7);
            column_config.AddDivider(border_css);
            column_config.AddText("modified_on", 0.95);
            column_config.AddDivider(border_css);
        }

        if (this.include_uploaded_keys_columns) {
            column_config.AddText("uploaded_by", 0.7);
            column_config.AddDivider(border_css);
            column_config.AddText("uploaded_on", 0.95);
            column_config.AddDivider(border_css);
        }

        if (this.print_mode) {
            if (column_config.columns.Last()["type"] === "divider") {
                column_config.columns.Pop();
            }
        }

        else {
            for (var button_config of this.buttons) {
                column_config.AddIconButton(
                    button_config["icon_name"],
                    this,
                    button_config["callback"],
                    button_config["hover_preview"] || button_config["config_name"] || "",
                    0.85,
                    0.15,
                    {
                        "margin-left": Dash.Size.Padding,
                        "margin-right": button_config["right_margin"],
                        "margin-top": Dash.Size.Padding * 0.15,
                        "flex": "none"
                    }
                );
            }
        }

        this.column_config = column_config;

        return column_config;
    };

    this.add_list = function () {
        this.list = new Dash.Layout.List(this, this.on_row_selected, this.get_column_config(), this.color);

        this.list.DisableDividerColorChangeOnHover();

        if (this.include_list_header_row) {
            this.list.AddHeaderRow(
                {
                    "margin-left": Dash.Size.Padding * 2,
                    "border-top-left-radius": Dash.Size.BorderRadius,
                    "border-top-right-radius": Dash.Size.BorderRadius
                },
                {
                    "background": this.color.Pinstripe,
                    "border-top-left-radius": Dash.Size.BorderRadius,
                    "border-top-right-radius": Dash.Size.BorderRadius
                }
            );
        }

        this.list.html.css({
            "margin-top": Dash.Size.Padding
        });

        this.html.append(this.list.html);
    };
}
