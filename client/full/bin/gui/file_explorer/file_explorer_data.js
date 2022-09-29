/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerData () {
    this.open_file = function (file_id) {
        this.loader.OpenFile(this.get_file_data(file_id));
    };

    this.update_file_content = function (file_id) {
        if (!window.confirm(this.UpdateContentButtonConfig["hover_preview"] + "?")) {
            return;
        }

        this.reset_upload_button_uploader = true;

        // Hijack the main upload button's uploader
        this.upload_button.SetFileUploader(
            this.api,
            {
                ...this.upload_button_params,
                "existing_id_to_update": file_id
            },
            this.on_file_upload_started
        );

        this.upload_button.file_uploader.html.trigger("click");
    };

    this.delete_file = function (file_id) {
        if (!window.confirm("Are you sure you want to delete this file?")) {
            return;
        }

        this.show_subheader("Deleting...");
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

    this.restore_file = function (file_id) {
        if (!window.confirm("Are you sure you want to restore this file?")) {
            return;
        }

        this.show_subheader("Restoring...");
        this.disable_load_buttons();

        Dash.Request(
            this,
            this.on_files_changed,
            this.api,
            {
                "f": "restore_archived_file",
                "parent_obj_id": this.parent_obj_id,
                "file_id": file_id,
                "return_all": false,
                "return_all_archived": true
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

    this.set_file_data = function (key, value, file_id) {
        this.show_subheader("Updating...");
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

    this.get_files_data = function (callback=null) {
        var archive_mode = this.archive_mode;  // Need archive mode at the moment of the request, not at the moment of the callback

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_files_data(response, archive_mode, callback);
                },
                self.api,
                {
                    "f": self.archive_mode ? "get_archived_files" : "get_files",
                    "parent_obj_id": self.parent_obj_id
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

        if (this.files_data && Dash.Validate.Object(this.files_data["data"])) {
            for (var id in response["data"]) {
                if ("local_ids" in response["data"][id]) {
                    delete response["data"][id]["local_ids"];
                }

                // This isn't ideal, but a lot of times, the sync app can be updating the modified time stamps when there isn't necessarily a change
                if (this.supports_desktop_client && "modified_on" in response["data"][id]) {
                    delete response["data"][id]["modified_on"];
                }
            }

            if (JSON.stringify(this.files_data["data"]) === JSON.stringify(response["data"])) {
                return;
            }
        }

        console.log("(File Explorer) Files data:", response);

        this.update_cached_data(response);

        if (callback) {
            callback.bind(this)();
        }

        else {
            this.redraw_rows();
        }
    };

    this.on_files_changed = function (response) {
        var error_context = "on_files_changed response (on upload/delete) was invalid.";

        if (!response["all_files"]) {
            console.error("Error:", error_context, "An 'all_files' key is required to update the list:", response);

            return;
        }

        if (!response["all_files"]["data"] || !response["all_files"]["order"]) {
            console.error("Error:", error_context, "Both 'data' and 'order' keys are required to update the list:", response);

            return;
        }

        if (!Dash.Validate.Response(response)) {
            return;
        }

        this.update_cached_data(response["all_files"]);
        this.redraw_rows();
        this.hide_subheader();
        this.enable_load_buttons();
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
