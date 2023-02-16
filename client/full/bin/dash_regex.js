function DashRegEx () {
    this.date = null;
    this.time = null;
    this.space = null;
    this.meridiem = null;
    this.readable_date_time = null;

    // Important: Since regex need to be compiled, don't generate them until they're needed (by using the flow below)

    // MM/DD/YYYY (month and/or day can be 1 or 2 digits each, year can be 2 or 4 digits)
    this.Date = function () {
        if (!this.date) {
            this.date = /\d{1,2}\/\d{1,2}\/(?<!\d)(\d{2}|\d{4})(?!\d)/;
        }

        return this.date;
    };

    // HH:MM (hour can be 1 or 2 digits)
    this.Time = function () {
        if (!this.time) {
            this.time = /\d{1,2}:\d{2}/;
        }

        return this.time;
    };

    // This accounts for a standard space, as well as &nbsp; and &nnbsp; (add to this as needed)
    this.Space = function () {
        if (!this.space) {
            this.space = /([ \u00a0\u202f])/;
        }

        return this.space;
    };

    this.Meridiem = function () {
        if (!this.meridiem) {
            this.meridiem = /(am|pm)/i;
        }

        return this.meridiem;
    };

    // Matches format of Dash.DateTime.Readable (MM/DD/YYYY at HH:MM AM/PM)
    this.ReadableDateTime = function () {
        if (!this.readable_date_time) {
            this.readable_date_time = new RegExp(
                [
                    this.Date().source,
                    this.Space().source,
                    "at",
                    this.Space().source,
                    this.Time().source,
                    this.Space().source,
                    this.Meridiem().source
                ].join(""),
                "i"
            );
        }

        return this.readable_date_time;
    };

    this.Date.toString = function () {
        return "MM/DD/YYYY";
    };

    this.Time.toString = function () {
        return "HH:MM";
    };

    this.ReadableDateTime.toString = function () {
        return "MM/DD/YYYY at HH:MM AM";
    };
}
