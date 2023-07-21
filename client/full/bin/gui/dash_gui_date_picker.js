/**@member DashGuiInputType*/

function DashGuiDatePicker (
    label_text="",
    binder=null,
    on_submit_cb=null,
    on_change_cb=null,
    color=null,
    min="",  // Ex: "2018-01-01"
    max=""   // Ex: "2018-12-31"
) {
    DashGuiInputType.call(
        this,
        $(  // Output: yyyy-mm-dd
            "<input type='date'" +
            (min ? " min='" + min + "'" : "") +
            (max ? " max='" + max + "'" : "") +
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
