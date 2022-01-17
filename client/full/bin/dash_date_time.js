function DashDateTime () {
    this.server_offset_hours = 5;

    this.Readable = function (iso_string, include_tz_label=true) {
        var tz_label = "UTC";
        var is_static_date = false;
        var dt_obj = new Date(Date.parse(iso_string));

        if (Dash.Context["timezone"]) {
            tz_label = Dash.Context["timezone"];


            if (dt_obj.getHours() === 0 && dt_obj.getMinutes() === 0 && dt_obj.getSeconds() === 0) {
                // The time information is 00:00:00
                //
                // This could be an ISO stamp from the server that just so happened to land on 00:00:00 (extremely uncommon, but certainly possible)
                // - OR -
                // It could be a static date only, which was parsed into an ISO stamp, which would default its time info to 00:00:00
                //
                // There doesn't appear to be a way to programmatically tell the difference
                // between the two, but they each need to be handled differently...
                //
                // For now, we won't alter the date object, until we can find a way to differentiate the two
                is_static_date = true;
            }

            else if (this.DSTInEffect(dt_obj)) {
                dt_obj.setHours(dt_obj.getHours() - (this.server_offset_hours - 1));  // Spring/Summer
            }

            else {
                dt_obj.setHours(dt_obj.getHours() - this.server_offset_hours);  // Fall/Winter
            }
        }

        var date = dt_obj.toLocaleDateString();

        if (is_static_date) {
            return date;
        }

        var colon_count = 0;
        var time = dt_obj.toLocaleTimeString();
        var readable = date + " at " + time;

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

        // Return readable without second
        readable = readable.slice(0, parseInt(i)) + readable.slice(parseInt(i) + 3, readable.length);

        if (include_tz_label) {
            return readable + " " + tz_label;
        }

        return readable;
    };

    this.IsIsoFormat = function (value) {
        if (!value) {
            return false;
        }

        if (typeof value === "object") {
            return false;
        }

        try {
            if (typeof JSON.parse(value) === "object") {
                return false;
            }
        }

        catch {
            // Ignore
        }

        value = value.toString();

        var test = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}/.test(value);

        if (!test) {
            test = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
        }

        return test;
    };

    this.DSTInEffect = function (dt_obj) {
        var jan = new Date(dt_obj.getFullYear(), 0, 1).getTimezoneOffset();
        var jul = new Date(dt_obj.getFullYear(), 6, 1).getTimezoneOffset();

        return Math.max(jan, jul) !== dt_obj.getTimezoneOffset();
    };

    this.FormatTime = function (server_iso_string) {
        var date = new Date(Date.parse(server_iso_string));

        date = date.setHours(date.getHours() - this.server_offset_hours);

        // TODO: What is timeago meant to be? It's undefined
        return timeago.format(date);
    };
}
