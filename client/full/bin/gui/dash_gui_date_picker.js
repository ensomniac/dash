/**@member DashGuiInputType*/

function DashGuiDatePicker (
    label_text="",
    binder=null,
    on_submit_cb=null,
    on_autosave_cb=null,
    on_change_cb=null,
    color=null,

    // yyyy-mm-dd
    min="",
    max=""
) {
    DashGuiInputType.call(
        this,
        $(
            "<input type='date'" +
            (min ? " min='" + min + "'" : "") +
            (max ? " max='" + max + "'" : "") +
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
            "width": (Dash.Size.ColumnWidth * (Dash.IsMobile ? 0.41 : 0.66)) + (min || max ? Dash.Size.Padding : 0)
        });
    };

    // Alternative to this, if using this.SetText() to set the value
    // instead, it has to be passed in using the correct format:
    // yyyy-mm-dd
    this.SetValue = function (year=1970, month=1, day=1) {
        this.SetText(
              year.toString().ZFill(4)
            + "-"
            + month.toString().ZFill(2)
            + "-"
            + day.toString().ZFill(2)
        );
    };

    // Override
    this.parse_value = function (value) {
        if (!value) {
            return null;
        }

        var [year, month, day] = value.split("-");

        return {
            "year": parseInt(year),
            "month": parseInt(month),
            "day": parseInt(day)
        };
    };

    this._setup_styles();
}
