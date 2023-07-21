/**@member DashGuiInputType*/

function DashGuiTimePicker (
    label_text="",
    binder=null,
    on_submit_cb=null,
    on_change_cb=null,
    color=null,
    min="",  // Ex: "09:00"
    max="",  // Ex: "18:00"
    include_seconds=false
) {
    this.include_seconds = include_seconds;

    DashGuiInputType.call(
        this,
        $(  // Output: always 24-hour format, hh-mm (or hh-mm-ss if this.include_seconds)
            "<input type='time'" +
            (min ? " min='" + min + "'" : "") +
            (max ? " max='" + max + "'" : "") +
            (this.include_seconds ? " step='1'" : "") +
            ">"
        ),
        label_text,
        binder,
        on_submit_cb,
        on_change_cb,
        color
    );

    this._setup_styles = function () {

    };

    this._setup_styles();
}
