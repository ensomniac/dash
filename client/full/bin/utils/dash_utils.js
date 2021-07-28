function DashUtils () {

    this.animation_frame_workers = [];
    this.animation_frame_manager_running = false;
    this.animation_frame_iter = 0;

    this.SetTimer = function (binder, callback, ms) {
        var timer = {};
        timer["callback"] = callback.bind(binder);
        timer["source"] = binder;
        timer["iterations"] = 0;

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
    };

    this.manage_timer = function (timer) {
        var still_active = true;

        if (timer.iterations && timer.iterations >= 1) {
            if (timer.source.html && !timer.source.html.is(":visible")) {
                still_active = false;
            }
        }

        if (!still_active) {
            clearInterval(timer["timer_id"]);
            return;
        }

        timer["callback"]();
    };

    this.OnHTMLResized = function (binder, callback) {
        // Very similar to OnFrame, except we capture the size of binder.html
        // and only fire the callback if the size changes

        var anim_frame_worker = {};
        anim_frame_worker["callback"] = callback.bind(binder);
        anim_frame_worker["source"] = binder;
        anim_frame_worker["width"] = binder.html.width();
        anim_frame_worker["height"] = binder.html.height();
        anim_frame_worker["on_resize"] = true;

        this.register_anim_frame_worker(anim_frame_worker);

    };

    this.OnFrame = function (binder, callback) {

        // Store a tiny bit of information about this request
        var anim_frame_worker = {};
        anim_frame_worker["callback"] = callback.bind(binder);
        anim_frame_worker["source"] = binder;

        this.register_anim_frame_worker(anim_frame_worker);

    };

    this.register_anim_frame_worker = function (anim_frame_worker) {

        if (!this.animation_frame_manager_running) {
            // This only needs to be started once, and it will run forever
            this.animation_frame_manager_running = true;
            this.draw_anim_frame_workers();
        };

        // This is intentionally called after we start the worker so that
        // the behavior of Dash.OnFrame is similar to Window.RequestAnimationFrame in that
        // you would not expect the callback to fire until the next frame...
        this.animation_frame_workers.push(anim_frame_worker);

    };

    this.draw_anim_frame_workers = function () {

        this.animation_frame_iter += 1;

        if (this.animation_frame_iter >= 30) {
            // Coarse timeout
            this.animation_frame_iter = 0;
            this.manage_anim_frame_workers();
        };

        // Actually fire each callback
        for (var x in this.animation_frame_workers) {

            if (this.animation_frame_workers[x]["on_resize"]) {
                this.manage_on_resize_worker(x);
            }
            else {
                this.animation_frame_workers[x]["callback"]();
            };

        };

        (function(self){
            // Call this function again
            requestAnimationFrame(function(){
                self.draw_anim_frame_workers()
            });
        })(this);

    };

    this.manage_on_resize_worker = function (index) {

        var width = this.animation_frame_workers[index]["source"].html.width();
        var height = this.animation_frame_workers[index]["source"].html.height();

        if (width == this.animation_frame_workers[index]["width"] && height == this.animation_frame_workers[index]["height"]) {
            // Nothing to do, height and width are the same
            return;
        };

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








    this.OnAnimationFrame = function (binder, callback, html_key=null) {
        var anim_frame = {};
        anim_frame["callback"] = callback.bind(binder);
        anim_frame["source"] = binder;
        anim_frame["iterations"] = 0;
        anim_frame["html"] = html_key ? binder[html_key] : binder.html;

        (function (self, anim_frame, binder, callback, html_key) {
            var iterations = 0;

            anim_frame["anim_frame_id"] = requestAnimationFrame(function () {
                anim_frame["iterations"] = iterations;

                // TODO: Ryan, I think (unable to confirm) that this may be causing some excessive looping...
                //  Can you please take a look at this logic and see if everything looks correct?
                //
                // TODO: Andrew: I don't think this is implemented in the way you were expecting
                //  I wrote a slightly different version in this file as an example
                //  of what I was thinking. When you see this and have some time,
                //  let's hop on a call to discus!

                self.OnAnimationFrame(binder, callback, html_key);

                iterations += 1;
            });
        })(this, anim_frame, binder, callback, html_key);

        this.manage_animation_frame(anim_frame);
    };

    this.manage_animation_frame = function (anim_frame) {
        var still_active = true;

        if (anim_frame["html"] && !anim_frame["html"].is(":visible")) {
            still_active = false;
        }

        if (!still_active) {
            window.cancelAnimationFrame(anim_frame["anim_frame_id"]);
            return;
        }

        anim_frame["callback"]();

    };
}
