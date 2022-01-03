function DashMath () {
    this.InverseLerp = function (min, max, val) {
        return (val - min) / (max - min);
    };

    this.Lerp = function (a, b, t) {
        return a + Math.min(Math.max(t, 0), 1) * (b - a);
    };

    this.RandomNumber = function (min=10000000, max=99999999) {
        return parseInt((min + (((Date.now() * 9301 + 49297) % 233280) / 233280) * (max - min)).toString());
    };

    // Get a random ID in the same format as PyDash Utils GetRandomID
    this.RandomID = function () {
        var random_id = "";
        var date = new Date();

        // Python datetime.datetime.today() format: 2021-08-04 03:48:11.866289
        // Converted to PyDash Utils GetRandomID format: 202108032117088034
        random_id += date.getFullYear().toString();
        random_id += this.ensure_double_digit(date.getMonth() + 1);  // Add one because Date() months start at 0
        random_id += this.ensure_double_digit(date.getDay() + 1);  // Add one because Date() days start at 0
        random_id += this.ensure_double_digit(date.getHours());
        random_id += this.ensure_double_digit(date.getMinutes());
        random_id += this.ensure_double_digit(date.getSeconds());
        random_id += this.ensure_double_digit(date.getMilliseconds()).substring(0, 3);
        random_id += Math.floor(Math.random() * 99).toString();

        return random_id;
    };

    this.ensure_double_digit = function (number) {
        number = number.toString();

        if (number.length === 1) {
            number = "0" + number;
        }

        else if (number.length === 0) {
            number = "00";
        }

        return number;
    };
}
