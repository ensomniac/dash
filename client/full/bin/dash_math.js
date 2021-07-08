function DashMath () {
    this.InverseLerp = function (min, max, val) {
        return (val - min) / (max - min);
    };

    this.Lerp = function (a, b, t) {
        return a + Math.min(Math.max(t, 0), 1) * (b - a);
    };

    this.RandomNumber = function (min=10000000, max=99999999) {
        return min + (((Date.now() * 9301 + 49297) % 233280) / 233280) * (max - min);
    };
}
