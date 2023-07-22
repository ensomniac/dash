/**@member DashGuiInputType*/

function DashGuiTimePicker (
    label_text="",
    binder=null,
    on_submit_cb=null,
    on_autosave_cb=null,
    on_change_cb=null,
    color=null,

    // (in 24-hour format)
    // hh:mm (or hh:mm:ss if including seconds)
    min="",
    max="",

    include_seconds=false
) {
    this.include_seconds = include_seconds;

    DashGuiInputType.call(
        this,
        $(
            "<input type='time'" +
            (min ? " min='" + min + "'" : "") +
            (max ? " max='" + max + "'" : "") +
            (this.include_seconds ? " step='1'" : "") +
            ">"
        ),
        label_text,
        binder,
        on_submit_cb,
        on_autosave_cb,
        on_change_cb,
        color,
        false
    );

    this._setup_styles = function () {
        this.input.css({
            "flex": "none",
            "width": Dash.Size.ColumnWidth * (this.include_seconds ? 0.8 : 0.66)
        });
    };

    // Alternative to this, if using this.SetText() to set the
    // value, it has to be passed in using the correct format:
    // (in 24-hour format)
    // hh:mm (or hh:mm:ss if including seconds)
    this.SetValue = function (meridiem="", hours=0, mins=0, secs=0) {
        hours = parseInt(hours);

        // In this case (12-hour format), need to validate meridiem
        // to ensure proper 24-hour format conversion, if needed
        if (hours < 13) {
            meridiem = meridiem.toLowerCase();

            if (meridiem !== "am" && meridiem !== "pm") {
                console.error("Error: Invalid meridiem:", meridiem);

                return;
            }

            if (hours < 12 && meridiem === "pm") {
                hours += 12;

            }

            else if (hours === 12 && meridiem === "am") {
                hours = 0;
            }
        }

        if (hours === 24) {
            hours = 0;
        }

        var value = (
              hours.toString().ZFill(2)
            + ":"
            + mins.toString().ZFill(2)
        );

        if (this.include_seconds) {
            value += ":" + secs.toString().ZFill(2);
        }

        this.SetText(value);
    };

    // Override
    this.parse_value = function (value) {
        if (!value) {
            return null;
        }

        var mins;
        var hours;
        var secs = null;

        if (this.include_seconds) {
            [hours, mins, secs] = value.split(":");
        }

        else {
            [hours, mins] = value.split(":");
        }

        hours = parseInt(hours);

        return {
            "hours_24": hours,
            "hours_12": hours > 12 ? hours - 12 : hours,
            "mins": parseInt(mins),
            "secs": secs !== null ? parseInt(secs) : secs,
            "meridiem": hours < 12 ? "am" : "pm"
        };
    };

    this._setup_styles();
}
