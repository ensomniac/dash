function DashGuiFileExplorerDesktopLoader (api, parent_obj_id, supports_desktop_client=true) {
    /** See docstring in DashGuiFileExplorer for explanation of 'api' and 'parent_object_id' params */

    this.api = api;
    this.parent_obj_id = parent_obj_id;
    this.supports_desktop_client = supports_desktop_client;

    this.desktop_client_name = "desktop";
    this.pending_file_view_requests = {};

    this.ViewFile = function (file_data) {
        if (!this.supports_desktop_client) {
            this.open_file_in_browser_tab(file_data);

            return;
        }

        this.get_desktop_client_sessions(file_data);
    };

    // If parent_folders are not provided, it will open the main parent folder, such as a job folder
    this.ViewFolder = function (binder, backup_cb, parent_folders=[]) {
        backup_cb = binder && backup_cb ? backup_cb.bind(binder) : backup_cb;

        if (!this.supports_desktop_client || !this.parent_obj_id) {
            backup_cb(this.parent_obj_id, parent_folders);

            return;
        }

        this.get_desktop_client_sessions({"id": this.parent_obj_id, "parent_folders": parent_folders}, true, backup_cb);
    };

    this.SetDesktopClientName = function (name) {
        if (!name) {
            return;
        }

        this.supports_desktop_client = true;  // In case it wasn't set to true on instantiation

        this.desktop_client_name = name;
    };

    this.get_desktop_client_sessions = function (file_data, folder=false, backup_cb=null) {
        if (!(file_data["id"] in this.pending_file_view_requests)) {
            this.pending_file_view_requests[file_data["id"]] = 0;
        }

        if (this.pending_file_view_requests[file_data["id"]] > 0) {
            alert("This " + (folder ? "folder" : "file") + " is currently in process of being opened on your computer.");

            return;
        }

        this.pending_file_view_requests[file_data["id"]] += 1;

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_desktop_client_sessions(response, file_data, folder, backup_cb);
                },
                self.api,
                {"f": "get_desktop_sessions"}
            );
        })(this);
    };

    this.on_desktop_client_sessions = function (response, file_data, folder=false, backup_cb=null) {
        this.pending_file_view_requests[file_data["id"]] -= 1;

        if (!Dash.ValidateResponse(response)) {
            return;
        }

        var machine_id;
        var ask_msg = "";
        var active_session;
        var active_session_count = 0;

        if (Dash.IsValidObject(response["sessions"]) && Dash.IsValidObject(response["sessions"]["active"])) {
            for (machine_id in response["sessions"]["active"]) {
                active_session = response["sessions"]["active"][machine_id];

                if (active_session["kill"]) {
                    continue;
                }

                active_session_count += 1;
            }
        }

        if (active_session_count > 1) {
            ask_msg = "Can't open the " + (folder ? "folder" : "file") + " on your computer's file system - you currently " +
                "have more than one " + this.desktop_client_name + " app running (on different devices).";
        }

        else if (active_session_count < 1) {
            ask_msg = "Opening this " + (folder ? "folder" : "file") + " in your computer's local file system requires " +
                "you to have the " + this.desktop_client_name + " app running on your computer.";
        }

        else {
            // Only one
            for (machine_id in response["sessions"]["active"]) {
                active_session = response["sessions"]["active"][machine_id];

                console.log("Sending signal to desktop session to open " + (folder ? "folder" : "file"), file_data["id"]);

                this.send_signal_to_desktop_session(
                    machine_id,
                    active_session["id"],
                    "open_local_" + (folder ? "folder" : "file") + "_path",
                    null,
                    file_data
                );
            }
        }

        if (ask_msg) {
            if (folder) {
                if (backup_cb) {
                    alert(ask_msg);

                    backup_cb(this.parent_obj_id, file_data["parent_folders"]);
                }
            }

            else {
                if (!window.confirm(ask_msg + "\n\nWould you like to open a new browser tab to view/download the file?")) {
                    return;
                }

                this.open_file_in_browser_tab(file_data);
            }
        }
    };

    this.send_signal_to_desktop_session = function (machine_id, session_id, key, value=null, value_json=null) {
        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.ValidateResponse(response)) {
                        alert("Failed to send signal to " + self.desktop_client_name + " app.");
                    }

                    console.log("Signal sent:", response["sent"]);
                },
                self.api,
                {
                    "f": "send_signal_to_desktop_session",
                    "key": key,
                    "value": value,
                    "value_json": Dash.IsValidObject(value_json) ? JSON.stringify(value_json) : null,
                    "session_id": session_id,
                    "machine_id": machine_id,
                    "parent_obj_id": self.parent_obj_id
                }
            );
        })(this);
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
