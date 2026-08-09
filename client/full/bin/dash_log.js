// This class is a wrapper to the built-in console.log etc
// methods. Use this for logs that should only be printed during
// local dev or during remote debugging. Any logs that can
// print on all clients should just use the built-in methods.
class DashLog {
    constructor () {
        this.remote_debug_ls_key = "_dash_remote_debug_mode_enabled";

        this.check_remote_debug_mode_enabled();
    }

    Log (...msg) {
        this.log("log", ...msg);
    }

    Debug (...msg) {
        this.log("debug", ...msg);
    }

    Info (...msg) {
        this.log("info", ...msg);
    }

    // May be uncommon to use, since this will likely need to be printed in most cases
    Warn (...msg) {
        this.log("warn", ...msg);
    }

    // It's uncommon this would be used, since this will almost always need to be printed
    Error (...msg) {
        this.log("error", ...msg);
    }

    Event (type, subsystem, state) {
        this.assert_debug_mode();

        if (!this.remote_debug_mode_enabled && !Dash.LocalDev) {
            return;
        }

        if (!["debug", "info", "log", "warn"].includes(type)) {
            type = "debug";
        }

        subsystem = this.get_safe_identifier(subsystem, "dash");
        state = this.get_safe_identifier(state, "event");

        console[type]("[" + subsystem + "] " + state);
    }

    // Calling 'Dash.Log.ToggleRemoteDebugMode()' in the console
    // will force all logs coming through this class to be printed.
    // This is useful when remotely debugging someone else's client.
    ToggleRemoteDebugMode () {
        if (Dash.LocalDev) {
            console.warn("Warning: Remote debug mode cannot (and doesn't need to) be toggled during local dev.");

            return;
        }

        this.assert_debug_mode();

        this.remote_debug_mode_enabled = !this.remote_debug_mode_enabled;

        Dash.Local.Set(this.remote_debug_ls_key, this.remote_debug_mode_enabled);

        location.reload();
    }

    log (type, ...msg) {
        this.assert_debug_mode();

        if (!this.remote_debug_mode_enabled && !Dash.LocalDev) {
            return;
        }

        console[type](this.get_safe_summary(type, msg));
    }

    get_safe_identifier (value, fallback) {
        if (typeof value !== "string") {
            return fallback;
        }

        value = value.toLowerCase();

        return /^[a-z0-9_-]{1,80}$/.test(value) ? value : fallback;
    }

    get_safe_summary (type, msg) {
        var value_types = msg.map((value) => this.get_value_type(value));
        var suffix = value_types.length ? value_types.join("-") : "none";

        return "[dash] " + this.get_safe_identifier(type, "debug") + "-" + suffix;
    }

    get_value_type (value) {
        if (value === null) {
            return "null";
        }

        try {
            if (Array.isArray(value)) {
                return "array";
            }

            if (value instanceof Error) {
                return "error";
            }
        }
        catch {
            return typeof value;
        }

        var value_type = typeof value;

        if (["bigint", "boolean", "function", "number", "string", "symbol", "undefined"].includes(value_type)) {
            return value_type;
        }

        return "object";
    }

    assert_debug_mode () {
        if (this.remote_debug_mode_enabled !== null) {
            return;  // Only need to assert once
        }

        // In case it wasn't ready on init
        if (Dash.LocalDev) {
            this.remote_debug_mode_enabled = false;

            return;
        }

        this.remote_debug_mode_enabled = Dash.Local.Get(this.remote_debug_ls_key, false);

        if (this.remote_debug_mode_enabled) {
            console.warn(
                "**********************************************************\n" +
                "WARNING: REMOTE DEBUG MODE ENABLED\n\n" +
                "Don't forget to disable this when done debugging by " +
                "calling\n'Dash.Log.ToggleRemoteDebugMode()' in the console." +
                "\n**********************************************************"
            );
        }
    }

    check_remote_debug_mode_enabled () {
        if (!window.Dash || !Dash.Color) {
            setTimeout(
                () => {
                    this.check_remote_debug_mode_enabled();
                },
                10
            );

            return;
        }

        this.remote_debug_mode_enabled = Dash.LocalDev ? false : null;
    }
}
