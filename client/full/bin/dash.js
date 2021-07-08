function Dash () {
    this.html = $("<div></div>");


    this.IsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.Context = DASH_CONTEXT;
    this.Local = new DashLocal();
    this.Math = new DashMath();
    this.Color = new DashColor();
    this.Size = new DashSize(this.IsMobile);
    this.User = new DashUser();
    this.Gui = new DashGui();
    this.View = new DashView();
    this.Animation = new DashAnimation();
    this.Requests = new DashRequest();
    this.Request = this.Requests.Request.bind(this.Requests);

    this.Utils = new DashUtils();
    this.SetTimer = this.Utils.SetTimer.bind(this.Utils);
    this.SetInterval = this.Utils.SetTimer.bind(this.Utils);
    this.OnAnimationFrame = this.Utils.OnAnimationFrame.bind(this.Utils);

    this.width = 0;
    this.height = 0;

    this.FormatTime = function (server_iso_string) {
        var server_offset_hours = 5; // The server's time is 3 hours different
        var date = new Date(Date.parse(server_iso_string));
        date = date.setHours(date.getHours()-server_offset_hours);
        return timeago.format(date);
    };

    this.ReadableDateTime = function (iso_string) {
        var tz_label = "UTC";
        var dt = new Date(Date.parse(iso_string));

        if (this.Context["domain"] === "altona.io") {
            tz_label = "EST";

            dt.setHours(dt.getHours() - 4);
        }

        else if (this.Context["domain"] === "authentic.tools") {
            tz_label = "PST";

            dt.setHours(dt.getHours() - 7);
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

        // Return readable without seconds
        readable = readable.slice(0, parseInt(i)) + readable.slice(parseInt(i) + 3, readable.length);

        return readable + " " + tz_label;
    };

    this.IsValidEmail = function (str) {
        if (typeof str !== "string") {
            return false;
        }

        var username = str.split("@")[0];
        var domain = str.split("@");
        domain = domain[domain.length - 1];
        var domain_split = domain.split(".");
        var domain_start = domain_split[0];
        var domain_end = domain_split[domain_split.length - 1];
        var at_sign_count = (str.match(/@/g) || []).length;

        if (str.length > 0 && (at_sign_count !== 1 || !(domain.includes(".")))) {
            return false;
        }

        return !(domain_start.length < 1 || domain_end.length < 1 || username.length < 1);
    };

    this.IsValidObject = function (data_object) {
        return !(!data_object || jQuery.isEmptyObject(data_object) || typeof data_object !== "object");
    };

    this.IsServerIsoDate = function (str) {
        return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}/.test(str);
    };

    this.ValidateResponse = function (response) {
        // TODO: doc

        if (!response) {
            console.log("Dash.ValidateResponse(1)");
            console.log(response);
            alert("There was a server problem with this request");
            return null;
        }

        if (response["error"]) {
            console.log("Dash.ValidateResponse(2)");
            console.log(response);
            alert(response["error"]);
            return null;
        }

        return response;

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

    this.draw = function () {

        this.width = $(window).width();
        this.height = $(window).height();

        this.html.css({
            "width": this.width,
            "height": this.height,
        });

    };

    this.extend_js = function () {
        // TODO: Move this into utils

        String.prototype.Title = function () {
            try {
                if (this.includes("_")) {
                    var asset_path = this.replaceAll("_", " ").toLowerCase().split(" ");

                    for (var i = 0; i < asset_path.length; i++) {
                        asset_path[i] = asset_path[i].charAt(0).toUpperCase() + asset_path[i].slice(1);
                    }

                    return asset_path.join(" ");
                }

                // var first = this.slice(0, 1);
                // var rest = this.slice(1, this.length);
                return this.slice(0, 1).toUpperCase() + this.slice(1, this.length);
            }

            catch {

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
        console.log("Warning: URL Loaded with www -> Redirecting");
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
