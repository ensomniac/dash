function DashHistory (is_mobile) {
    this.is_mobile = is_mobile;

    this.url_hashes = {};
    this.listening = false;
    this.last_old_url = null;
    this.last_new_url = null;
    this.last_added_hash_text = "";
    this.skip_hash_change_event = false;

    // TODO: At some point, extra consideration should be added for "inactive" tabs

    // Use for any GUI elements that are explicitly loaded/instantiated by a specific function/callback
    // (This is also useful when you have a tab layout within a tab layout, like a top tab in the content
    // area of a side tab, and you need to first load the side tab index before loading the top tab index)
    this.LoaderAdd = function (hash_text, loader_cb, binder=null, ...loader_params) {
        if (this.is_mobile || !hash_text || !loader_cb) {
            return;
        }

        this.set_hash_text(hash_text);

        this.url_hashes[hash_text] = {
            "loader_cb": binder ? loader_cb.bind(binder) : loader_cb,
            "loader_params": [...loader_params]
        };
    };

    // Use for any GUI element managed by DashLayoutTabs
    // (This is uniquely required so that the proper tab button gets selected when navigating)
    this.TabAdd = function (hash_text, layout_tabs_instance, tab_index) {
        if (this.is_mobile || !hash_text || !layout_tabs_instance) {
            return;
        }

        tab_index = parseInt(tab_index);

        if (isNaN(tab_index)) {
            return;
        }

        if (!layout_tabs_instance instanceof DashLayoutTabs) {
            console.error("Error: TabAdd is only for GUI elements managed by DashLayoutTabs");

            return;
        }

        this.set_hash_text(hash_text);

        this.url_hashes[hash_text] = {
            "layout_tabs_instance": layout_tabs_instance,
            "tab_index": tab_index
        };
    };

    // Use for any GUI element not managed by DashLayoutTabs and not explicitly loaded/instantiated
    // (It's likely that LoaderAdd will be the better choice over this one that majority of the time)
    this.ClassAdd = function (hash_text, view_parent_html, view_class, ...view_instantiation_params) {
        if (this.is_mobile || !hash_text || !view_parent_html || !view_class) {
            return;
        }

        this.set_hash_text(hash_text);

        this.url_hashes[hash_text] = {
            "view_class": view_class,
            "view_parent_html": view_parent_html,
            "view_instantiation_params": [...view_instantiation_params]
        };
    };

    this.set_hash_text = function (hash_text) {
        if (this.last_added_hash_text === hash_text) {
            return;
        }

        if (!this.listening) {
            this.add_listener();
        }

        this.skip_hash_change_event = true;

        window.location.hash = hash_text;

        this.last_added_hash_text = hash_text;
    };

    this.add_listener = function () {
        (function (self) {
            window.addEventListener(
                "hashchange",
                function (event) {  // Don't break out this function, this particular code must stay here
                    var hash = self.get_hash_from_url(event.newURL);

                    if (!hash) {
                        if (self.skip_hash_change_event) {
                            self.skip_hash_change_event = false;
                        }

                        return;
                    }

                    var previous_old_url = self.last_old_url;
                    var previous_new_url = self.last_new_url;

                    self.last_old_url = event.oldURL;
                    self.last_new_url = event.newURL;

                    if (self.skip_hash_change_event) {
                        self.skip_hash_change_event = false;

                        return;
                    }

                    if (previous_old_url === self.last_old_url || previous_new_url === self.last_new_url) {
                        return;  // Duplicate event
                    }

                    console.log("Loading URL hash from history:", hash);

                    self.on_hash_change(event);
                },
                false
            );
        })(this);
    };

    this.get_hash_from_url = function (url) {
        if (!url.includes("#")) {
            return "";
        }

        return url.split("#").Last() || "";
    };

    this.on_failed_hash_change = function (original_hash_text, detail="", error="") {
        var msg = "Error: URL hash change failed";

        if (detail) {
            msg += " - " + detail;
        }

        if (error) {
            msg += "\n" + error;
        }

        console.error(msg);

        if (original_hash_text) {  // Reset the url hash
            this.skip_hash_change_event = true;

            window.location.hash = original_hash_text;
        }

        return false;
    };

    this.on_hash_change = function (event) {
        var data = this.url_hashes[this.get_hash_from_url(event.newURL)];

        this.process_hash_change(event, data);
    };

    this.process_hash_change = function (event, data) {
        if (!Dash.Validate.Object(data)) {
            return false;
        }

        if (data["layout_tabs_instance"]) {
            return this.handle_tab_add_change(event, data);
        }

        if (data["loader_cb"]) {
            return this.handle_loader_add_change(event, data);
        }

        return this.handle_add_change(event, data);
    };

    this.handle_loader_add_change = function (event, data) {
        try {
            data["loader_cb"](...data["loader_params"]);

            return true;
        }

        catch (e) {
            return this.on_failed_hash_change(
                event ? this.get_hash_from_url(event.oldURL) : null,
                "Failed to load content with the loader callback",
                e
            );
        }
    };

    this.handle_tab_add_change = function (event, data) {
        try {
            data["layout_tabs_instance"].LoadIndex(data["tab_index"]);

            return true;
        }

        catch (e) {
            return this.on_failed_hash_change(
                event ? this.get_hash_from_url(event.oldURL) : null,
                "Failed to load index " + data["tab_index"].toString() + " from layout tabs instance",
                e
            );
        }
    };

    this.handle_add_change = function (event, data) {
        try {
            data["view_parent_html"].empty();
        }

        catch (e) {
            return this.on_failed_hash_change(
                event ? this.get_hash_from_url(event.oldURL) : null,
                "Failed to empty the view class' parent's html"
            );
        }

        try {
            var instantiated_class = new data["view_class"](...data["view_instantiation_params"]);
        }

        catch (e) {
            return this.on_failed_hash_change(
                event ? this.get_hash_from_url(event.oldURL) : null,
                "Failed to instantiate the view class",
                e
            );
        }

        if (!instantiated_class.hasOwnProperty("html")) {
            return this.on_failed_hash_change(
                event ? this.get_hash_from_url(event.oldURL) : null,
                "View class doesn't have an 'html' property to append to the view class' parent's html"
            );
        }

        try {
            data["view_parent_html"].append(instantiated_class.html);
        }

        catch (e) {
            return this.on_failed_hash_change(
                event ? this.get_hash_from_url(event.oldURL) : null,
                "Failed to append the instantiated view class' html to its parent's html",
                e
            );
        }

        return true;
    };
}
