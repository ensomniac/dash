function Dash () {
    this.width = 0;
    this.height = 0;
    this.html = $("<div></div>");

    this.Context  = DASH_CONTEXT;
    this.Daypart  = "Morning/Afternoon/Evening"; // Managed by Dash.Utils -> 5-minute background update interval.

    // TODO: Mozilla officially/explicitly recommends against userAgent sniffing, we should probably update this...
    //  https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
    this.IsMobileiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.IsMobile = this.IsMobileiOS || /Mobi|Android|webOS|BlackBerry|IEMobile|CriOS|OPiOS|Opera Mini/i.test(navigator.userAgent);

    // Not exclusive to mobile, unless you also check for this.IsMobileiOS.
    // Safari will be present in the userAgent on Apple devices even when using other browsers,
    // so we have to make sure those other browser names aren't present in the userAgent.
    this.IsSafari = /Safari/i.test(navigator.userAgent) && !(/Chrome|Firefox|OP/i.test(navigator.userAgent));

    // Web-app saved to home screen
    this.IsMobileFromHomeScreen = (
        window.navigator.standalone === true  // iOS
        || window.matchMedia("(display-mode: standalone)").matches  // Android
    );

    this.Local = new DashLocal(this.Context);
    this.DarkModeActive = ["true", true].includes(this.Local.Get("dark_mode_active"));
    this.Color = new DashColor(this.DarkModeActive);

    if (this.DarkModeActive) {
        console.warn(
            "*** Dark mode active ***\n\n" +
            "Be sure that to call Dash.Color.SwapIfDarkModeActive() " +
            "after custom colors are set in color spec file."
        );
    }

    this.Animation = new DashAnimation();
    this.DateTime  = new DashDateTime();
    this.File      = new DashFile();
    this.Gui       = new DashGui();
    this.History   = new DashHistory();
    this.Layout    = new DashLayout();
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
        $("body").css({
            "overflow": "hidden"
        });

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "background": this.Color.GetVerticalGradient("#444", "#111", "#111"),
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

    this.draw = function () {
        this.width = $(window).width();
        this.height = $(window).height();

        this.html.css({
            "width": this.width,
            "height": this.height
        });
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
                            console.warn("Array.prototype.Last() failed:", this);

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
                            console.warn("Array.prototype.SetLast() failed:", this);

                            return this;
                        }
                    }
                },
                "Insert": {
                    "value": function (index, item) {
                        try {
                            return this.splice(index, 0, item);
                        }

                        catch {
                            console.warn("Array.prototype.Insert() failed:", this);

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

                        catch {
                            console.warn("Array.prototype.Remove() failed:", this);

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

                        catch {
                            console.warn("Array.prototype.Pop() failed:", this);

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

                        catch {
                            console.warn("Array.prototype.Count() failed:", this);

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

            catch {
                console.warn("String.prototype.Title() failed:", typeof this, this);

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
                console.warn("String.prototype.Trim() failed:", typeof this, this);

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
                console.warn("String.prototype.LTrim() failed:", typeof this, this);

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
                console.warn("String.prototype.RTrim() failed:", typeof this, this);

                return this;
            }
        };

        String.prototype.Count = function (char) {
            try {
                return (this.split(char).length - 1);
            }

            catch {
                console.warn("String.prototype.Count() failed:", typeof this, this);

                return this;
            }
        };

        String.prototype.IsDigit = function () {
            try {
                return /^\d+$/.test(this);
            }

            catch {
                console.warn("String.prototype.IsDigit() failed:", typeof this, this);

                return this;
            }
        };

        String.prototype.ZFill = function (len) {
            if (!len || this.length === len) {
                return this;
            }

            var string = "";

            string += this;

            for (var _ of Dash.Math.Range(len)) {
                if (string.length >= len) {
                    break;
                }

                string = "0" + string;
            }

            return string;
        };
    };

    this.extend_date_prototype = function () {
        // This gets the ISO week number, which is equivalent to calling '.isocalendar().week' on a python datetime object
        Date.prototype.getWeek = function () {
            var date = new Date(this.getTime());

            date.setHours(0, 0, 0, 0);

            // Thursday in current week decides the year
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

            // January 4 is always in week 1
            var week1 = new Date(date.getFullYear(), 0, 4);

            // Adjust to Thursday in week 1 and count number of weeks from date to week1
            return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
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
    };
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
        console.warn("Warning: URL Loaded with www -> Redirecting");

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

    window.Dash = new Dash();
    window.d = window.Dash;  // TODO: deprecate this

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
