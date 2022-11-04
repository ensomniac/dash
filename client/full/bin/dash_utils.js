function DashUtils () {
    this.animation_frame_iter = 0;
    this.animation_frame_workers = [];
    this.animation_frame_manager_running = false;

    this.NormalizeSearchText = function (text="") {
        if (!text) {
            return text;
        }

        text = text.trim().toLowerCase().replaceAll(".", "").replaceAll("-", "");

        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    this.GetDeepCopy = function (obj) {
        if (!Dash.Validate.Object(obj)) {
            console.warn("Warning: Failed to produce deepcopy, invalid object:", typeof obj, obj);

            return null;
        }

        return JSON.parse(JSON.stringify(obj));
    };

    this.GetClassName = function (class_instance) {
        return class_instance.constructor.toString().split("(")[0].replace("function", "").trim();
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
        this.register_anim_frame_worker({
            "callback": callback.bind(binder),
            "source": binder,
            "width": binder.html.width(),
            "height": binder.html.height(),
            "on_resize": true
        });
    };

    // Store a tiny bit of information about this request
    this.OnFrame = function (binder, callback) {
        this.register_anim_frame_worker({
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

        if (timer.iterations && timer.iterations >= 1) {
            if (timer.source && timer.source.html && !timer.source.html.is(":visible")) {
                still_active = false;
            }
        }

        if (!still_active) {
            clearInterval(timer["timer_id"]);

            return;
        }

        timer["callback"]();
    };

    this.register_anim_frame_worker = function (anim_frame_worker) {
        if (!this.animation_frame_manager_running) {
            // This only needs to be started once, and it will run forever
            this.animation_frame_manager_running = true;

            this.draw_anim_frame_workers();
        }

        // This is intentionally called after we start the worker so that
        // the behavior of Dash.OnFrame is similar to Window.RequestAnimationFrame in that
        // you would not expect the callback to fire until the next frame...
        this.animation_frame_workers.push(anim_frame_worker);
    };

    this.draw_anim_frame_workers = function () {
        this.animation_frame_iter += 1;

        // Coarse timeout
        if (this.animation_frame_iter >= 30) {
            this.animation_frame_iter = 0;

            this.manage_anim_frame_workers();
        }

        // Actually fire each callback
        for (var x in this.animation_frame_workers) {
            if (this.animation_frame_workers[x]["on_resize"]) {
                this.manage_on_resize_worker(x);
            }

            else {
                this.animation_frame_workers[x]["callback"]();
            }
        }

        (function (self) {
            // Call this function again
            requestAnimationFrame(function () {
                self.draw_anim_frame_workers();
            });
        })(this);
    };

    this.manage_on_resize_worker = function (index) {
        var width = this.animation_frame_workers[index]["source"].html.width();
        var height = this.animation_frame_workers[index]["source"].html.height();

        if (parseInt(width) === parseInt(this.animation_frame_workers[index]["width"])) {
            if (parseInt(height) === parseInt(this.animation_frame_workers[index]["height"])) {
                return;  // Nothing to do, height and width are the same
            }
        }

        this.animation_frame_workers[index]["width"] = width;
        this.animation_frame_workers[index]["height"] = height;
        this.animation_frame_workers[index]["callback"](width, height);
    };

    this.manage_anim_frame_workers = function () {
        // This breakout function is not called on every frame, but on
        // approximately every 30 frames. This is so we're not doing anything
        // too heavy on each frame. Check each worker to see if we should
        // still be processing frame updates
        // console.log("Manage them all....");
        // console.log(this.animation_frame_workers.length);

        // TODO: Round out this function to clean up stale html objects
    };

    // This is called on the next frame because window.Dash.<> is
    // not the correct instance / valid until the next frame

    (function (self) {
        requestAnimationFrame(function () {
            self.start_background_update_loop();
        });
    })(this);
}
