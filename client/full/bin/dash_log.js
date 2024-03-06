// This class is a wrapper to the built-in console.log etc
// methods. Use this for logs that should only be printed during
// local dev or during remote debugging. Any logs that can
// print on all clients should just use the built-in methods.
class DashLog {
    constructor () {
        this.remote_debug_ls_key = "_dash_remote_debug_mode_enabled";
        this.remote_debug_mode_enabled = Dash.LocalDev ? false : null;
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
        if (!this.remote_debug_mode_enabled && !Dash.LocalDev) {
            return;
        }

        this.assert_debug_mode();

        console[type](...msg);
    }

    assert_debug_mode () {
        if (this.remote_debug_mode_enabled !== null) {
            return;  // Only need to assert once
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
}
