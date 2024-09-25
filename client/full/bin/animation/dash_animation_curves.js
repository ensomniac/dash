function DashAnimationCurves() {
    this.EaseInOut = function (t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    this.EaseIn = function (t) {
        return t * t;
    };

    this.EaseOut = function (t) {
        return t * (2 - t);
    };

    this.EaseOutExpo = function (t) {
        return (t===1) ? 1 : -Math.pow(2, -10 * t) + 1;
    };

    this.EaseOutBounce = function (t) {
        var b1 = 4 / 11;
        var b2 = 6 / 11;
        var b3 = 8 / 11;
        var b4 = 3 / 4;
        var b5 = 9 / 11;
        var b6 = 10 / 11;
        var b7 = 15 / 16;
        var b8 = 21 / 22;
        var b9 = 63 / 64;
        var b0 = 1 / b1 / b1;

        // Is (t = +t) supposed to be (t += t)?
        return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
    };
}
