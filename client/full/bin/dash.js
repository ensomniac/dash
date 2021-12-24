function Dash () {
    this.html = $("<div></div>");

    this.IsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.Daypart = "Morning/Afternoon/Evening"; // Managed by Dash.Utils -> 5 minute background update interval
    this.width = 0;
    this.height = 0;

    this.Context = DASH_CONTEXT;
    this.Local = new DashLocal();
    this.Math = new DashMath();
    this.Color = new DashColor();
    this.Color.Set = DashColorSet;
    this.Color.ButtonSet = DashColorButtonSet;
    this.Color.StateSet = DashColorStateSet;
    this.Size = new DashSize(this.IsMobile);
    this.User = new DashUser();
    this.Gui = new DashGui();
    this.View = new DashView();
    this.Animation = new DashAnimation();
    this.Requests = new DashRequest();
    this.Request = this.Requests.Request.bind(this.Requests);
    this.Logout = this.User.Logout;
    this.Utils = new DashUtils();
    this.SetTimer = this.Utils.SetTimer.bind(this.Utils);
    this.SetInterval = this.Utils.SetTimer.bind(this.Utils);
    this.OnAnimationFrame = this.Utils.OnAnimationFrame.bind(this.Utils);
    this.OnFrame = this.Utils.OnFrame.bind(this.Utils);
    this.OnHTMLResized = this.Utils.OnHTMLResized.bind(this.Utils);

    // Temp storage
    this.TempLastComboChanged = null;
    this.TempLastInputSubmitted = null;

    this.FormatTime = function (server_iso_string) {
        var server_offset_hours = 5; // The server's time is 3 hours different
        var date = new Date(Date.parse(server_iso_string));
        date = date.setHours(date.getHours()-server_offset_hours);
        return timeago.format(date);
    };

    // Get a random ID in the same format as PyDash Utils GetRandomID
    this.RandomID = function () {
        var date = new Date();
        var random_id = "";

        // Python datetime.datetime.today() format: 2021-08-04 03:48:11.866289
        // Converted to PyDash Utils GetRandomID format: 202108032117088034
        random_id += date.getFullYear().toString();
        random_id += this.ensure_double_digit(date.getMonth() + 1);  // Add one because Date() months start at 0
        random_id += this.ensure_double_digit(date.getDay() + 1);  // Add one because Date() days start at 0
        random_id += this.ensure_double_digit(date.getHours());
        random_id += this.ensure_double_digit(date.getMinutes());
        random_id += this.ensure_double_digit(date.getSeconds());
        random_id += this.ensure_double_digit(date.getMilliseconds()).substring(0, 3);
        random_id += Math.floor(Math.random() * 99).toString();

        return random_id;
    };

    this.ReadableDateTime = function (iso_string, include_tz_label=true) {
        var tz_label = "UTC";
        var dt = new Date(Date.parse(iso_string));

        // TODO: Move this to dash.guide as a context property
        if (this.Context["domain"] === "altona.io") {
            tz_label = "EST";

            // TODO: It appears that UTC doesn't observe daylight savings time, which makes sense,
            //  so we need to write a way to programmatically know how many hours difference there is
            // dt.setHours(dt.getHours() - 4);  // Spring/Summer
            dt.setHours(dt.getHours() - 5);  // Fall/Winter
        }

        var date = dt.toLocaleDateString();
        var time = dt.toLocaleTimeString();
        var readable = date + " at " + time;
        var colon_count = 0;

        // Get index of seconds
        for (var i in readable) {
            var char = readable[i];

            if (char !== ":") {
                continue;
            }

            colon_count += 1;

            if (colon_count === 2) {
                break;
            }
        }

        // Return readable without second
        readable = readable.slice(0, parseInt(i)) + readable.slice(parseInt(i) + 3, readable.length);

        if (include_tz_label) {
            return readable + " " + tz_label;
        }

        return readable;
    };

    this.GetDeepCopy = function (obj) {
        if (!this.IsValidObject(obj)) {
            console.warn("Warning: Failed to produce deepcopy, invalid object:", typeof obj, obj);

            return null;
        }

        return JSON.parse(JSON.stringify(obj));
    };

    this.IsValidEmail = function (str) {
        if (typeof str !== "string") {
            return false;
        }

        var username = str.split("@")[0];
        var domain = str.split("@");
        domain = domain.Last();
        var domain_split = domain.split(".");
        var domain_start = domain_split[0];
        var domain_end = domain_split.Last();
        var at_sign_count = (str.match(/@/g) || []).length;

        if (str.length > 0 && (at_sign_count !== 1 || !(domain.includes(".")))) {
            return false;
        }

        return !(domain_start.length < 1 || domain_end.length < 1 || username.length < 1);
    };

    this.IsValidObject = function (data_object) {
        return !(!data_object || jQuery.isEmptyObject(data_object) || typeof data_object !== "object");
    };

    this.IsServerIsoDate = function (value) {
        if (!value) {
            return false;
        }

        if (typeof value === "object") {
            return false;
        }

        try {
            if (typeof JSON.parse(value) === "object") {
                return false;
            }
        }

        catch {
            // Ignore
        }

        value = value.toString();

        var test = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}/.test(value);

        if (!test) {
            test = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
        }

        return test;
    };

    this.ValidateResponse = function (response, show_alert=true) {
        if (response && !response["error"]) {
            return response;
        }

        // This stops duplicate callbacks from being triggered after an alert window pops up
        this.handle_duplicate_callbacks_on_invalid_input();

        if (!response) {
            console.error("(Dash.ValidateResponse) No response received:", response);

            if (show_alert) {
                alert("There was a server problem with this request:\nNo response received");
            }
        }

        else if (response["error"]) {
            console.error("There was a server problem with this request:", response);

            if (show_alert) {
                alert(response["error"]);
            }
        }

        return null;
    };

    this.GetFormContainer = function () {
        var container = $("<div></div>");

        container.css({
            "background": ContainerColor,
            "margin": Padding,
            "padding": Padding,
            "box-shadow": "0px 0px 15px 1px rgba(0, 0, 0, 0.2)",
            "color": "rgba(0, 0, 0, 0.8)",
            "border-radius": 6,
        });

        return container;

    };

    // This is useful as a quick "undo" on the last modified input in cases like
    // when the server returns a response that says that input value is invalid etc
    this.RevertTempLastInputText = function (temp_last_input=null, allow_empty_string=false) {
        if (!temp_last_input) {
            temp_last_input = this.TempLastInputSubmitted;
        }

        if (!temp_last_input) {
            return;
        }

        var previous = temp_last_input.previous_submitted_text || "";

        if (!allow_empty_string && !previous) {
            return;
        }

        if (previous !== temp_last_input.last_submitted_text) {
            temp_last_input.SetText(previous);
        }

        else if (allow_empty_string && !previous && !temp_last_input.last_submitted_text) {
            temp_last_input.SetText("");
        }
    };

    // This is useful as a quick "undo" on the last modified combo in cases like
    // when the server returns a response that says that combo change is invalid etc
    this.RevertTempLastComboSelection = function (temp_last_combo=null) {
        if (!temp_last_combo) {
            temp_last_combo = this.TempLastComboChanged;
        }

        if (!temp_last_combo) {
            return;
        }

        var previous = temp_last_combo.previous_selected_option;

        if (!this.IsValidObject(previous)) {
            // Instead of returning, might make sense to set 'previous' to
            // the first combo option in the combo's list of options?
            return;
        }

        if (JSON.stringify(previous) !== JSON.stringify(temp_last_combo.selected_option)) {
            temp_last_combo.Update(null, previous, true);
        }
    };

    this.setup_styles = function () {

        $("body").css({
            "overflow": "hidden",
        });

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "background": Dash.Color.GetVerticalGradient("#444", "#111", "#111"),
        });

        (function (self) {

            requestAnimationFrame(function () {
                self.draw();
            });

            $(window).on("resize", function () {
                self.draw();
            });

        })(this);

    };

    this.ensure_double_digit = function (number) {
        number = number.toString();

        if (number.length === 1) {
            number = "0" + number;
        }

        else if (number.length === 0) {
            number = "00";
        }

        return number;
    };

    this.draw = function () {

        this.width = $(window).width();
        this.height = $(window).height();

        this.html.css({
            "width": this.width,
            "height": this.height,
        });

    };

    this.handle_duplicate_callbacks_on_invalid_input = function () {
        var temp_last_input = this.TempLastInputSubmitted;

        if (!temp_last_input || !(temp_last_input instanceof DashGuiInput)) {
            return;
        }

        temp_last_input.SkipNextBlur();

        if (!temp_last_input.submit_called_from_autosave) {
            temp_last_input.SkipNextAutosave();
        }

        this.RevertTempLastInputText(temp_last_input);
    };

    this.extend_js = function () {
        // TODO: Move this into utils

        // *** IMPORTANT NOTE ***
        // To extend Object types, like Array (unlike String), something like:
        //
        // Array.prototype.Last = function () {}
        //
        // will not work effectively. Instead, you must use Object.defineProperty,
        // or defineProperties, as in the example for Array.prototype.Last below.
        // When extending an Object type in the incorrect way above, it
        // technically work and you can successfully call the new function.
        // However, doing it that way makes the newly created function
        // enumerable, which breaks any and all enumerations of the extended
        // object type. For example, if you loop through an Array like this:
        //
        // var test_array = ["a", "b"];
        //
        // for (var i in test_array) {
        //     console.log(test_array[i])
        //
        // You would see three printouts instead of two:
        //     - "a"
        //     - "b"
        //     - Last

        Object.defineProperties(
            Array.prototype,
            {
                "Last": {
                    "value": function () {
                        try {
                            return this[this.length - 1];
                        }

                        catch {
                            console.log("Array.prototype.Last() failed:", this);

                            return this;
                        }
                    }
                },
                "SetLast": {
                    "value": function (value) {
                        try {
                            this[this.length - 1] = value;
                        }

                        catch {
                            console.log("Array.prototype.SetLast() failed:", this);

                            return this;
                        }
                    }
                }
            }
        );

        String.prototype.Title = function () {
            try {
                if (this.includes("_")) {
                    var asset_path = this.replaceAll("_", " ").toLowerCase().split(" ");

                    for (var i = 0; i < asset_path.length; i++) {
                        asset_path[i] = asset_path[i].charAt(0).toUpperCase() + asset_path[i].slice(1);
                    }

                    return asset_path.join(" ");
                }

                return this.slice(0, 1).toUpperCase() + this.slice(1, this.length);
            }

            catch {
                console.log("String.prototype.Title() failed:", typeof this, this);

                return this;
            }
        };

        String.prototype.Trim = function (char) {
            try {
                if (!char) {
                    return this.trim();
                }

                return this.LTrim(char).RTrim(char);
            }

            catch {
                console.log("String.prototype.Trim() failed:", typeof this, this);

                return this;
            }
        };

        String.prototype.LTrim = function (char) {
            try {
                var trimmed = "";

                if (this.startsWith(char)) {
                    trimmed = this.substring(char.length, this.length);
                }

                if (this.startsWith(char)) {
                    return trimmed.LTrim(char);
                }

                return this;
            }

            catch {
                console.log("String.prototype.LTrim() failed:", typeof this, this);

                return this;
            }
        };

        String.prototype.RTrim = function (char) {
            try {
                var trimmed = "";

                if (this.endsWith(char)) {
                    trimmed = this.substring(0, this.length - char.length);
                }

                if (this.endsWith(char)) {
                    return trimmed.RTrim(char);
                }

                return this;
            }

            catch {
                console.log("String.prototype.RTrim() failed:", typeof this, this);

                return this;
            }
        };
    };

    this.Initialize = function () {
        // Called once when document ready
        this.extend_js();
        this.setup_styles();
    };

}

