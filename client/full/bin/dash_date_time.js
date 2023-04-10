function DashDateTime () {
    this.Readable = function (iso_string, include_tz_label=true, raw=false, include_seconds=false, include_time=true, include_date=true) {
        var date;
        var dt_obj;
        var timezone;
        var is_static_date = false;

        if (raw) {
            dt_obj = new Date(Date.parse(iso_string));
        }

        else {
            timezone = Dash.Context["timezone"] ? Dash.Context["timezone"] : "UTC";

            [dt_obj, is_static_date] = this.GetDateObjectFromISO(iso_string, timezone, true);
        }

        if (include_date) {
            if (Dash.Context["ignore_locale_for_readable_dates"]) {
                date = [dt_obj.getMonth() + 1, dt_obj.getDate(), dt_obj.getFullYear()].join("/");
            }

            else {
                // The above "ignore_locale_for_readable_dates" was implemented as a quick addition at
                // an earlier date, that I wanted to later add to DashContext, but I'm now of the
                // opinion that en-US should be enforced globally to ensure our code works as expected.
                date = dt_obj.toLocaleDateString("en-US");
            }

            if (is_static_date || !include_time) {
                return date;
            }
        }

        var colon_count = 0;
        var time = dt_obj.toLocaleTimeString("en-US");
        var readable = include_date ? (date + " at " + time) : time;

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

        if (!include_seconds) {
            readable = readable.slice(0, parseInt(i)) + readable.slice(parseInt(i) + 3, readable.length);
        }

        if (include_tz_label && timezone) {
            return readable + " " + timezone;
        }

        return readable;
    };

    this.GetDateObjectFromISO = function (iso_string, timezone="EST", check_static=false, account_for_dst=true, offset_hours=0) {
        iso_string = iso_string.replace("Z", "");

        var included_offset_hours;

        // Check for included offset hours at end of the ISO string (ex: -04:00)
        if (iso_string[iso_string.length - 6] === "-") {
            included_offset_hours = parseInt(iso_string.substring(iso_string.length - 5, iso_string.length));  // Grab the offset before removing it
            iso_string = iso_string.substring(0, iso_string.length - 6);  // Remove the offset from the original
        }

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

        else if (included_offset_hours) {
            // If the ISO string has offset hours included within it, we don't need to
            // manually determine and adjust for the offset hours, so do nothing here
        }

        else {
            dt_obj.setHours(dt_obj.getHours() - (offset_hours || this.get_server_offset_hours(dt_obj, timezone, account_for_dst)));
        }

        if (check_static) {
            return [dt_obj, is_static_date];
        }

        return dt_obj;
    };

    this.GetDifferenceSec = function (start_iso, end_iso) {
        var start_ms = Dash.DateTime.GetDateObjectFromISO(start_iso).getTime();
        var end_ms = Dash.DateTime.GetDateObjectFromISO(end_iso).getTime();

        return Math.floor((end_ms - start_ms) / 1000);
    };

    this.GetReadableDifference = function (start_iso, end_iso, include_secs=false, sec_mod=0) {
        var secs = this.GetDifferenceSec(start_iso, end_iso)

        if (sec_mod !== 0) {
            secs += sec_mod;

        }

        return this.GetReadableHoursMins(secs, include_secs);
    };

    this.GetReadableHoursMins = function (secs, include_secs=false) {
        var mins = Math.floor(secs / 60);
        var hours = Math.floor(mins / 60);

        secs = secs % 60;
        mins = mins % 60;

        if (secs < 0) {
            secs = 0;
        }

        if (mins < 0) {
            mins = 0;
        }

        if (hours < 0) {
            hours = 0;
        }

        if (!include_secs) {
            if (secs >= 30) {
                mins += 1;
            }

            if (mins === 0 && secs) {
                mins += 1;
            }
        }

        var readable = hours + "h " + mins + "m";

        if (include_secs) {
            readable += " " + secs + "s";
        }

        return readable;
    };

    this.GetUTCDateObject = function () {
        return this.GetDateObjectFromISO(new Date().toISOString(), "UTC");
    };

    this.GetISOAgeMs = function (iso_string, return_objects=false) {
        var now = this.GetNewRelativeDateObject("UTC");
        var dt_obj = this.GetDateObjectFromISO(iso_string, "UTC", false, false);

        if (return_objects) {
            return [now - dt_obj, now, dt_obj];
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

        if (value.length > 36) {
            return false;
        }

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

    // Timeago library: /bin/src/timeago.js
    this.FormatTime = function (iso_string) {
        return timeago.format(this.GetDateObjectFromISO(
            iso_string,
            "EST",
            false,
            true,
            (new Date().getTimezoneOffset() / 60))  // Ensure the timeago representation is always relevant to the user's timezone
        );
    };

    // Get a date object of the start of a given week/year (defaults to Sunday, but ISO weeks start on Monday)
    this.GetDateObjectForWeek = function (week_num, year, start_on_monday=false) {
        var dt_obj = new Date(year, 0, 1 + (week_num - 1) * 7);

        dt_obj.setDate((dt_obj.getDay() <= 4 ? (dt_obj.getDate() - dt_obj.getDay() + 1) : (dt_obj.getDate() + 8 - dt_obj.getDay())) - 1);

        if (start_on_monday) {
            dt_obj.setDate(dt_obj.getDate() + 1);
        }

        return dt_obj;
    };

    this.GetDayOrdinalSuffix = function (day_num) {
        var j = day_num % 10;
        var k = day_num % 100;

        if (j === 1 && k !== 11) {
            return "st";
        }

        if (j === 2 && k !== 12) {
            return "nd";
        }

        if (j === 3 && k !== 13) {
            return "rd";
        }

        return "th";
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
