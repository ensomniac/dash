function DashAnimationSet (duration_ms, callback, curve) {
    this.duration_ms = duration_ms;
    this.callback = callback;
    this.curve = curve;
    this.start_time = null;
    this.playback_ms = 0;
    this.norm_t = 0;
    this.active = false;

    this.Start = function () {
        this.start_time = new Date();
        this.playback_ms = 0;
        this.norm_t = 0;
        this.active = true;

        this.update();
    };

    this.update = function () {
        if (!this.active) {
            delete this;

            return;
        }

        (function (self) {
            requestAnimationFrame(function () {
                self.update();
            });
        })(this);

        this.playback_ms = new Date()-this.start_time;
        this.norm_t = this.playback_ms / this.duration_ms;

        if (this.norm_t > 1.0) {
            this.norm_t = 1.0;
        }

        if (this.curve) {
            this.callback(this.curve(this.norm_t));
        }

        else {
            this.callback(this.norm_t);
        }

        if (this.norm_t >= 1.0) {
            this.active = false;
        }
    };
}
