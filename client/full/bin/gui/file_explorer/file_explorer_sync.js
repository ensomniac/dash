/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerSync () {
    this.view_file = function (file_id) {
        if (!this.supports_desktop_client) {
            this.open_file_in_browser_tab(file_id);

            return;
        }

        this.get_desktop_client_sessions(file_id);
    };

    this.get_desktop_client_sessions = function (file_id) {
        if (!(file_id in this.pending_file_view_requests)) {
            this.pending_file_view_requests[file_id] = 0;
        }

        if (this.pending_file_view_requests[file_id] > 0) {
            alert("This file is currently in process of being opened on your computer.");

            return;
        }

        this.pending_file_view_requests[file_id] += 1;

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_desktop_client_sessions(response, file_id);
                },
                self.api,
                {"f": "get_desktop_sessions"}
            );
        })(this);
    };

    this.on_desktop_client_sessions = function (response, file_id) {
        this.pending_file_view_requests[file_id] -= 1;

        if (!Dash.ValidateResponse(response)) {
            return;
        }

        if (!Dash.IsValidObject(response["sessions"]) || Dash.IsValidObject(!response["sessions"]["active"])) {
            var msg = "Error: Unable to find any Altona IO File Sync app active session data\n\n";

            console.error(msg + response);

            alert(msg + JSON.stringify(response));

            return;
        }

        var machine_id;
        var ask_msg = "";
        var active_session;
        var active_session_count = 0;

        for (machine_id in response["sessions"]["active"]) {
            active_session = response["sessions"]["active"][machine_id];

            if (active_session["kill"]) {
                continue;
            }

            active_session_count += 1;
        }

        if (active_session_count > 1) {
            ask_msg = "Can't open the file on your computer's file system - you currently " +
                "have more than one Altona IO File Sync app running (on different devices).";
        }

        else if (active_session_count < 1) {
            ask_msg = "Opening this file in your computer's local file system requires " +
                "you to have the Altona IO File Sync app running on your computer.";
        }

        else {
            // Only one
            for (machine_id in response["sessions"]["active"]) {
                active_session = response["sessions"]["active"][machine_id];

                console.debug("Sending signal to desktop session to open file", file_id);

                this.send_signal_to_desktop_session(
                    machine_id,
                    active_session["id"],
                    "open_local_file_path",
                    null,
                    this.get_file_data(file_id)
                );
            }
        }

        if (ask_msg) {
            if (!window.confirm(ask_msg + "\n\nWould you like to open a new browser tab to view/download the file?")) {
                return;
            }

            this.open_file_in_browser_tab(file_id);
        }
    };

    this.send_signal_to_desktop_session = function (machine_id, session_id, key, value=null, value_json=null) {
        Dash.Request(
            this,
            function (response) {
                if (!Dash.ValidateResponse(response)) {
                    alert("Failed to send signal to Altona IO File Sync app.");
                }

                console.debug("Signal sent:", response["sent"]);
            },
            this.api,
            {
                "f": "send_signal_to_desktop_session",
                "key": key,
                "value": value,
                "value_json": Dash.IsValidObject(value_json) ? JSON.stringify(value_json) : null,
                "session_id": session_id,
                "machine_id": machine_id,
                "parent_obj_id": this.parent_obj_id
            }
        );
    };

    this.open_file_in_browser_tab = function (file_id) {
        window.open(this.get_file_url(this.get_file_data(file_id)), "_blank");
    };
}
