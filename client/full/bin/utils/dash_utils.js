function DashUtils () {
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
            console.log("== CLEARING TIMER ==");

            clearInterval(timer["timer_id"]);

            return;
        }

        timer["callback"]();
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
            console.log("== CLEARING ANIMATION FRAME ==");

            window.cancelAnimationFrame(anim_frame["anim_frame_id"]);

            return;
        }

        anim_frame["callback"]();
    };
}
