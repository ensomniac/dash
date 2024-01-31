/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerData () {
    this.open_file = function (row) {
        this.loader.OpenFile(this.get_file_data(row.ID()));
    };

    this.update_file_content = function (row) {
        if (!window.confirm(this.UpdateContentButtonConfig["hover_preview"] + "?")) {
            return;
        }

        this.reset_upload_button_uploader = true;

        // Hijack the main upload button's uploader
        this.upload_button.SetFileUploader(
            this.api,
            {
                ...this.upload_button_params,
                "existing_id_to_update": row.ID()
            },
            this.on_file_upload_started
        );

        this.upload_button.file_uploader.html.trigger("click");
    };

    this.delete_file = function (row) {
        if (!window.confirm("Are you sure you want to delete this file?")) {
            return;
        }

        this.show_subheader("Deleting...");
        this.disable_load_buttons();

        var f = "delete_file";

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!self.on_files_changed(response, false)) {
                        return;
                    }

                    self.list.RemoveRow(row.ID(), true);
                },
                self.api,
                {
                    "f": f,
                    "parent_obj_id": self.parent_obj_id,
                    "file_id": row.ID(),
                    ...(self.extra_params[f] || {})
                }
            );
        })(this);
    };

    this.restore_file = function (row) {
        if (!window.confirm("Are you sure you want to restore this file?")) {
            return;
        }

        this.show_subheader("Restoring...");
        this.disable_load_buttons();

        var f = "restore_archived_file";

        Dash.Request(
            this,
            this.on_files_changed,
            this.api,
            {
                "f": f,
                "parent_obj_id": this.parent_obj_id,
                "file_id": row.ID(),
                "return_all": false,
                "return_all_archived": true,
                ...(this.extra_params[f] || {})
            }
        );
    };

    this.download_file = function (row) {
        var file_data = this.get_file_data(row.ID());

        Dash.Gui.OpenFileURLDownloadDialog(
            this.get_file_url(file_data),
            this.get_filename(file_data)
        );
    };

    this.set_file_data = function (key, value, file_id) {
        this.show_subheader("Updating...");
        this.disable_load_buttons();

        var f = "set_file_property";

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!self.on_files_changed(response, false)) {
                        return;
                    }

                    var row = self.list.GetRow(file_id);

                    if (!row) {
                        row = self.list.GetRow(file_id, false, true);
                    }

                    if (row) {
                        row.Update();
                    }
                },
                self.api,
                {
                    "f": f,
                    "parent_obj_id": self.parent_obj_id,
                    "key": key,
                    "value": value,
                    "file_id": file_id,
                    ...(self.extra_params[f] || {})
                }
            );
        })(this);
    };

    this.get_files_data = function (callback=null) {
        var f = this.archive_mode ? "get_archived_files" : "get_files";

        // Need archive mode at the moment of the request, not at the moment of the callback
        var archive_mode = this.archive_mode;

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_files_data(response, archive_mode, callback);
                },
                self.api,
                {
                    "f": f,
                    "parent_obj_id": self.parent_obj_id,
                    ...(self.extra_params[f] || {})
                }
            );
        })(this);
    };

    this.update_cached_data = function (data) {
        this.files_data = data;
        this.original_order = data["order"];

        this.get_order();
    };

    this.on_files_data = function (response, archive_mode=false, callback=null) {
        if (archive_mode !== this.archive_mode) {
            return;
        }

        if (!Dash.Validate.Response(response, false)) {

            // The requests are made every 2.25 seconds, so if it's still not resolved after ~20
            // seconds, the portal was updated or something is wrong - either way, need to reload.
            Dash.Requests.TrackRequestFailureForID(this.request_failure_id, 9);

            return;
        }

        Dash.Requests.ResetRequestFailuresForID(this.request_failure_id);

        if (!response["data"] || !response["order"]) {
            console.error("Error: Get files data response was invalid. Both 'data' and 'order' keys are required to update the list:", response);

            return;
        }

        if (!this.initialized) {
            (function (self, response, archive_mode) {
                setTimeout(
                    function () {
                        self.on_files_data(response, archive_mode);
                    },
                    250
                );
            })(this, response, archive_mode);

            return;
        }

        response = this.clean_cached_data(response);

        if (this.files_data && Dash.Validate.Object(this.files_data["data"])) {
            if (JSON.stringify(this.files_data["data"]) === JSON.stringify(response["data"])) {
                return;
            }
        }

        Dash.Log.Log("(File Explorer) Files data:", response);

        this.update_cached_data(response);

        if (callback) {
            callback.bind(this)();
        }

        else {
            if (this.list) {
                for (var row of this.list.rows) {
                    if (row.is_sublist && row.IsExpanded()) {
                        return;  // Make sure we don't redraw when looking in a folder (sublist)
                    }
                }
            }

            this.redraw_rows();
        }
    };

    this.clean_cached_data = function (data) {
        for (var id in data["data"]) {
            if ("local_ids" in data["data"][id]) {
                delete data["data"][id]["local_ids"];
            }

            // This isn't ideal, but a lot of times, the sync app can be updating the modified time stamps when there isn't necessarily a change
            if (this.supports_desktop_client && "modified_on" in data["data"][id]) {
                delete data["data"][id]["modified_on"];
            }
        }

        return data;
    };

    this.on_files_changed = function (response, redraw_rows=true) {
        if (!Dash.Validate.Response(response)) {
            return false;
        }

        var error_context = "on_files_changed response (on upload/delete) was invalid.";

        if (!response["all_files"]) {
            console.error("Error:", error_context, "An 'all_files' key is required to update the list:", response);

            return false;
        }

        if (!response["all_files"]["data"] || !response["all_files"]["order"]) {
            console.error("Error:", error_context, "Both 'data' and 'order' keys are required to update the list:", response);

            return false;
        }

        this.update_cached_data(this.clean_cached_data(response["all_files"]));

        if (redraw_rows) {
            this.redraw_rows();
        }

        this.hide_subheader();
        this.enable_load_buttons();

        return true;
    };

    this.on_file_upload_started = function () {
        this.show_subheader("Uploading...");
        this.disable_load_buttons();
    };

    this.on_file_uploaded = function (data_key, additional_data, response) {
        if (this.reset_upload_button_uploader) {
            this.upload_button.SetFileUploader(
                this.api,
                this.upload_button_params,
                this.on_file_upload_started
            );
        }

        if (!response || response["originalEvent"] || response["isTrigger"]) {
            return;
        }

        this.on_files_changed(response);
    };

    this.on_folder_display_changed = function (selection) {
        if (selection["id"] === "top") {
            if (this.display_folders_first) {
                return;  // No change
            }

            this.display_folders_first = true;
        }

        else if (selection["id"] === "bottom") {
            if (!this.display_folders_first) {
                return;  // No change
            }

            this.display_folders_first = false;
        }

        else {
            return;
        }

        this.redraw_rows();
    };

    this.on_sort_changed = function (selection) {
        if (selection["id"] === this.sort_by_key) {
            return;  // No change
        }

        this.sort_by_key = selection["id"];

        this.get_order();
        this.redraw_rows();
    };

    this.get_order = function () {
        if (this.sort_by_key === "most_recent") {
            this.files_data["order"] = this.original_order;
        }

        else if (this.sort_by_key === "alphabetical") {
            this.set_alphabetical_order();
        }
    };

    this.set_alphabetical_order = function () {
        var order = [];
        var items = [];

        for (var file_id in this.files_data["data"]) {
            items.push([file_id, this.get_filename(this.files_data["data"][file_id])]);
        }

        items.sort(function (item, next_item) {
            if (item[1] < next_item[1]) {
                return -1;
            }

            if (item[1] > next_item[1]) {
                return 1;
            }

            return 0;
        });

        items.forEach(
            function (item) {
                order.push(item[0]);
            }
        );

        this.files_data["order"] = order;
    };
}
