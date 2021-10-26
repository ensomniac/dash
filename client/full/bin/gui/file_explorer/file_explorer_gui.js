/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerGUI () {
    this.add_header = function () {
        var header = new Dash.Gui.Header("Files", this.color);

        header.ReplaceBorderWithIcon("paperclip");
        header.icon.AddShadow();

        header.html.css({
            "margin-bottom": 0
        });

        this.html.append(header.html);
    };

    this.add_subheader = function () {
        this.subheader = new Dash.Gui.Header("...", this.color);

        this.subheader.border.remove();

        this.subheader.html.css({
            "opacity": 0.6,
            "position": "absolute",
            "right": Dash.Size.Padding * 4,
            "top": Dash.Size.Padding
        });

        this.subheader.label.css({
            "font-family": "sans_serif_italic"
        });

        this.html.append(this.subheader.html);
    };

    this.add_upload_button = function () {
        this.upload_button = Dash.Gui.GetTopRightIconButton(this, this.on_file_uploaded, "upload_file");

        this.upload_button.SetFileUploader(
            this.api,
            {
                "f": "upload_file",
                "parent_obj_id": this.parent_obj_id
            },
            this.on_file_upload_started
        );

        this.upload_button.html.css({
            "margin-right": Dash.Size.Padding * 0.1,
            "margin-top": Dash.Size.Padding * 0.25
        });

        this.upload_button.SetIconSize(150);
        this.upload_button.SetHoverHint("Upload File");

        this.html.append(this.upload_button.html);
    };

    this.add_row = function (row_id) {
        var row = this.list.AddRow(row_id);

        row.html.css({
            "margin-left": Dash.Size.Padding * 2,
            "border-bottom": "1px dotted rgba(0, 0, 0, 0.2)"
        });

        row.Update();

        this.rows[row_id] = row;

        return row;
    };

    this.add_sublist = function (row_id, list) {
        var row = list.AddSubList(row_id, this.border_color, true);

        row.html.css({
            "border-bottom": "1px dotted rgba(0, 0, 0, 0.2)"
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
        for (var file_id in this.files_data["data"]) {
            var parents = this.get_file_data(file_id)["parent_folders"];

            if (!Dash.IsValidObject(parents)) {
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
                    row.AddToSublistQueue(file_id, {"border-bottom": "1px dotted rgba(0, 0, 0, 0.2)"});
                }

                list = row.GetCachedPreview();
            }
        }
    };

    this.add_list = function () {
        var column_config = new Dash.Gui.Layout.List.ColumnConfig();
        var border_css = {"background": this.border_color};

        column_config.AddColumn(
            "Filename",
            "filename",
            false,
            null,
            {"css": {"flex-grow": 2, "flex-shrink": 2}}
        );


        column_config.AddSpacer(true);
        column_config.AddDivider(border_css);

        column_config.AddColumn(
            "Uploaded By",
            "uploaded_by",
            false,
            Dash.Size.ColumnWidth * 0.7,
            {"css": {"flex": "none"}}
        );

        column_config.AddDivider(border_css);

        column_config.AddColumn(
            "Uploaded On",
            "uploaded_on",
            false,
            Dash.Size.ColumnWidth * 0.95,
            {"css": {"flex": "none"}}
        );

        column_config.AddDivider(border_css);

        for (var key in this.buttons) {
            var name = key.Title();

            column_config.AddColumn(
                name,
                "",
                false,
                Dash.Size.ColumnWidth * 0.15,
                {
                    "type": "icon_button",
                    "options": {
                        "icon_name": this.buttons[key]["icon_name"],
                        "callback": this.buttons[key]["callback"],
                        "binder": this,
                        "color": this.color,
                        "hover_text": this.buttons[key]["hover_preview"] || name,
                        "options": {
                            "size_mult": 0.85
                        }
                    },
                    "css": {
                        "margin-left": Dash.Size.Padding,
                        "margin-right": this.buttons[key]["right_margin"],
                        "margin-top": Dash.Size.Padding * 0.15,
                        "flex": "none"
                    }
                }
            );
        }

        this.list = new Dash.Gui.Layout.List(this, this.on_row_selected, column_config);

        this.list.AddHeaderRow(
            {"margin-left": Dash.Size.Padding * 2},
            border_css
        );

        this.list.html.css({
            "margin-top": Dash.Size.Padding
        });

        this.html.append(this.list.html);
    };
}