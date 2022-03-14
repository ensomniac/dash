function DashDateTime () {
    this.Readable = function (iso_string, include_tz_label=true) {
        var timezone = Dash.Context["timezone"] ? Dash.Context["timezone"] : "UTC";
        var [dt_obj, is_static_date] = this.GetDateObjectFromISO(iso_string, timezone, true);
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
            return readable + " " + timezone;
        }

        return readable;
    };

    this.GetDateObjectFromISO = function (iso_string, timezone="EST", check_static=false, account_for_dst=true) {
        iso_string = iso_string.replace("Z", "");

        var is_static_date = false;
        var dt_obj = new Date(Date.parse(iso_string));

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

        else {
            dt_obj.setHours(dt_obj.getHours() - this.get_server_offset_hours(dt_obj, timezone, account_for_dst));
        }

        if (check_static) {
            return [dt_obj, is_static_date];
        }

        return dt_obj;
    };

    this.GetUTCDateObject = function () {
        return Dash.DateTime.GetDateObjectFromISO(new Date().toISOString(), "UTC");
    };

    this.GetISOAgeMs = function (iso_string, timezone="EST", debug=false) {
        var now = this.GetNewRelativeDateObject(timezone);
        var dt_obj = this.GetDateObjectFromISO(iso_string, timezone, false, false);
        console.debug("TEST", iso_string);
        console.debug("TEST", now);
        console.debug("TEST", dt_obj);
        console.debug("TEST", now - dt_obj);

        if (debug) {
            return [iso_string, now, dt_obj, now - dt_obj];
        }

        return now - dt_obj;
    };

    this.GetNewRelativeDateObject = function (timezone="EST", account_for_dst=true) {
        var now = new Date();

        now.setHours(now.getHours() + ((now.getTimezoneOffset() / 60) - this.get_server_offset_hours(null, timezone, account_for_dst)));

        return now;
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

    this.FormatTime = function (iso_string) {
        // Timeago library: /bin/src/timeago.js
        return timeago.format(this.GetDateObjectFromISO(iso_string));
    };

    this.get_server_offset_hours = function (dt_obj=null, timezone="EST", account_for_dst=true) {
        timezone = timezone.toLowerCase();

        if (timezone === "utc" || timezone === "gmt") {
            return 0;
        }

        // Baseline (only worrying about US timezones)
        var est_to_utc_offset_hours = dt_obj && (account_for_dst && this.DSTInEffect(dt_obj)) ? 4 : 5;

        // Eastern time
        if (timezone === "est" || timezone === "edt") {
            return est_to_utc_offset_hours;
        }

        // Central time
        if (timezone === "cst" || timezone === "cdt") {
            return est_to_utc_offset_hours + 1;
        }

        // Mountain time (not accounting for about AZ's exclusion)
        if (timezone === "mst" || timezone === "mdt") {
            return est_to_utc_offset_hours + 2;
        }

        // Pacific time
        if (timezone === "pst" || timezone === "pdt") {
            return est_to_utc_offset_hours + 3;
        }

        console.warn("Unhandled timezone, server offset hours not calculated:", timezone);

        return 0;
    };
}
