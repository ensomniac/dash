/**@member DashGuiInputBase*/

// Abstract from this for input elements with specific "types", such as "date", "time", etc
function DashGuiInputType (input, label_text="", binder=null, on_submit_cb=null, on_change_cb=null, color=null) {
    this.input = input;
    this.label_text = label_text;

    DashGuiInputBase.call(this, color || (binder ? binder.color : color));

    this.label = null;

    this.EnableAutosave();
    this.SetOnSubmit(on_submit_cb, binder);
    this.SetOnChange(on_change_cb, binder);
    this.SetOnAutosave(on_change_cb, binder);

    this.setup_styles = function () {
        this.html.css({
            "height": this.height,
            "line-height": this.height + "px",
            "display": "flex"
        });

        if (this.label_text) {
            this.setup_label();
        }

        this.input.css({
            "color": this.color.Text,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis"
        });

        this.html.append(this.input);

        this.setup_connections();
    };

    this.setup_label = function () {
        if (!(this.label_text.endsWith(":"))) {
            this.label_text += ":";
        }

        this.label = $("<div>" + this.label_text + "</div>");

        this.label.css({
            "color": this.color.Text,
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "flex": "none"
        });

        this.html.append(this.label);
    };

    this.setup_styles();
}
