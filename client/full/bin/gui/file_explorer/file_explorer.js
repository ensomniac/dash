/**
 * File Explorer box element.
 *
 * IMPORTANT NOTE:
 *     For consistency across Dash, this takes an API name and parent object ID, and uses predetermined names for function calls.
 *     For each context this is used in, make sure to add the correct function names to the respective API file as follows:
 *
 *         "get_files":         Get all files and return dict with data/order keys
 *         "upload_file":       Upload a file
 *         "delete_file":       Delete a file
 *         "set_file_property": Set a property for a file with provided key/value
 *
 * @param {DashColorSet} color - DashColorSet instance
 * @param {string} api - API name for requests
 * @param {string} parent_obj_id - Parent object ID where the file is stored (this will be included in requests as 'parent_obj_id')
 * @param {boolean} supports_desktop_client - Whether or not this context has a related desktop client app it should try to connect to
 */

function DashGuiFileExplorer (color, api, parent_obj_id, supports_desktop_client=false) {
    this.color = color || Dash.Color.Light;
    this.api = api;
    this.parent_obj_id = parent_obj_id;
    this.supports_desktop_client = supports_desktop_client;

    // Using the simpler/concise method (in docstring) for now - if we ever need full flexibility with
    // the requests in this module, revert back to the below system and re-enable this.validate_params
    //
    // this.params_get_all = params_get_all;
    // this.params_set_property = params_set_property;
    // this.params_upload = params_upload;
    // this.params_delete = params_delete;

    this.rows = {};
    this.list = null;
    this.buttons = null;
    this.subheader = null;
    this.files_data = null;
    this.initialized = false;
    this.upload_button = null;
    this.subfolder_structure = {};
    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);
    this.border_color = this.color.BackgroundTrue || this.color.Background;

    this.setup_styles = function () {
        // if (!this.validate_params()) {
        //     return;
        // }

        // this.buttons must be populated here so that the callbacks are not undefined
        this.buttons = {
            "view": {
                "icon_name": "link",
                "callback": this.view_file,
                "right_margin": -Dash.Size.Padding * 0.25,
                "hover_preview": this.supports_desktop_client ? "View locally in your computer's file explorer (requires LiveSync)" : "View file in browser"
            },
            "delete": {
                "icon_name": "trash",
                "callback": this.delete_file,
                "right_margin": -Dash.Size.Padding * 0.5
            },
            "download": {
                "icon_name": "download_file",
                "callback": this.download_file,
                "right_margin": -Dash.Size.Padding
            }
        };

        this.get_init_files_data();
        this.add_header();
        this.add_upload_button();

        this.initialized = true;
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

    this.add_header = function () {
        var header = new Dash.Gui.Header("Files", this.color);

        header.ReplaceBorderWithIcon("paperclip");
        header.icon.AddShadow();

        header.html.css({
            "margin-bottom": 0
        });

        this.html.append(header.html);
    };

    this.on_file_upload_started = function () {
        this.show_subheader("File upload in progress...");
        this.disable_load_buttons();
    };

    this.show_subheader = function (text="") {
        if (!this.subheader) {
            this.add_subheader();
        }

        else {
            this.subheader.html.show();
        }

        if (text) {
            this.subheader.SetText(text);
        }
    };

    this.hide_subheader = function () {
        if (!this.subheader) {
            return;
        }

        this.subheader.html.hide();
    };

    this.on_file_uploaded = function (data_key, additional_data, response) {
        if (!response || response["originalEvent"]) {
            return;
        }

        this.on_files_changed(response);
    };

    this.on_files_changed = function (response) {
        var error_context = "on_files_changed response (on upload/delete) was invalid.";

        if (!response["all_files"]) {
            console.log("Error:", error_context, "An 'all_files' key is required to update the list:", response);

            return;
        }

        if (!response["all_files"]["data"] || !response["all_files"]["order"]) {
            console.log("Error:", error_context, "Both 'data' and 'order' keys are required to update the list:", response);

            return;
        }

        if (!Dash.ValidateResponse(response)) {
            return;
        }

        this.files_data = response["all_files"];

        this.redraw_rows();
        this.hide_subheader();
        this.enable_load_buttons();
    };

    this.disable_load_buttons = function () {
        this.upload_button.Disable();

        if (this.list) {
            this.list.DisableColumn("icon_buttons", 1);
        }
    };

    this.enable_load_buttons = function () {
        this.upload_button.Enable();

        if (this.list) {
            this.list.EnableColumn("icon_buttons", 1);
        }
    };

    this.delete_file = function (file_id) {
        if (!window.confirm("Are you sure you want to delete this file?")) {
            return;
        }

        this.show_subheader("File deletion in progress...");
        this.disable_load_buttons();

        Dash.Request(
            this,
            this.on_files_changed,
            this.api,
            {
                "f": "delete_file",
                "parent_obj_id": this.parent_obj_id,
                "file_id": file_id
            }
        );
    };

    this.download_file = function (file_id) {
        var file_data = this.get_file_data(file_id);

        Dash.Gui.OpenFileURLDownloadDialog(
            this.get_file_url(file_data),
            this.get_filename(file_data)
        );
    };

    this.get_filename = function (file_data) {
        return file_data["filename"] || file_data["orig_filename"] || "";
    };

    this.get_file_url = function (file_data) {
        return file_data["url"] || file_data["orig_url"] || "";
    };

    this.view_file = function (file_id) {
        if (this.supports_desktop_client) {
            var live_sync_active = false;  // TODO: Check if live sync is active/enabled

            if (live_sync_active) {
                // TODO: Show the file in the user's computer's local file system
            }

            else {
                // TODO: Remove "(coming soon)" and instead, mention how to enable it
                if (!window.confirm(
                    "Opening this file in your computer's local file system requires LiveSync to be enabled " +
                    "(coming soon).\n\nWould you like to open a new browser tab to view/download the file?"
                )) {
                    return;
                }

                this.open_file_in_browser_tab(file_id);
            }
        }

        else {
            this.open_file_in_browser_tab(file_id);
        }
    };

    this.open_file_in_browser_tab = function (file_id) {
        window.open(this.get_file_url(this.get_file_data(file_id)), "_blank");
    };

    this.redraw_rows = function () {
        this.rows = {};

        if (this.list) {
            this.list.Clear();
        }

        else {
            if (this.files_data["order"].length < 1) {
                return;
            }

            this.add_list();
        }

        this.draw_subfolders();

        // Draw files that don't live in subfolders
        this.files_data["order"].forEach(
            function (file_id) {
                if (!Dash.IsValidObject(this.get_file_data(file_id)["parent_folders"])) {
                    this.add_row(file_id);
                }
            },
            this
        );
    };

    // TODO: bug - expand sublist, collapse, then expand again and now highlighting/clicking isn't working

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

    // Should be able to get rid of this now that draw_subfolders took its place

    // this.add_folders_to_structure = function (root, folders) {
    //     if (!folders.length) {
    //         return root;
    //     }
    //
    //     var current_folder_name = folders[0];
    //
    //     root[current_folder_name] = root[current_folder_name] || {};
    //
    //     return this.add_folders_to_structure(root[current_folder_name], folders.slice(1));
    // };
    //
    // this.get_subfolder_structure = function () {
    //     var structures = [];
    //
    //     for (var file_id in this.files_data["data"]) {
    //         var parents = this.get_file_data(file_id)["parent_folders"];
    //
    //         if (!Dash.IsValidObject(parents)) {
    //             continue;
    //         }
    //
    //         structures.push(parents);
    //     }
    //
    //     (function (self) {
    //         self.subfolder_structure = structures.reduce(
    //             function (root, folders) {
    //                 self.add_folders_to_structure(root, folders);
    //
    //                 return root;
    //             },
    //             {}
    //         );
    //     })(this);
    // };

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

    this.get_init_files_data = function () {
        Dash.Request(
            this,
            this.on_init_files_data,
            this.api,
            {
                "f": "get_files",
                "parent_obj_id": this.parent_obj_id
            }
        );
    };

    this.on_init_files_data = function (response) {
        if (!Dash.ValidateResponse(response)) {
            return;
        }

        if (!response["data"] || !response["order"]) {
            console.log("Error: Get files data response was invalid. Both 'data' and 'order' keys are required to update the list:", response);

            return;
        }

        if (!this.initialized) {
            (function (self, response) {
                setTimeout(
                    function () {
                        self.on_init_files_data(response);
                    },
                    250
                );
            })(this, response);

            return;
        }

        console.log("(File Explorer) Init files data:", response);

        this.files_data = response;

        this.redraw_rows();
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

    this.on_row_selected = function (file_id, is_selected, row) {
        if (!row) {
            row = this.list.GetRow(file_id);
        }

        if (!is_selected) {
            row.Collapse();

            return;
        }

        var preview = new Dash.Gui.FileExplorer.PreviewStrip(this, file_id);

        row.Expand(preview.html);
    };

    this.get_file_data = function (file_id) {
        return this.files_data["data"][file_id];
    };

    this.set_file_data = function (key, value, file_id) {
        this.show_subheader("Updating list...");
        this.disable_load_buttons();

        Dash.Request(
            this,
            this.on_files_changed,
            this.api,
            {
                "f": "set_file_property",
                "parent_obj_id": this.parent_obj_id,
                "key": key,
                "value": value,
                "file_id": file_id
            }
        );
    };

    // this.validate_params = function () {
    //     [this.params_get_all, this.params_upload, this.params_delete].forEach(function (params) {
    //         if (!Dash.IsValidObject(params)) {
    //             console.log("Error: Invalid 'params_' param, expecting a dict of server params:", params);
    //
    //             return false;
    //         }
    //
    //         if (!(params["f"])) {
    //             console.log("Error: Invalid 'params_' param, missing 'f' key:", params);
    //
    //             return false;
    //         }
    //     });
    //
    //     // This required param is dynamically added in this module
    //     if ("file_id" in this.params_delete) {
    //         delete this.params_delete["file_id"];
    //     }
    //
    //     // These required params are dynamically added in this module
    //     ["key", "value", "file_id"].forEach(
    //         function (key) {
    //             if (key in this.params_set_property) {
    //                 delete this.params_set_property[key];
    //             }
    //         },
    //         this
    //     );
    //
    //     return true;
    // };

    this.GetDataForKey = function (file_id, key) {
        if (key === "filename") {
            return this.get_filename(this.get_file_data(file_id));
        }

        var value = this.get_file_data(file_id)[key];

        if (key === "uploaded_on") {
            if (Dash.IsServerIsoDate(value)) {
                return Dash.ReadableDateTime(value, false);
            }
        }

        else if (key === "uploaded_by") {
            var user = Dash.User.Init["team"][value];

            if (user && user["display_name"]) {
                return user["display_name"];
            }
        }

        return value;
    };

    this.Update = function () {
        this.redraw_rows();
    };

    this.setup_styles();
}
