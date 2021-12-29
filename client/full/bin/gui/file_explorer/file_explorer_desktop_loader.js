function DashGuiFileExplorerDesktopLoader (api, parent_obj_id, supports_desktop_client=true) {
    /** See docstring in DashGuiFileExplorer for explanation of 'api' and 'parent_object_id' params, and request function naming */

    this.api = api;
    this.parent_obj_id = parent_obj_id;
    this.supports_desktop_client = supports_desktop_client;

    this.desktop_client_name = "desktop";
    this.pending_file_view_requests = {};

    this.OpenFile = function (file_data) {
        if (!this.supports_desktop_client) {
            this.open_file_in_browser_tab(file_data);

            return;
        }

        this.send_signal_to_desktop_session(file_data, "open_local_file_path");
    };

    this.ViewFile = function (file_data) {
        if (!this.supports_desktop_client) {
            this.open_file_in_browser_tab(file_data);

            return;
        }

        this.send_signal_to_desktop_session(file_data, "show_local_file_path");
    };

    // If parent_folders are not provided, it will open the main parent folder, such as a job folder
    this.ViewFolder = function (binder=null, backup_cb=null, parent_folders=[]) {
        backup_cb = binder && backup_cb ? backup_cb.bind(binder) : backup_cb;

        if (!this.supports_desktop_client || !this.parent_obj_id) {
            if (backup_cb) {
                backup_cb(this.parent_obj_id, parent_folders);
            }

            return;
        }

        this.send_signal_to_desktop_session(
            {"id": this.parent_obj_id, "parent_folders": parent_folders},
            "show_local_folder_path",
            true,
            backup_cb
        );
    };

    this.SetDesktopClientName = function (name) {
        if (!name) {
            return;
        }

        this.supports_desktop_client = true;  // In case it wasn't set to true on instantiation

        this.desktop_client_name = name;
    };

    this.send_signal_to_desktop_session = function (file_data, key, folder=false, backup_cb=null) {
        if (!(file_data["id"] in this.pending_file_view_requests)) {
            this.pending_file_view_requests[file_data["id"]] = 0;
        }

        if (this.pending_file_view_requests[file_data["id"]] > 0) {
            alert("This " + (folder ? "folder" : "file") + " is currently in process of being accessed on your computer.");

            return;
        }

        this.pending_file_view_requests[file_data["id"]] += 1;

        console.log("Sending signal to desktop session to access", (folder ? "folder" : "file"), file_data["id"]);

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_signal_sent(response, file_data, folder, backup_cb);
                },
                self.api,
                {
                    "f": "send_signal_to_desktop_session",
                    "key": key,
                    "value": JSON.stringify(file_data),
                    "parent_obj_id": self.parent_obj_id
                }
            );
        })(this);
    };

    this.on_signal_sent = function (response, file_data, folder=false, backup_cb=null) {
        this.pending_file_view_requests[file_data["id"]] -= 1;

        if (!Dash.Validate.Response(response)) {
            return;
        }

        console.log("Signal sent:", response["sent"]);

        if (!response["msg"]) {
            return;
        }

        if (folder && backup_cb) {
            alert(response["msg"]);

            backup_cb(this.parent_obj_id, file_data["parent_folders"]);

            return;
        }

        if (!window.confirm(response["msg"] + "\n\nWould you like to open a new browser tab to view/download the file?")) {
            return;
        }

        this.open_file_in_browser_tab(file_data);
    };

    this.open_file_in_browser_tab = function (file_data) {
        var url = file_data["url"] || file_data["orig_url"] || "";

        if (!url) {
            console.warn("Couldn't open file in browser tab, no URL found in file data:", url);

            return;
        }

        window.open(url, "_blank");
    };
}
