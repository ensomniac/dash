/**@member DashGuiFileExplorer*/

function DashGuiFileExplorerSync () {
    this.view_file = function (file_id) {
        if (this.supports_desktop_client) {
            if (this.check_livesync_connected()) {
                this.open_file_in_desktop_file_system();
            }

            else {
                // TODO: Remove "(coming soon)" and instead, mention how to enable it
                var msg = "Opening this file in your computer's local file system requires LiveSync to be enabled " +
                          "(coming soon).\n\nWould you like to open a new browser tab to view/download the file?";

                if (!window.confirm(msg)) {
                    return;
                }

                this.open_file_in_browser_tab(file_id);
            }
        }

        else {
            this.open_file_in_browser_tab(file_id);
        }
    };

    this.check_livesync_connected = function () {
        // TODO: Check if live sync is active/enabled

        return false;
    };

    this.open_file_in_desktop_file_system = function () {
        // TODO: Show the file in the user's computer's local file system
    };

    this.open_file_in_browser_tab = function (file_id) {
        window.open(this.get_file_url(this.get_file_data(file_id)), "_blank");
    };
}
