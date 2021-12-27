function DashGuiFileExplorer (color, api, parent_obj_id, supports_desktop_client=false) {
    /**
     * File Explorer box element.
     * --------------------------
     *
     * IMPORTANT NOTE: <br>
     *     For consistency across Dash, this takes an API name and parent object ID, and uses predetermined names for function calls.
     *     For each context this is used in, make sure to add the correct function names to the respective API file as follows:
     *
     *         - "get_files":                      Get all files and return dict with data/order keys
     *         - "upload_file":                    Upload a file
     *         - "delete_file":                    Delete a file
     *         - "set_file_property":              Set a property for a file with provided key/value
     *         - "get_desktop_sessions":           Get all of the user's desktop sessions (includes active and last terminated)
     *         - "send_signal_to_desktop_session": Send a signal to a specific session (by machine_id and session_id) by adding a key/value pair to it
     *
     * @param {DashColorSet} color - DashColorSet instance
     * @param {string} api - API name for requests
     * @param {string} parent_obj_id - Parent object ID where the file is stored (this will be included in requests as 'parent_obj_id')
     * @param {boolean} supports_desktop_client - Whether or not this context has a related desktop client app it should try to connect to
     */

    this.color = color || Dash.Color.Light;
    this.api = api;
    this.parent_obj_id = parent_obj_id;
    this.supports_desktop_client = supports_desktop_client;

    this.rows = {};
    this.list = null;
    this.extra_gui = [];
    this.buttons = null;
    this.tool_row = null;
    this.subheader = null;
    this.files_data = null;
    this.sort_by_key = null;
    this.initialized = false;
    this.upload_button = null;
    this.original_order = null;
    this.display_folders_first = true;
    this.desktop_client_name = "desktop";
    this.html = Dash.Gui.GetHTMLBoxContext({}, this.color);
    this.loader = new Dash.Gui.FileExplorerDesktopLoader(this.api, this.parent_obj_id, this.supports_desktop_client);

    DashGuiFileExplorerGUI.call(this);
    DashGuiFileExplorerData.call(this);

    this.setup_styles = function () {
        // this.buttons must be populated here so that the callbacks are not undefined
        this.buttons = {
            "view": {
                "icon_name": "link",
                "callback": this.view_file,
                "right_margin": -Dash.Size.Padding * 0.25,
                "hover_preview": this.supports_desktop_client ?
                                 "View locally in your computer's file system (or in a browser tab, if " + this.desktop_client_name + " app isn't running)" :
                                 "View file in new browser tab"
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


        Dash.SetInterval(this, this.get_files_data, 2250);

        this.add_header();
        this.add_tool_row();
        this.add_upload_button();

        this.initialized = true;
    };

    this.SetDesktopClientName = function (name) {
        if (!name) {
            return;
        }

        this.supports_desktop_client = true;  // In case it wasn't set to true on instantiation

        this.desktop_client_name = name;

        this.loader.SetDesktopClientName(name);
    };

    this.AddHTML = function (html, wait_for_list=false) {
        if (!html || (wait_for_list && this.extra_gui.includes(html))) {
            return;
        }

        if (!this.initialized) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddHTML(html, wait_for_list);
                    },
                    250
                );
            })(this);

            return;
        }

        if (wait_for_list) {
            if (!this.list) {
                html.css({
                    "opacity": 0
                });
            }

            this.extra_gui.push(html);
        }

        this.html.append(html);
    };

    this.show_subheader = function (text="") {
        if (!this.subheader) {
            this.add_subheader();
        }

        else {
            this.subheader.html.show();
        }

        if (text) {
            if (text.includes(" ")) {
                // Subheader should only be a single word
                text = text.split(" ")[0];
            }

            if (!text.endsWith("...")) {
                text += "...";
            }

            this.subheader.SetText(text);
        }
    };

    this.hide_subheader = function () {
        if (!this.subheader) {
            return;
        }

        this.subheader.html.hide();
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

            for (var extra_gui of this.extra_gui) {
                extra_gui.css({
                    "opacity": 1
                });
            }
        }

        if (this.display_folders_first) {
            this.draw_subfolders();
        }

        // Draw files that don't live in subfolders
        this.files_data["order"].forEach(
            function (file_id) {
                if (!Dash.IsValidObject(this.get_file_data(file_id)["parent_folders"])) {
                    this.add_row(file_id);
                }
            },
            this
        );

        if (!this.display_folders_first) {
            this.draw_subfolders();
        }
    };

    this.get_file_data = function (file_id) {
        return this.files_data["data"][file_id];
    };

    this.get_filename = function (file_data) {
        return file_data["filename"] || file_data["orig_filename"] || "";
    };

    this.get_file_url = function (file_data) {
        return file_data["url"] || file_data["orig_url"] || "";
    };

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
