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

    this.update_cached_data = function (data) {
        this.files_data = data;
        this.original_order = data["order"];

        this.get_order();
    };

    this.on_init_files_data = function (response) {
        if (!Dash.ValidateResponse(response)) {
            return;
        }

        if (!response["data"] || !response["order"]) {
            console.error("Error: Get files data response was invalid. Both 'data' and 'order' keys are required to update the list:", response);

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

        this.update_cached_data(response);
        this.redraw_rows();
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

        if (!Dash.ValidateResponse(response)) {
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
        if (!response || response["originalEvent"]) {
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
