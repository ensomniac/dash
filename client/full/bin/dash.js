function Dash () {
    this.width = 0;
    this.height = 0;
    this.html = $("<div></div>");

    this.Context = DASH_CONTEXT;
    this.Daypart = "Morning/Afternoon/Evening"; // Managed by Dash.Utils -> 5 minute background update interval
    this.IsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.Local            = new DashLocal();
    this.Math             = new DashMath();
    this.Temp             = new DashTemp();
    this.Validate         = new DashValidate();
    this.DT               = new DashDT();
    this.Color            = new DashColor();
    this.Color.Set        = DashColorSet;
    this.Color.ButtonSet  = DashColorButtonSet;
    this.Color.StateSet   = DashColorStateSet;
    this.Size             = new DashSize(this.IsMobile);
    this.User             = new DashUser();
    this.Gui              = new DashGui();
    this.View             = new DashView();
    this.History          = new DashHistory();
    this.Animation        = new DashAnimation();
    this.Requests         = new DashRequest();
    this.Request          = this.Requests.Request.bind(this.Requests);
    this.Logout           = this.User.Logout;
    this.Utils            = new DashUtils();
    this.SetTimer         = this.Utils.SetTimer.bind(this.Utils);
    this.SetInterval      = this.Utils.SetTimer.bind(this.Utils);
    this.OnAnimationFrame = this.Utils.OnAnimationFrame.bind(this.Utils);
    this.OnFrame          = this.Utils.OnFrame.bind(this.Utils);
    this.OnHTMLResized    = this.Utils.OnHTMLResized.bind(this.Utils);
    this.GetDeepCopy      = this.Utils.GetDeepCopy.bind(this.Utils);

    // Prevent older projects from not breaking due to these having been moved
    this.RandomID         = this.Math.RandomID.bind(this.Math);
    this.ReadableDateTime = this.DT.Readable.bind(this.DT);
    this.IsServerIsoDate  = this.DT.IsIsoFormat.bind(this.DT);
    this.FormatTime       = this.DT.FormatTime.bind(this.DT);
    this.GetFormContainer = this.Gui.GetFormContainer.bind(this.Gui);
    this.IsValidEmail     = this.Validate.Email.bind(this.Validate);
    this.IsValidObject    = this.Validate.Object.bind(this.Validate);
    this.ValidateResponse = this.Validate.Response.bind(this.Validate);

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

    this.extend_js = function () {
        this.extend_array_prototype();
        this.extend_string_prototype();
    };

    // Called once when document ready
    this.Initialize = function () {
        this.extend_js();
        this.setup_styles();
    };
}

$(document).on("ready", function () {
    $.fn.extend({
        animateStep: function (options) {   // TODO: What is this?
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
