/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerData () {
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

    this.on_file_upload_started = function () {
        this.show_subheader("Uploading...");
        this.disable_load_buttons();
    };

    this.on_sort_changed = function (selection) {
        console.log("TEST on sort changed", selection);
    };

    this.on_folder_display_changed = function (selection) {
        // TODO: also resolve combo rows display issue where it's not wide enough
        console.log("TEST on folder display changed", selection);
    };
}
