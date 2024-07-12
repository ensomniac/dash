function DashLocal (context) {
    this.context = context;
    this.global_get_cbs = {};
    this.on_init_pending_global_sets = {};
    this.on_init_pending_global_set_timer = null;

    this.Set = function (key, value, session=false, global=false) {
        if (key.indexOf(this.context["asset_path"] + "_") !== 0) {
            key = this.context["asset_path"] + "_" + key;
        }

        if (global) {
            if (Dash.GlobalStorageEnabled) {
                console.warn("TEST1 set global", key, value);
                this.query_global_storage("DashGlobalStorageSet", key, {"value": value});
            }

            else if (!Dash.InChromeExtension) {
                this.on_init_pending_global_sets[key] = value;

                if (!this.on_init_pending_global_set_timer) {
                    this.on_init_pending_global_set_timer = setTimeout(
                        () => {
                            if (Dash.GlobalStorageEnabled) {
                                return;
                            }

                            console.warn(
                                "Warning: Dash.Local.Set was called for:\n'"
                                + Object.keys(this.on_init_pending_global_sets).join(", ")
                                + "'\nwith 'global' but 'Dash.GlobalStorageEnabled' is false"
                            );
                        },
                        5000
                    );
                }
            }
        }

        return session ? sessionStorage.setItem(key, value) : localStorage.setItem(key, value);
    };

    // If bool_default is provided, the value will be
    // parsed as a bool and default to the value provided
    this.Get = function (key, bool_default=null, session=false, global_cb=null) {
        if (key.indexOf(this.context["asset_path"] + "_") !== 0) {
            key = this.context["asset_path"] + "_" + key;
        }

        if (global_cb) {
            if (Dash.GlobalStorageEnabled) {
                var callback_id = Dash.Math.RandomID();

                this.global_get_cbs[callback_id] = (value) => {
                    global_cb(this.parse_get_value(value, bool_default));
                };

                this.query_global_storage("DashGlobalStorageGet", key, {"callback_id": callback_id});
            }

            else if (!Dash.InChromeExtension) {
                console.warn(
                      "Warning: Dash.Local.Get was called for '"
                    + key
                    + "' with 'global_cb' but 'Dash.GlobalStorageEnabled' is false"
                );

                global_cb("");
            }

            return;
        }

        return this.parse_get_value(
            session ? sessionStorage.getItem(key) : localStorage.getItem(key),
            bool_default
        );
    };

    // Intended to be called by dash.js only
    this.on_global_storage_enabled = function () {
        if (!Dash.GlobalStorageEnabled) {
            return;  // Should never be the case
        }

        for (var key in this.on_init_pending_global_sets) {
            console.warn("TEST2 set global", key, value);
            this.query_global_storage("DashGlobalStorageSet", key, {"value": value});
        }
    };

    this.parse_get_value = function (value, bool_default=null) {
        if (bool_default === true) {
            return ["true", true, null, ""].includes(value);
        }

        if (bool_default === false) {
            return ["true", true].includes(value);
        }

        return value;
    };

    this.query_global_storage = function (type, key, extra_data={}) {
        if (!Dash.GlobalStorageEnabled) {
            if (!Dash.InChromeExtension) {
                console.warn(
                      "Warning: Dash.Local.query_global_storage was called for '"
                    + key
                    + "' but 'Dash.GlobalStorageEnabled' is false"
                );
            }

            return;
        }

        if (Dash.InChromeExtension) {
            chrome.runtime.sendMessage(
                {
                    "type": type,
                    "key": "dash_global_" + key,
                    ...extra_data
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        if (chrome.runtime.lastError.message !== "The message port closed before a response was received.") {
                            console.log(
                                "(Dash.Local " + type + ") responseCallback failed:",
                                chrome.runtime.lastError.message
                            );
                        }

                        return;
                    }

                    if (response?.["type"] === "DashGlobalStorageGetResponse") {
                        this.global_get_cbs[response["callback_id"]](response["value"]);

                        delete this.global_get_cbs[response["callback_id"]];
                    }
                }
            );
        }

        else {
            window.postMessage(
                {
                    "type": type,
                    "key": "dash_global_" + key,
                    ...extra_data
                },
                "*"
            );
        }
    };
}
