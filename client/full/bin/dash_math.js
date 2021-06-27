function DashMath () {

    this.InverseLerp = function (min, max, val) {
        return (val - min) / (max - min);
    };

    this.Lerp = function (a, b, t) {
        return a + Math.min(Math.max(t, 0), 1) * (b - a);
    };

}
