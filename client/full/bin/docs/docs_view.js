function DashDocsView (package_id, ext, color_options={}) {
    this.package_id = package_id;
    this.ext = ext;

    this.is_py = this.ext === "py";
    this.is_js = this.ext === "js";

    if (!this.is_py && !this.is_js) {
        console.error("Invalid extension for docs:", this.ext);

        this.html = $("<div>ERROR: See console</div>");

        return;
    }

    this.data = null;
    this.list = null;
    this.html = $("<div></div>");
    this.left = $("<div></div>");
    this.right = $("<div></div>");
    this.color = Dash.Color.Light;
    this.list_width = Dash.Size.ColumnWidth * 2;
    this.type_label_color = color_options["type"] || null;
    this.default_label_color = color_options["default"] || null;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "overflow": "hidden"
        });

        this.left.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "border-right": "1px solid " + this.color.Button.Background.Base,
            "border-top": "1px solid " + this.color.StrokeLight,
            "box-sizing": "border-box",
            "overflow-y": "auto",
            "width": this.list_width
        });

        this.right.css({
            "position": "absolute",
            "overflow-y": "auto",
            "right": 0,
            "top": 0,
            "bottom": 0,
            "left": this.list_width
        });

        this.html.append(this.left);
        this.html.append(this.right);

        this.get_documentation();
        this.add_list();
    };

    this.add_list = function () {
        if (!this.list) {
            this.list = new Dash.Layout.List(this, this.on_row_selected, this.get_column_config(), this.color, null, Dash.Size.RowHeight * 1.25);

            this.list.html.css({
                "position": "absolute",
                "inset": 0
            });

            this.list.AddHeaderRow(
                {},
                {"background": this.color.Pinstripe}
            );

            this.list.EnableActiveRowHighlighting();

            this.left.append(this.list.html);
        }

        if (this.data) {
            this.add_list_rows();
        }
    };

    this.add_list_rows = function (data=null, list=null, sublist_row=null) {
        if (!list) {
            list = this.list;
        }

        if (list === this.list) {
            list.Clear();
        }

        if (data === null) {
            data = this.data;
        }

        if (!Dash.Validate.Object(this.data)) {
            alert("Failed to get documentation data");

            return;
        }

        if (this.data["error"]) {
            alert("Failed to get documentation data, see console for error");

            console.error("Error:", this.data["error"]);

            return;
        }

        for (var name in data) {
            if (name.endsWith("." + this.ext)) {
                if (list === this.list) {
                    list.AddRow(name);
                }

                else if (sublist_row) {
                    sublist_row.AddToSublistQueue(name);
                }
            }

            else {
                var row = list.GetRow(name, true);

                if (!row) {
                    row = list.AddSubList(name, this.color.Pinstripe, true);

                    // This might break things if we start updating this list. As of writing, this list
                    // doesn't update once it's generated, but once search is implemented etc, it will.
                    // This line enabled the nested sublists to work, so removing it may also require more work.
                    row.DisableSublistClearOnUpdate();
                }

                this.add_list_rows(data[name], row.GetCachedPreview(), row);
            }
        }

        if (list === this.list) {
            list.Update();

            if (list.rows) {
                for (row of list.rows) {
                    if (!row.is_sublist) {
                        list.SetSelection(row);

                        break;
                    }
                }
            }
        }
    };

    this.on_row_selected = function (row_id, is_selected, row) {
        if (!is_selected) {
            return;
        }

        var parents = this.get_parent_folder_names(row).reverse();
        var data = this.get_data_by_parents(parents)[row_id];

        this.right.empty();
        this.right.append((new Dash.Docs.Box(this, row_id, data)).html);
    };

    this.get_data_by_parents = function (parents=[], data=null) {
        if (data === null) {
            data = this.data;
        }

        if (!parents.length) {
            return data;
        }

        var parent = parents.shift();

        return this.get_data_by_parents(parents, data[parent]);
    };

    // This needs to be reversed once the final result is received,
    // it just can't happen within this function since it's recursive
    this.get_parent_folder_names = function (row, parents=[]) {
        if (!row || !row.list || !row.list.parent_row || !row.list.parent_row.id) {
            return parents;
        }

        parents.push(row.list.parent_row.id.toString().replace(row.list.sublist_row_tag, ""));

        return this.get_parent_folder_names(row.list.parent_row, parents);
    };

    this.get_column_config = function () {
        var config = new Dash.Layout.List.ColumnConfig();

        config.AddFlexText("Documentation");  // Data key not required, but this will populate the header row

        return config;
    };

    this.get_documentation = function () {
        var params = {
            "f": "get",
            "package_id": this.package_id
        };

        // To properly authenticate the user's token across contexts
        if (Dash.Context["asset_path"] !== "dash_guide") {
            params["dash_context_auth_asset_path"] = Dash.Context["asset_path"];
        }

        if (this.is_py) {
            params["front_end"] = false;
        }

        else if (this.is_js) {
            params["back_end"] = false;
        }

        Dash.Request(this, this.on_documentation, "Documentation", params, "dash.guide");
    };

    this.on_documentation = function (response) {
        Dash.Log.Log("Documentation:", response);

        if (!Dash.Validate.Response(response)) {
            return;
        }

        if (this.is_py) {
            this.data = response["back_end"];
        }

        else if (this.is_js) {
            this.data = response["front_end"];
        }

        if (!Dash.Validate.Object(this.data)) {
            alert("Failed to get documentation data");

            return;
        }

        if (this.data["error"]) {
            alert("Failed to get documentation data, see console for error");

            console.error("Error:", this.data["error"]);

            return;
        }

        if (this.list) {
            this.add_list_rows();
        }
    };

    this.GetDataForKey = function (row_id) {
        return row_id.replace("." + this.ext, "");
    };

    this.setup_styles();
}