$(document).on("ready", function () {

    $.fn.extend({
        animateStep: function (options) {
            return this.each(function () {
                var elementOptions = $.extend({}, options, {step: options.step.bind($(this))});
                $({x: options.from}).animate({x: options.to}, elementOptions);
            });
        },
        rotate: function (value) {
            return this.css("transform", "rotate(" + value + "deg)");
        }
    });

    if (window.location.href.includes("https://www.") && !window.location.href.includes("file://")) {
        console.warn("Warning: URL Loaded with www -> Redirecting");
        window.location.href = window.location.href.replace("https://www.", "https://");
    }

    window.InverseLerp = function (min, max, val) {
        return (val - min) / (max - min);
    };

    window.Lerp = function (valA, valB, t) {
        if (t > 1) {t = 1;}
        if (t < 0) {t = 0;}

        return valA + t * (valB - valA);
    };

    window.Dash = new Dash();
    window.d = window.Dash;
    window.Dash.Initialize();
    $("body").empty().append(window.Dash.html);

    if (!window.RunDash) {
        console.log("Dash is initialized, but there is no window.RunDash() function. Create one and reload.");
    }
    else {

        var html = window.RunDash();

        if (!html) {
            console.log("Dash Warning: The window.RunDash() must return an html element to anchor this app.");
        }
        else {
            window.Dash.html.append(html);
        }

    }

});
