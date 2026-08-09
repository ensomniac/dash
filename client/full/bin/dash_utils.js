function DashUtils () {
    this.animation_frame_iter = 0;
    this.animation_frame_workers = [];
    this.animation_frame_manager_running = false;
    this.animation_frame_request_id = null;
    this.animation_frame_detached_grace_frames = 30;

    this.SetDynamicFont = function (html, font_url, font_display_name, font_original_filename, on_load_cb) {
        var font_name = "";

        for (var char of (font_display_name + font_original_filename.split(".")[0])) {
            if (char.toLowerCase() === char.toUpperCase()) {
                continue;  // Not a letter (FontFace font name can only be letters)
            }

            font_name += char;
        }

        var font_face = new FontFace(font_name, "url(" + font_url + ")");

        // Doesn't look like this is actually finding already-loaded fonts, but not a big deal. We should
        // really be using documents.fonts.check(font_name), but it's failing and I can't get it to work.
        if (document.fonts.has(font_face)) {
            html.css({
                "font-family": font_name
            });

            return;
        }

        // Create a new font-face dynamically and update the preview to use it
        (function () {
            font_face.load().then(function (loaded_font) {
                document.fonts.add(loaded_font);

                if (on_load_cb) {
                    on_load_cb();
                }

                html.css({
                    "font-family": font_name
                });
            }).catch(function (error) {
                alert("Failed to load font for preview\n\nError:\n" + error);

                console.error(error);
            });
        })();
    };

    this.NormalizeSearchText = function (text="") {
        if (!text) {
            return text;
        }

        text = text.trim().toLowerCase().replaceAll(".", "").replaceAll("-", "");

        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    this.GetDeepCopy = function (obj) {
        if (!Dash.Validate.Object(obj, false)) {
            Dash.Log.Warn("Warning: Failed to produce deepcopy, invalid object:", typeof obj, obj);

            return obj;
        }

        return JSON.parse(JSON.stringify(obj));
    };

    this.GetClassName = function (class_instance) {
        return class_instance.constructor.toString().split("(")[0].replace("function", "").trim();
    };

    // Based on font properties of a single element
    this.GetAverageCharWidth = function (element) {
        var string = "abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        var span = $("<span>").text(string).css({
            "position": "absolute",
            "left": -9999,  // Position off-screen
            "top": 0,
            "white-space": "nowrap",  // Ensure the string isn't wrapping
            "font": element.css("font")  // Copy the font properties
        }).appendTo("body");

        var avg_char_width = span.width() / string.length;

        span.remove();

        return avg_char_width;
    };

    this.SetTimer = function (binder, callback, ms, source=null) {
        var timer = {
            "callback": callback.bind(binder),
            "source": source || binder,
            "iterations": 0
        };

        (function (self, timer) {
            var iterations = 0;

            timer["timer_id"] = setInterval(
                function () {
                    timer["iterations"] = iterations;

                    self.manage_timer(timer);

                    iterations += 1;
                },
                ms
            );
        })(this, timer);

        this.manage_timer(timer);

        return timer["timer_id"];
    };

    // Very similar to OnFrame, except we capture the size of binder.html and only fire the callback if the size changes
    this.OnHTMLResized = function (binder, callback) {
        return this.register_anim_frame_worker({
            "callback": callback.bind(binder),
            "source": binder,
            "width": binder.html.width(),
            "height": binder.html.height(),
            "on_resize": true
        });
    };

    this.OnInitialVisibility = function (html, callback) {
        // Fires callback once the first time html becomes visible

        if (!(html instanceof Element)) {
            html = html[0];
        };

        if (!(html instanceof Element)) {
            throw new Error("Invalid element passed");
        };

        let observer = new IntersectionObserver((entries, observerInstance) => {
            for (let entry of entries) {
                if (entry.isIntersecting) {
                    observerInstance.disconnect(); // stop observing
                    callback(); // fire callback once
                    break;
                }
            }
        }, {
            threshold: 0, // triggers as soon as *any* part is visible
        });

        observer.observe(html);

    };

    // Store a tiny bit of information about this request
    this.OnFrame = function (binder, callback) {
        return this.register_anim_frame_worker({
            "callback": callback.bind(binder),
            "source": binder
        });
    };

    // Should this live in DashAnimation?
    this.OnAnimationFrame = function (binder, callback, html_key=null) {
        var anim_frame = {
            "callback": callback.bind(binder),
            "source": binder,
            "iterations": 0,
            "html": html_key ? binder[html_key] : binder.html
        };

        (function (self, anim_frame, binder, callback, html_key) {
            anim_frame["anim_frame_id"] = requestAnimationFrame(
                function () {
                    self.OnAnimationFrame(binder, callback, html_key);
                }
            );
        })(this, anim_frame, binder, callback, html_key);

        this.manage_animation_frame(anim_frame);
    };

    this.manage_animation_frame = function (anim_frame) {
        if (anim_frame["html"] && !anim_frame["html"].is(":visible")) {
            window.cancelAnimationFrame(anim_frame["anim_frame_id"]);

            return;
        }

        anim_frame["callback"]();
    };

    // This function is called when this class is instantiated. It calls a
    // few global update functions that keep certain time elements current.
    this.start_background_update_loop = function () {
        (function (self) {
            setInterval(
                function () {
                    self.manage_background_update_loop_5_min();
                },
                1000
            );
        })(this);

        this.manage_background_update_loop_5_min();
    };

    // Called once every 5 minutes, and upon instantiation of Dash
    this.manage_background_update_loop_5_min = function () {
        Dash.Daypart = "Day";

        var hrs = new Date().getHours();

        if (hrs < 12) {
            Dash.Daypart = "Morning";
        }

        else if (hrs >= 12 && hrs <= 17) {
            Dash.Daypart = "Afternoon";
        }

        else if (hrs >= 17 && hrs <= 24) {
            Dash.Daypart = "Evening";
        }

        else {
            console.error("Error - Unknown hour set");
        }
    };

    this.manage_timer = function (timer) {
        var still_active = true;

        if (timer.iterations && timer.iterations >= 1 && timer.source) {
            try {
                if (timer.source.html && !timer.source.html.is(":visible")) {
                    still_active = false;
                }
            }

            catch {
                try {
                    if (!timer.source.is(":visible")) {
                        still_active = false;
                    }
                }

                catch {
                    // Pass
                }
            }
        }

        if (!still_active) {
            clearInterval(timer["timer_id"]);

            return;
        }

        if (!Dash.TabIsVisible) {
            // Dash.Log.Warn("Warning: Tab is not visible, skipping timer/interval callback(s)");

            return;
        }

        timer["callback"]();
    };

    this.get_anim_frame_worker_element = function (source) {
        var html = source && source.html ? source.html : source;

        if (!html) {
            return null;
        }

        if (html.jquery && typeof html.get === "function") {
            html = html.get(0);
        }
        else if (html[0] && (html[0].nodeType || typeof html[0].isConnected === "boolean")) {
            html = html[0];
        }

        if (!html || typeof html !== "object") {
            return null;
        }

        if (html.nodeType || typeof html.isConnected === "boolean") {
            return html;
        }

        return null;
    };

    this.is_anim_frame_worker_source_connected = function (anim_frame_worker) {
        var element = this.get_anim_frame_worker_element(anim_frame_worker["source"]);

        if (!element) {
            return null;
        }

        if (typeof element.isConnected === "boolean") {
            return element.isConnected;
        }

        if (document.documentElement && typeof document.documentElement.contains === "function") {
            return document.documentElement.contains(element);
        }

        return null;
    };

    this.CancelAnimationFrameWorker = function (registration_or_source) {
        var cancelled = [];
        var retained = [];

        for (var anim_frame_worker of this.animation_frame_workers) {
            if (anim_frame_worker === registration_or_source || anim_frame_worker["source"] === registration_or_source) {
                cancelled.push(anim_frame_worker);
            }
            else {
                retained.push(anim_frame_worker);
            }
        }

        this.animation_frame_workers = retained;

        for (var anim_frame_worker of cancelled) {
            anim_frame_worker["active"] = false;
            anim_frame_worker["callback"] = null;
            anim_frame_worker["source"] = null;
        }

        if (!this.animation_frame_workers.length) {
            this.stop_anim_frame_worker_manager();
        }

        return cancelled.length;
    };

    this.register_anim_frame_worker = function (anim_frame_worker) {
        anim_frame_worker["active"] = true;
        anim_frame_worker["connected_once"] = false;
        anim_frame_worker["detached_frames"] = 0;
        anim_frame_worker["source_connected"] = this.is_anim_frame_worker_source_connected(anim_frame_worker);

        if (anim_frame_worker["source_connected"] === true) {
            anim_frame_worker["connected_once"] = true;
        }

        (function (self, anim_frame_worker) {
            anim_frame_worker["Cancel"] = function () {
                return self.CancelAnimationFrameWorker(anim_frame_worker);
            };
        })(this, anim_frame_worker);

        this.animation_frame_workers.push(anim_frame_worker);

        if (!this.animation_frame_manager_running) {
            this.animation_frame_manager_running = true;
            this.schedule_anim_frame_worker_draw();
        }

        return anim_frame_worker;
    };

    this.schedule_anim_frame_worker_draw = function () {
        if (!this.animation_frame_manager_running || this.animation_frame_request_id !== null) {
            return;
        }

        (function (self) {
            self.animation_frame_request_id = requestAnimationFrame(function () {
                self.animation_frame_request_id = null;
                self.draw_anim_frame_workers();
            });
        })(this);
    };

    this.stop_anim_frame_worker_manager = function () {
        if (this.animation_frame_request_id !== null) {
            window.cancelAnimationFrame(this.animation_frame_request_id);
        }

        this.animation_frame_request_id = null;
        this.animation_frame_manager_running = false;
        this.animation_frame_iter = 0;
    };

    this.draw_anim_frame_workers = function () {
        if (!this.animation_frame_manager_running) {
            return;
        }

        this.animation_frame_iter += 1;

        this.manage_anim_frame_workers();

        // Actually fire each callback
        var anim_frame_workers = this.animation_frame_workers.slice();

        for (var anim_frame_worker of anim_frame_workers) {
            if (!anim_frame_worker["active"] || anim_frame_worker["source_connected"] === false) {
                continue;
            }

            if (anim_frame_worker["on_resize"]) {
                this.manage_on_resize_worker(anim_frame_worker);
            }

            else {
                anim_frame_worker["callback"]();
            }
        }

        if (!this.animation_frame_workers.length) {
            this.stop_anim_frame_worker_manager();

            return;
        }

        this.schedule_anim_frame_worker_draw();
    };

    this.manage_on_resize_worker = function (anim_frame_worker) {
        var width = anim_frame_worker["source"].html.width();
        var height = anim_frame_worker["source"].html.height();

        if (parseInt(width) === parseInt(anim_frame_worker["width"])) {
            if (parseInt(height) === parseInt(anim_frame_worker["height"])) {
                return;  // Nothing to do, height and width are the same
            }
        }

        anim_frame_worker["width"] = width;
        anim_frame_worker["height"] = height;
        anim_frame_worker["callback"](width, height);
    };

    this.manage_anim_frame_workers = function () {
        var stale_workers = [];

        for (var anim_frame_worker of this.animation_frame_workers) {
            if (!anim_frame_worker["active"]) {
                stale_workers.push(anim_frame_worker);

                continue;
            }

            var source_connected = this.is_anim_frame_worker_source_connected(anim_frame_worker);
            anim_frame_worker["source_connected"] = source_connected;

            if (source_connected === null) {
                anim_frame_worker["detached_frames"] = 0;

                continue;
            }

            if (source_connected) {
                anim_frame_worker["connected_once"] = true;
                anim_frame_worker["detached_frames"] = 0;

                continue;
            }

            anim_frame_worker["detached_frames"] += 1;

            if (
                anim_frame_worker["connected_once"] ||
                anim_frame_worker["detached_frames"] >= this.animation_frame_detached_grace_frames
            ) {
                stale_workers.push(anim_frame_worker);
            }
        }

        for (var stale_worker of stale_workers) {
            this.CancelAnimationFrameWorker(stale_worker);
        }
    };

    // This is called on the next frame because window.Dash.<> is
    // not the correct instance / valid until the next frame

    (function (self) {
        requestAnimationFrame(function () {
            self.start_background_update_loop();
        });
    })(this);
}
