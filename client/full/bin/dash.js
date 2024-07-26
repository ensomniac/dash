function Dash () {
    this.width = 0;
    this.height = 0;
    this.html = $("<div></div>");
    this.TabIsVisible = true;
    this.Context = DASH_CONTEXT;
    this.GlobalStorageEnabled = false;
    this.Daypart = "Morning/Afternoon/Evening"; // Managed by Dash.Utils -> 5-minute background update interval
    this.LocalDev = window.location.protocol === "file:";

    // TODO: Mozilla officially/explicitly recommends against userAgent sniffing, we should probably update this...
    //  https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
    this.IsMobileiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.IsMobile = this.IsMobileiOS || /Mobi|Android|webOS|BlackBerry|IEMobile|CriOS|OPiOS|Opera Mini/i.test(navigator.userAgent);

    // Not exclusive to mobile, unless you also check for this.IsMobileiOS.
    // Safari will be present in the userAgent on Apple devices even when using other browsers,
    // so we have to make sure those other browser names aren't present in the userAgent.
    this.IsSafari = /Safari/i.test(navigator.userAgent) && !(/Chrome|Firefox|OP/i.test(navigator.userAgent));

    this.IsChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;  // !this.IsSafari && /Chrome/i.test(navigator.userAgent);

    // Web-app saved to home screen
    this.IsMobileFromHomeScreen = (
           window.navigator.standalone === true  // iOS
        || window.matchMedia("(display-mode: standalone)").matches  // Android
    );

    try {
        this.InChromeExtension = this.IsMobile ? false : chrome?.runtime;
    }

    catch {
        this.InChromeExtension = false;
    }

    this.Local = new DashLocal(this.Context);
    this.DarkModeActive = ["true", true].includes(this.Local.Get("dark_mode_active"));
    this.Color = new DashColor(this.DarkModeActive);

    this.Animation = new DashAnimation();
    this.DateTime  = new DashDateTime();
    this.File      = new DashFile();
    this.Gui       = new DashGui();
    this.History   = new DashHistory();
    this.Layout    = new DashLayout();
    this.Log       = new DashLog(this);
    this.Math      = new DashMath();
    this.RegEx     = new DashRegEx();
    this.Requests  = new DashRequest();
    this.Size      = new DashSize(this.IsMobile);
    this.Temp      = new DashTemp();
    this.User      = new DashUser();
    this.Utils     = new DashUtils();
    this.Validate  = new DashValidate();
    this.View      = new DashView();

    if (this.IsMobile) {
        this.Mobile = {
            Combo:           DashMobileCombo,
            TextBox:         DashMobileTextBox,
            CardStack:       DashMobileCardStack,
            UserProfile:     DashMobileUserProfile,
            SearchableCombo: DashMobileSearchableCombo
        };
    }

    // As of 9/8/22, iOS/Safari don't support regex lookbehind, which is used in DashDocsHelp. For now,
    // going to skip the inclusion of Docs for mobile, because we really don't need it in that case anyway.
    else {
        this.Docs = {
            Box:  DashDocsBox,
            Help: DashDocsHelp,
            View: DashDocsView
        };
    }

    this.GetDeepCopy      = this.Utils.GetDeepCopy.bind(this.Utils);
    this.Logout           = this.User.Logout;
    this.OnAnimationFrame = this.Utils.OnAnimationFrame.bind(this.Utils);
    this.OnHTMLResized    = this.Utils.OnHTMLResized.bind(this.Utils);
    this.OnFrame          = this.Utils.OnFrame.bind(this.Utils);
    this.Request          = this.Requests.Request.bind(this.Requests);
    this.SendEmail        = this.Requests.SendEmail.bind(this.Requests);
    this.SetInterval      = this.Utils.SetTimer.bind(this.Utils);
    this.SetTimer         = this.Utils.SetTimer.bind(this.Utils);

    // |-------------------------------------------------------------------------------------------------------------|
    // | DEPRECATED: These exist to prevent older projects from breaking due to these having been moved/restructured |
    // |-------------------------------------------------------------------------------------------------------------|
    // | Left side is the deprecated, backwards-compatible pointer, right side is the proper/new pointer             |
    // |-------------------------------------------------------------------------------------------------------------|
    this.FormatTime         = this.DateTime.FormatTime.bind(this.DateTime);
    this.IsServerIsoDate    = this.DateTime.IsIsoFormat.bind(this.DateTime);
    this.ReadableDateTime   = this.DateTime.Readable.bind(this.DateTime);
    this.GetFormContainer   = this.Gui.GetFormContainer.bind(this.Gui);
    this.RandomID           = this.Math.RandomID.bind(this.Math);
    this.IsValidEmail       = this.Validate.Email.bind(this.Validate);
    this.IsValidObject      = this.Validate.Object.bind(this.Validate);
    this.ValidateResponse   = this.Validate.Response.bind(this.Validate);
    this.Gui.Layout         = this.Layout;
    this.Gui.PaneSlider     = this.Layout.PaneSlider;
    this.Gui.SearchableList = this.Layout.SearchableList;
    this.Layout.ButtonBar   = this.Gui.ButtonBar;
    // |-------------------------------------------------------------------------------------------------------------|

    this.HardwareAccelerationCSS = {
        "-webkit-transform": "translateZ(0)",
        "-moz-transform":    "translateZ(0)",
        "-ms-transform":     "translateZ(0)",
        "-o-transform":      "translateZ(0)",
        "transform":         "translateZ(0)"
    };

    this.setup_styles = function () {
        this.check_for_global_storage();

        $("body").css({
            "overflow": "hidden"
        });

        var css = {
            "background": this.Color.GetVerticalGradient("#444", "#111", "#111")
        };

        if (!this.InChromeExtension) {
            css["position"] = "absolute";
            css["left"] = 0;
            css["top"] = 0;
        }

        this.html.css(css);

        (function (self) {
            requestAnimationFrame(function () {
                self.draw();
            });

            $(window).on("resize", function () {
                self.draw();
            });
        })(this);
    };

    this.check_for_global_storage = function () {
        var event_key = "DashGlobalStorageReady";

        if (this.InChromeExtension) {  // For extensions (using Dash)
            // This goes to the extension's background context (background.js)
            chrome.runtime.sendMessage(
                {"type": "Is" + event_key},
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.log(
                            "(Dash Is" + event_key + ") responseCallback failed:",
                            chrome.runtime.lastError.message
                        );

                        return;
                    }

                    this.GlobalStorageEnabled = response["ready"];

                    if (this.GlobalStorageEnabled) {
                        this.Local.on_global_storage_enabled();

                        return;
                    }

                    // This receives messages from the extension's background context (background.js)
                    chrome.runtime.onMessage.addListener((message) => {
                        if (message["type"] === event_key) {
                            this.GlobalStorageEnabled = true;

                            this.Local.on_global_storage_enabled();
                        }
                    });
                }
            );
        }

        else {  // For webpages
            var on_ready;
            var timeout_id;

            on_ready = () => {
                if (this.GlobalStorageEnabled) {
                    clearTimeout(timeout_id);

                    window.removeEventListener(event_key, on_ready);

                    return;
                }

                this.GlobalStorageEnabled = true;

                clearTimeout(timeout_id);

                window.removeEventListener(event_key, on_ready);

                // This receives messages from the Dash Global Storage extension's content context (content.js)
                window.addEventListener("message", (event) => {
                    if (event.source !== window || !event.data?.["type"]) {
                        return;
                    }

                    if (event.data["type"] === "DashGlobalStorageGetResponse") {
                        this.Local.global_get_cbs[event.data["callback_id"]](event.data["value"]);

                        delete this.Local.global_get_cbs[event.data["callback_id"]];
                    }
                });

                this.Local.on_global_storage_enabled();
            };

            // This receives messages from the Dash Global Storage extension's content context (content.js)
            window.addEventListener(event_key, on_ready);

            timeout_id = setTimeout(
                () => {
                    window.removeEventListener(event_key, on_ready);
                },
                5000
            );
        }
    };

    this.draw = function () {
        if (this.InChromeExtension) {
            return;
        }

        this.width = $(window).width();
        this.height = $(window).height();

        this.html.css({
            "width": this.width,
            "height": this.height
        });

        if (this.IsMobile && !this.IsMobileiOS && !this.IsChrome) {
            this.add_android_non_chrome_warning();
        }
    };

    this.add_android_non_chrome_warning = function () {
        var font_size_mult = 0.8;
        var top_pad = Dash.Size.Padding * 0.3;
        var height = this.Size.RowHeight;
        var full_height = (height * font_size_mult) + (top_pad * 2);

        this.height -= full_height;

        this.html.css({
            "top": full_height,
            "height": this.height
        });

        var shared_css = {
            "color": "#182424",
            "text-align": "center",
            "font-style": "italic",
            "font-family": "sans_serif_bold",
            "line-height": ((height * 0.5) * font_size_mult) + "px"
        };

        var warning = $("<div>This site works best on Google Chrome.</div>");

        warning.css({
            ...shared_css,
            "padding-left": top_pad * 2,
            "padding-right": top_pad * 2,
            "padding-top": top_pad,
            "padding-bottom": top_pad,
            "position": "absolute",
            "top": -full_height,
            "left": 0,
            "right": 0,
            "height": height * font_size_mult,
            "font-size": (font_size_mult * 100) + "%",
            "background": "#ffcc00"
        });

        var link = $(
            '<a href="https://play.google.com/store/apps/details?id=com.android.chrome" target="_blank">'
            + "Download Chrome to avoid unexpected behavior."
            + "</a>"
        );

        link.css({
            ...shared_css,
            "font-size": "100%",
            "text-decoration": "underline"
        });

        warning.append(link);

        this.html.append(warning);
    };

    this.extend_array_prototype = function () {
        // *** IMPORTANT NOTE ***
        // To extend Object types, like Array (unlike String), something like:
        //
        // Array.prototype.Last = function () {}
        //
        // will not work effectively. Instead, you must use Object.defineProperty,
        // or defineProperties, as in the example for Array.prototype.Last below.
        // When extending an Object type in the incorrect way above, it
        // technically works, and you can successfully call the new function.
        // However, doing it that way makes the newly created function
        // enumerable, which breaks any and all enumerations of the extended
        // object type. For example, if you loop through an Array like this:
        //
        // var test_array = ["a", "b"];
        //
        // for (var i in test_array) {
        //     Dash.Log.Log(test_array[i])
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

                        catch (e) {
                            console.warn("Array.prototype.Last() failed:", typeof this, this, e);

                            return this;
                        }
                    }
                },
                "SetLast": {
                    "value": function (value) {
                        try {
                            this[this.length - 1] = value;
                        }

                        catch (e) {
                            console.warn("Array.prototype.SetLast() failed:", typeof this, this, e);

                            return this;
                        }
                    }
                },
                "Insert": {
                    "value": function (index, item) {
                        try {
                            return this.splice(index, 0, item);
                        }

                        catch (e) {
                            console.warn("Array.prototype.Insert() failed:", typeof this, this, e);

                            return this;
                        }
                    }
                },
                "Remove": {
                    "value": function (item, return_item=true) {
                        try {
                            var removed = this.Pop(this.indexOf(item), return_item);

                            if (return_item) {
                                return removed;
                            }

                            return this;
                        }

                        catch (e) {
                            console.warn("Array.prototype.Remove() failed:", typeof this, this, e);

                            return this;
                        }
                    }
                },
                "Pop": {
                    "value": function (index=null, return_item=true) {
                        try {
                            if (index === null) {
                                index = this.length - 1;  // Last index
                            }

                            index = parseInt(index);

                            if (index > -1) { // -1 means it's not in the array
                                var removed = this.splice(index, 1);
                            }

                            if (return_item) {
                                return removed.length ? removed[0] : null;  // Splice returns an array
                            }

                            return this;
                        }

                        catch (e) {
                            console.warn("Array.prototype.Pop() failed:", typeof this, this, e);

                            return this;
                        }
                    }
                },
                "Count": {
                    "value": function (value) {
                        try {
                            return this.filter(function (item) {
                                return item === value;
                            }).length;
                        }

                        catch (e) {
                            console.warn("Array.prototype.Count() failed:", typeof this, this, e);

                            return this;
                        }
                    }
                },
            }
        );
    };

    this.extend_string_prototype = function () {
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

            catch (e) {
                console.warn("String.prototype.Title() failed:", typeof this, this, e);

                return this.toString();
            }
        };

        String.prototype.Trim = function (char) {
            try {
                if (!char) {
                    return this.trim();
                }

                return this.LTrim(char).RTrim(char);
            }

            catch (e) {
                console.warn("String.prototype.Trim() failed:", typeof this, this, e);

                return this.toString();
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

                return this.toString();
            }

            catch (e) {
                console.warn("String.prototype.LTrim() failed:", typeof this, this, e);

                return this.toString();
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

                return this.toString();
            }

            catch (e) {
                console.warn("String.prototype.RTrim() failed:", typeof this, this, e);

                return this.toString();
            }
        };

        String.prototype.Count = function (char) {
            try {
                return (this.split(char).length - 1);
            }

            catch (e) {
                console.warn("String.prototype.Count() failed:", typeof this, this, e);

                return this.toString();
            }
        };

        String.prototype.IsDigit = function () {
            try {
                return /^\d+$/.test(this);
            }

            catch (e) {
                console.warn("String.prototype.IsDigit() failed:", typeof this, this, e);

                return this.toString();
            }
        };

        String.prototype.ZFill = function (len) {
            try {
                if (!len || this.length === len) {
                    return this.toString();
                }

                var string = "";

                string += this.toString();

                for (var _ of Dash.Math.Range(len)) {
                    if (string.length >= len) {
                        break;
                    }

                    string = "0" + string;
                }

                return string;
            }

            catch (e) {
                console.warn("String.prototype.ZFill() failed:", typeof this, this, e);

                return this.toString();
            }
        };
    };

    this.extend_date_prototype = function () {
        // This gets the ISO week number, which is equivalent to
        // calling '.isocalendar().week' on a python datetime object
        Date.prototype.getWeek = function () {
            try {
                var date = new Date(this.getTime());

                date.setHours(0, 0, 0, 0);

                // Thursday in current week decides the year
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

                // January 4 is always in week 1
                var week1 = new Date(date.getFullYear(), 0, 4);

                // Adjust to Thursday in week 1 and count number of weeks from date to week1
                return 1 + Math.round(
                    ((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
                );
            }

            catch (e) {
                console.warn("Date.prototype.getWeek() failed:", typeof this, this, e);

                return this.toString();
            }
        };
    };

    this.extend_js = function () {
        this.extend_array_prototype();
        this.extend_string_prototype();
        this.extend_date_prototype();
    };

    // Called once when document ready
    this.Initialize = function () {
        this.extend_js();
        this.setup_styles();

        // As of writing (1/30/24), this assists with reducing wasteful
        // timer/interval callbacks, many of which are making requests.
        (function (self) {
            $(document).on("visibilitychange", function () {
                self.TabIsVisible = document.visibilityState !== "hidden";
            });
        })(this);

        // TODO: Once the Idle Detector API is fully available and no longer experimental,
        //  it should be added and used in conjunction with the above visibility detector.
        //  https://developer.mozilla.org/en-US/docs/Web/API/Idle_Detection_API
    };
}

function WindowInitDash () {
    window.Dash = new Dash();
    window.d = window.Dash;  // TODO: deprecate this

    window.Dash.Initialize();

    $("body").empty().append(window.Dash.html);

    if (Dash.DarkModeActive) {
        Dash.Log.Warn(
            "*** Dark mode active ***\n\n" +
            "Be sure that to call Dash.Color.SwapIfDarkModeActive() " +
            "after custom colors are set in color spec file."
        );
    }

    if (!window.RunDash) {
        console.error("Dash is initialized, but there is no window.RunDash() function. Create one and reload.");

        return;
    }

    var html = window.RunDash();

    if (!html) {
        console.error("The window.RunDash() must return an html element to anchor this app.");

        return;
    }

    window.Dash.html.append(html);
}

$(document).on("ready", function () {
    $.fn.extend({  // TODO: are these extensions used?
        "animateStep": function (options) {
            return this.each(function () {
                var elementOptions = $.extend({}, options, {step: options.step.bind($(this))});

                $({x: options.from}).animate({x: options.to}, elementOptions);
            });
        },
        "rotate": function (value) {
            return this.css("transform", "rotate(" + value + "deg)");
        }
    });

    if (window.location.href.includes("https://www.") && !window.location.href.includes("file://")) {
        Dash.Log.Warn("Warning: URL Loaded with www -> Redirecting");

        window.location.href = window.location.href.replace("https://www.", "https://");
    }

    // TODO: Do we really need this as a window variable rather than just calling it from Dash.Math?
    window.InverseLerp = function (min, max, val) {
        return (val - min) / (max - min);
    };

    // TODO: Do we really need this as a window variable rather than just calling it from Dash.Math?
    window.Lerp = function (valA, valB, t) {
        if (t > 1) {
            t = 1;
        }

        if (t < 0) {
            t = 0;
        }

        return valA + t * (valB - valA);
    };

    WindowInitDash();
});
